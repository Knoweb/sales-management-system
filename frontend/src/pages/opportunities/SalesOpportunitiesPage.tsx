import React, { useState, useEffect, useCallback } from 'react';
import { getOpportunities } from '../../api/opportunityApi';
import type { SalesOpportunitySummaryDTO } from '../../api/opportunityApi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '../../components/PageHeader';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table';
import { StatusBadge, getStatusVariant } from '../../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Input, Select } from '../../components/Forms';
import { Card } from '../../components/Card';
import { Eye, TrendingUp, X, Edit2 } from 'lucide-react';
import EditOpportunityModal from '../../components/opportunities/EditOpportunityModal';
import { useAuth } from '../../context/AuthContext';

const SalesOpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const canEditOpportunity = !!user?.permissions?.includes('OPPORTUNITY_UPDATE');
  const [opportunities, setOpportunities] = useState<SalesOpportunitySummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedOpportunity, setSelectedOpportunity] = useState<SalesOpportunitySummaryDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const navigate = useNavigate();

  const loadOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOpportunities(page, 10, search, stage);
      setOpportunities(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('Failed to load opportunities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, stage]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOpportunities();
  }, [loadOpportunities]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStage(e.target.value);
    setPage(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Sales Opportunities"
        description="Manage qualified sales opportunities, pipelines, and project briefs."
        icon={<TrendingUp size={24} />}
      />

      {!error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            marginBottom: '0.5rem',
            height: '44px',
          }}
        >
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            <Input
              type="text"
              placeholder="Search by title, number, client..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              style={{
                width: '100%',
                height: '44px',
                paddingLeft: '16px',
                paddingRight: search ? '40px' : '16px',
                borderRadius: '9px',
              }}
            />
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '40%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  padding: '4px',
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ width: '210px', flexShrink: 0 }}>
            <Select
              value={stage}
              onChange={handleStageChange}
            >
              <option value="">All Stages</option>
              <option value="OPPORTUNITY">Opportunity</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="WON">Won</option>
              <option value="LOST">Lost</option>
              <option value="BRIEF_IN_PROGRESS">Brief In Progress</option>
              <option value="BRIEF_SUBMITTED">Brief Submitted</option>
            </Select>
          </div>
        </div>
      )}

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={loadOpportunities} />
        ) : loading && opportunities.length === 0 ? (
          <LoadingState message="Loading opportunities..." />
        ) : opportunities.length === 0 ? (
          <EmptyState 
            title="No opportunities found" 
            message={
              search !== "" || stage !== ""
                ? "No opportunities match your current search or filters."
                : "No sales opportunities are available."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Opportunity</TableHeader>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Value</TableHeader>
                    <TableHeader>Stage</TableHeader>
                    <TableHeader>Expected Close</TableHeader>
                    <TableHeader align="right">Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {opportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-mono">{opp.opportunityNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>{opp.clientName}</TableCell>
                      <TableCell>
                        LKR {opp.estimatedValue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={opp.stage} variant={getStatusVariant(opp.stage)} />
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${opp.expectedCloseDate && new Date(opp.expectedCloseDate) < new Date() && opp.stage !== 'WON' && opp.stage !== 'LOST' ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <IconButton 
                            title="View Details" 
                            aria-label={`View opportunity ${opp.opportunityNumber}`} 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/opportunities/${opp.id}`);
                            }}
                          >
                            <Eye size={16} />
                          </IconButton>
                          {canEditOpportunity && (
                            <IconButton 
                              title="Edit Opportunity" 
                              aria-label={`Edit opportunity ${opp.opportunityNumber}`} 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOpportunity(opp);
                                setIsEditModalOpen(true);
                              }}
                            >
                              <Edit2 size={16} />
                            </IconButton>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-4 border-t border-gray-200 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  Previous
                </Button>
                <span className="flex items-center text-gray-700 text-sm font-medium">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
      
      {isEditModalOpen && selectedOpportunity && (
        <EditOpportunityModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          opportunityId={selectedOpportunity.id}
          onSuccess={() => {
            setIsEditModalOpen(false);
            loadOpportunities();
          }}
        />
      )}
    </div>
  );
};

export default SalesOpportunitiesPage;
