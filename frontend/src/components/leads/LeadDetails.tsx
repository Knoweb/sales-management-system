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
import { PermissionGuard } from '../PermissionGuard';
import { Card } from '../Card';
import { Button } from '../Button';
import { StatusBadge } from '../StatusBadge';
import { LoadingState, ErrorState } from '../FeedbackStates';

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

  if (loading) return <LoadingState message="Loading lead details..." />;
  if (error || !lead) return <ErrorState message={error || 'Lead not found'} />;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold">
              {lead.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">{lead.title}</h2>
              <p className="text-gray-500 m-0 flex items-center gap-1 mt-1">
                <Building size={14} /> {lead.clientName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lead.status === 'QUALIFIED' && lead.active && (
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
            <StatusBadge status={lead.status} />
          </div>
        </div>
      </Card>

      <LeadConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        leadId={lead.id}
        leadTitle={lead.title}
        assignedTo={lead.assignedTo}
        onSuccess={(oppId) => {
          setIsConversionModalOpen(false);
          alert('Lead converted successfully!');
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

      <div className="mt-6">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Lead Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-gray-600">
                  <Tag size={18} className="mt-0.5 text-gray-400" /> 
                  <div>
                    <span className="font-medium text-gray-900 block text-sm">Source</span>
                    <span>{lead.inquirySource.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Contact size={18} className="mt-0.5 text-gray-400" /> 
                  <div>
                    <span className="font-medium text-gray-900 block text-sm">Contact</span>
                    <span>{lead.contactName || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Briefcase size={18} className="mt-0.5 text-gray-400" /> 
                  <div>
                    <span className="font-medium text-gray-900 block text-sm">Product</span>
                    <span>{lead.interestedProduct || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <User size={18} className="mt-0.5 text-gray-400" /> 
                  <div>
                    <span className="font-medium text-gray-900 block text-sm">Assigned To</span>
                    <span>{lead.assignedToName || 'Unassigned'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Calendar size={18} className="mt-0.5 text-gray-400" /> 
                  <div>
                    <span className="font-medium text-gray-900 block text-sm">Next Follow-up</span>
                    <span>{nextFollowUp ? new Date(nextFollowUp.followUpDate).toLocaleString() : 'None Scheduled'}</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Initial Request</h3>
                <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md">
                  {lead.initialRequest || 'No initial request details provided.'}
                </p>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-md">
                  {lead.notes || 'No additional notes.'}
                </p>
              </Card>
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
