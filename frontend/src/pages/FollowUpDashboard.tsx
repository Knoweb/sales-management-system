import React, { useState, useEffect } from 'react';
import { LeadApi } from '../services/LeadApi';
import type { FollowUp } from '../types/lead';
import { CalendarClock, Calendar, Search, AlertCircle, Clock, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Tabs, type TabItem } from '../components/Tabs';
import { LoadingState, ErrorState, EmptyState } from '../components/FeedbackStates';

export const FollowUpDashboard: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<string>('upcoming');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchFollowUps = async () => {
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

  const tabs: TabItem[] = [
    { id: 'upcoming', label: 'Upcoming', icon: <Clock size={16} /> },
    { id: 'overdue', label: 'Overdue', icon: <AlertCircle size={16} /> }
  ];

  const handleTabChange = (id: string) => {
    setFilterType(id);
    setPage(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Follow-ups Dashboard"
        description="Manage your upcoming and overdue lead follow-ups."
        icon={<CalendarClock size={24} />}
      />

      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={filterType} onChange={handleTabChange} />
      </div>

      <div className="space-y-4">
        {error && <ErrorState message={error} />}
        
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
            <div className="grid gap-4">
              {followUps.map(fu => {
                const display = getStatusDisplay(fu);
                return (
                <Card key={fu.id} style={{ borderLeft: `4px solid ${display.border}` }}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="m-0 text-lg font-medium text-text-primary flex items-center gap-2">
                        <Calendar size={18} className="text-text-muted" />
                        {new Date(fu.followUpDate).toLocaleString()}
                      </h4>
                      <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: display.bg, color: display.color }}>
                        {display.label}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <IconButton 
                        icon={<Search size={18} />} 
                        onClick={() => navigate(`/leads/${fu.leadId}`)} 
                        title="View Lead"
                        variant="secondary"
                      />
                      <IconButton 
                        icon={<Check size={18} />} 
                        onClick={() => handleComplete(fu)} 
                        title="Mark as Completed"
                        style={{ color: 'var(--color-success)' }}
                      />
                    </div>
                  </div>
                  {fu.notes && (
                    <p className="m-0 mt-2 text-text-secondary">
                      <strong className="font-medium text-text-primary">Notes:</strong> {fu.notes}
                    </p>
                  )}
                  {fu.assignedToName && (
                    <p className="m-0 mt-2 text-sm text-text-muted flex items-center gap-1">
                      Assigned to: <span className="font-medium text-text-secondary">{fu.assignedToName}</span>
                    </p>
                  )}
                </Card>
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
    </div>
  );
};
