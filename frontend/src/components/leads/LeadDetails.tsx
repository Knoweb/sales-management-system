import React, { useState, useEffect } from 'react';
import { LeadApi } from '../../services/LeadApi';
import type { Lead } from '../../types/lead';
import { Tabs } from '../Tabs';
import { LeadTimeline } from './LeadTimeline';
import { LeadFollowUps } from './LeadFollowUps';
import { LeadAttachments } from './LeadAttachments';
import { Briefcase } from 'lucide-react';
import type { FollowUp } from '../../types/lead';
import LeadConversionModal from '../LeadConversionModal';
import { PermissionGuard } from '../PermissionGuard';
import { Card } from '../Card';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import { LoadingState, ErrorState } from '../FeedbackStates';
import { PageHeader } from '../PageHeader';

interface LeadDetailsProps {
  leadId: string;
}

export const LeadDetails: React.FC<LeadDetailsProps> = ({ leadId }) => {
  const [lead, setLead] = useState<Lead | null>(null);
  const [nextFollowUp, setNextFollowUp] = useState<FollowUp | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'info' | 'timeline' | 'followups' | 'attachments'>('info');

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

  useEffect(() => {
    void loadLead();
  }, [leadId]);

  if (loading) return <LoadingState message="Loading lead details..." />;
  if (error || !lead) return <ErrorState message={error || 'Lead not found'} />;

  const getSubtitlePrefix = () => {
    if (lead.assignedToName) return `Assigned to ${lead.assignedToName}`;
    if (lead.clientName) return `Client: ${lead.clientName}`;
    return 'Unassigned';
  };
  
  const descriptionStr = getSubtitlePrefix();

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.title}
        icon={<Briefcase size={24} />}
        description={descriptionStr}
        actionElement={
          <div className="flex items-center gap-3">
            <StatusBadge status={lead.status} />
            {lead.status === 'QUALIFIED' && lead.active && !lead.hasOpportunity && (
              <PermissionGuard permission="OPPORTUNITY_CREATE">
                <Button
                  variant="primary"
                  onClick={() => setIsConversionModalOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                >
                  Convert to Opportunity
                </Button>
              </PermissionGuard>
            )}
            {lead.hasOpportunity && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  width: 'fit-content',
                  padding: '6px 12px',
                  borderRadius: '9999px',
                  background: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  fontSize: '14px',
                  fontWeight: 500,
                  lineHeight: 1
                }}
              >
                Converted to Opportunity
              </span>
            )}
          </div>
        }
      />

      <LeadConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        leadId={lead.id}
        leadTitle={lead.title}
        assignedTo={lead.assignedTo}
        onSuccess={() => {
          setIsConversionModalOpen(false);
          alert('Lead converted successfully!');
          void loadLead();
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

      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="space-y-6 mb-6">
            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Lead Information
                  </h2>
                  <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
                    Basic lead details
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Source</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{lead.inquirySource ? lead.inquirySource.replace('_', ' ') : 'N/A'}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Contact</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{lead.contactName || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Product</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{lead.interestedProduct || 'N/A'}</p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Assigned To</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{lead.assignedToName || 'Unassigned'}</p>
                  </div>
                  <div style={{ gridColumn: '1 / -1', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Next Follow-up</p>
                    <p style={{ margin: '7px 0 0', color: '#0f172a', fontSize: '16px', fontWeight: 600, lineHeight: 1.5, wordBreak: 'break-word' }}>{nextFollowUp ? new Date(nextFollowUp.followUpDate).toLocaleString() : 'None Scheduled'}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Initial Request
                  </h2>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {lead.initialRequest || 'No initial request details provided.'}
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', fontWeight: 700, lineHeight: 1.3 }}>
                    Notes
                  </h2>
                </div>
                <p style={{ margin: 0, color: '#475569', fontSize: '15px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {lead.notes || 'No additional notes.'}
                </p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'timeline' && <LeadTimeline leadId={leadId} />}
        {activeTab === 'followups' && <LeadFollowUps leadId={leadId} />}
        {activeTab === 'attachments' && <LeadAttachments entityId={leadId} entityType="LEAD" />}
      </div>
    </div>
  );
};
