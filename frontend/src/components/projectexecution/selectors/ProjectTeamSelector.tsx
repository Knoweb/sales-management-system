import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { projectExecutionApi } from '../../../api/projectExecutionApi';

interface ProjectTeamSelectorProps {
    workspaceId: string;
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
    isOptional?: boolean;
}

export const ProjectTeamSelector: React.FC<ProjectTeamSelectorProps> = (props) => {
    const fetchTeam = async (search: string): Promise<Option[]> => {
        try {
            const res = await projectExecutionApi.resources.getAllocations(props.workspaceId);
            const searchLower = search.toLowerCase();
            
            let filtered = res.data || [];
            if (searchLower) {
                filtered = filtered.filter((emp: any) => 
                    emp.employeeName?.toLowerCase().includes(searchLower)
                );
            }

            const options = filtered.map((emp: any) => ({
                id: emp.employeeId,
                label: `${emp.employeeName}`,
                subtitle: `${emp.roleDescription?.replace(/_/g, ' ')}`,
                originalData: emp
            }));
            
            if (props.isOptional && !searchLower) {
                options.unshift({
                    id: '',
                    label: 'Unassigned / None',
                    subtitle: '',
                    originalData: null
                });
            }
            return options;
        } catch {
            return [];
        }
    };

    return (
        <SearchableSelect
            value={props.value}
            onChange={props.onChange}
            disabled={props.disabled}
            defaultLabel={props.defaultLabel}
            fetchOptions={fetchTeam}
            placeholder={props.placeholder || "Select team member..."}
        />
    );
};
