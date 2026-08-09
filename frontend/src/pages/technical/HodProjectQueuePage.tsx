import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { getDepartmentAssignedProjects, createProjectTeam, type AssignedProjectSummaryDTO } from '../../services/ProjectTeamApi';
import { EmployeeApi } from '../../services/EmployeeApi';

import { PageHeader } from '../../components/PageHeader';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState, EmptyState, LoadingState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Users } from 'lucide-react';

export const HodProjectQueuePage: React.FC = () => {
  const [projects, setProjects] = useState<AssignedProjectSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingTeamId, setCreatingTeamId] = useState<string | null>(null);
  
  
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch my profile to get departmentId
      const profileRes = await EmployeeApi.getMyProfile();
      if (!profileRes.linked || !profileRes.departmentHead || !profileRes.employee) {
        setError('Department Head access required. You are not assigned as a Department Head.');
        setLoading(false);
        return;
      }
      if (!profileRes.employee.department?.id) {
        setError("You are not assigned to any department.");
        return;
      }
      
      
      const data = await getDepartmentAssignedProjects(profileRes.employee.department.id);
      setProjects(data.content);
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load department projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInitTeam = async (tpdId: string) => {
    try {
      setCreatingTeamId(tpdId);
      setError(null);
      const team = await createProjectTeam(tpdId, 'Default Team', '');
      navigate(`/hod/projects/${team.id}/team`);
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to initialize project team.');
      setCreatingTeamId(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Department Assigned Projects"
        description="Build project teams for projects routed to your department."
      />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading assigned projects..." />
          </div>
        ) : error ? (
          <div className="p-8">
            <ErrorState
              title="Failed to load projects"
              message={error}
              onRetry={fetchData}
            />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No projects assigned"
              message="Your department has no active routed projects."
              icon={<Users className="w-10 h-10 text-gray-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead><TableRow>
                  <TableHeader>Project Name</TableHeader>
                  <TableHeader>Project Status</TableHeader>
                  <TableHeader>Dept Status</TableHeader>
                  <TableHeader>Routed At</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow></TableHead>
              <TableBody>
                {projects.map((project) => {
                  
                  return (
                    <TableRow key={project.technicalProjectDepartmentId}>
                      <TableCell className="font-medium">
                        {project.projectTitle || 'Unknown Project'}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.projectStatus} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.formationStatus} />
                      </TableCell>
                      <TableCell>
                        {project.assignedAt
                          ? format(new Date(project.assignedAt), 'MMM d, yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {project.projectTeamId ? (
                          <Button
                            variant="secondary"
                            onClick={() => navigate(`/hod/projects/${project.projectTeamId}/team`)}
                            icon={<Users className="w-4 h-4" />}
                          >
                            Manage Team
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            isLoading={creatingTeamId === project.technicalProjectDepartmentId}
                            disabled={creatingTeamId !== null}
                            onClick={() => handleInitTeam(project.technicalProjectDepartmentId)}
                            icon={<Users className="w-4 h-4" />}
                          >
                            Build Team
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};















