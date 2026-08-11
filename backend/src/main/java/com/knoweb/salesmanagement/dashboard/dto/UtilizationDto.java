package com.knoweb.salesmanagement.dashboard.dto;

import java.util.List;

public class UtilizationDto {
    private String departmentName;
    private int totalEmployees;
    private int activeProjects;
    private List<EmployeeUtilizationDto> employees;

    public static class EmployeeUtilizationDto {
        private String name;
        private int activeAssignments;
        
        public EmployeeUtilizationDto(String name, int activeAssignments) {
            this.name = name;
            this.activeAssignments = activeAssignments;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public int getActiveAssignments() { return activeAssignments; }
        public void setActiveAssignments(int activeAssignments) { this.activeAssignments = activeAssignments; }
    }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public int getTotalEmployees() { return totalEmployees; }
    public void setTotalEmployees(int totalEmployees) { this.totalEmployees = totalEmployees; }

    public int getActiveProjects() { return activeProjects; }
    public void setActiveProjects(int activeProjects) { this.activeProjects = activeProjects; }

    public List<EmployeeUtilizationDto> getEmployees() { return employees; }
    public void setEmployees(List<EmployeeUtilizationDto> employees) { this.employees = employees; }
}
