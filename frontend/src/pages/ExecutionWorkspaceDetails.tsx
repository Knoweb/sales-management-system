import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { projectExecutionApi, type ProjectExecutionSummary } from '../api/projectExecutionApi';
import type { ExecutionWorkspaceDTO } from '../api/projectExecutionApi';
import { SetupWorkspaceModal } from '../components/projectexecution/SetupWorkspaceModal';
import TasksTab from '../components/projectexecution/tabs/TasksTab';
import AllocationsTab from '../components/projectexecution/tabs/AllocationsTab';
import ProgressTab from '../components/projectexecution/tabs/ProgressTab';
import DelaysTab from '../components/projectexecution/tabs/DelaysTab';
import ApprovalsTab from '../components/projectexecution/tabs/ApprovalsTab';
import KanbanTab from '../components/projectexecution/tabs/KanbanTab';
import PhotosTab from '../components/projectexecution/tabs/PhotosTab';
import LabourTab from '../components/projectexecution/tabs/LabourTab';
import MaterialsTab from '../components/projectexecution/tabs/MaterialsTab';
import IssuesTab from '../components/projectexecution/tabs/IssuesTab';
import ChangeRequestsTab from '../components/projectexecution/tabs/ChangeRequestsTab';
import DocumentsTab from '../components/projectexecution/tabs/DocumentsTab';

import { 
    Briefcase, Calendar, CheckSquare, Clock, LayoutDashboard, 
    ListTodo, Users, ArrowLeft, Activity, 
    AlertTriangle, FileText, Image, PenTool, BarChart3, Wrench, ShieldAlert,
    Settings
} from 'lucide-react';
import './ExecutionWorkspaceDetails.css';

interface ExtendedWorkspaceDTO extends ExecutionWorkspaceDTO {
    projectTitle?: string;
}


