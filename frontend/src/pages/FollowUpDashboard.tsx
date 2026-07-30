import React, { useState, useEffect } from 'react';
import { LeadApi } from '../services/LeadApi';
import type { FollowUp } from '../types/lead';
import { Calendar, CheckCircle, Search, AlertCircle, Clock } from 'lucide-react';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const FollowUpDashboard: React.FC = () => {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterType, setFilterType] = useState<'upcoming' | 'overdue'>('upcoming');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchFollowUps = async () => {
      try {
        if (mounted) setLoading(true);
        setError(null);
        const data = await LeadApi.getGlobalFollowUps(filterType, page, 10);
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
      return { label: 'Overdue', bg: 'var(--error-bg)', color: 'var(--error)', border: 'var(--error)' };
    }
    return { label: 'Upcoming', bg: 'var(--warning-bg)', color: 'var(--warning)', border: 'var(--warning)' };
  };

  return (
    <div className="card">
      <div className="card-header flex-between">
        <h2 className="card-title">Follow-ups Dashboard</h2>
        <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => { setFilterType('upcoming'); setPage(0); }}
            style={{ 
              padding: '0.5rem 1rem', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: filterType === 'upcoming' ? 'var(--bg-main)' : 'transparent',
              color: filterType === 'upcoming' ? 'var(--text-main)' : 'var(--text-light)',
              fontWeight: filterType === 'upcoming' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Clock size={16} /> Upcoming
          </button>
          <button
            onClick={() => { setFilterType('overdue'); setPage(0); }}
            style={{ 
              padding: '0.5rem 1rem', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: filterType === 'overdue' ? 'var(--error-bg)' : 'transparent',
              color: filterType === 'overdue' ? 'var(--error)' : 'var(--text-light)',
              fontWeight: filterType === 'overdue' ? 600 : 400,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} /> Overdue
          </button>
        </div>
      </div>
      <div className="card-body">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <p>Loading follow-ups...</p>
        ) : followUps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
            <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '1.125rem' }}>No {filterType} follow-ups found.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {followUps.map(fu => {
                const display = getStatusDisplay(fu);
                return (
                <div key={fu.id} className="card" style={{ padding: '1.25rem', borderLeft: `4px solid ${display.border}` }}>
                  <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={18} style={{ color: 'var(--text-light)' }} />
                        {new Date(fu.followUpDate).toLocaleString()}
                      </h4>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.875rem',
                        backgroundColor: display.bg,
                        color: display.color,
                        fontWeight: 500
                      }}>
                        {display.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="ghost" onClick={() => navigate(`/leads/${fu.leadId}`)} title="View Lead">
                        <Search size={18} />
                      </Button>
                      <Button variant="ghost" onClick={() => handleComplete(fu)} style={{ color: 'var(--success)' }} title="Mark as Completed">
                        <CheckCircle size={18} />
                      </Button>
                    </div>
                  </div>
                  {fu.notes && (
                    <p style={{ margin: 0, marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                      <strong>Notes:</strong> {fu.notes}
                    </p>
                  )}
                  {fu.assignedToName && (
                    <p style={{ margin: 0, marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-light)' }}>
                      Assigned to: {fu.assignedToName}
                    </p>
                  )}
                </div>
              )})}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.5rem', alignItems: 'center' }}>
                <Button 
                  variant="secondary" 
                  disabled={page === 0 || loading} 
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span style={{ margin: '0 0.5rem' }}>Page {page + 1} of {totalPages}</span>
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
