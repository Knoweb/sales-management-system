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

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [qualifications, setQualifications] = useState<EmployeeQualification[]>([]);
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'qualifications' | 'leave' | 'availability'>('overview');

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
    return (
      <div className="page-container">
        <div className="card p-8" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="card p-8" style={{ textAlign: 'center', margin: '2rem 0', border: '1px solid var(--error)' }}>
          <h2 style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</h2>
          <button className="btn btn-primary" onClick={() => setRetryCount(c => c + 1)}>Retry</button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="page-container">
        <div className="card p-8" style={{ textAlign: 'center', margin: '2rem 0' }}>
          <h2 style={{ marginBottom: '1rem' }}>Employee Not Found</h2>
          <p style={{ marginBottom: '1.5rem', color: 'var(--text-light)' }}>The employee you are looking for does not exist.</p>
          <Link to="/employees" className="btn btn-secondary">Back to Employees</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="mb-4">
        <Link to="/employees" className="btn btn-secondary flex-inline gap-2">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title"><User size={24} className="inline-icon" /> {employee.firstName} {employee.lastName}</h1>
        <p className="page-description">{employee.jobTitle} • {employee.department?.name || 'No Department'}</p>
      </div>

      <div className="tabs mb-4">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'skills' ? 'active' : ''}`} onClick={() => setActiveTab('skills')}>Skills</button>
        <button className={`tab ${activeTab === 'qualifications' ? 'active' : ''}`} onClick={() => setActiveTab('qualifications')}>Qualifications</button>
        <button className={`tab ${activeTab === 'leave' ? 'active' : ''}`} onClick={() => setActiveTab('leave')}>Leave</button>
        <button className={`tab ${activeTab === 'availability' ? 'active' : ''}`} onClick={() => setActiveTab('availability')}>Availability</button>
      </div>

      <div className="card">
        <div className="card-body">
          {activeTab === 'overview' && (
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>Contact Information</h3>
                <p><strong>Work Email:</strong> {employee.workEmail || 'N/A'}</p>
                <p><strong>Personal Email:</strong> {employee.personalEmail || 'N/A'}</p>
                <p><strong>Contact Number:</strong> {employee.contactNumber || 'N/A'}</p>
              </div>
              <div>
                <h3 className="mb-2" style={{ fontWeight: 600 }}>Employment Details</h3>
                <p><strong>Employee ID:</strong> {employee.employeeNumber}</p>
                <p><strong>Type:</strong> {employee.employmentType}</p>
                <p><strong>Status:</strong> {employee.employmentStatus}</p>
                <p><strong>Hire Date:</strong> {employee.hireDate || 'N/A'}</p>
                <p><strong>Linked User:</strong> {employee.user ? employee.user.email : 'None'}</p>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <div className="flex-between mb-4">
                <h3 style={{ fontWeight: 600 }}><CheckCircle size={18} className="inline-icon" /> Skills</h3>
                <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                  <button className="btn btn-primary" onClick={() => { setEditSkillData(undefined); setShowSkillForm(true); }}>Add Skill</button>
                </PermissionGuard>
              </div>
              {skills.length === 0 ? <p>No skills assigned.</p> : (
                <table className="data-table">
                  <thead><tr><th>Skill</th><th>Proficiency</th><th>Years</th><th>Verified</th><th>Actions</th></tr></thead>
                  <tbody>
                    {skills.map(s => (
                      <tr key={s.id}>
                        <td>{s.skill?.name}</td>
                        <td>{s.proficiencyLevel}</td>
                        <td>{s.yearsOfExperience || '-'}</td>
                        <td>{s.verified ? 'Yes' : 'No'}</td>
                        <td>
                          <PermissionGuard permission="EMPLOYEE_SKILL_MANAGE">
                            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" onClick={() => { setEditSkillData(s); setShowSkillForm(true); }}>Edit</button>
                              <button className="btn btn-secondary" onClick={() => handleRemoveSkill(s.skill.id)} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Remove</button>
                            </div>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'qualifications' && (
            <div>
              <div className="flex-between mb-4">
                <h3 style={{ fontWeight: 600 }}><BookOpen size={18} className="inline-icon" /> Qualifications</h3>
                <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                  <button className="btn btn-primary" onClick={() => { setEditQualData(undefined); setShowQualForm(true); }}>Add Qualification</button>
                </PermissionGuard>
              </div>
              {qualifications.length === 0 ? <p>No qualifications added.</p> : (
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Institution</th><th>Level</th><th>Verified</th><th>Actions</th></tr></thead>
                  <tbody>
                    {qualifications.map(q => (
                      <tr key={q.id}>
                        <td>{q.qualificationName}</td>
                        <td>{q.institution || '-'}</td>
                        <td>{q.qualificationLevel || '-'}</td>
                        <td>{q.verified ? 'Yes' : 'No'}</td>
                        <td>
                          <PermissionGuard permission="EMPLOYEE_QUALIFICATION_MANAGE">
                            <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                              <button className="btn btn-secondary" onClick={() => { setEditQualData(q); setShowQualForm(true); }}>Edit</button>
                              <button className="btn btn-secondary" onClick={() => handleRemoveQual(q.id)} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Remove</button>
                            </div>
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'leave' && (
            <div>
              <div className="flex-between mb-4">
                <h3 style={{ fontWeight: 600 }}><Calendar size={18} className="inline-icon" /> Leave Requests</h3>
                <PermissionGuard permission={['EMPLOYEE_LEAVE_MANAGE', 'EMPLOYEE_SELF_READ']}>
                  <button className="btn btn-primary" onClick={() => setShowLeaveForm(true)}>Request Leave</button>
                </PermissionGuard>
              </div>
              {leaves.length === 0 ? <p>No leave requests.</p> : (
                <table className="data-table">
                  <thead><tr><th>Type</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td>{l.leaveType}</td>
                        <td>{l.startDate}</td>
                        <td>{l.endDate}</td>
                        <td>
                          <span className={`status-badge ${l.status.toLowerCase()}`}>
                            {l.status}
                          </span>
                        </td>
                        <td>
                          <PermissionGuard permission="EMPLOYEE_LEAVE_MANAGE">
                            {l.status === 'PENDING' && (
                              <div className="flex gap-2" style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn btn-secondary" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} onClick={() => handleLeaveStatusUpdate(l.id, 'APPROVED')}>Approve</button>
                                <button className="btn btn-secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleLeaveStatusUpdate(l.id, 'REJECTED')}>Reject</button>
                              </div>
                            )}
                          </PermissionGuard>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div>
              <div className="flex-between mb-4">
                <h3 style={{ fontWeight: 600 }}><Clock size={18} className="inline-icon" /> Availability</h3>
              </div>
              <p><strong>Weekly Capacity:</strong> {employee.weeklyCapacityHours} hours</p>
              
              <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr auto', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Date</label>
                    <input type="date" className="form-input" value={availStart} onChange={(e) => setAvailStart(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Date</label>
                    <input type="date" className="form-input" value={availEnd} onChange={(e) => setAvailEnd(e.target.value)} />
                  </div>
                  <button className="btn btn-primary" onClick={checkAvailability} disabled={availLoading || !availStart || !availEnd}>
                    {availLoading ? 'Checking...' : 'Check'}
                  </button>
                </div>

                {availData && (
                  <div className="grid mt-4" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Est. Capacity Hours</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{availData.estimatedCapacityHours}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Leave Hours</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{availData.approvedLeaveHours}</p>
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Available Hours</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 600, color: availData.estimatedAvailableHours < 0 ? 'var(--error)' : 'var(--success)' }}>
                        {availData.estimatedAvailableHours}
                      </p>
                    </div>
                  </div>
                )}
                
                {availData && (
                  <div className="mt-4" style={{ padding: '16px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <p><strong>Availability Percentage:</strong> {availData.availabilityPercentage.toFixed(1)}%</p>
                    <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          backgroundColor: availData.availabilityPercentage < 0 ? 'var(--error)' : 'var(--success)',
                          width: `${Math.min(Math.max(availData.availabilityPercentage, 0), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
