import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmployeeApi } from '../services/EmployeeApi';
import type { Employee } from '../types/employee';
import type { EmployeeSkill } from '../types/skill';
import type { EmployeeQualification } from '../types/qualification';
import type { EmployeeLeave } from '../types/leave';
import { User, CheckCircle, BookOpen, Calendar, Clock, ArrowLeft } from 'lucide-react';

export const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [skills, setSkills] = useState<EmployeeSkill[]>([]);
  const [qualifications, setQualifications] = useState<EmployeeQualification[]>([]);
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'qualifications' | 'leave' | 'availability'>('overview');

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [empData, skillsData, qualData, leaveData] = await Promise.all([
          EmployeeApi.getById(id),
          EmployeeApi.getSkills(id).catch(() => []),
          EmployeeApi.getQualifications(id).catch(() => []),
          EmployeeApi.getLeaves(id).catch(() => [])
        ]);
        
        setEmployee(empData);
        setSkills(skillsData);
        setQualifications(qualData);
        setLeaves(leaveData);
      } catch (error) {
        console.error('Failed to load employee details', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container">
        <p>Loading employee details...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="page-container">
        <p>Employee not found.</p>
        <Link to="/employees" className="btn btn-secondary mt-4">Back to Employees</Link>
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
                <button className="btn btn-primary">Add Skill</button>
              </div>
              {skills.length === 0 ? <p>No skills assigned.</p> : (
                <table className="data-table">
                  <thead><tr><th>Skill</th><th>Proficiency</th><th>Verified</th><th>Actions</th></tr></thead>
                  <tbody>
                    {skills.map(s => (
                      <tr key={s.id}>
                        <td>{s.skill?.name}</td>
                        <td>{s.proficiencyLevel}</td>
                        <td>{s.verified ? 'Yes' : 'No'}</td>
                        <td><button className="btn btn-secondary">Edit</button></td>
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
                <button className="btn btn-primary">Add Qualification</button>
              </div>
              {qualifications.length === 0 ? <p>No qualifications added.</p> : (
                <table className="data-table">
                  <thead><tr><th>Name</th><th>Institution</th><th>Year</th><th>Verified</th><th>Actions</th></tr></thead>
                  <tbody>
                    {qualifications.map(q => (
                      <tr key={q.id}>
                        <td>{q.qualificationName}</td>
                        <td>{q.institution}</td>
                        <td>{q.issueDate || 'N/A'}</td>
                        <td>{q.verified ? 'Yes' : 'No'}</td>
                        <td><button className="btn btn-secondary">Edit</button></td>
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
                <button className="btn btn-primary">Request Leave</button>
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
                        <td>{l.status}</td>
                        <td><button className="btn btn-secondary">View</button></td>
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
              <p>Weekly Capacity: {employee.weeklyCapacityHours} hours</p>
              <div className="mt-4 p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <p>Availability calendar integration will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