export const ExecutionWorkspaceDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const hasWritePermission = user?.permissions?.includes('PROJECT_EXECUTION_WRITE');


    const [workspace, setWorkspace] = useState<ExtendedWorkspaceDTO | null>(null);
    const [summary, setSummary] = useState<ProjectExecutionSummary | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);


    const loadWorkspace = () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        Promise.allSettled([
            projectExecutionApi.workspaces.getById(id),
            projectExecutionApi.monitoring.getSummary(id)
        ])
            .then(([res, summaryRes]) => {
                if (res.status === 'fulfilled') {
                    setWorkspace(res.value.data);
                } else {
                    setError('Workspace not found or access denied.');
                }
                
                if (summaryRes.status === 'fulfilled') {
                    setSummary(summaryRes.value.data);
                } else {
                    console.warn("Summary feature unavailable.");
                }
            })
            .catch(err => {
                console.error(err);
                setError('Failed to load workspace details');
            })
            .finally(() => setLoading(false));
    };


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadWorkspace();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return (
            <div className="execution-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '48px', width: '48px', borderBottom: '2px solid #2563eb', marginBottom: '16px' }}></div>
                    <span style={{ fontSize: '18px', color: '#475569', fontWeight: 500 }}>Loading Workspace...</span>
                </div>
            </div>
        );
    }

    if (error || !workspace) {
        return (
            <div className="execution-page">
                <div className="execution-error-card" style={{ backgroundColor: '#ffffff', margin: '40px auto' }}>
                    <div className="execution-error-icon" style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '50%' }}>
                        <AlertTriangle size={24} color="#dc2626" />
                    </div>
                    <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Error</h3>
                        <p style={{ margin: '0 0 16px', color: '#475569' }}>{error || "Workspace not found"}</p>
                        <button onClick={() => navigate('/execution')} className="execution-secondary-button">
                            <ArrowLeft size={16} />
                            Back to Queue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'tasks', label: 'Tasks', icon: ListTodo },
        { id: 'kanban', label: 'Kanban', icon: LayoutDashboard },
        { id: 'allocations', label: 'Employee Allocation', icon: Users },
        { id: 'progress', label: 'Daily Progress', icon: Activity },
        { id: 'labour', label: 'Labour Hours', icon: Clock },
        { id: 'materials', label: 'Materials', icon: Wrench },
        { id: 'issues', label: 'Issues', icon: AlertTriangle },
        { id: 'delays', label: 'Delays', icon: Clock },
        { id: 'documents', label: 'Documents', icon: FileText },
        { id: 'photos', label: 'Photos', icon: Image },
        { id: 'approvals', label: 'Approval Requests', icon: CheckSquare },
        { id: 'changes', label: 'Change Requests', icon: PenTool },
    ];

    const getStatusClass = (status: string) => {
        if (status === 'IN_PROGRESS') return 'status-in-progress';
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'ON_HOLD') return 'status-on-hold';
        return 'status-default';
    };

    return (
        <div className="execution-page" style={{ minHeight: '100vh', padding: 0 }}>
            {/* Top Navigation Bar */}
            <div className="execution-details-header">
                <button onClick={() => navigate('/execution')} className="execution-back-button">
                    <ArrowLeft size={20} />
                </button>
                <div className="execution-header-info">
                    <div className="execution-header-title">
                        <span className="execution-project-code">{workspace.projectCode}</span>
                        <h1>{workspace.projectTitle || "Execution Workspace"}</h1>
                    </div>
                    <div className="execution-header-meta">
                        <div className="execution-meta-item">
                            <Briefcase size={16} />
                            {workspace.projectManagerName || 'Unassigned PM'}
                        </div>
                        <div className="execution-meta-item">
                            <Calendar size={16} />
                            {workspace.plannedStartDate || 'TBD'} - {workspace.plannedEndDate || 'TBD'}
                        </div>
                    </div>
                </div>
                
                <div className="execution-header-actions">
                    {!hasWritePermission && (
                        <div className="execution-status-pill" style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #cbd5e1' }}>
                            Read Only
                        </div>
                    )}
                    <div className={`execution-status-pill ${getStatusClass(workspace.status)}`}>
                        <div className="execution-dot"></div>
                        {workspace.status.replace('_', ' ')}
                    </div>
                    <div className="execution-progress-mini">
                        <span className="execution-progress-mini-label">Progress</span>
                        <div className="execution-progress-mini-bar">
                            <div className="execution-progress-mini-fill" style={{ width: `${workspace.overallProgress || 0}%` }}></div>
                        </div>
                        <span className="execution-progress-mini-value">{workspace.overallProgress || 0}%</span>
                    </div>
                    {hasWritePermission && (
                        <button onClick={() => setIsSetupModalOpen(true)} className="execution-secondary-button" style={{ marginLeft: '12px' }}>
                            <Settings size={16} />
                            Setup Workspace
                        </button>
                    )}
                </div>
            </div>

            <div className="execution-layout">
                {/* Sidebar Tabs */}
                <div className="execution-sidebar">
                    <nav className="execution-nav">
                        {tabs.map(tab => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`execution-tab ${activeTab === tab.id ? 'active' : ''}`}>
                                <tab.icon size={18} className="execution-tab-icon" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                
                {/* Main Content Area */}
                <div className="execution-content">
                    {activeTab === 'overview' && (
                        <div className="execution-overview">
                            <h2>Workspace Overview</h2>
                            
                            {/* Summary Dashboard Cards */}
                            <div className="execution-stats-grid">

                                {[
                                    { label: 'Overall Progress', value: `${workspace.overallProgress || 0}%`, icon: BarChart3, color: 'blue' },
                                    { label: 'Total Tasks', value: summary?.totalTasks || 0, icon: ListTodo, color: 'indigo' },
                                    { label: 'Overdue Tasks', value: summary?.overdueTasks || 0, icon: Clock, color: 'rose' },
                                    { label: 'Open Issues', value: summary?.blockedTasks || 0 /* Using blocked for issues if no open issues stat */, icon: ShieldAlert, color: 'amber' },
                                    { label: 'Labour Hours', value: `${summary?.totalActualHours || 0}h`, icon: Users, color: 'emerald' },
                                    { label: 'Material Cost', value: `$${summary?.materialCostTotal || 0}`, icon: Wrench, color: 'slate' }
                                ].map((stat, idx) => (

                                    <div key={idx} className="execution-stat-card">
                                        <div className={`execution-stat-icon-wrapper color-${stat.color}`}>
                                            <stat.icon size={16} />
                                        </div>
                                        <p className="execution-stat-label">{stat.label}</p>
                                        <p className="execution-stat-value">{stat.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="execution-details-grid">
                                {/* Project Details Card */}
                                <div className="execution-detail-card">
                                    <div className="execution-detail-header">
                                        <h3>
                                            <LayoutDashboard size={16} />
                                            Execution Timeline
                                        </h3>
                                    </div>
                                    <div className="execution-detail-body">
                                        <div className="execution-timeline-grid">
                                            <div className="execution-timeline-item">
                                                <p className="execution-timeline-label">Planned Start</p>
                                                <p className="execution-timeline-value">{workspace.plannedStartDate || 'Not set'}</p>
                                            </div>
                                            <div className="execution-timeline-item">
                                                <p className="execution-timeline-label">Planned End</p>
                                                <p className="execution-timeline-value">{workspace.plannedEndDate || 'Not set'}</p>
                                            </div>
                                            <div className="execution-timeline-item">
                                                <p className="execution-timeline-label">Actual Start</p>
                                                <p className="execution-timeline-value">{workspace.actualStartDate || 'Not started'}</p>
                                            </div>
                                            <div className="execution-timeline-item">
                                                <p className="execution-timeline-label">Actual End</p>
                                                <p className="execution-timeline-value">{workspace.actualEndDate || 'Not completed'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Team Card */}
                                <div className="execution-detail-card">
                                    <div className="execution-detail-header">
                                        <h3>
                                            <Users size={16} />
                                            Key Personnel
                                        </h3>
                                    </div>
                                    <div className="execution-detail-body">
                                        <div className="execution-team-member">
                                            <div className="execution-avatar">
                                                {workspace.projectManagerName ? workspace.projectManagerName.charAt(0) : 'U'}
                                            </div>
                                            <div className="execution-member-info">
                                                <p>{workspace.projectManagerName || 'Unassigned'}</p>
                                                <p>Project Manager</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tasks' && <TasksTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'kanban' && <KanbanTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'allocations' && <AllocationsTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'progress' && <ProgressTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'labour' && <LabourTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'materials' && <MaterialsTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'issues' && <IssuesTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'delays' && <DelaysTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'documents' && <DocumentsTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'photos' && <PhotosTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'approvals' && <ApprovalsTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                    {activeTab === 'changes' && <ChangeRequestsTab workspaceId={workspace.id} onRefreshSummary={loadWorkspace} />}
                </div>
            </div>
            
            <SetupWorkspaceModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                workspaceId={workspace.id}
                onSuccess={loadWorkspace}
            />
        </div>
    );
};
