import React, { useState, useEffect } from 'react';
import { LeadApi } from '../services/LeadApi';
import type { FollowUp } from '../types/lead';
import { CalendarClock, Calendar, AlertCircle, Clock, Check, Video } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Tabs, type TabItem } from '../components/Tabs';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates';
import { useAuth } from '../context/AuthContext';
import { UpcomingVirtualToursWidget } from '../features/dashboard/components/UpcomingVirtualToursWidget';

export const FollowUpDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const hasLeadRead = user?.permissions?.includes('LEAD_READ');
  const hasVirtualTourRead = user?.permissions?.includes('VIRTUAL_TOUR_READ');

  const tabFromUrl = searchParams.get('tab');
  const defaultTab = tabFromUrl 
    ? tabFromUrl 
    : hasLeadRead 
      ? 'upcoming' 
      : hasVirtualTourRead 
        ? 'virtual-tours' 
        : 'upcoming';

  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<string>(defaultTab);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchFollowUps = async () => {
      if (filterType !== 'upcoming' && filterType !== 'overdue') {
        if (mounted) setLoading(false);
        return;
      }
      try {
        if (mounted) setLoading(true);
        setError(null);
        const data = await LeadApi.getGlobalFollowUps(filterType as 'upcoming' | 'overdue', page, 10);
        if (mounted) {
          setFollowUps(data.content || []);
          setTotalPages(data.page.totalPages);
        }
      } catch (err) {
        console.error('Failed to load follow-ups', err);
        if (mounted) setError('Failed to load follow-ups. Please try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void fetchFollowUps();
    return () => { mounted = false; };
  }, [filterType, page]);

  const handleComplete = async (fu: FollowUp) => {
    try {
      await LeadApi.completeFollowUp(fu.leadId, fu.id);
      window.location.reload(); // simple reload to refresh
      alert('Follow-up marked as completed!');
    } catch {
      alert('Failed to complete follow-up');
    }
  };

  const getStatusDisplay = (fu: FollowUp) => {
    // eslint-disable-next-line react-hooks/purity
    const isOverdue = new Date(fu.followUpDate).getTime() < Date.now();
    if (isOverdue) {
      return { label: 'Overdue', bg: 'var(--color-danger-bg)', color: 'var(--color-danger)', border: 'var(--color-danger)' };
    }
    return { label: 'Upcoming', bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', border: 'var(--color-warning)' };
  };

  const tabs: TabItem[] = [];
  if (hasLeadRead) {
    tabs.push({ id: 'upcoming', label: 'Upcoming', icon: <Clock size={16} /> });
    tabs.push({ id: 'overdue', label: 'Overdue', icon: <AlertCircle size={16} /> });
  }
  if (hasVirtualTourRead) {
    tabs.push({ id: 'virtual-tours', label: 'Virtual Tours', icon: <Video size={16} /> });
  }

  const handleTabChange = (id: string) => {
    setFilterType(id);
    setPage(0);
    setSearchParams({ tab: id });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Follow-ups"
        description="Manage lead follow-ups and scheduled virtual tours."
        icon={<CalendarClock size={24} />}
      />

      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={filterType} onChange={handleTabChange} />
      </div>

      {filterType === 'virtual-tours' ? (
        <div style={{ marginTop: '24px' }}>
          <UpcomingVirtualToursWidget />
        </div>
      ) : (
        <div>
          {error && <div style={{ marginBottom: '16px' }}><ErrorState message={error} /></div>}
          
          {loading ? (
            <LoadingState message="Loading follow-ups..." />
          ) : followUps.length === 0 ? (
            <EmptyState 
              icon={<Calendar size={48} />}
              title={`No ${filterType} follow-ups`}
              message={`You do not have any ${filterType} follow-ups at this time.`}
            />
          ) : (
            <>
              <div className="followup-grid">
                {followUps.map(fu => {
                  const display = getStatusDisplay(fu);
                  const dateObj = new Date(fu.followUpDate);
                  const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                  const timeStr = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                  const formattedDate = `${dateStr} • ${timeStr}`;

                  return (
                  <div 
                    key={fu.id} 
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'var(--color-surface)', 
                      borderRadius: '10px', 
                      border: '1px solid var(--color-border)', 
                      borderLeft: `4px solid ${display.border}`,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                            {fu.clientName || 'Unknown Client'}
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Lead: <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{fu.leadTitle || 'Untitled Lead'}</span>
                          </p>
                        </div>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: 600, 
                          backgroundColor: display.bg, 
                          color: display.color,
                          flexShrink: 0
                        }}>
                          {display.label}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {formattedDate}
                        </span>
                      </div>

                      {fu.notes ? (
                        <div style={{ marginTop: 'auto' }}>
                          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {fu.notes}
                          </p>
                        </div>
                      ) : (
                        <div style={{ marginTop: 'auto' }} />
                      )}
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start', 
                      gap: '12px',
                      alignItems: 'center', 
                      padding: '12px 20px', 
                      borderTop: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-secondary)'
                    }}>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/leads/${fu.leadId}`)}
                        style={{ fontSize: '0.8125rem', padding: '0 12px', height: '32px', backgroundColor: 'var(--color-surface-secondary)', color: 'var(--color-text-primary)', borderColor: 'var(--color-border-strong)' }}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline"
                        icon={<Check size={16} />}
                        onClick={() => handleComplete(fu)} 
                        title="Mark as Completed"
                        style={{ 
                          fontSize: '0.8125rem', 
                          padding: '0 12px', 
                          height: '32px', 
                          color: 'var(--color-success)',
                          borderColor: 'var(--color-success)',
                          backgroundColor: 'var(--color-success-bg)'
                        }}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  </div>
                )})}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-end items-center gap-4 mt-6">
                  <Button 
                    variant="secondary" 
                    disabled={page === 0 || loading} 
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-text-secondary">Page {page + 1} of {totalPages}</span>
                  <Button 
                    variant="secondary" 
                    disabled={page >= totalPages - 1 || loading} 
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
