# Phase 7: Technical Routing and Team Formation (Technical Design)

## 1. Eligibility for Technical Routing
A `ProjectBrief` is eligible for Phase 7 only when:
- Client verification is completed successfully (A `ClientVerification` record exists for the brief where the status explicitly indicates completion/verification).
- BDM approval is completed successfully (A `BdmApproval` record exists where `status == APPROVED`).
- No `TechnicalProject` already exists for the same approved workflow source.

`CLIENT_VERIFIED` status alone on the `ProjectBrief` must not make the brief eligible. The backend must explicitly verify the existence and status of the Phase 6 `ClientVerification` and `BdmApproval` records.

## 2. Technical Coordinator Routing Workflow
Projects are **not** automatically routed directly from `ProjectBrief.requiredDepartments`. The correct workflow is:
1. An eligible approved Project Brief appears in the Technical Coordinator's queue.
2. The Technical Coordinator reviews the brief.
3. The Technical Coordinator selects one or more active technical departments for routing.
4. For each selected department, the coordinator records:
   - Required technical scope
   - Expected technical-estimate submission dateComplete the final missing verification for Phase 7 Step 2C.

Do not implement services, controllers, DTOs, APIs or frontend code.
Do not continue to Step 3.

Add focused persistence tests for Phase 7 foreign-key constraints.

Verify that persistence fails when:

1. TechnicalProject references a non-existing ProjectBrief.
2. TechnicalProjectDepartment references a non-existing TechnicalProject.
3. ProjectTeam references a non-existing TechnicalProjectDepartment.
4. ProjectTeamMember references a non-existing Employee.
5. ProjectTeamMember references a non-existing ProjectTeam.
6. EmployeeAllocation references a non-existing Employee.
7. EmployeeAllocation references a non-existing TechnicalProject.
8. EmployeeAllocation references a non-existing ProjectTeam.
9. EmployeeAllocation references a non-existing Department.

Use the existing PostgreSQL persistence-test conventions.

Force SQL execution using flush() so that database constraint violations are actually triggered.

Assert the project’s expected persistence or data-integrity exception type.

Do not mock repositories.
Do not alter or weaken foreign-key constraints.
Do not edit the applied V16 migration.

Then run:

cd backend
.\mvnw.cmd clean test

Provide:

- Test class and method names
- Foreign-key cases tested
- Tests run
- Failures
- Errors
- Skipped
- Build result
- Files modified

Do not continue to Phase 7 Step 3.
   - Optional routing notes
5. The routing operation is submitted atomically.

*Note: `ProjectBrief.requiredDepartments` may be displayed as suggested departments in the UI, but it must not replace the coordinator's explicit routing decision.*

## 3. Technical Project Data Model
Only one `TechnicalProject` may exist for the same approved Project Brief or workflow source. The model will strictly focus on routing and team formation statuses.

**`TechnicalProject`**:
- `id` (UUID, PK)
- `project_code` (String, Unique)
- `project_brief_id` (UUID, FK, Unique) - Approved Project Brief reference
- `sales_opportunity_id` (UUID, FK) - Sales Opportunity reference
- `technical_coordinator_id` (UUID, FK to User) - Assigned Technical Coordinator
- `status` (Enum: `AWAITING_TECHNICAL_ROUTING`, `ROUTED`, `TEAM_FORMATION_IN_PROGRESS`, `TEAM_READY`)
- `routed_at` (OffsetDateTime)
- `created_by` (UUID)
- `created_at` (OffsetDateTime)
- `updated_at` (OffsetDateTime)
- `version` (Integer, @Version for optimistic locking)

## 4. Project Department Data Model
A department must be active before it can be assigned.

**`TechnicalProjectDepartment`**:
- `id` (UUID, PK)
- `technical_project_id` (UUID, FK)
- `department_id` (UUID, FK)
- `required_scope` (Text)
- `expected_estimate_submission_date` (LocalDate)
- `routing_notes` (Text)
- `routing_status` / `formation_status` (Enum: `PENDING`, `IN_PROGRESS`, `COMPLETED`)
- `assigned_by` (UUID, FK)
- `assigned_at` (OffsetDateTime)
- `submitted_by` (UUID, FK)
- `submitted_at` (OffsetDateTime)
- `created_at` (OffsetDateTime)
- `updated_at` (OffsetDateTime)
- `version` (Integer, @Version)

