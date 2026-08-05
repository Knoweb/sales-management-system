# Member C Implementation Plan

## 1. Member C Scope
- Phase 14 — Shared Dashboard Framework
- Phase 15 — Virtual Tour Tracking
- Phase 16 — Marketing ROI Tracker
- Phase 17 — Payment Gateway Analytics
- Phase 19 — Core Notification and Audit Infrastructure
- Phase 20 — Frontend accessibility, shared quality and observability

## 2. Existing Reusable Code
### Backend Components
- **Date Handling**: `@PrePersist` and `@PreUpdate` entity lifecycle annotations for `createdAt` and `updatedAt`.
- **Exceptions**: `GlobalExceptionHandler`, `ResourceNotFoundException`, `ResourceConflictException`.
- **Response Structure**: `ErrorResponse`.
- **Authentication**: `JwtTokenProvider`, `CustomUserDetails`, `CustomUserDetailsService`.
- **Notifications**: Existing `NotificationService` and `Notification` entity pattern.
- **Workflow History**: Existing `TechnicalProjectHistoryHelper` and history entity patterns.

### Frontend Components
- **Layout & Auth**: `AuthenticatedLayout`, `ProtectedRoute`, `PermissionGuard`, `AuthContext`.
- **UI Elements**: `Table`, `Card`, `StatusBadge`, `FilterBar`, `Tabs`, `Modal`, `Alert`, `SearchInput`.
- **State Feedback**: `Skeleton`, `FeedbackStates`.
- **API**: Shared API client (`apiClient` and `publicApiClient` in `services/Api.ts`).

## 3. Dependencies
- Relies on Member A's and Member B's core structural implementation (Roles, Users, Auth, CRM, Sales, Approvals, Technical Project Routing).
- Must integrate cleanly without breaking existing Flyway migrations or entity structures.

## 4. Proposed Backend Packages
- `com.knoweb.salesmanagement.dashboard`
- `com.knoweb.salesmanagement.virtualtour`
- `com.knoweb.salesmanagement.marketing`
- `com.knoweb.salesmanagement.paymentanalytics`
- `com.knoweb.salesmanagement.audit`
- (Expanding existing `notification` package)

## 5. Proposed Frontend Routes
- `/dashboard/virtual-tours`
- `/dashboard/marketing-roi`
- `/dashboard/payment-analytics`
- `/notifications`
- `/audit-logs`

## 6. Proposed Permissions
- `DASHBOARD_READ`
- `VIRTUAL_TOUR_CREATE`
- `VIRTUAL_TOUR_READ`
- `VIRTUAL_TOUR_UPDATE`
- `VIRTUAL_TOUR_DELETE`
- `MARKETING_CAMPAIGN_CREATE`
- `MARKETING_CAMPAIGN_READ`
- `MARKETING_CAMPAIGN_UPDATE`
- `MARKETING_CAMPAIGN_DELETE`
- `PAYMENT_GATEWAY_ANALYTICS_CREATE`
- `PAYMENT_GATEWAY_ANALYTICS_READ`
- `PAYMENT_GATEWAY_ANALYTICS_UPDATE`
- `PAYMENT_GATEWAY_ANALYTICS_DELETE`
- `NOTIFICATION_READ`
- `NOTIFICATION_MANAGE_PREFERENCES`
- `AUDIT_LOG_READ`

## 7. Proposed Migration Approach
- Next available migration number is V23.
- Will create schema structures for audit logs, virtual tours, marketing campaigns, and payment analytics in subsequent steps.
- **Rule**: Recheck highest migration number on `main` immediately before Step C1.

## 8. Shared-file Ownership
- **Member C Owned**: Dashboard, Virtual Tour, Marketing ROI, Payment Analytics, Audit Log feature components, services, and tests.
- **Shared Files (Coordinate Before Editing)**: 
  - `frontend/src/App.tsx` (Routes)
  - `frontend/src/components/AuthenticatedLayout.tsx` (Sidebar)
  - `backend/src/main/resources/db/migration/*`
  - `frontend/src/services/Api.ts`
  - Backend `GlobalExceptionHandler`
  - Backend Security Config
- **Conflict Mitigation**: Work on `main` requires frequent pulls, small commits, and no broad code formatting refactors.

## 9. Integration Risks
- Modifying `App.tsx` or layout sidebar could introduce merge conflicts with Member A and B.
- Flyway version collisions if another member pushes a migration concurrently.
- Changes to global exception handling could break existing error parsing on the frontend.

## 10. Testing Strategy
- Unit tests for all new backend services and controllers.
- Integration tests for data access repositories and custom specifications.
- Frontend rendering tests for new dashboard metrics and charts.
- API tests using the standard test properties.

## 11. Definition of Done
- Feature implemented and integrated into `main`.
- Relevant Flyway migrations applied and tested.
- Unit and integration tests passing.
- Frontend build and lint passing.
- UI elements meet accessibility guidelines (Phase 20).
- Feature is reachable and usable via UI without regressions to other members' work.

## 12. Implementation Sequence
- **C0** — Codebase audit and shared contracts
- **C1** — Phase 19 notification and audit core foundation
- **C2** — Phase 14 shared dashboard shell
- **C3** — Phase 15 Virtual Tour Tracking
- **C4** — Phase 16 Marketing ROI Tracker
- **C5** — Phase 17 Payment Gateway Analytics
- **C6** — Phase 19 Notification Centre and Audit Viewer
- **C7** — Phase 14 final dashboard integration
- **C8** — Phase 20 frontend accessibility, shared quality and observability
