import React, { useState, useEffect } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { Lead } from '../../types/lead';
import { LeadTimeline } from './LeadTimeline';
import { LeadFollowUps } from './LeadFollowUps';
import { LeadAttachments } from './LeadAttachments';
import { Briefcase, Building, Tag, User } from 'lucide-react';

interface LeadDetailsProps {
  leadId: string;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'followups' | 'attachments'>('info');

  useEffect(() => {
    const loadLead = async () => {
      try {
        setLoading(true);
        const data = await LeadApi.getLead(leadId);
        setLead(data);
      } catch {
        setError('Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };
    
    void loadLead();
  }, [leadId]);

  if (loading) return <div className="card"><div className="card-body">Loading...</div></div>;
  if (error || !lead) return <div className="error-message">{error || 'Lead not found'}</div>;

  return (
    <div className="lead-details-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div className="card-header flex-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="avatar-circle" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {lead.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)' }}>{lead.title}</h2>
              <p style={{ margin: 0, color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Building size={14} /> {lead.clientName}
              </p>
            </div>
          </div>
          <div>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '1rem', 
              fontSize: '0.875rem',
              backgroundColor: 'var(--primary-bg)',
              color: 'var(--primary)',
              fontWeight: 500
            }}>
              {lead.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'info' ? '2px solid var(--primary)' : 'none', color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'info' ? 600 : 400 }}>
          Information
        </button>
        <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'timeline' ? '2px solid var(--primary)' : 'none', color: activeTab === 'timeline' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'timeline' ? 600 : 400 }}>
          Timeline Activity
        </button>
        <button className={`tab-btn ${activeTab === 'followups' ? 'active' : ''}`} onClick={() => setActiveTab('followups')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'followups' ? '2px solid var(--primary)' : 'none', color: activeTab === 'followups' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'followups' ? 600 : 400 }}>
          Follow-Ups
        </button>
        <button className={`tab-btn ${activeTab === 'attachments' ? 'active' : ''}`} onClick={() => setActiveTab('attachments')} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'attachments' ? '2px solid var(--primary)' : 'none', color: activeTab === 'attachments' ? 'var(--primary)' : 'var(--text-light)', fontWeight: activeTab === 'attachments' ? 600 : 400 }}>
          Attachments
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'info' && (
          <div className="card">
            <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Lead Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <Tag size={16} /> <span><strong>Source:</strong> {lead.inquirySource.replace('_', ' ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <Briefcase size={16} /> <span><strong>Product:</strong> {lead.interestedProduct || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <User size={16} /> <span><strong>Assigned To:</strong> {lead.assignedToName || 'Unassigned'}</span>
                  </div>
                </div>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Initial Request</h3>
                <p style={{ color: 'var(--text-light)', backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  {lead.initialRequest || 'No initial request details provided.'}
                </p>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Notes</h3>
                <p style={{ color: 'var(--text-light)', backgroundColor: 'var(--bg-light)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  {lead.notes || 'No additional notes.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'timeline' && <LeadTimeline leadId={leadId} />}
        {activeTab === 'followups' && <LeadFollowUps leadId={leadId} />}
        {activeTab === 'attachments' && <LeadAttachments entityId={leadId} entityType="LEAD" />}
      </div>
    </div>
  );
};
