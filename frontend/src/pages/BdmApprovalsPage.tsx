import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getPendingBdmApprovals, type BdmApprovalDTO } from '../services/ApprovalApi';
import { PageHeader } from '../components/PageHeader';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../components/FeedbackStates';
import { IconButton } from '../components/IconButton';
import { Input, Select } from '../components/Forms';
import { Card } from '../components/Card';
import { FileCheck, Eye, X } from 'lucide-react';

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
              placeholder="Search approvals..."
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
              value={statusFilter}
              onChange={handleStatusChange}
            >
              <option value="">All Pending</option>
              <option value="PENDING">Awaiting BDM Review</option>
            </Select>
          </div>
        </div>
      )}

      <Card>
        {error ? (
          <ErrorState message={error} onRetry={fetchApprovals} />
        ) : loading && approvals.length === 0 ? (
          <LoadingState message="Loading approvals..." />
        ) : approvals.length === 0 || filteredApprovals.length === 0 ? (
          <EmptyState 
            title="No pending approvals" 
            message={
              search !== "" || statusFilter !== ""
                ? "No approvals match your current search or filters."
                : "There are no BDM approvals waiting for review."
            }
          />
        ) : (
          <div className="overflow-x-auto">
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
                  <TableRow key={approval.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-mono">{approval.opportunityNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>{approval.clientName}</TableCell>
                    <TableCell>
                      {approval.assignedSalesOfficerName || "Unassigned"}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-gray-900">
                        v{approval.projectBriefVersionNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 whitespace-nowrap">
                        {format(new Date(approval.createdAt), 'dd MMM yyyy, hh:mm a')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
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
                      <div className="flex justify-end gap-2">
                        <IconButton 
                          title="Review Approval" 
                          aria-label={`Review approval for ${approval.opportunityTitle}`} 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bdm-approvals/${approval.id}`);
                          }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BdmApprovalsPage;
