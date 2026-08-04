import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  getPendingRoutingProjects, 
  getEligibleProjectBriefs,
  initializeTechnicalProject,
  type TechnicalProjectSummaryDTO,
  type EligibleProjectBriefSummaryDTO
} from '../services/TechnicalProjectApi';
import { PageHeader } from '../components/PageHeader';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState, LoadingState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { Waypoints, Play } from 'lucide-react';
import { Alert } from '../components/Alert';

export const TechnicalProjectQueuePage: React.FC = () => {
  const [projects, setProjects] = useState<TechnicalProjectSummaryDTO[]>([]);
  const [eligibleBriefs, setEligibleBriefs] = useState<EligibleProjectBriefSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [initializingId, setInitializingId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [projectsData, briefsData] = await Promise.all([
        getPendingRoutingProjects(),
        getEligibleProjectBriefs()
      ]);
      setProjects(projectsData.content);
      setEligibleBriefs(briefsData.content);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Failed to load projects and eligible briefs.';
      setError(errorMsg || 'Failed to load projects and eligible briefs.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInitialize = async (briefId: string, title: string) => {
    try {
      setInitializingId(briefId);
      setError(null);
      setSuccessMsg(null);
      await initializeTechnicalProject(briefId);
      setSuccessMsg(`Project "${title}" initialized successfully.`);
      await fetchProjects();
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : `Failed to initialize project "${title}".`;
      setError(errorMsg || `Failed to initialize project "${title}".`);
    } finally {
      setInitializingId(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Projects Queue"
        description="View and route technical projects to departments."
      />

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}
      {successMsg && <Alert variant="success" className="mb-4">{successMsg}</Alert>}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Eligible Project Briefs</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8"><LoadingState message="Loading briefs..." /></div>
          ) : eligibleBriefs.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No eligible briefs" message="No project briefs are currently ready for technical initialization." icon={<Waypoints className="w-10 h-10 text-gray-400" />} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead><TableRow>
                    <TableHeader>Project Title</TableHeader>
                    <TableHeader>Client</TableHeader>
                    <TableHeader>Approved Date</TableHeader>
                    <TableHeader className="text-right">Actions</TableHeader>
                  </TableRow></TableHead>
                <TableBody>
                  {eligibleBriefs.map((brief) => (
                    <TableRow key={brief.id}>
                      <TableCell className="font-medium">{brief.title}</TableCell>
                      <TableCell>{brief.clientName}</TableCell>
                      <TableCell>{brief.bdmApprovedDate ? format(new Date(brief.bdmApprovedDate), 'MMM d, yyyy') : '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="primary"
                          onClick={() => handleInitialize(brief.id, brief.title)}
                          isLoading={initializingId === brief.id}
                          disabled={initializingId !== null}
                          icon={<Play className="w-4 h-4" />}
                        >
                          Initialize
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Technical Projects Queue</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading projects..." />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No pending projects"
              message="There are currently no technical projects awaiting routing."
              icon={<Waypoints className="w-10 h-10 text-gray-400" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead><TableRow>
                  <TableHeader>Project Name</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created At</TableHeader>
                  <TableHeader>Routed At</TableHeader>
                  <TableHeader className="text-right">Actions</TableHeader>
                </TableRow></TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.projectTitle || 'Unknown Project'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      {project.createdAt
                        ? format(new Date(project.createdAt), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {project.routedAt
                        ? format(new Date(project.routedAt), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="secondary"
                        
                        onClick={() => navigate(`/technical-projects/${project.id}/route`)}
                        icon={<Waypoints className="w-4 h-4" />}
                      >
                        Route
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};








