import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOpportunity } from '../api/opportunityApi';
import type { SalesOpportunityDTO } from '../api/opportunityApi';
import { initializeProjectBrief } from '../api/projectBriefApi';
import { format } from 'date-fns';

const SalesOpportunityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<SalesOpportunityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initializingBrief, setInitializingBrief] = useState(false);

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

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!opportunity) return <div className="p-6">Opportunity not found.</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Opportunity: {opportunity.title} ({opportunity.opportunityNumber})
        </h1>
        <div className="space-x-3">
          {opportunity.stage === 'OPPORTUNITY' && (
            <button
              onClick={handleStartBrief}
              disabled={initializingBrief}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {initializingBrief ? 'Starting...' : 'Start Project Brief'}
            </button>
          )}
          {['BRIEF_IN_PROGRESS', 'BRIEF_SUBMITTED'].includes(opportunity.stage) && (
            <div className="text-sm text-gray-600 italic">
               Project Brief is in progress or submitted. Please view it from the Project Briefs tab (coming soon).
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Client</p>
                <p className="mt-1 text-sm text-gray-900">{opportunity.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Value</p>
                <p className="mt-1 text-sm text-gray-900">
                  {opportunity.currency} {opportunity.estimatedValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Stage</p>
                <p className="mt-1 text-sm text-gray-900">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {opportunity.stage.replace(/_/g, ' ')}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Expected Close Date</p>
                <p className="mt-1 text-sm text-gray-900">
                  {opportunity.expectedCloseDate ? format(new Date(opportunity.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Product Category</p>
                <p className="mt-1 text-sm text-gray-900">{opportunity.productCategoryName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Assigned Sales Officer</p>
                <p className="mt-1 text-sm text-gray-900">{opportunity.assignedSalesOfficerName || 'Unassigned'}</p>
              </div>
            </div>
            
            {opportunity.description && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-500">Description</p>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {opportunity.activities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== opportunity.activities.length - 1 ? (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <span className="text-white text-xs font-medium">
                              {activity.createdByName.charAt(0)}
                            </span>
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              {activity.description} <span className="font-medium text-gray-900">by {activity.createdByName}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesOpportunityDetailsPage;
