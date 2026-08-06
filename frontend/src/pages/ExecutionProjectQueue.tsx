import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectExecutionApi } from '../api/projectExecutionApi';
import type { ExecutionWorkspaceDTO } from '../api/projectExecutionApi';
import { 
    PlaySquare, AlertCircle, Briefcase, Plus, RefreshCw,
    LayoutDashboard, CheckCircle2, Clock, CheckSquare, ListTodo, AlertTriangle
} from 'lucide-react';
import './ExecutionProjectQueue.css';

interface ExtendedWorkspaceDTO extends ExecutionWorkspaceDTO {
    projectTitle?: string;
    clientName?: string;
    quotationAcceptedDate?: string;
}

export const ExecutionProjectQueue: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<ExtendedWorkspaceDTO[]>([]);
    const [eligibleProjects, setEligibleProjects] = useState<ExtendedWorkspaceDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [creatingId, setCreatingId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const canWrite = user?.permissions?.includes('PROJECT_EXECUTION_WRITE') || false;

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const wsRes = await projectExecutionApi.workspaces.getAll();
            setWorkspaces(wsRes.data);

            if (canWrite) {
                const elRes = await projectExecutionApi.workspaces.getEligible();
                setEligibleProjects(elRes.data);
            } else {
                setEligibleProjects([]);
            }
        } catch (err: unknown) {
            console.error("Failed to load queue data", err);
            const status = err && typeof err === 'object' && 'response' in err ? (err as {response?: {status?: number}}).response?.status : null;
            if (status === 401) {
                setError("Unauthorized. Please log in again.");
            } else if (status === 403) {
                setError("Forbidden. You do not have permission to view the project execution queue.");
            } else {
                setError("Failed to load execution queue. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, []);

    const handleCreateWorkspace = async (projectId: string) => {
        setCreatingId(projectId);
        try {
            await projectExecutionApi.workspaces.create(projectId);
            await loadData();
        } catch (error: unknown) {
            console.error(error);
            const errorMessage = error && typeof error === 'object' && 'response' in error 
                ? (error as {response?: {data?: {message?: string}}}).response?.data?.message 
                : "Failed to create workspace.";
            alert(errorMessage || "Failed to create workspace.");
        } finally {
            setCreatingId(null);
        }
    };

    const activeWorkspacesCount = workspaces.length;
    const inProgressCount = workspaces.filter(w => w.status === 'IN_PROGRESS').length;
    const averageCompletion = workspaces.length > 0 
        ? Math.round(workspaces.reduce((acc, w) => acc + (w.overallProgress || 0), 0) / workspaces.length)
        : 0;

    if (loading) {
        return (
            <div className="execution-loading">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', marginBottom: '16px' }}></div>
                    <span style={{ fontSize: '18px', color: '#475569', fontWeight: 500 }}>Loading Execution Dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="execution-page">
                <div className="execution-error-card">
                    <div className="execution-error-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Failed to load dashboard</h3>
                        <p style={{ margin: '0 0 16px', color: '#475569' }}>{error}</p>
                        <button onClick={loadData} className="execution-secondary-button">
                            <RefreshCw size={16} />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="execution-page">
            {/* Header Card */}
            <div className="execution-header-card">
                <div className="execution-header-content">
                    <div className="execution-header-icon">
                        <LayoutDashboard size={32} />
                    </div>
                    <div className="execution-header-text">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1>Project Execution</h1>
                            {!canWrite && (
                                <span className="execution-status-badge badge-grey" style={{ fontSize: '12px' }}>
                                    Read Only
                                </span>
                            )}
                        </div>
                        <p>Initialize and monitor confirmed client projects</p>
                    </div>
                </div>
                <button onClick={loadData} className="execution-secondary-button">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </div>
            
            {/* Summary Cards */}
            <div className="execution-summary-grid">
                <div className="execution-summary-card accent-blue">
                    <div className="execution-summary-icon">
                        <PlaySquare size={24} />
                    </div>
                    <div className="execution-summary-details">
                        <p>Ready for Execution</p>
                        <h3>{eligibleProjects.length}</h3>
                    </div>
                </div>
                
                <div className="execution-summary-card accent-purple">
                    <div className="execution-summary-icon">
                        <Briefcase size={24} />
                    </div>
                    <div className="execution-summary-details">
                        <p>Active Workspaces</p>
                        <h3>{activeWorkspacesCount}</h3>
                    </div>
                </div>

                <div className="execution-summary-card accent-orange">
                    <div className="execution-summary-icon">
                        <Clock size={24} />
                    </div>
                    <div className="execution-summary-details">
                        <p>In Progress</p>
                        <h3>{inProgressCount}</h3>
                    </div>
                </div>

                <div className="execution-summary-card accent-green">
                    <div className="execution-summary-icon">
                        <CheckSquare size={24} />
                    </div>
                    <div className="execution-summary-details">
                        <p>Avg. Completion</p>
                        <h3>{averageCompletion}%</h3>
                    </div>
                </div>
            </div>

            {/* Ready for Execution */}
            {canWrite && (
            <section className="execution-section-card">
                <div className="execution-section-header">
                    <PlaySquare size={20} color="#4f46e5" />
                    <h2>Ready for Execution</h2>
                    <span className="execution-section-count">{eligibleProjects.length}</span>
                </div>
                
                <div className="execution-section-content">
                    {eligibleProjects.length === 0 ? (
                        <div className="execution-empty-state">
                            <div className="execution-empty-icon">
                                <CheckCircle2 size={32} color="#9ca3af" style={{ backgroundColor: '#f3f4f6', borderRadius: '50%', padding: '8px' }} />
                            </div>
                            <h3>No pending projects</h3>
                            <p>All eligible projects have workspaces. Projects will appear here once their quotation is client-accepted.</p>
                        </div>
                    ) : (
                        <div className="execution-project-grid">
                            {eligibleProjects.map(p => (
                                <div key={p.technicalProjectId} className="execution-project-card">
                                    <div className="execution-card-header">
                                        <div className="execution-card-title">
                                            <span className="execution-status-badge badge-green" style={{ marginBottom: '8px', display: 'inline-flex' }}>
                                                <CheckCircle2 size={14} />
                                                Client Accepted
                                            </span>
                                            <h3>{p.projectCode}</h3>
                                        </div>
                                    </div>
                                    
                                    <div className="execution-card-body">
                                        <p style={{ margin: 0, fontWeight: 500, color: '#0f172a' }}>{p.projectTitle || "Untitled Project"}</p>
                                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{p.clientName ? `Client: ${p.clientName}` : "Client TBD"}</p>
                                        {p.quotationAcceptedDate && (
                                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>Accepted: {p.quotationAcceptedDate}</p>
                                        )}
                                    </div>
                                    
                                    <div className="execution-card-footer">
                                        <div className="execution-footer-top">
                                            <span className="execution-status-badge badge-amber">
                                                Pending Initialization
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleCreateWorkspace(p.technicalProjectId)}
                                            disabled={creatingId === p.technicalProjectId}
                                            className="execution-primary-button" style={{ width: '100%' }}>
                                            {creatingId === p.technicalProjectId ? (
                                                <><div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '16px', width: '16px', borderBottom: '2px solid #ffffff' }}></div> Initializing...</>
                                            ) : (
                                                <><Plus size={16} /> Initialize Workspace</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            )}

            {/* Active Workspaces */}
            <section className="execution-section-card">
                <div className="execution-section-header">
                    <Briefcase size={20} color="#2563eb" />
                    <h2>Active Workspaces</h2>
                    <span className="execution-section-count">{workspaces.length}</span>
                </div>
                
                <div className="execution-section-content">
                    {workspaces.length === 0 ? (
                        <div className="execution-empty-state">
                            <div className="execution-empty-icon" style={{ backgroundColor: '#f3f4f6' }}>
                                <ListTodo size={32} color="#9ca3af" />
                            </div>
                            <h3>No active workspaces</h3>
                            <p>Initialize a workspace from the queue above to start execution.</p>
                        </div>
                    ) : (
                        <div className="execution-project-grid">
                            {workspaces.map(w => (
                                <div key={w.id} 
                                     className="execution-project-card active-workspace-card"
                                     onClick={() => navigate(`/execution/workspace/${w.id}`)}>
                                    
                                    <div className="execution-card-header">
                                        <div className="execution-card-title">
                                            <h3>{w.projectCode}</h3>
                                            <p>{w.projectTitle || "Untitled Project"}</p>
                                        </div>
                                        <span className={`execution-status-badge ${
                                            w.status === 'COMPLETED' ? 'badge-green' :
                                            w.status === 'IN_PROGRESS' ? 'badge-blue' :
                                            w.status === 'ON_HOLD' ? 'badge-amber' :
                                            'badge-grey'
                                        }`}>
                                            {w.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    <div className="execution-card-body" style={{ marginTop: '12px' }}>
                                        <div className="execution-info-row">
                                            <span className="execution-info-label">Manager:</span>
                                            <span className="execution-info-value">{w.projectManagerName || 'Unassigned'}</span>
                                        </div>
                                        <div className="execution-info-row">
                                            <span className="execution-info-label">Timeline:</span>
                                            <span className="execution-info-value">
                                                {w.plannedStartDate ? new Date(w.plannedStartDate).toLocaleDateString() : 'TBD'} 
                                                {' - '}
                                                {w.plannedEndDate ? new Date(w.plannedEndDate).toLocaleDateString() : 'TBD'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="execution-card-footer">
                                        <div className="execution-progress-container">
                                            <div className="execution-progress-labels">
                                                <span>Completion</span>
                                                <span>{w.overallProgress || 0}%</span>
                                            </div>
                                            <div className="execution-progress-bar">
                                                <div className="execution-progress-fill" style={{ width: `${w.overallProgress || 0}%` }}></div>
                                            </div>
                                        </div>
                                        
                                        <div className="execution-action-link">
                                            {w.status === 'ON_HOLD' ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                                                    <AlertTriangle size={14} /> Blocked
                                                </span>
                                            ) : <div />}
                                            
                                            <span>
                                                Open Workspace &rarr;
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
    );
};
