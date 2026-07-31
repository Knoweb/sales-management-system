import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Employee } from '../types/employee';
import type { EmployeeSkill } from '../types/skill';
import type { EmployeeQualification } from '../types/qualification';
import type { EmployeeLeave, LeaveStatus } from '../types/leave';
import type { AvailabilityResponse } from '../types/availability';
import { User, CheckCircle, BookOpen, Calendar, Clock, ArrowLeft } from 'lucide-react';
import { PermissionGuard } from '../components/PermissionGuard';
import { EmployeeSkillForm } from '../components/EmployeeSkillForm';
import { EmployeeQualificationForm } from '../components/EmployeeQualificationForm';
import { EmployeeLeaveForm } from '../components/EmployeeLeaveForm';
import { Tabs } from '../components/Tabs';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState } from '../components/FeedbackStates';
import { Input } from '../components/Forms';

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [qualifications, setQualifications] = useState<EmployeeQualification[]>([]);
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editSkillData, setEditSkillData] = useState<EmployeeSkill | undefined>();
  
  const [showQualForm, setShowQualForm] = useState(false);
  const [editQualData, setEditQualData] = useState<EmployeeQualification | undefined>();

  const [showLeaveForm, setShowLeaveForm] = useState(false);

  // Availability states
  const [availStart, setAvailStart] = useState('');
  const [availEnd, setAvailEnd] = useState('');
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
            setError('Failed to load employee details.');
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
      loadedTabsRef.current.add('skills');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id || activeTab !== 'skills' || loadedTabsRef.current.has('skills') || loading) return;
    const controller = new AbortController();
    
    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getSkills(id, controller.signal);
        setSkills(data);
        loadedTabsRef.current.add('skills');
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
      loadedTabsRef.current.add('qualifications');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id || activeTab !== 'qualifications' || loadedTabsRef.current.has('qualifications') || loading) return;
    const controller = new AbortController();
    
    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getQualifications(id, controller.signal);
        setQualifications(data);
        loadedTabsRef.current.add('qualifications');
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
      loadedTabsRef.current.add('leave');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id || activeTab !== 'leave' || loadedTabsRef.current.has('leave') || loading) return;
    const controller = new AbortController();
    
    const loadTab = async () => {
      try {
        const data = await EmployeeApi.getLeaves(id, controller.signal);
        setLeaves(data);
        loadedTabsRef.current.add('leave');
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
      alert(error?.response?.data?.message || 'Failed to save skill');
    }
  };

  const handleRemoveSkill = async (skillId: string) => {
    if (confirm('Are you sure you want to remove this skill?')) {
      await EmployeeApi.removeSkill(id!, skillId);
      setSkills(skills.filter(s => s.skill.id !== skillId));
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
      alert(error?.response?.data?.message || 'Failed to save qualification');
    }
  };

  const handleRemoveQual = async (qualId: string) => {
    if (confirm('Are you sure you want to remove this qualification?')) {
      await EmployeeApi.removeQualification(id!, qualId);
      setQualifications(qualifications.filter(q => q.id !== qualId));
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
      alert(error?.response?.data?.message || 'Failed to record leave');
    }
  };

  const handleLeaveStatusUpdate = async (leaveId: string, status: LeaveStatus) => {
    await EmployeeApi.updateLeaveStatus(id!, leaveId, status);
    await loadLeaves();
  };

  const checkAvailability = async () => {
    if (!availStart || !availEnd) return;
    try {
      setAvailLoading(true);
      const data = await EmployeeApi.checkAvailability(id!, availStart, availEnd);
      setAvailData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAvailLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 max-w-7xl mx-auto"><LoadingState message="Loading employee details..." /></div>;
  }

  if (error) {
    return <div className="p-6 max-w-7xl mx-auto"><ErrorState message={error} onRetry={() => setRetryCount(c => c + 1)} /></div>;
  }

  if (!employee) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <ErrorState title="Employee Not Found" message="The employee you are looking for does not exist." />
        <div className="text-center mt-4">
          <Link to="/employees" className="btn btn-secondary">Back to Employees</Link>
        </div>
      </div>
    );
  }

  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'skills', label: 'Skills' },
    { id: 'qualifications', label: 'Qualifications' },
    { id: 'leave', label: 'Leave' },
    { id: 'availability', label: 'Availability' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link to="/employees" className="btn btn-ghost text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      <PageHeader 
        title={
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-full">
              <User size={24} />
            </div>
            {employee.firstName} {employee.lastName}
          </div>
        }
        description={`${employee.jobTitle} • ${employee.department?.name || 'No Department'}`}
      />

      <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Contact Information</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Work Email</span>
                  <span className="col-span-2 text-gray-900">{employee.workEmail || <span className="text-gray-400">N/A</span>}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Personal Email</span>
                  <span className="col-span-2 text-gray-900">{employee.personalEmail || <span className="text-gray-400">N/A</span>}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Phone Number</span>
                  <span className="col-span-2 text-gray-900">{employee.contactNumber || <span className="text-gray-400">N/A</span>}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">Employment Details</h3>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Employee ID</span>
                  <span className="col-span-2 text-gray-900">{employee.employeeNumber}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Type</span>
                  <span className="col-span-2 text-gray-900">
                    <StatusBadge status={employee.employmentType} variant="neutral" />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="col-span-2">
                    <StatusBadge status={employee.employmentStatus} />
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Hire Date</span>
                  <span className="col-span-2 text-gray-900">{employee.hireDate || <span className="text-gray-400">N/A</span>}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-500 font-medium">Linked User</span>
                  <span className="col-span-2 text-gray-900">{employee.user ? employee.user.email : <span className="text-gray-400">None</span>}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'skills' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <CheckCircle size={20} className="text-blue-500" /> Skills
              </h3>
              <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                <Button onClick={() => { setEditSkillData(undefined); setShowSkillForm(true); }}>Add Skill</Button>
              </PermissionGuard>
            </div>
            {skills.length === 0 ? <p className="text-gray-500 text-center py-4">No skills assigned.</p> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Skill</TableHeader>
                    <TableHeader>Proficiency</TableHeader>
                    <TableHeader>Years</TableHeader>
                    <TableHeader>Verified</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {skills.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.skill?.name}</TableCell>
                      <TableCell>{s.proficiencyLevel}</TableCell>
                      <TableCell>{s.yearsOfExperience || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.verified ? 'Verified' : 'Unverified'} variant={s.verified ? 'success' : 'neutral'} />
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setEditSkillData(s); setShowSkillForm(true); }}>Edit</Button>
                            <Button variant="danger" onClick={() => handleRemoveSkill(s.skill.id)}>Remove</Button>
                          </div>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {activeTab === 'qualifications' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <BookOpen size={20} className="text-blue-500" /> Qualifications
              </h3>
              <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                <Button onClick={() => { setEditQualData(undefined); setShowQualForm(true); }}>Add Qualification</Button>
              </PermissionGuard>
            </div>
            {qualifications.length === 0 ? <p className="text-gray-500 text-center py-4">No qualifications added.</p> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Name</TableHeader>
                    <TableHeader>Institution</TableHeader>
                    <TableHeader>Level</TableHeader>
                    <TableHeader>Verified</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qualifications.map(q => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium">{q.qualificationName}</TableCell>
                      <TableCell>{q.institution || '-'}</TableCell>
                      <TableCell>{q.qualificationLevel || '-'}</TableCell>
                      <TableCell>
                        <StatusBadge status={q.verified ? 'Verified' : 'Unverified'} variant={q.verified ? 'success' : 'neutral'} />
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setEditQualData(q); setShowQualForm(true); }}>Edit</Button>
                            <Button variant="danger" onClick={() => handleRemoveQual(q.id)}>Remove</Button>
                          </div>
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {activeTab === 'leave' && (
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Calendar size={20} className="text-blue-500" /> Leave Requests
              </h3>
              <PermissionGuard permission={['EMPLOYEE_LEAVE_MANAGE', 'EMPLOYEE_SELF_READ']}>
                <Button onClick={() => setShowLeaveForm(true)}>Request Leave</Button>
              </PermissionGuard>
            </div>
            {leaves.length === 0 ? <p className="text-gray-500 text-center py-4">No leave requests.</p> : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Type</TableHeader>
                    <TableHeader>Start Date</TableHeader>
                    <TableHeader>End Date</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Actions</TableHeader>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map(l => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.leaveType}</TableCell>
                      <TableCell>{l.startDate}</TableCell>
                      <TableCell>{l.endDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell>
                        <PermissionGuard permission="EMPLOYEE_LEAVE_MANAGE">
                          {l.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button variant="primary" onClick={() => handleLeaveStatusUpdate(l.id, 'APPROVED')}>Approve</Button>
                              <Button variant="danger" onClick={() => handleLeaveStatusUpdate(l.id, 'REJECTED')}>Reject</Button>
                            </div>
                          )}
                        </PermissionGuard>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}

        {activeTab === 'availability' && (
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Clock size={20} className="text-blue-500" /> Availability
              </h3>
            </div>
            <p className="mb-4 text-sm"><strong className="font-medium text-gray-700">Weekly Capacity:</strong> {employee.weeklyCapacityHours} hours</p>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
                <div className="flex-1 w-full">
                  <Input type="date" label="Start Date" value={availStart} onChange={(e) => setAvailStart(e.target.value)} />
                </div>
                <div className="flex-1 w-full">
                  <Input type="date" label="End Date" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)} />
                </div>
                <div className="w-full md:w-auto">
                  <Button onClick={checkAvailability} disabled={availLoading || !availStart || !availEnd} className="w-full md:w-auto">
                    {availLoading ? 'Checking...' : 'Check'}
                  </Button>
                </div>
              </div>

              {availData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-md border border-gray-200 shadow-sm mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Est. Capacity</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{availData.estimatedCapacityHours} <span className="text-sm font-normal text-gray-500">hrs</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Leave</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{availData.approvedLeaveHours} <span className="text-sm font-normal text-gray-500">hrs</span></p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Available</p>
                      <p className={`text-2xl font-semibold mt-1 ${availData.estimatedAvailableHours < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {availData.estimatedAvailableHours} <span className="text-sm font-normal">hrs</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">Availability Utilization</p>
                      <p className="text-sm font-bold text-gray-900">{availData.availabilityPercentage.toFixed(1)}%</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full ${availData.availabilityPercentage < 0 ? 'bg-red-600' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(Math.max(availData.availabilityPercentage, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
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

