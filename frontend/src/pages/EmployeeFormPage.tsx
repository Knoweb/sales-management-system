import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { EmployeeApi } from "../services/EmployeeApi";
import { DepartmentApi } from "../services/DepartmentApi";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { FormField, Input, Select } from "../components/Forms";
import { SectionHeader } from "../components/SectionHeader";
import { Alert } from "../components/Alert";
import type { Department } from "../types/department";
import { apiClient } from "../services/Api";

interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}
import type {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  EmploymentType,
} from "../types/employee";

import { ContactRound } from "lucide-react";

export const EmployeeFormPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeNumber: "",
    departmentId: "",
    firstName: "",
    lastName: "",
    workEmail: "",
    personalEmail: "",
    contactNumber: "",
    jobTitle: "",
    employmentType: "FULL_TIME",
    hireDate: "",
    weeklyCapacityHours: 40,
    userId: "",
    notes: "",
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch departments
        const deptData = await DepartmentApi.search(undefined, true, 0, 100);
        setDepartments(deptData.content || []);

        // Fetch active, unlinked users
        const usersResponse = await apiClient.get<{ content: SimpleUser[] }>(
          "/users",
          {
            params: { active: true, unlinked: true, size: 100 },
          },
        );
        setAvailableUsers(usersResponse.data.content || []);
      } catch (err) {
        console.error("Failed to load initial data", err);
        setError("Failed to load form data.");
      }
    };
    fetchInitialData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: CreateEmployeeRequest & UpdateEmployeeRequest = {
        departmentId: formData.departmentId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        workEmail: formData.workEmail || undefined,
        personalEmail: formData.personalEmail || undefined,
        contactNumber: formData.contactNumber || undefined,
        jobTitle: formData.jobTitle,
        employmentType: formData.employmentType as EmploymentType,
        hireDate: formData.hireDate || undefined,
        weeklyCapacityHours: formData.weeklyCapacityHours,
        userId: formData.userId || undefined,
        notes: formData.notes || undefined,
        employeeNumber: formData.employeeNumber,
      };

      await EmployeeApi.create(payload);
      navigate("/employees");
    } catch (err: unknown) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to create employee");
      } else {
        setError("Failed to create employee");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-6">
      <PageHeader
        title="Add New Employee"
        description="Create a new employee record and setup their profile."
        icon={<ContactRound size={24} />}
      />

      <div style={{ maxWidth: "800px" }}>
        <Card>
          {error && (
            <Alert variant="error" style={{ marginBottom: "1.5rem" }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <SectionHeader title="Personal Information" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <FormField label="First Name" required id="firstName">
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Last Name" required id="lastName">
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>
            </div>

            <SectionHeader title="Employment Information" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <FormField label="Employee Number" required id="employeeNumber">
                <Input
                  type="text"
                  id="employeeNumber"
                  name="employeeNumber"
                  value={formData.employeeNumber}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Department" required id="departmentId">
                <Select
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Job Title" required id="jobTitle">
                <Input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </FormField>

              <FormField label="Employment Type" required id="employmentType">
                <Select
                  id="employmentType"
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </Select>
              </FormField>

              <FormField label="Hire Date" id="hireDate">
                <Input
                  type="date"
                  id="hireDate"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>

              <FormField label="User Account" id="userId">
                <Select
                  id="userId"
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">-- No User Account --</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.email})
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <SectionHeader title="Contact Information" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <FormField label="Work Email" id="workEmail">
                <Input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Contact Number" id="contactNumber">
                <Input
                  type="text"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>

              <FormField label="Personal Email" id="personalEmail">
                <Input
                  type="email"
                  id="personalEmail"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>
            </div>

            <SectionHeader title="Capacity and Notes" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              <FormField
                label="Weekly Capacity (Hours)"
                id="weeklyCapacityHours"
              >
                <Input
                  type="number"
                  id="weeklyCapacityHours"
                  name="weeklyCapacityHours"
                  value={formData.weeklyCapacityHours}
                  onChange={handleChange}
                  disabled={loading}
                />
              </FormField>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
                borderTop: "1px solid var(--color-border)",
                paddingTop: "1.5rem",
              }}
            >
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/employees")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={loading}>
                Create Employee
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
