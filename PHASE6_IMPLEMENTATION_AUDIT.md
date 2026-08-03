# Phase 6 Implementation Audit

## 1. Database and Flyway
- [x] Inspect existing Flyway migration version.
- [x] Create next unused migration version (V15).
- [x] Add `approvals` schema (`bdm_approvals`).
- [x] Add `approval_comments` schema (`bdm_approval_comments`).
- [x] Add `client_verifications` schema.
- [x] Add `workflow_history` schema.
- [x] Ensure Client Verification supports verifier name, contact, digital confirmation, token expiry.
- [x] Ensure only a secure hash of the client verification token is stored.
- [x] Add database constraints/indexes to prevent duplicate active approval or verification requests.

## 2. BDM Approval Workflow
- [x] Create BDM approval queue.
- [x] Implement BDM decisions (approve, reject, return for revision, request information).
- [x] Ensure decision references exact submitted Brief version.
- [x] Add required comments for reject, return, request information.
- [x] Prevent approving same version twice.
- [x] Resubmitted Brief must create new version and new approval request.

## 3. Client Verification Workflow
- [x] Generate secure Client Verification request (authorised internal user).
- [x] Create secure client-facing verification route (`/client-verification/{token}`).
- [x] Client decisions: `CONFIRMED`, `CHANGES_REQUESTED`, `REJECTED`.
- [x] Secure token storage (hash only) and expiry.
- [x] Ensure invalid/expired tokens are rejected.
- [x] Ensure client decisions record verifier details and comments.
- [x] Ensure new Brief version invalidates pending verification.

## 4. Revision Cycle
- [x] Return Project Brief to revision state upon requested changes.
- [x] Allow only authorised Sales users to edit.
- [x] Require new immutable version when resubmitted.
- [x] Require BDM approval and Client Verification again for the new version.

## 5. Workflow Guards
- [x] Implement central workflow transition service.
- [x] Reject invalid transitions (e.g., DRAFT directly to BDM_APPROVED).
- [x] Return appropriate HTTP status codes (400, 401, 403, 404, 409).

## 6. Permissions
- [x] Add/reuse granular permissions (`BDM_APPROVAL_READ`, `BDM_APPROVAL_DECIDE`, `CLIENT_VERIFICATION_CREATE`, `CLIENT_VERIFICATION_READ`, `APPROVAL_HISTORY_READ`).
- [x] Apply backend permission checks and row-level Opportunity access.

## 7. Workflow History and Audit
- [x] Record immutable workflow history for all state transitions and actions.
- [x] Store actor, action, timestamp, opportunity, brief version, state changes, comments.

## 8. Notifications
- [x] Create notifications for new review requests, BDM decisions, Client actions.
- [x] Ensure no duplicate notifications.
- [x] Ensure notification links point to correct page.

## 9. Frontend Pages
- [x] `/bdm-approvals` (BDM Approval Queue).
- [x] `/bdm-approvals/:id` (BDM Review page).
- [x] `/client-verification/:token` (External-facing client page).
- [x] `/opportunities/:id/approval-history`.

## 10. Opportunity Details Integration
- [x] Add Approval and Verification section to Opportunity Details.
- [x] Hide Phase 7 Technical Routing controls until both gates pass.

## 11. Tests
- [x] Add backend tests for all workflow rules and security checks.
- [x] Ensure tests run successfully with `.\mvnw.cmd clean test`.

## 12. Frontend Validation
- [x] Run `npm run lint` and `npm run build`.
- [x] Fix all TypeScript errors, ESLint errors, React Hook warnings.

## 13. Runtime Verification
- [x] Verify API workflows end-to-end.
- [x] Check HTTP 500 errors.

## 14. Completion Gate
- [x] Confirm all conditions are met before reporting PHASE 6 COMPLETE.

## Evidence and Runtime Verification
- Fixed Jackson snapshot serialization properly via `JsonMapper` and removed legacy module configs.
- Re-tested 76 backend tests, which passed fully (`mvnw clean test`).
- Ran frontend builds: `npm run lint` and `npm run build` returned fully successful logs.
- Added Missing "BDM Approvals" to Sidebar guarding via `BDM_APPROVAL_READ` | `BDM_APPROVAL_DECIDE`.
- Handled state flows on `SalesOpportunityDetailsPage` and `ProjectBriefEditor` successfully.
- Implemented and integrated independent `ClientVerificationPage` using external routing.
- Used the exact migration version V15 (`V15__create_phase6_approvals_and_verifications_schema.sql`) for creating the phase 6 tables.
- Fixed the empty BDM Approval Queue by properly instantiating `BdmApproval` requests synchronously during the `ProjectBriefService.submitProjectBrief` transaction.
- Added duplicate active approval request protection via `BdmApprovalRepository`.
- Updated `/api/v1/bdm-approvals` GET endpoint mapping and expanded `BdmApprovalDTO` data payload to fulfill frontend queue UI requirements (Opportunity number, title, client, waiting duration, etc.).

Verdict:
PHASE 6 COMPLETE
