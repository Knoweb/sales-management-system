import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { EmployeeApi } from '../../../services/EmployeeApi';

interface EmployeeSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = (props) => {
    const fetchEmployees = async (search: string): Promise<Option[]> => {
        const res = await EmployeeApi.search(search);
        return res.content.map(emp => ({
            id: emp.id,
            label: `${emp.employeeNumber || emp.id.substring(0,8)} — ${emp.firstName} ${emp.lastName}`,
            subtitle: `${emp.jobTitle || 'No Title'}  ${(emp as any).department?.name || 'No Dept'}`,
            originalData: emp
        }));
    };

    return (
        <SearchableSelect
            {...props}
            fetchOptions={fetchEmployees}
            placeholder={props.placeholder || "Select an Employee..."}
        />
    );
};
