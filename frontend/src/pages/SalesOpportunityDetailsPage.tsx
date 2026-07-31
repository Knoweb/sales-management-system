import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunity } from '../api/opportunityApi';
import type { SalesOpportunityDTO } from '../api/opportunityApi';
import { initializeProjectBrief } from '../api/projectBriefApi';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Tabs, type TabItem } from '../components/Tabs';
import { StatusBadge, getStatusVariant } from '../components/StatusBadge';

import { LoadingState, ErrorState } from '../components/FeedbackStates';
import { FileText, Activity, Paperclip, LayoutDashboard, TrendingUp } from 'lucide-react';

const SalesOpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<SalesOpportunityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializingBrief, setInitializingBrief] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async (oppId: string) => {
    try {
      setLoading(true);
      setError(null);
      const opp = await getOpportunity(oppId);
      setOpportunity(opp);
      
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load opportunity');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData(id);
    }
  }, [id, loadData]);

  const handleStartBrief = async () => {
    if (!id) return;
    try {
      setInitializingBrief(true);
      const newBrief = await initializeProjectBrief(id);
      navigate(`/project-briefs/${newBrief.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to initialize project brief');
    } finally {
      setInitializingBrief(false);
    }
  };

  if (loading) return <div className="p-6"><LoadingState message="Loading opportunity details..." /></div>;
  if (error) return <div className="p-6"><ErrorState message={error} onRetry={() => id && loadData(id)} /></div>;
  if (!opportunity) return <div className="p-6"><ErrorState message="Opportunity not found" /></div>;

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'activity', label: 'Activity Timeline', icon: <Activity size={18} /> },
    { id: 'attachments', label: 'Attachments', icon: <Paperclip size={18} /> }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 w-full">
      <PageHeader 
        title={opportunity.title}
        icon={<TrendingUp size={24} />}
        description={`Opportunity Number: ${opportunity.opportunityNumber}`}
        actionButton={
          opportunity.stage === 'OPPORTUNITY' ? {
            label: initializingBrief ? 'Starting...' : 'Start Project Brief',
            icon: <FileText size={18} />,
            onClick: handleStartBrief,
            disabled: initializingBrief
          } : undefined
        }
      />

      {['BRIEF_IN_PROGRESS', 'BRIEF_SUBMITTED'].includes(opportunity.stage) && (
        <div className="bg-info-bg text-info border border-info-border px-4 py-3 rounded-md flex items-start gap-3">
          <FileText className="mt-0.5 flex-shrink-0" size={18} />
          <div>
            <p className="font-medium">Project Brief is active</p>
            <p className="text-sm mt-1">This opportunity has a project brief in progress or submitted. You can access it via the project briefs section.</p>
          </div>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'overview' && (
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-6 border-b border-border pb-4">Opportunity Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-text-secondary">Client</p>
                <p className="mt-1 font-medium text-text-primary">{opportunity.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Value</p>
                <p className="mt-1 font-medium text-text-primary">
                  {opportunity.currency} {opportunity.estimatedValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Stage</p>
                <div className="mt-1">
                  <StatusBadge status={opportunity.stage} variant={getStatusVariant(opportunity.stage)} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Expected Close Date</p>
                <p className={`mt-1 font-medium ${opportunity.expectedCloseDate && new Date(opportunity.expectedCloseDate) < new Date() && opportunity.stage !== 'WON' && opportunity.stage !== 'LOST' ? 'text-danger' : 'text-text-primary'}`}>
                  {opportunity.expectedCloseDate ? format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Product Category</p>
                <p className="mt-1 font-medium text-text-primary">{opportunity.productCategoryName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Assigned Sales Officer</p>
                <p className="mt-1 font-medium text-text-primary">{opportunity.assignedSalesOfficerName || 'Unassigned'}</p>
              </div>
            </div>
            
            {opportunity.description && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm font-medium text-text-secondary mb-2">Description</p>
                <p className="text-body whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'activity' && (
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-6 border-b border-border pb-4">Activity Timeline</h2>
            {opportunity.activities.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                No activity recorded for this opportunity yet.
              </div>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {opportunity.activities.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== opportunity.activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-4 ring-surface">
                              <span className="text-white text-xs font-bold">
                                {activity.createdByName.charAt(0).toUpperCase()}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-text-secondary">
                                {activity.description} <span className="font-semibold text-text-primary">by {activity.createdByName}</span>
                              </p>
                            </div>
                            <div className="text-right text-xs font-medium whitespace-nowrap text-text-muted">
                              {format(new Date(activity.createdAt), 'MMM d, yyyy h:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'attachments' && (
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-6 border-b border-border pb-4">Attachments</h2>
            <div className="text-center py-12 text-text-muted bg-surface-secondary rounded-lg border border-dashed border-border">
              <Paperclip size={32} className="mx-auto mb-3 opacity-50" />
              <p>Attachment management will be available soon.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SalesOpportunityDetailsPage;
