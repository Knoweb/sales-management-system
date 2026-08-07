import React from 'react';
import { SearchableSelect } from './SearchableSelect';
import type { Option } from './SearchableSelect';
import { projectExecutionApi } from '../../../api/projectExecutionApi';

interface EmployeeSelectorProps {
    value?: string;
    onChange: (value: string, option?: Option) => void;
    disabled?: boolean;
    placeholder?: string;
    defaultLabel?: string;
}

export const EmployeeSelector: React.FC<EmployeeSelectorProps> = (props) => {
    const fetchEmployees = async (search: string): Promise<Option[]> => {
        const res = await projectExecutionApi.lookups.employees();
        const searchLower = search.toLowerCase();
        
        let filtered = res;
        if (searchLower) {
            filtered = res.filter((emp: any) => 
                emp.fullName.toLowerCase().includes(searchLower) || 
                (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(searchLower))
            );
        }

        return filtered.map((emp: any) => ({
            id: emp.employeeId,
            label: `${emp.employeeNumber || emp.employeeId.substring(0,8)} - ${emp.fullName}`,
            subtitle: `${emp.departmentName || 'No Dept'}`,
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
