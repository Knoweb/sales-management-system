import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  getProjectTeam,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  markTeamReady,
  searchEmployeeAvailability,
  type ProjectTeamDetailDTO,
  type EmployeeAvailabilityDTO
} from '../../services/ProjectTeamApi';
import type { ProjectRole } from '../../services/TechnicalProjectApi';
import { StatusBadge } from '../../components/StatusBadge';
import { ErrorState, LoadingState } from '../../components/FeedbackStates';
import { Button } from '../../components/Button';
import { Input, Select, Checkbox, Textarea } from '../../components/Forms';
import { ArrowLeft, Users, Search, Plus, Trash2, CheckCircle } from 'lucide-react';

import './ProjectTeamBuilderPage.css';

export const ProjectTeamBuilderPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [team, setTeam] = useState<ProjectTeamDetailDTO | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Search state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<EmployeeAvailabilityDTO[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Add Member State
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeAvailabilityDTO | null>(null);
  const [projectRole, setProjectRole] = useState('PROJECT_ENGINEER');
  const [assignedHours, setAssignedHours] = useState<number | ''>('');
  const [overrideRequested, setOverrideRequested] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  // Edit Member State
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editProjectRole, setEditProjectRole] = useState('PROJECT_ENGINEER');
  const [editAssignedHours, setEditAssignedHours] = useState<number | ''>('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const teamData = await getProjectTeam(id);
      setTeam(teamData);

      // Default search dates to project expected dates or defaults
      if (teamData.expectedStartDate) {
        setStartDate(format(new Date(teamData.expectedStartDate), 'yyyy-MM-dd'));
      } else {
        setStartDate(format(new Date(), 'yyyy-MM-dd'));
      }
      if (teamData.expectedDeliveryDate) {
        setEndDate(format(new Date(teamData.expectedDeliveryDate), 'yyyy-MM-dd'));
      } else {
        setEndDate(format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
      }
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to load project team details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setSearchError("Start and End dates are required.");
      return;
    }
    try {
      setSearchLoading(true);
      setSearchError(null);
      const data = await searchEmployeeAvailability(team?.departmentId, startDate, endDate);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setSearchError(e.response?.data?.message || 'Failed to search availability.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!id || !selectedEmployee || !startDate || !endDate || !assignedHours) {
      setError("Please fill out all required fields to add the member.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      await addTeamMember(id, {
        employeeId: selectedEmployee.employeeId,
        projectRole: projectRole as ProjectRole,
        allocationStartDate: startDate,
        allocationEndDate: endDate,
        assignedHours: Number(assignedHours),
        overrideRequested: overrideRequested,
        overrideReason: overrideRequested ? overrideReason : undefined
      });

      // Reset form and reload
      setSelectedEmployee(null);
      setAssignedHours('');
      setOverrideRequested(false);
      setOverrideReason('');

      await fetchData();
      await handleSearch(); // Refresh search results to show updated availability
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to add team member.');
    } finally {
      setActionLoading(false);
    }
  };

  const startEditMember = (member: any) => {
    setEditingMemberId(member.id);
    setEditProjectRole(member.projectRole || 'PROJECT_ENGINEER');
    setEditAssignedHours(member.assignedHours || '');
    setEditStartDate(member.allocationStartDate ? format(new Date(member.allocationStartDate), 'yyyy-MM-dd') : '');
    setEditEndDate(member.allocationEndDate ? format(new Date(member.allocationEndDate), 'yyyy-MM-dd') : '');
    setError(null);
  };

  const cancelEditMember = () => {
    setEditingMemberId(null);
    setError(null);
  };

  const handleEditMember = async () => {
    if (!id || !editingMemberId || !editStartDate || !editEndDate || !editAssignedHours) {
      setError("Please fill out all required fields to update the member.");
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await updateTeamMember(id, editingMemberId, {
        projectRole: editProjectRole as ProjectRole,
        allocationStartDate: editStartDate,
        allocationEndDate: editEndDate,
        assignedHours: Number(editAssignedHours),
      });
      setEditingMemberId(null);
      await fetchData();
    } catch (err: unknown) {
      const e = err as { response?: { data?: any } };
      console.error(e.response?.data || err);
      setError(e.response?.data?.message || 'Failed to update team member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      setActionLoading(true);
      setError(null);
      await removeTeamMember(id, memberId);
      await fetchData();
      if (searchResults.length > 0) {
        await handleSearch();
      }
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to remove team member.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReady = async () => {
    if (!id) return;
    if (!window.confirm("Mark team as ready? You cannot add more members once ready.")) return;
    try {
      setActionLoading(true);
      setError(null);
      await markTeamReady(id);
      await fetchData();
    } catch (err: unknown) {
      console.error(err);
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to mark team as ready.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '32px' }}>
        <LoadingState message="Loading team details..." />
      </div>
    );
  }

  if (error && !team) {
    return (
      <div style={{ padding: '32px' }}>
        <ErrorState
          title="Failed to load"
          message={error}
          onRetry={fetchData}
        />
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => navigate('/hod/projects')} icon={<ArrowLeft size={16} />}>
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  const isTeamReady = team?.status === 'READY';
  const isProjectClosed = team?.projectClosed === true;

  const canAdd = !isProjectClosed;
  const canEdit = isTeamReady && !isProjectClosed;
  const canRemove = !isTeamReady && !isProjectClosed;

  return (
    <div className="team-builder-container">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button variant="secondary" onClick={() => navigate('/hod/projects')} icon={<ArrowLeft size={16} />}>
          Back
        </Button>
      </div>

      {/* 1. Header Card */}
      <div className="team-builder-card">
        <div className="team-builder-header-top">
          <div>
            <h1 className="team-builder-title">Project Team Builder</h1>
            <div className="team-builder-meta">
              <span className="team-builder-meta-strong">{team?.projectCode || 'Unknown'}</span>
              <span className="team-builder-meta-strong">{team?.projectTitle || 'Unknown'}</span>
              {team?.status && (
                <StatusBadge status={team.status} />
              )}
            </div>
          </div>
          {canAdd && !isTeamReady && (
            <Button
              variant="primary"
              onClick={handleMarkReady}
              disabled={actionLoading || !team?.members || team.members.length === 0}
              isLoading={actionLoading}
              icon={<CheckCircle size={16} />}
            >
              Mark Team Ready
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', background: '#fef2f2', color: '#991b1b', borderRadius: '6px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      {/* 2. Project Details */}
      <div className="team-builder-card">
        <h3 className="team-builder-section-title">Project Details</h3>

        <div className="team-project-meta-grid">
          <div className="team-project-meta-item">
            <span className="team-meta-label">Expected Start</span>
            <span className="team-meta-value">
              {team?.expectedStartDate ? format(new Date(team.expectedStartDate), 'MMM d, yyyy') : '-'}
            </span>
          </div>
          <div className="team-project-meta-item">
            <span className="team-meta-label">Expected Delivery</span>
            <span className="team-meta-value">
              {team?.expectedDeliveryDate ? format(new Date(team.expectedDeliveryDate), 'MMM d, yyyy') : '-'}
            </span>
          </div>
        </div>

        <div>
          <span className="team-meta-label">Scope</span>
          <div className="team-scope-box">{team?.requiredScope || '-'}</div>
        </div>
      </div>

      {/* 3. Current Team Members */}
      <div className="team-builder-card">
        <h3 className="team-builder-section-title">Current Team Members</h3>

        {team?.members && team.members.length > 0 ? (
          <div className="team-members-grid">
            {team.members.map(member => (
              <div key={member.id} className="team-member-card">
                <div className="team-member-header">
                  <div>
                    <h4 className="team-member-name">
                      {member.employeeName || `Employee #${member.employeeNumber || member.employeeId.substring(0, 8)}`}
                    </h4>
                    <p className="team-member-title">{member.jobTitle || 'Team Member'}</p>
                  </div>
                  <StatusBadge status={member.status} />
                </div>

                {editingMemberId === member.id ? (
                  <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Select
                      label="Project Role"
                      value={editProjectRole}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditProjectRole(e.target.value)}
                      required
                    >
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="PROJECT_ENGINEER">Project Engineer</option>
                      <option value="QUALITY_CONTROLLER">QA / Quality Controller</option>
                      <option value="SOFTWARE_ENGINEER">Software Engineer</option>
                      <option value="MECHANICAL_ENGINEER">Mechanical Engineer</option>
                      <option value="ELECTRICAL_ENGINEER">Electrical Engineer</option>
                      <option value="ELECTRONIC_ENGINEER">Electronic Engineer</option>
                      <option value="SITE_SUPERVISOR">Site Supervisor</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="WELDER">Welder</option>
                      <option value="ASSISTANT">Assistant</option>
                      <option value="OTHER">Other</option>
                    </Select>
                    <Input
                      label="Assigned Hours"
                      type="number"
                      min={1}
                      value={editAssignedHours}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditAssignedHours(e.target.value === '' ? '' : Number(e.target.value))}
                      required
                    />
                    <Input
                      label="Start Date"
                      type="date"
                      value={editStartDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditStartDate(e.target.value)}
                      required
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={editEndDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditEndDate(e.target.value)}
                      required
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                      <Button variant="ghost" onClick={cancelEditMember} disabled={actionLoading}>Cancel</Button>
                      <Button variant="primary" onClick={handleEditMember} disabled={actionLoading || !editAssignedHours || !editStartDate || !editEndDate}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="team-member-details">
                      <div className="team-member-role-full">
                        <span className="team-meta-label">Project Role</span>
                        <span className="team-meta-value">{member.projectRole?.replace(/_/g, ' ') || '-'}</span>
                      </div>
                      <div>
                        <span className="team-meta-label">Allocation</span>
                        <span className="team-meta-value">
                          {member.allocationStartDate && member.allocationEndDate ? (
                            `${format(new Date(member.allocationStartDate), 'MMM d')} – ${format(new Date(member.allocationEndDate), 'MMM d, yyyy')}`
                          ) : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="team-meta-label">Assigned Hours</span>
                        <span className="team-meta-value">{member.assignedHours ? `${member.assignedHours} hrs` : '-'}</span>
                      </div>
                    </div>
                    {canRemove && (
                      <div className="team-member-actions">
                        <Button
                          variant="danger"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={actionLoading}
                          icon={<Trash2 size={16} />}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    
                    {canEdit && (
                      <div className="team-member-actions">
                        <Button
                          variant="secondary"
                          onClick={() => startEditMember(member)}
                          disabled={actionLoading}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="team-empty-state">
            <div className="team-empty-icon">
              <Users size={24} />
            </div>
            <h4 className="team-empty-title">No team members yet</h4>
            <p className="team-empty-text">Search available employees below and add them to the team.</p>
          </div>
        )}
      </div>

      {/* 5. Search Availability */}
      {canAdd && (
        <div className="team-builder-card">
          <h3 className="team-builder-section-title">Search Availability</h3>

          <div className="team-search-grid">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              required
            />
            <Button
              onClick={handleSearch}
              disabled={searchLoading || !startDate || !endDate}
              isLoading={searchLoading}
              icon={<Search size={16} />}
            >
              Search Available Staff
            </Button>
          </div>

          {searchError && (
            <p className="team-search-error">{searchError}</p>
          )}
        </div>
      )}

      {/* 6. Search Results */}
      {canAdd && searchResults.length > 0 && (
        <div className="team-builder-card">
          <h3 className="team-builder-section-title">Search Results</h3>

          <div className="team-results-grid">
            {searchResults.map(emp => {
              const isAlreadyInTeam = team?.members?.some(m => m.employeeId === emp.employeeId);
              const isFullyUnavailable = emp.availableHours !== undefined && emp.availableHours <= 0;
              const isDisabled = isAlreadyInTeam || isFullyUnavailable;
              const isSelected = selectedEmployee?.employeeId === emp.employeeId;

              let badgeClass = 'badge-available';
              if (!emp.available) badgeClass = 'badge-conflict';

              return (
                <div
                  key={emp.employeeId}
                  className={`team-result-card ${isDisabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (!isDisabled) {
                      setSelectedEmployee(emp);
                      setOverrideRequested(!emp.available);
                    }
                  }}
                >
                  {!isDisabled && (
                    <div className="team-result-radio">
                      <input
                        type="radio"
                        checked={isSelected}
                        readOnly
                        style={{ cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                      />
                    </div>
                  )}
                  <div className="team-result-content">
                    <div className="team-result-header">
                      <div>
                        <h4 className="team-result-name">
                          {emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown'}
                        </h4>
                        <p className="team-result-desc">
                          {emp.jobTitle} {emp.departmentName ? `• ${emp.departmentName}` : ''}
                        </p>
                      </div>
                      <span className={`team-result-badge ${badgeClass}`}>
                        {emp.available ? 'Available' : 'Conflict'}
                      </span>
                    </div>

                    {emp.availableHours !== undefined && (
                      <p className="team-result-desc" style={{ marginTop: '8px' }}>
                        Available Hours: <strong style={{ color: 'var(--color-text-primary)' }}>{emp.availableHours} hrs</strong>
                      </p>
                    )}

                    {!emp.available && emp.conflicts && emp.conflicts.length > 0 && (
                      <div className="team-result-conflict-box">
                        <strong className="team-result-conflict-title">Overlapping active allocation:</strong>
                        <ul className="team-result-conflict-list">
                          {emp.conflicts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}

                    {isAlreadyInTeam && (
                      <p className="team-result-msg">Already assigned to this team.</p>
                    )}
                    {!isAlreadyInTeam && isFullyUnavailable && (
                      <p className="team-result-msg">Fully unavailable (0 hours remaining).</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Add Selected Employee to Team */}
      {canAdd && selectedEmployee && (
        <div className="team-builder-card team-add-card">
          <div className="team-add-header">
            <h3 className="team-builder-section-title" style={{ margin: 0 }}>
              {`Add ${selectedEmployee.employeeName || selectedEmployee.firstName || 'Employee'} to Team`}
            </h3>
          </div>

          <div className="team-add-grid">
            <Select
              label="Project Role"
              value={projectRole}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setProjectRole(e.target.value)}
              required
            >
              <option value="PROJECT_MANAGER">Project Manager</option>
              <option value="PROJECT_ENGINEER">Project Engineer</option>
              <option value="QUALITY_CONTROLLER">QA / Quality Controller</option>
              <option value="SOFTWARE_ENGINEER">Software Engineer</option>
              <option value="MECHANICAL_ENGINEER">Mechanical Engineer</option>
              <option value="ELECTRICAL_ENGINEER">Electrical Engineer</option>
              <option value="ELECTRONIC_ENGINEER">Electronic Engineer</option>
              <option value="SITE_SUPERVISOR">Site Supervisor</option>
              <option value="TECHNICIAN">Technician</option>
              <option value="WELDER">Welder</option>
              <option value="ASSISTANT">Assistant</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input
              label="Assigned Hours"
              type="number"
              min={1}
              value={assignedHours}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAssignedHours(e.target.value === '' ? '' : Number(e.target.value))}
              required
            />
          </div>

          <div className="team-add-grid">
            <Input
              label="Allocation Start Date"
              type="date"
              value={startDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Allocation End Date"
              type="date"
              value={endDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              required
            />
          </div>

          {!selectedEmployee.available && (
            <div className="team-conflict-override">
              <p className="team-conflict-override-msg">Override required due to conflict.</p>
              <Checkbox
                label="Request Override"
                id="overrideRequested"
                checked={overrideRequested}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOverrideRequested(e.target.checked)}
              />
              {overrideRequested && (
                <Textarea
                  label="Override Reason"
                  value={overrideReason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setOverrideReason(e.target.value)}
                  placeholder="Provide justification for overriding conflicts..."
                  required
                  rows={2}
                />
              )}
            </div>
          )}

          <div className="team-add-actions">
            <Button
              onClick={handleAddMember}
              disabled={actionLoading || !assignedHours || (!selectedEmployee.available && (!overrideRequested || !overrideReason))}
              isLoading={actionLoading}
              icon={<Plus size={16} />}
            >
              Add to Team
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};










