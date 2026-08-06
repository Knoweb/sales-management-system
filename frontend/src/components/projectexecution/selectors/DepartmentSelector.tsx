import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { DepartmentApi } from '../../../services/DepartmentApi';

interface DepartmentSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const DepartmentSelector: React.FC<DepartmentSelectorProps> = (props) => {
    const fetchDepartments = async (search: string): Promise<Option[]> => {
        const res = await DepartmentApi.search(search);
        return res.content.map(dept => ({
            id: dept.id,
            label: dept.name,
            subtitle: dept.code ? `Code: ${dept.code}` : undefined,
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
