/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { projectExecutionApi } from '../../../api/projectExecutionApi';
import type { } from '../../../api/projectExecutionApi';

interface Props { workspaceId: string; onRefreshSummary?: () => void;  canEdit?: boolean; }

const COLUMNS = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED'];

const KanbanTab: React.FC<Props> = ({ workspaceId, onRefreshSummary, canEdit = true }) => {
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await projectExecutionApi.tasks.getByWorkspace(workspaceId);
            setTasks(res.data);
        } catch (error: any) {
            if (error?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                alert('Failed to load tasks');
            }
        }
        setLoading(false);
    };

    useEffect(() => { fetchTasks(); }, [workspaceId]);

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await projectExecutionApi.tasks.updateStatus(taskId, newStatus);
            fetchTasks();
            if (onRefreshSummary) onRefreshSummary();
        } catch (err) {
            const e = err as any;
            if (e?.response?.status === 403) {
                alert("You have read-only access. Only the Project Manager can make changes.");
            } else {
                const msg = e?.response?.data?.message || 'Failed to update status';
                alert(msg);
            }
        }
    };

    if (loading) return <p>Loading Kanban...</p>;

    return (
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '16px 0' }}>
            {COLUMNS.map((status: any) => (
                <div key={status} style={{ minWidth: '250px', flex: 1, backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>{status.replace('_', ' ')}</h4>
                    {tasks.filter((t: any) => t.status === status).map((task: any) => (
                        <div key={task.id} style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '8px' }}>
                            <strong>{task.title}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', marginBottom: '8px' }}>
                                {task.completionPercentage || 0}% | {task.priority}
                                {task.plannedEndDate && ` | Due: ${task.plannedEndDate}`}
                            </div>
                            {task.status === 'COMPLETED' && (
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                                    <span style={{ color: '#64748b', fontWeight: 'bold', padding: '2px 4px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>Completed</span>
                                </div>
                            )}
                            {task.status === 'CANCELLED' && (
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                                    <span style={{ color: '#64748b', fontWeight: 'bold', padding: '2px 4px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>Cancelled</span>
                                </div>
                            )}
                            {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && task.executionStatus && (
                                <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                                    {task.executionStatus === 'DELAYED' && <span style={{ color: '#d32f2f', fontWeight: 'bold', padding: '2px 4px', backgroundColor: '#ffebee', borderRadius: '4px' }}>DELAYED ({task.delayDays}d)</span>}
                                    {task.executionStatus === 'NO_UPDATE' && <span style={{ color: '#ed6c02', fontWeight: 'bold', padding: '2px 4px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>NO UPDATE</span>}
                                    {task.executionStatus === 'ON_TRACK' && <span style={{ color: '#2e7d32', fontWeight: 'bold', padding: '2px 4px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>ON TRACK</span>}
                                </div>
                            )}
                            <select disabled={!canEdit} value={task.status} onChange={(e: any) => handleStatusChange(task.id, e.target.value)} style={{ width: '100%', padding: '4px' }}>
                                {COLUMNS.map((s: any) => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};
export default KanbanTab;
