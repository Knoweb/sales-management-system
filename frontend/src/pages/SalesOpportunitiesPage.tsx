import React, { useState, useEffect, useCallback } from 'react';
import { getOpportunities } from '../api/opportunityApi';
import type { SalesOpportunitySummaryDTO } from '../api/opportunityApi';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Input, Select } from '../components/Forms';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { Search } from 'lucide-react';

const SalesOpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<SalesOpportunitySummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination and filtering state
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
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
        description="Manage qualified sales opportunities and project briefs."
      />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Search by title, number, client..."
              value={search}
              onChange={handleSearchChange}
              label="Search"
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={stage}
              onChange={handleStageChange}
              label="Stage"
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
      </Card>

      {error ? (
        <ErrorState message={error} onRetry={loadOpportunities} />
      ) : loading ? (
        <LoadingState message="Loading opportunities..." />
      ) : opportunities.length === 0 ? (
        <EmptyState 
          icon={<Search size={48} />}
          title="No opportunities found" 
          message="Try adjusting your filters or search terms." 
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Number</TableHeader>
                <TableHeader>Title</TableHeader>
                <TableHeader>Client</TableHeader>
                <TableHeader>Value</TableHeader>
                <TableHeader>Stage</TableHeader>
                <TableHeader>Close Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {opportunities.map((opp) => (
                <TableRow key={opp.id}>
                  <TableCell className="font-medium text-blue-600">
                    <Link to={`/opportunities/${opp.id}`}>{opp.opportunityNumber}</Link>
                  </TableCell>
                  <TableCell>{opp.title}</TableCell>
                  <TableCell>{opp.clientName}</TableCell>
                  <TableCell>
                    {opp.currency} {opp.estimatedValue.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={opp.stage} />
                  </TableCell>
                  <TableCell>
                    {opp.expectedCloseDate ? format(new Date(opp.expectedCloseDate), 'MMM d, yyyy') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Link to={`/opportunities/${opp.id}`} className="text-blue-600 hover:text-blue-900 font-medium">View</Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <span className="flex items-center text-gray-700 text-sm font-medium">
                Page {page + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SalesOpportunitiesPage;
