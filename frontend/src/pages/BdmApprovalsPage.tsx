import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getPendingBdmApprovals, type BdmApprovalDTO } from '../services/ApprovalApi';
import { PageHeader } from '../components/PageHeader';
import { SearchInput } from '../components/SearchInput';
import { FilterBar } from '../components/FilterBar';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Select } from '../components/Forms';
import { Search, FileCheck, Eye } from 'lucide-react';

export const BdmApprovalsPage: React.FC = () => {
  const [approvals, setApprovals] = useState<BdmApprovalDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [now] = useState(() => Date.now());
  
  const navigate = useNavigate();

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingBdmApprovals();
      setApprovals(data);
    } catch (err: unknown) {
      console.error(err);
      setError('Failed to load pending BDM approvals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchApprovals();
  }, [fetchApprovals]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // 400ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const filteredApprovals = useMemo(() => {
    let filtered = approvals;

    if (debouncedSearch) {
      const term = debouncedSearch.toLowerCase();
      filtered = filtered.filter(a => 
        (a.opportunityNumber?.toLowerCase().includes(term)) ||
        (a.opportunityTitle?.toLowerCase().includes(term)) ||
        (a.clientName?.toLowerCase().includes(term)) ||
        (a.assignedSalesOfficerName?.toLowerCase().includes(term))
      );
    }

    if (statusFilter && statusFilter !== '') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }

    return filtered;
  }, [approvals, debouncedSearch, statusFilter]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const getWaitingTime = (createdAt: string) => {
    const submittedDate = new Date(createdAt);
    const waitingMs = now - submittedDate.getTime();
    const waitingDays = Math.floor(waitingMs / (1000 * 60 * 60 * 24));
    const waitingHours = Math.floor(waitingMs / (1000 * 60 * 60));
    
    if (waitingDays > 1) return `${waitingDays} days`;
    if (waitingDays === 1) return '1 day';
    if (waitingHours > 1) return `${waitingHours} hours`;
    return `${waitingHours} hour${waitingHours === 1 ? '' : 's'}`;
  };

  const getDisplayStatus = (status: string) => {
    if (status === 'PENDING') return 'Awaiting Review';
    return status;
  };
  
  const getBadgeVariant = (status: string) => {
    if (status === 'PENDING') return 'warning';
    return 'neutral';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader 
        title="Pending BDM Approvals"
        description="Review and action submitted project briefs from the sales team."
        icon={<FileCheck size={24} />}
      />

      <FilterBar>
        <SearchInput
          placeholder="Search approvals..."
          value={search}
          onSearch={handleSearchChange}
        />
        <div className="w-full md:w-56">
          <Select
            value={statusFilter}
            onChange={handleStatusChange}
            aria-label="Filter by Status"
          >
            <option value="">All Pending</option>
            <option value="PENDING">Awaiting BDM Review</option>
          </Select>
        </div>
      </FilterBar>

      <div className="mt-6">
        {error ? (
          <ErrorState message={error} onRetry={fetchApprovals} />
        ) : loading && approvals.length === 0 ? (
          <LoadingState message="Loading approvals..." />
        ) : approvals.length === 0 ? (
          <EmptyState 
            icon={<FileCheck size={48} />}
            title="No pending BDM approvals found." 
            message="There are no project briefs currently waiting for BDM review."
          />
        ) : filteredApprovals.length === 0 ? (
          <EmptyState 
            icon={<Search size={48} />}
            title="No approvals match your search." 
            message="Try adjusting your search terms or status filter."
            action={<Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>}
          />
        ) : (
          <div className="table-container relative overflow-x-auto">
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
                  <TableHeader>Assigned Sales Officer</TableHeader>
                  <TableHeader>Brief Version</TableHeader>
                  <TableHeader>Submitted Date</TableHeader>
                  <TableHeader>Waiting Time</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApprovals.map((approval) => (
                  <TableRow key={approval.id} onClick={() => navigate(`/bdm-approvals/${approval.id}`)}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary mb-1">{approval.opportunityTitle}</span>
                        <span className="text-xs font-mono text-text-muted">{approval.opportunityNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-text-secondary">{approval.clientName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-text-secondary">
                        {approval.assignedSalesOfficerName || "Unassigned"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-text-primary">
                        v{approval.projectBriefVersionNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-text-secondary whitespace-nowrap">
                        {format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-text-secondary">
                        {getWaitingTime(approval.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge 
                        status={getDisplayStatus(approval.status)} 
                        variant={getBadgeVariant(approval.status)} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        icon={<Eye size={18} />} 
                        aria-label={`Review approval for ${approval.opportunityTitle}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/bdm-approvals/${approval.id}`);
                        }}
                        variant="ghost"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BdmApprovalsPage;