*Constraint*: Unique constraint on `technical_project_id` + `department_id`.

## 5. Project Team Data Model
A separate `ProjectTeam` entity is required to represent the departmental team for an assigned project department. A team must not exist for a department that was not routed to the project.

**`ProjectTeam`**:
- `id` (UUID, PK)
- `technical_project_department_id` (UUID, FK, Unique)
- `team_name` (String)
- `status` (Enum: `DRAFT`, `READY`)
- `created_by` (UUID, FK - HOD)
- `created_at` (OffsetDateTime)
- `updated_at` (OffsetDateTime)
- `version` (Integer, @Version)

## 6. Team Member and Allocation Model
Roles must use structured values instead of depending only on a free-text role description.

**`ProjectTeamMember`**:
- `id` (UUID, PK)
- `employee_id` (UUID, FK)
- `project_team_id` (UUID, FK)
- `project_role` (Enum: `PROJECT_MANAGER`, `PROJECT_ENGINEER`, `MECHANICAL_ENGINEER`, `ELECTRICAL_ENGINEER`, `ELECTRONIC_ENGINEER`, `SOFTWARE_ENGINEER`, `TECHNICIAN`, `WELDER`, `ASSISTANT`, `SITE_SUPERVISOR`, `QUALITY_CONTROLLER`, `OTHER`)
- `allocation_start_date` (LocalDate)
- `allocation_end_date` (LocalDate)
- `assigned_hours` (BigDecimal)
- `is_primary_member` (Boolean)
- `status` (Enum: `ACTIVE`, `REMOVED`)
- `added_by` (UUID)
- `added_at` (OffsetDateTime)
- `updated_at` (OffsetDateTime)

## 7. Employee Allocation Persistence
Employee allocations are stored in a dedicated `EmployeeAllocation` entity. This ensures duplicate or repeated allocation requests are prevented via tight unique constraints and allows granular tracking across projects.

**`EmployeeAllocation`**:
- `id` (UUID, PK)
- `employee_id` (UUID, FK)
- `technical_project_id` (UUID, FK)
- `project_team_id` (UUID, FK)
- `department_id` (UUID, FK)
- `allocation_start_date` (LocalDate)
- `allocation_end_date` (LocalDate)
- `assigned_hours` (BigDecimal)
- `status` (Enum: `ACTIVE`, `CANCELLED`)
- `override_flag` (Boolean)
- `override_reason` (Text)
- `overridden_by` (UUID, FK)
- `overridden_at` (OffsetDateTime)
- `created_by` (UUID)
- `created_at` (OffsetDateTime)
- `updated_at` (OffsetDateTime)

*Duplicate Prevention*: A unique constraint on `employee_id` + `project_team_id` + `allocation_start_date` + `allocation_end_date` prevents duplicate entries. 

## 8. Availability Calculation
Reuse the existing `AvailabilityService`. The updated design must calculate availability strictly for a requested date range using:
`working capacity - approved leave hours - active overlapping project allocations`

Every allocation has its own start date and end date. The service will accurately map allocated hours to working days within that specific period, verifying existing capacity conventions instead of making arbitrary averaging assumptions.

**Required Availability Response Fields**:
- `effective_working_capacity`
- `approved_leave_hours`
- `existing_allocated_hours`
- `remaining_available_hours`
- `current_workload_percentage`
- `proposed_workload_percentage`
- `active_project_count`
- `conflict_status`
- `conflict_reason`

## 9. Over-Allocation Override
Over-allocation must be blocked by default. A frontend Boolean flag alone is not sufficient. An override requires:
- The user holds the `EMPLOYEE_ALLOCATION_OVERRIDE` permission.
- `overrideRequested=true` in the API payload.
- A mandatory `override_reason` string.
- An authenticated responsible user.
- Capture of the `override_timestamp` (`overridden_at`).
- An immutable history record logging the override.

