import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  getProjectTeam, 
  addTeamMember, 
  removeTeamMember, 
  markTeamReady,
  searchEmployeeAvailability,
  type ProjectTeamDetailDTO,
  type EmployeeAvailabilityDTO
} from '../services/ProjectTeamApi';
import { PageHeader } from '../components/PageHeader';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { ErrorState, LoadingState, EmptyState } from '../components/FeedbackStates';
import { Button } from '../components/Button';
import { Input, Select, Checkbox, Textarea } from '../components/Forms';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/Table';
import { ArrowLeft, Users, Search, Plus, Trash2, CheckCircle } from 'lucide-react';

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

    if (!id || !selectedEmployee || !startDate || !endDate || !assignedHours) return;
    try {
      setActionLoading(true);
      setError(null);
      
      await addTeamMember(id, {
        employeeId: selectedEmployee.employeeId,
        projectRole: projectRole as "PROJECT_MANAGER" | "TECH_LEAD" | "PROJECT_ENGINEER" | "QA_ENGINEER" | "UI_UX_DESIGNER" | "SYSTEM_ANALYST" | "ASSISTANT",
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
      <div className="p-8">
        <LoadingState message="Loading team details..." />
      </div>
    );
  }

  if (error && !team) {
    return (
      <div className="p-8">
        <ErrorState
          title="Failed to load"
          message={error}
          onRetry={fetchData}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => navigate('/hod/projects')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  const isDraft = team?.status === 'DRAFT';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="secondary" onClick={() => navigate('/hod/projects')} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <PageHeader
            title={`Build Team: ${team?.projectTitle || team?.projectCode || 'Unknown'}`}
            description="Search available employees and assign them to the project team."
          />
        </div>
        <div className="flex items-center space-x-4">
           {isDraft && (
             <Button
               variant="primary"
               onClick={handleMarkReady}
               disabled={actionLoading || !team?.members || team.members.length === 0}
               isLoading={actionLoading}
               icon={<CheckCircle className="w-4 h-4" />}
             >
               Mark Team Ready
             </Button>
           )}
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Team Members */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6"><div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Current Team Members</h3></div>
             {team?.members && team.members.length > 0 ? (
               <div className="overflow-x-auto">
                 <Table>
                   <TableHead><TableRow>
                       <TableHeader>Employee</TableHeader>
                       <TableHeader>Status</TableHeader>
                       <TableHeader>Override</TableHeader>
                       <TableHeader className="text-right">Actions</TableHeader>
                     </TableRow></TableHead>
                   <TableBody>
                     {team.members.map(member => (
                       <TableRow key={member.id}>
                         <TableCell className="font-medium">
                           Employee #{member.employeeNumber || member.employeeId.substring(0, 8)}
                         </TableCell>
                         <TableCell>
                           <StatusBadge status={member.status} />
                         </TableCell>
                         <TableCell>
                           {member.overrideFlag ? (
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                               Yes
                             </span>
                           ) : (
                             <span className="text-gray-500 text-sm">No</span>
                           )}
                         </TableCell>
                         <TableCell className="text-right">
                           {isDraft && (
                             <Button
                               variant="danger"
                               
                               onClick={() => handleRemoveMember(member.id)}
                               disabled={actionLoading}
                               icon={<Trash2 className="w-4 h-4" />}
                             >
                               Remove
                             </Button>
                           )}
                         </TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </div>
             ) : (
               <EmptyState
                 title="No team members"
                 message="Search for available employees and add them to the team."
                 icon={<Users className="w-10 h-10 text-gray-400" />}
               />
             )}
          </Card>
          
          <Card className="p-6"><div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Project Details</h3></div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 mb-1">Expected Start</span>
                <span className="font-medium">
                  {team?.expectedStartDate ? format(new Date(team.expectedStartDate), 'MMM d, yyyy') : '-'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 mb-1">Expected Delivery</span>
                <span className="font-medium">
                  {team?.expectedDeliveryDate ? format(new Date(team.expectedDeliveryDate), 'MMM d, yyyy') : '-'}
                </span>
              </div>
            </div>
            <div className="mt-4">
              <span className="block text-gray-500 mb-1 text-sm">Scope</span>
              <p className="text-gray-900 whitespace-pre-wrap text-sm">{team?.requiredScope || '-'}</p>
            </div>
          </Card>

        </div>

        {/* Right Column: Search & Add */}
        <div className="space-y-6">
          {isDraft && (
            <Card className="p-6">
              <div className="mb-4"><h3 className="text-lg font-medium text-gray-900">Search Availability</h3></div>
              <div className="space-y-4">
                <Input
                  label="Start Date *"
                  type="date"
                  value={startDate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setStartDate(e.target.value)}
                  required
                />
                <Input
                  label="End Date *"
                  type="date"
                  value={endDate}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setEndDate(e.target.value)}
                  required
                />
                <Button
                  className="w-full"
                  onClick={handleSearch}
                  disabled={searchLoading || !startDate || !endDate}
                  isLoading={searchLoading}
                  icon={<Search className="w-4 h-4" />}
                >
                  Search Available Staff
                </Button>
                
                {searchError && (
                  <p className="text-sm text-red-600 mt-2">{searchError}</p>
                )}
                
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Results</label>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                      {searchResults.map(emp => {
                        const isAlreadyInTeam = team?.members?.some(m => m.employeeId === emp.employeeId);
                        const isFullyUnavailable = emp.availableHours !== undefined && emp.availableHours <= 0;
                        const isDisabled = isAlreadyInTeam || isFullyUnavailable;
                        const isSelected = selectedEmployee?.employeeId === emp.employeeId;
                        return (
                        <div 
                          key={emp.employeeId} 
                          className={`p-3 border rounded-md transition-colors ${
                            isDisabled ? 'bg-gray-50 opacity-75 cursor-not-allowed' :
                            isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300 cursor-pointer'
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              setSelectedEmployee(emp);
                              setOverrideRequested(!emp.available);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-start space-x-3">
                              {!isDisabled && (
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  readOnly
                                  className="mt-1"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm text-gray-900">
                                  {emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500">{emp.jobTitle} {emp.departmentName ? `• ${emp.departmentName}` : ''}</p>
                                {emp.availableHours !== undefined && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    Available Hours: <span className="font-medium">{emp.availableHours}</span>
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${emp.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {emp.available ? 'Available' : 'Conflict'}
                            </span>
                          </div>
                          {!emp.available && emp.conflicts && emp.conflicts.length > 0 && (
                            <p className="mt-2 text-xs text-red-600">
                              Conflicts: {emp.conflicts.join(', ')}
                            </p>
                          )}
                          {isAlreadyInTeam && (
                            <p className="mt-2 text-xs text-gray-500 font-medium">Already assigned to this team.</p>
                          )}
                          {!isAlreadyInTeam && isFullyUnavailable && (
                            <p className="mt-2 text-xs text-gray-500 font-medium">Fully unavailable (0 hours remaining).</p>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {isDraft && selectedEmployee && (
            <Card className="p-6 border-primary-500 border-2">
              <div className="mb-4"><h3 className="text-lg font-medium text-gray-900">{`Add ${selectedEmployee.employeeName || selectedEmployee.firstName || 'Employee'} to Team`}</h3></div>

              <div className="space-y-4">
                <Select
                  label="Project Role *"
                  value={projectRole}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setProjectRole(e.target.value)}
                  required
                >
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="TECH_LEAD">Tech Lead</option>
                  <option value="PROJECT_ENGINEER">Project Engineer</option>
                  <option value="QA_ENGINEER">QA Engineer</option>
                  <option value="UI_UX_DESIGNER">UI/UX Designer</option>
                  <option value="SYSTEM_ANALYST">System Analyst</option>
                  <option value="ASSISTANT">Assistant</option>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Allocation Start Date *"
                    type="date"
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setStartDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Allocation End Date *"
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <Input
                  label="Assigned Hours *"
                  type="number" 
                  min={1}
                  value={assignedHours}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setAssignedHours(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />

                {!selectedEmployee.available && (
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 space-y-3">
                    <p className="text-sm text-yellow-800 font-medium">Override required due to conflict.</p>
                    <Checkbox
                      label="Request Override"
                      id="overrideRequested"
                      checked={overrideRequested}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOverrideRequested(e.target.checked)}
                    />
                    {overrideRequested && (
                      <Textarea
                        label="Override Reason *"
                        value={overrideReason}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>) => setOverrideReason(e.target.value)}
                        placeholder="Provide justification for overriding conflicts..."
                        required
                        rows={2}
                      />
                    )}
                  </div>
                )}
                
                <Button
                  className="w-full"
                  onClick={handleAddMember}
                  disabled={actionLoading || !assignedHours || (!selectedEmployee.available && (!overrideRequested || !overrideReason))}
                  isLoading={actionLoading}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add to Team
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};










