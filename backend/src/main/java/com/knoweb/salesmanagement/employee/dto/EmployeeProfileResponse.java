package com.knoweb.salesmanagement.employee.dto;

public class EmployeeProfileResponse {
    private boolean linked;
    private boolean departmentHead;
    private EmployeeDTO employee;

    public EmployeeProfileResponse() {}

    public EmployeeProfileResponse(boolean linked, boolean departmentHead, EmployeeDTO employee) {
        this.linked = linked;
        this.departmentHead = departmentHead;
        this.employee = employee;
    }

    public boolean isLinked() {
        return linked;
    }

    public void setLinked(boolean linked) {
        this.linked = linked;
    }

    public boolean isDepartmentHead() {
        return departmentHead;
    }

    public void setDepartmentHead(boolean departmentHead) {
        this.departmentHead = departmentHead;
    }

    public EmployeeDTO getEmployee() {
        return employee;
    }

    public void setEmployee(EmployeeDTO employee) {
        this.employee = employee;
    }
}
