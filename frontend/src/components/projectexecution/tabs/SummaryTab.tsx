import { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { ProjectExecutionSummary } from '../../../api/projectExecutionApi';
import { LoadingState } from '../../FeedbackStates';

interface Props {
    workspaceId: string;
 canEdit?: boolean; }

const SummaryTab: React.FC<Props> = ({ workspaceId }) => { console.log(workspaceId);
    const [summary, setSummary] = useState<ProjectExecutionSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await projectExecutionApi.monitoring.getSummary(workspaceId);
                setSummary(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        void fetchSummary();
    }, [workspaceId]);

    if (loading) return <LoadingState message="Loading summary..." />;
    if (!summary) return <p className="text-danger">Failed to load summary</p>;

    return (
        <div>
            <div className="execution-tab-header-container">
                <div className="execution-tab-title-group">
                    <h2 className="execution-tab-title">Overview</h2>
                    <p className="execution-tab-subtitle">View overall project progress, task status and financial summary.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-surface-elevated p-4 rounded border border-border">
                    <h3 className="text-sm text-text-secondary font-medium">Overall Progress</h3>
                    <p className="text-3xl font-bold mt-2">{summary.overallProgress}%</p>
                </div>
                <div className="bg-surface-elevated p-4 rounded border border-border">
                    <h3 className="text-sm text-text-secondary font-medium">Tasks Status</h3>
                    <div className="mt-2 text-sm space-y-1">
                        <p>Total: <span className="font-medium">{summary.totalTasks}</span></p>
                        <p>Completed: <span className="font-medium text-success">{summary.completedTasks}</span></p>
                        <p>Blocked: <span className="font-medium text-danger">{summary.blockedTasks}</span></p>
                        <p>Overdue: <span className="font-medium text-warning">{summary.overdueTasks}</span></p>
                    </div>
                </div>
                <div className="bg-surface-elevated p-4 rounded border border-border">
                    <h3 className="text-sm text-text-secondary font-medium">Financials</h3>
                    <div className="mt-2 text-sm space-y-1">
                        <p>Total Estimated Hours: <span className="font-medium">{summary.totalEstimatedHours}h</span></p>
                        <p>Total Actual Hours: <span className="font-medium">{summary.totalActualHours}h</span></p>
                        <p>Labour Cost: <span className="font-medium">${summary.labourCostTotal}</span></p>
                        <p>Material Cost: <span className="font-medium">${summary.materialCostTotal}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default SummaryTab;
