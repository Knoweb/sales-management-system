import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { apiClient } from '../../../services/Api';

interface ProjectManagerSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const ProjectManagerSelector: React.FC<ProjectManagerSelectorProps> = (props) => {
    const fetchUsers = async (search: string): Promise<Option[]> => {
        const res = await apiClient.get<{content: Array<{id: string, firstName: string, lastName: string, email: string, roles: string[]}>}>('/users', {
            params: { roleCode: 'PROJECT_MANAGER', search }
        });
        return res.data.content.map(u => ({
            id: u.id,
            label: `${u.firstName} ${u.lastName}`,
            subtitle: u.email,
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
