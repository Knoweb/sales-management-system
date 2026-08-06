import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { projectExecutionApi } from '../../../api/projectExecutionApi';

interface TaskSelectorProps {
    workspaceId: string;
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({ workspaceId, ...props }) => {
    const fetchTasks = async (search: string): Promise<Option[]> => {
        if (!workspaceId) return [];
        const res = await projectExecutionApi.tasks.getByWorkspace(workspaceId);
        
        // Client-side filtering since API doesn't support search param for workspace tasks
        const filtered = res.data.filter(t => 
            !search || 
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.id?.toLowerCase().includes(search.toLowerCase())
        );
        
        return filtered.map(t => ({
            id: t.id!,
            label: `${t.id || t.id?.substring(0,8)} — ${t.title}`,
            subtitle: `Assignee: ${t.assigneeName || 'Unassigned'} · Status: ${t.status}`,
            originalData: t
        }));
    };

    return (
        <SearchableSelect
            {...props}
            fetchOptions={fetchTasks}
            placeholder={props.placeholder || "Select a Task..."}
        />
    );
};
