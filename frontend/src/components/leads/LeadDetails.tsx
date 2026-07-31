import React, { useState, useEffect } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { Lead } from '../../types/lead';
import { Tabs } from '../Tabs';
import { LeadTimeline } from './LeadTimeline';
import { LeadFollowUps } from './LeadFollowUps';
import { LeadAttachments } from './LeadAttachments';
import { Briefcase, Building, Tag, User, Contact, Calendar } from 'lucide-react';
import type { FollowUp } from '../../types/lead';
import LeadConversionModal from '../LeadConversionModal';
import { useNavigate } from 'react-router-dom';

interface LeadDetailsProps {
  leadId: string;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [nextFollowUp, setNextFollowUp] = useState<FollowUp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'followups' | 'attachments'>('info');

  useEffect(() => {
    const loadLead = async () => {
      try {
        setLoading(true);
        const data = await LeadApi.getLead(leadId);
        setLead(data);
        
        const followUps = await LeadApi.getFollowUps(leadId);
        const pending = followUps
          .filter(f => f.status === 'PENDING')
          .sort((a, b) => new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime());
        setNextFollowUp(pending[0] || null);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {lead.status === 'QUALIFIED' && (
              <button
                onClick={() => setIsConversionModalOpen(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Convert to Opportunity
              </button>
            )}
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

      <LeadConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        leadId={lead.id}
        leadTitle={`${lead.clientName} - New Opportunity`}
        onSuccess={(oppId) => {
          setIsConversionModalOpen(false);
          navigate(`/opportunities/${oppId}`);
        }}
      />

      <Tabs 
        tabs={[
          { id: 'info', label: 'Information' },
          { id: 'timeline', label: 'Timeline Activity' },
          { id: 'followups', label: 'Follow-Ups' },
          { id: 'attachments', label: 'Attachments' }
        ]} 
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as typeof activeTab)}
      />

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
                    <Contact size={16} /> <span><strong>Contact:</strong> {lead.contactName || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <Briefcase size={16} /> <span><strong>Product:</strong> {lead.interestedProduct || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <User size={16} /> <span><strong>Assigned To:</strong> {lead.assignedToName || 'Unassigned'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-light)' }}>
                    <Calendar size={16} /> <span><strong>Next Follow-up:</strong> {nextFollowUp ? new Date(nextFollowUp.followUpDate).toLocaleString() : 'None Scheduled'}</span>
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
