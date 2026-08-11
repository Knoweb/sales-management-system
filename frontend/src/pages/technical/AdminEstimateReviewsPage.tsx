/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTechnicalProjects, type TechnicalProjectSummaryDTO } from '../../services/TechnicalProjectApi';
import { PageHeader } from '../../components/PageHeader';
import { LoadingState } from '../../components/FeedbackStates';
import { Calculator, Briefcase } from 'lucide-react';
import '../ExecutionProjectQueue.css';

export const AdminEstimateReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<TechnicalProjectSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getTechnicalProjects();
      setProjects(response.content.filter(p => p.status !== 'AWAITING_TECHNICAL_ROUTING'));
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return <div className="p-8"><LoadingState message="Loading projects for review..." /></div>;
  }

  return (
    <div className="space-y-8 max-w-[90rem] mx-auto pb-12 px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <PageHeader
          title="Estimate Reviews"
          description="Review submitted department technical estimates, request revisions, and consolidate into final approved estimates."
        />
      </div>

      <div className="w-full">
        {/* Full Width - Projects */}
        <div className="w-full">
            <section className="execution-section-card" style={{ height: 'fit-content' }}>
                <div className="execution-section-header">
                    <Briefcase size={20} color="#2563eb" />
                    <h2>Active Technical Projects</h2>
                    <span className="execution-section-count">{projects.length}</span>
                </div>
                
                <div className="execution-section-content" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    {projects.length === 0 ? (
                        <div className="execution-empty-state">
                            <div className="execution-empty-icon" style={{ backgroundColor: '#f3f4f6' }}>
                                <Calculator size={32} color="#9ca3af" />
                            </div>
                            <h3>No active projects</h3>
                            <p>No projects require estimates.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {projects.map(project => (
                                <div key={project.id} 
                                     className={`execution-project-card active-workspace-card`}
                                     style={{
                                        maxWidth: '420px',
                                        width: '100%'
                                     }}
                                     onClick={() => navigate(`/admin/estimates/${project.id}`)}>
                                    
                                    <div className="execution-card-header">
                                        <div className="execution-card-title">
                                            <h3>{project.projectCode}</h3>
                                        </div>
                                        <span className={`execution-status-badge ${project.status === 'TEAM_READY' ? 'badge-green' : 'badge-grey'}`}>
                                            {project.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                                        </span>
                                    </div>
                                    
                                    <div className="execution-card-body" style={{ marginTop: '4px', marginBottom: '16px' }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>{project.projectTitle || "Untitled Project"}</p>
                                        {project.clientName && (
                                            <div className="execution-info-row">
                                                <span className="execution-info-label">Client:</span>
                                                <span className="execution-info-value">{project.clientName}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="execution-card-footer">
                                        <div className="execution-action-link" style={{ justifyContent: 'flex-end', marginTop: 0 }}>
                                            <span>
                                                View Estimates &rarr;
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
      </div>
    </div>
  );
};
