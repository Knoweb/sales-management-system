import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { projectExecutionApi } from '../../../api/projectExecutionApi';

interface DepartmentSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = (props) => {
    const fetchDepartments = async (search: string): Promise<Option[]> => {
        const res = await projectExecutionApi.lookups.departments();
        const searchLower = search.toLowerCase();
        
        let filtered = res;
        if (searchLower) {
            filtered = res.filter((dept: any) => 
                dept.name.toLowerCase().includes(searchLower)
            );
        }

        return filtered.map((dept: any) => ({
            id: dept.id,
            label: dept.name,
            originalData: dept
        }));
    };

    return (
        <SearchableSelect
            {...props}
            fetchOptions={fetchDepartments}
            placeholder={props.placeholder || "Select a Department..."}
        />
    );
};
