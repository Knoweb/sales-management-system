import React, { useState, useEffect, useCallback } from 'react';
import { getOpportunities } from '../api/opportunityApi';
import type { SalesOpportunitySummaryDTO } from '../api/opportunityApi';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { FilterBar } from '../components/FilterBar';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge, getStatusVariant } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Select } from '../components/Forms';
import { Search, Eye, TrendingUp } from 'lucide-react';

const SalesOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<SalesOpportunitySummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleClearFilters = () => {
    setSearch('');
    setStage('');
    setPage(0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Sales Opportunities"
        description="Manage qualified sales opportunities, pipelines, and project briefs."
        icon={<TrendingUp size={24} />}
      />

      <FilterBar>
        <SearchInput
          placeholder="Search by title, number, client..."
          value={search}
          onSearch={handleSearchChange}
        />
        <div className="w-full md:w-56">
          <Select
            value={stage}
            onChange={handleStageChange}
            aria-label="Filter by Stage"
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
      </FilterBar>

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={loadOpportunities} />
        ) : loading && opportunities.length === 0 ? (
          <LoadingState message="Loading opportunities..." />
        ) : opportunities.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No opportunities found" 
            message={search || stage ? "No opportunities match your current filters. Try adjusting them." : "There are no opportunities in the pipeline right now."}
            action={(search || stage) ? (
              <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
            ) : undefined}
          />
        ) : (
          <>
            <div className="table-container relative">
              {loading && (
                <div className="absolute inset-0 bg-surface/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
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
                    <TableRow key={opp.id} onClick={() => navigate(`/opportunities/${opp.id}`)}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-text-primary mb-1">{opp.title}</span>
                          <span className="text-xs font-mono text-text-muted">{opp.opportunityNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-text-secondary">{opp.clientName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {opp.currency} {opp.estimatedValue.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={opp.stage} variant={getStatusVariant(opp.stage)} />
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm ${opp.expectedCloseDate && new Date(opp.expectedCloseDate) < new Date() && opp.stage !== 'WON' && opp.stage !== 'LOST' ? 'text-danger font-medium' : 'text-text-secondary'}`}>
                          {opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton 
                          icon={<Eye size={18} />} 
                          aria-label={`View opportunity ${opp.opportunityNumber}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/opportunities/${opp.id}`);
                          }}
                          variant="ghost"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-sm text-text-secondary">
                  Showing page <span className="font-medium text-text-primary">{page + 1}</span> of <span className="font-medium text-text-primary">{totalPages}</span>
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesOpportunitiesPage;