## 10. Permissions
The following explicit permissions map to Phase 7:
- `TECHNICAL_PROJECT_READ`
- `TECHNICAL_PROJECT_ROUTE`
- `TECHNICAL_PROJECT_ROUTING_REVISE`
- `PROJECT_TEAM_READ`
- `PROJECT_TEAM_MANAGE`
- `EMPLOYEE_ALLOCATION_READ`
- `EMPLOYEE_ALLOCATION_MANAGE`
- `EMPLOYEE_ALLOCATION_OVERRIDE`

**Role Mappings**:
- `SYSTEM_ADMIN`: All permissions.
- `TECHNICAL_COORDINATOR`: `TECHNICAL_PROJECT_READ`, `TECHNICAL_PROJECT_ROUTE`, `TECHNICAL_PROJECT_ROUTING_REVISE`, `PROJECT_TEAM_READ`.
- `HOD`: `TECHNICAL_PROJECT_READ`, `PROJECT_TEAM_READ`, `PROJECT_TEAM_MANAGE`, `EMPLOYEE_ALLOCATION_READ`, `EMPLOYEE_ALLOCATION_MANAGE`, `EMPLOYEE_ALLOCATION_OVERRIDE`.
- `ENGINEER` / `TECHNICIAN`: `TECHNICAL_PROJECT_READ`, `PROJECT_TEAM_READ`, `EMPLOYEE_ALLOCATION_READ`.
- `SALES` / `BDM`: `TECHNICAL_PROJECT_READ`.

**Department-Level Access Checks**:
A HOD must receive an `HTTP 403 Forbidden` response when attempting to manage another department's team or modify allocations outside their assigned purview.

## 11. API Design
Following existing `/api/v1` conventions:

**Technical Coordinator**:
- `GET /api/v1/technical-projects/eligible` (eligible project queue)
- `GET /api/v1/technical-projects/{id}` (technical project detail)
- `POST /api/v1/technical-projects/{id}/route` (multi-department routing)
- `PUT /api/v1/technical-projects/{id}/route` (routing revision)

**HOD**:
- `GET /api/v1/departments/{deptId}/assigned-projects` (assigned projects for authenticated department)
- `GET /api/v1/technical-projects/{id}/teams/{teamId}` (team detail)
- `POST /api/v1/technical-projects/{id}/departments/{deptId}/teams` (create/update team)
- `POST /api/v1/technical-projects/{id}/teams/{teamId}/members` (add member)
- `PUT /api/v1/technical-projects/{id}/teams/{teamId}/members/{memberId}` (update allocation)
- `DELETE /api/v1/technical-projects/{id}/teams/{teamId}/members/{memberId}` (remove member)
- `POST /api/v1/technical-projects/{id}/teams/{teamId}/mark-ready` (mark team ready)

**Availability**:
- `GET /api/v1/employees/availability?departmentId={deptId}&startDate={start}&endDate={end}&skills={skills}&proposedHours={hours}` (search employees and return allocation and leave breakdown)

**History**:
- `GET /api/v1/technical-projects/{id}/history` (project routing and team history)

## 12. History
The design must preserve append-only history using the existing workflow-history or audit implementation for:
- technical project created
- department routed
- routing revised
- team created
- member added
- allocation updated
- member removed
- allocation override used
- team marked ready

*No competing Phase 19 audit platform will be created.*

## 13. Notification Integration
Notifications are not a blocking requirement for Phase 7 database design. If an existing shared notification-event contract exists, Phase 7 may publish events through it. Do not create a new competing notification system.

## 14. Migration Version
Before implementation, the next migration version must be explicitly reserved in `docs/MIGRATION_REGISTRY.md` to avoid conflicts with parallel development. Do not permanently assume V16 is available simply because V15 is currently the highest local migration.

## 15. Scope Boundary
The design strictly does **NOT** include:
- Phase 8 costing
- Phase 9 quotation
- Phase 11 task execution (no execution statuses like `IN_PROGRESS` or `COMPLETED`)
- Daily progress updates
- Delivery or closure
- A new Phase 19 notification/audit platform
