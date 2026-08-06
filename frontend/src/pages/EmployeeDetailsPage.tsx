import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EmployeeApi } from "../services/EmployeeApi";
import type { Employee } from "../types/employee";
import type { EmployeeSkill } from "../types/skill";
import type { EmployeeQualification } from "../types/qualification";
import type { EmployeeLeave, LeaveStatus } from "../types/leave";
import type { AvailabilityResponse } from "../types/availability";
import {
  ContactRound,
  CheckCircle,
  BookOpen,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { PermissionGuard } from "../components/PermissionGuard";
import { EmployeeSkillForm } from "../components/EmployeeSkillForm";
import { EmployeeQualificationForm } from "../components/EmployeeQualificationForm";
import { EmployeeLeaveForm } from "../components/EmployeeLeaveForm";
import { Tabs } from "../components/Tabs";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../components/Table";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "../components/FeedbackStates";
import { Input } from "../components/Forms";

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [qualifications, setQualifications] = useState<EmployeeQualification[]>(
    [],
  );
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editSkillData, setEditSkillData] = useState<
    EmployeeSkill | undefined
  >();

  const [showQualForm, setShowQualForm] = useState(false);
  const [editQualData, setEditQualData] = useState<
    EmployeeQualification | undefined
  >();

  const [showLeaveForm, setShowLeaveForm] = useState(false);

  // Availability states
  const [availStart, setAvailStart] = useState("");
  const [availEnd, setAvailEnd] = useState("");
  const [availData, setAvailData] = useState<AvailabilityResponse | null>(null);
  const [availLoading, setAvailLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const loadedTabsRef = React.useRef(new Set<string>());

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const loadEmployee = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await EmployeeApi.getById(id, controller.signal);
        setEmployee(data);
        loadedTabsRef.current.clear();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!controller.signal.aborted) {
          const status = err?.response?.status;
          if (status === 403) {
            setError("Unauthorized to view this employee.");
          } else if (status !== 404) {
            setError("Failed to load employee details.");
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadEmployee();

    return () => {
      controller.abort();
    };
  }, [id, retryCount]);

  const loadSkills = async () => {
    if (!id) return;
    try {
      const data = await EmployeeApi.getSkills(id);
      setSkills(data);
      loadedTabsRef.current.add("skills");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      !id ||
      activeTab !== "skills" ||
      loadedTabsRef.current.has("skills") ||
      loading
    )
      return;
    const controller = new AbortController();

    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getSkills(id, controller.signal);
        setSkills(data);
        loadedTabsRef.current.add("skills");
      } catch (err) {
        if (!controller.signal.aborted) console.error(err);
      }
    };

    void loadTab();
    return () => controller.abort();
  }, [id, activeTab, loading]);

  const loadQualifications = async () => {
    if (!id) return;
    try {
      const data = await EmployeeApi.getQualifications(id);
      setQualifications(data);
      loadedTabsRef.current.add("qualifications");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      !id ||
      activeTab !== "qualifications" ||
      loadedTabsRef.current.has("qualifications") ||
      loading
    )
      return;
    const controller = new AbortController();

    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getQualifications(id, controller.signal);
        setQualifications(data);
        loadedTabsRef.current.add("qualifications");
      } catch (err) {
        if (!controller.signal.aborted) console.error(err);
      }
    };

    void loadTab();
    return () => controller.abort();
  }, [id, activeTab, loading]);

  const loadLeaves = async () => {
    if (!id) return;
    try {
      const data = await EmployeeApi.getLeaves(id);
      setLeaves(data);
      loadedTabsRef.current.add("leave");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (
      !id ||
      activeTab !== "leave" ||
      loadedTabsRef.current.has("leave") ||
      loading
    )
      return;
    const controller = new AbortController();

    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getLeaves(id, controller.signal);
        setLeaves(data);
        loadedTabsRef.current.add("leave");
      } catch (err) {
        if (!controller.signal.aborted) console.error(err);
      }
    };

    void loadTab();
    return () => controller.abort();
  }, [id, activeTab, loading]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSkillSubmit = async (data: any) => {
    try {
      if (editSkillData) {
        await EmployeeApi.updateSkill(id!, editSkillData.skill.id, data);
      } else {
        await EmployeeApi.assignSkill(id!, data);
      }
      await loadSkills();
      setShowSkillForm(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to save skill");
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (confirm("Are you sure you want to remove this skill?")) {
      await EmployeeApi.removeSkill(id!, skillId);
      setSkills(skills.filter((s) => s.skill.id !== skillId));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleQualificationSubmit = async (data: any) => {
    try {
      if (editQualData) {
        await EmployeeApi.updateQualification(id!, editQualData.id, data);
      } else {
        await EmployeeApi.addQualification(id!, data);
      }
      await loadQualifications();
      setShowQualForm(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to save qualification");
    }
  };

  const handleRemoveQual = async (qualId: string) => {
    if (confirm("Are you sure you want to remove this qualification?")) {
      await EmployeeApi.removeQualification(id!, qualId);
      setQualifications(qualifications.filter((q) => q.id !== qualId));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleLeaveSubmit = async (data: any) => {
    try {
      await EmployeeApi.requestLeave(id!, data);
      await loadLeaves();
      setShowLeaveForm(false);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error?.response?.data?.message || "Failed to record leave");
    }
  };

  const handleLeaveStatusUpdate = async (
    leaveId: string,
    status: LeaveStatus,
  ) => {
    await EmployeeApi.updateLeaveStatus(id!, leaveId, status);
    await loadLeaves();
  };

  const checkAvailability = async () => {
    if (!availStart || !availEnd) return;
    try {
      setAvailLoading(true);
      const data = await EmployeeApi.checkAvailability(
        id!,
        availStart,
        availEnd,
      );
      setAvailData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAvailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <LoadingState message="Loading employee details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <ErrorState
          message={error}
          onRetry={() => setRetryCount((c) => c + 1)}
        />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <ErrorState
          title="Employee Not Found"
          message="The employee you are looking for does not exist."
        />
        <div className="text-center mt-4">
          <Button variant="secondary" onClick={() => navigate("/employees")}>
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: "overview", label: "Overview" },
    { id: "skills", label: "Skills" },
    { id: "qualifications", label: "Qualifications" },
    { id: "leave", label: "Leave" },
    { id: "availability", label: "Availability" },
  ];

  const descriptionStr = [
    employee.jobTitle,
    employee.department?.name || "No Department",
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <div style={{ marginBottom: '20px' }}>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/employees')}
          style={{
            height: '40px',
            paddingInline: '12px',
            backgroundColor: '#f8fafc',
            color: '#475569',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'none',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <ArrowLeft size={18} strokeWidth={2.2} />
            Back to Directory
          </span>
        </Button>
      </div>

      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        icon={<ContactRound size={24} />}
        description={descriptionStr}
      />

      <div className="mb-6">
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div>
        {activeTab === "overview" && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'stretch',
              gap: '24px',
            }}
          >
            {/* Contact Information Card */}
            <div
              style={{
                flex: '1 1 320px',
                minWidth: 0,
              }}
            >
              <Card>
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: '#0f172a',
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      Contact Information
                    </h2>
                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      Employee contact details
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: '14px',
                    }}
                  >
                    {/* Work Email */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Work Email
                      </p>
                      <p
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {employee.workEmail || <span style={{ color: '#94a3b8' }}>N/A</span>}
                      </p>
                    </div>

                    {/* Personal Email */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Personal Email
                      </p>
                      <p
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {employee.personalEmail || <span style={{ color: '#94a3b8' }}>N/A</span>}
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Phone Number
                      </p>
                      <p
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        {employee.contactNumber || <span style={{ color: '#94a3b8' }}>N/A</span>}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Employment Details Card */}
            <div
              style={{
                flex: '2 1 520px',
                minWidth: 0,
              }}
            >
              <Card>
                <div style={{ padding: '24px' }}>
                  <div
                    style={{
                      marginBottom: '20px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        color: '#0f172a',
                        fontSize: '20px',
                        fontWeight: 700,
                        lineHeight: 1.3,
                      }}
                    >
                      Employment Details
                    </h2>
                    <p
                      style={{
                        margin: '6px 0 0',
                        color: '#64748b',
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}
                    >
                      Employee roles and status
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gap: '14px',
                    }}
                  >
                    {/* Employee ID */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Employee ID
                      </p>
                      <p
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                        }}
                      >
                        {employee.employeeNumber}
                      </p>
                    </div>

                    {/* Hire Date */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Hire Date
                      </p>
                      <p
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                        }}
                      >
                        {employee.hireDate || <span style={{ color: '#94a3b8' }}>N/A</span>}
                      </p>
                    </div>

                    {/* Linked User */}
                    <div
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: '#64748b',
                          fontSize: '12px',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Linked User
                      </p>
                      <div
                        style={{
                          margin: '7px 0 0',
                          color: '#0f172a',
                          fontSize: '16px',
                          fontWeight: 600,
                          lineHeight: 1.5,
                        }}
                      >
                        {employee.user ? (
                          <div>
                            <div>{employee.user.email}</div>
                            {employee.user.roles && employee.user.roles.length > 0 && (
                              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                Role: {employee.user.roles.join(', ')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>N/A</span>
                        )}
                      </div>
                    </div>

                    {/* Type and Status */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '14px',
                      }}
                    >
                      {/* Employment Type */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Employment Type
                          </p>
                          <p
                            style={{
                              margin: '6px 0 0',
                              color: '#475569',
                              fontSize: '14px',
                            }}
                          >
                            Contract type
                          </p>
                        </div>
                        <StatusBadge status={employee.employmentType} variant="neutral" />
                      </div>

                      {/* Employment Status */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin: 0,
                              color: '#64748b',
                              fontSize: '12px',
                              fontWeight: 700,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                            }}
                          >
                            Current Status
                          </p>
                          <p
                            style={{
                              margin: '6px 0 0',
                              color: '#475569',
                              fontSize: '14px',
                            }}
                          >
                            Active employee status
                          </p>
                        </div>
                        <StatusBadge status={employee.employmentStatus} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "skills" && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                <CheckCircle size={20} className="text-blue-500" /> Skills
              </h3>
              <div style={{ marginLeft: 'auto' }}>
                <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                  <Button
                    onClick={() => {
                      setEditSkillData(undefined);
                      setShowSkillForm(true);
                    }}
                  >
                    Add Skill
                  </Button>
                </PermissionGuard>
              </div>
            </div>
            {skills.length === 0 ? (
              <EmptyState
                title="No skills assigned"
                message="This employee has no skills."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Skill</TableHeader>
                      <TableHeader>Proficiency</TableHeader>
                      <TableHeader>Years</TableHeader>
                      <TableHeader>Verified</TableHeader>
                      <TableHeader align="right">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {skills.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {s.skill?.name}
                        </TableCell>
                        <TableCell>{s.proficiencyLevel}</TableCell>
                        <TableCell>{s.yearsOfExperience || "-"}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={s.verified ? "Verified" : "Unverified"}
                            variant={s.verified ? "success" : "neutral"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditSkillData(s);
                                  setShowSkillForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                style={{ color: "#dc2626" }}
                                onClick={() => handleRemoveSkill(s.skill.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {activeTab === "qualifications" && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                <BookOpen size={20} className="text-blue-500" /> Qualifications
              </h3>
              <div style={{ marginLeft: 'auto' }}>
                <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                  <Button
                    onClick={() => {
                      setEditQualData(undefined);
                      setShowQualForm(true);
                    }}
                  >
                    Add Qualification
                  </Button>
                </PermissionGuard>
              </div>
            </div>
            {qualifications.length === 0 ? (
              <EmptyState
                title="No qualifications added"
                message="This employee has no qualifications."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Name</TableHeader>
                      <TableHeader>Institution</TableHeader>
                      <TableHeader>Level</TableHeader>
                      <TableHeader>Verified</TableHeader>
                      <TableHeader align="right">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qualifications.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">
                          {q.qualificationName}
                        </TableCell>
                        <TableCell>{q.institution || "-"}</TableCell>
                        <TableCell>{q.qualificationLevel || "-"}</TableCell>
                        <TableCell>
                          <StatusBadge
                            status={q.verified ? "Verified" : "Unverified"}
                            variant={q.verified ? "success" : "neutral"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  setEditQualData(q);
                                  setShowQualForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                style={{ color: "#dc2626" }}
                                onClick={() => handleRemoveQual(q.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {activeTab === "leave" && (
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '1.5rem' }}>
              <h3 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                <Calendar size={20} className="text-blue-500" /> Leave Requests
              </h3>
              <div style={{ marginLeft: 'auto' }}>
                <PermissionGuard
                  permission={["EMPLOYEE_LEAVE_MANAGE", "EMPLOYEE_SELF_READ"]}
                >
                  <Button onClick={() => setShowLeaveForm(true)}>
                    Request Leave
                  </Button>
                </PermissionGuard>
              </div>
            </div>
            {leaves.length === 0 ? (
              <EmptyState
                title="No leave requests"
                message="This employee has no leave requests."
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Type</TableHeader>
                      <TableHeader>Start Date</TableHeader>
                      <TableHeader>End Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                      <TableHeader align="right">Actions</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaves.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">
                          {l.leaveType}
                        </TableCell>
                        <TableCell>{l.startDate}</TableCell>
                        <TableCell>{l.endDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={l.status} />
                        </TableCell>
                        <TableCell align="right">
                          <PermissionGuard permission="EMPLOYEE_LEAVE_MANAGE">
                            {l.status === "PENDING" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    handleLeaveStatusUpdate(l.id, "APPROVED")
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  style={{ color: "#dc2626" }}
                                  onClick={() =>
                                    handleLeaveStatusUpdate(l.id, "REJECTED")
                                  }
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </PermissionGuard>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        )}

        {activeTab === "availability" && (
          <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
            <Card>
              <div className="mb-6">
                <h3 className="text-lg font-medium flex items-center gap-2 text-gray-900">
                  <Clock size={20} className="text-blue-500" /> Availability
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  <strong className="font-medium">Weekly Capacity:</strong>{" "}
                  {employee.weeklyCapacityHours} hours
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end mb-8">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    value={availStart}
                    onChange={(e) => setAvailStart(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    label="End Date"
                    value={availEnd}
                    onChange={(e) => setAvailEnd(e.target.value)}
                  />
                </div>
                <div>
                  <Button
                    onClick={checkAvailability}
                    disabled={availLoading || !availStart || !availEnd}
                    style={{ height: "42px", paddingLeft: "1.5rem", paddingRight: "1.5rem", width: "100%" }}
                  >
                    {availLoading ? "Checking..." : "Check"}
                  </Button>
                </div>
              </div>

              {availData && (
                <div
                  className="mt-6 rounded-lg border border-gray-200 bg-gray-50"
                  style={{
                    padding: "18px 20px",
                    maxWidth: "520px",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "190px 16px auto",
                      rowGap: "14px",
                      alignItems: "center",
                    }}
                  >
                    <span className="text-sm font-medium text-gray-600">
                      Estimated Capacity
                    </span>
                    <span className="text-sm text-gray-400">-</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {availData.estimatedCapacityHours} hrs
                    </span>

                    <span className="text-sm font-medium text-gray-600">
                      Approved Leave
                    </span>
                    <span className="text-sm text-gray-400">-</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {availData.approvedLeaveHours} hrs
                    </span>

                    <span className="text-sm font-medium text-gray-600">
                      Available
                    </span>
                    <span className="text-sm text-gray-400">-</span>
                    <span
                      className={`text-sm font-semibold ${
                        availData.estimatedAvailableHours < 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {availData.estimatedAvailableHours} hrs
                    </span>

                    <span className="text-sm font-medium text-gray-600">
                      Availability Utilization
                    </span>
                    <span className="text-sm text-gray-400">-</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {availData.availabilityPercentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        availData.availabilityPercentage < 0
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          Math.max(availData.availabilityPercentage, 0),
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {showSkillForm && (
        <EmployeeSkillForm
          initialData={editSkillData}
          onClose={() => setShowSkillForm(false)}
          onSubmit={handleSkillSubmit}
        />
      )}

      {showQualForm && (
        <EmployeeQualificationForm
          initialData={editQualData}
          onClose={() => setShowQualForm(false)}
          onSubmit={handleQualificationSubmit}
        />
      )}

      {showLeaveForm && (
        <EmployeeLeaveForm
          onClose={() => setShowLeaveForm(false)}
          onSubmit={handleLeaveSubmit}
        />
      )}
    </div>
  );
};
