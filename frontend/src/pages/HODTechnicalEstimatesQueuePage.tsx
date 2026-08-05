/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartmentAssignedProjects, type AssignedProjectSummaryDTO } from '../services/ProjectTeamApi';
import { getDepartmentEstimate } from '../services/TechnicalCostingApi';
import { EmployeeApi } from '../services/EmployeeApi';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState, EmptyState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export const HODTechnicalEstimatesQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<AssignedProjectSummaryDTO[]>([]);
  const [estimateStatuses, setEstimateStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await EmployeeApi.getMyProfile();
      const userDeptId = profile.employee?.department?.id;
      if (!userDeptId) {
        setError('You are not assigned to a department.');
        return;
      }
      setDepartmentId(userDeptId);

      const response = await getDepartmentAssignedProjects(userDeptId);
      // Filter for TEAM_READY (formationStatus === 'COMPLETED')
      const readyProjects = response.content.filter(p => p.formationStatus === 'COMPLETED');
      setProjects(readyProjects);
      
      // Fetch estimate status for each project
      const statuses: Record<string, string> = {};
      await Promise.all(readyProjects.map(async (p) => {
        try {
          const est = await getDepartmentEstimate(p.technicalProjectId, userDeptId);
          statuses[p.technicalProjectId] = est.status;
        } catch (e: unknown) {
          if ((e as any).response?.status === 404) {
            statuses[p.technicalProjectId] = 'MISSING';
          }
        }
      }));
      setEstimateStatuses(statuses);
      
    } catch (err: unknown) {
      console.error(err);
      setError((err as any).response?.data?.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading department estimates queue..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorState title="Failed to load" message={error} onRetry={fetchProjects} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Technical Estimates"
        description="Create and submit cost and time estimates for your department's assigned projects."
      />

      <Card className="p-6">
        {projects.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Project Code</TableHeader>
                  <TableHeader>Client</TableHeader>
                  <TableHeader>Project Title</TableHeader>
                  <TableHeader>Assigned Date</TableHeader>
                  <TableHeader>Estimate Status</TableHeader>
                  <TableHeader className="text-right">Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map(project => {
                  const status = estimateStatuses[project.technicalProjectId] || 'MISSING';
                  return (
                    <TableRow key={project.technicalProjectDepartmentId}>
                      <TableCell className="font-medium text-gray-900">{project.projectCode}</TableCell>
                      <TableCell>{project.clientName}</TableCell>
                      <TableCell>{project.projectTitle}</TableCell>
                      <TableCell>{format(new Date(project.assignedAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                         {status === 'MISSING' && <StatusBadge status="PENDING" />}
                         {status !== 'MISSING' && <StatusBadge status={status} />}
                      </TableCell>
                      <TableCell className="text-right">
                        {status === 'MISSING' || status === 'DRAFT' || status === 'REVISION_REQUESTED' ? (
                          <Button 
                            variant={status === 'REVISION_REQUESTED' ? 'danger' : 'primary'}
                            onClick={() => navigate(`/hod/estimates/${project.technicalProjectId}/department/${departmentId}`)}
                            icon={<Calculator className="w-4 h-4" />}
                          >
                            {status === 'MISSING' ? 'Create Estimate' : status === 'DRAFT' ? 'Continue Draft' : 'Create Revision'}
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary"
                            onClick={() => navigate(`/hod/estimates/${project.technicalProjectId}/department/${departmentId}`)}
                            icon={<ArrowRight className="w-4 h-4" />}
                          >
                            View Submitted
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <EmptyState
            title="No Projects for Estimation"
            message="There are currently no team-ready projects requiring estimates from your department."
            icon={<CheckCircle className="w-10 h-10 text-gray-400" />}
          />
        )}
      </Card>
    </div>
  );
};
