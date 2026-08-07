import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { projectExecutionApi } from '../../../api/projectExecutionApi';

interface ProjectManagerSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const ProjectManagerSelector: React.FC<ProjectManagerSelectorProps> = (props) => {
    const fetchUsers = async (search: string): Promise<Option[]> => {
        const data = await projectExecutionApi.lookups.projectManagers();
        const pms = data.filter(emp => emp.fullName.toLowerCase().includes(search.toLowerCase()) || emp.employeeNumber.toLowerCase().includes(search.toLowerCase()));
        return pms.map(u => ({
            id: u.employeeId,
            label: `${u.employeeNumber} — ${u.fullName}`,
            subtitle: u.departmentName || 'Unknown Department',
            originalData: u
        }));
    };

    return (
        <SearchableSelect
            {...props}
            fetchOptions={fetchUsers}
            placeholder={props.placeholder || "Select a Project Manager..."}
        />
    );
};
