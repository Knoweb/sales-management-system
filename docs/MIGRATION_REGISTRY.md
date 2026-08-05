# Flyway Migration Registry

## Existing Migrations

| Version | Filename | Purpose | Related Phase/Module | Appears Applied |
|---------|----------|---------|----------------------|-----------------|
| V1 | V1__initialize_database.sql | Base initialisation | Core | Yes |
| V2 | V2__create_authentication_schema.sql | Auth schema | Phase 1 (Auth) | Yes |
| V3 | V3__seed_roles_and_permissions.sql | Roles & Permissions | Phase 1 (Auth) | Yes |
| V4 | V4__create_organization_schema.sql | Org schema | Phase 2 (Organization) | Yes |
| V5 | V5__seed_departments_and_phase3_permissions.sql | Departments & Permissions | Phase 3 (Skills) | Yes |
| V6 | V6__seed_initial_skills.sql | Skills seed | Phase 3 (Skills) | Yes |
| V7 | V7__create_client_and_lead_schema.sql | Client/Lead schema | Phase 4 (CRM) | Yes |
| V9 | V9__align_client_contacts_schema.sql | Align contacts | Phase 4 (CRM) | Yes |
| V10 | V10__add_contact_to_lead.sql | Add contact to lead | Phase 4 (CRM) | Yes |
| V11 | V11__create_sales_opportunity_and_project_brief_schema.sql | Opportunities/Briefs | Phase 5 (Sales) | Yes |
| V12 | V12__seed_product_categories_and_phase5_permissions.sql | Product categories | Phase 5 (Sales) | Yes |
| V13 | V13__add_initial_meeting_and_attachments.sql | Initial meeting | Phase 5 (Sales) | Yes |
| V14 | V14__add_storage_path_to_project_brief_attachments.sql | Storage path | Phase 5 (Sales) | Yes |
| V15 | V15__create_phase6_approvals_and_verifications_schema.sql | Approvals/Verifications | Phase 6 (Approvals) | Yes |
| V16 | V16__add_encrypted_token_and_permission.sql | Encrypted token | Phase 6 (Approvals) | Yes |
| V18 | V18__add_missing_notification_permissions.sql | Notification perms | Core | Yes |
| V19 | V19__create_phase7_technical_routing_schema.sql | Technical routing | Phase 7 (Routing) | Yes |
| V20 | V20__create_phase8_technical_costing_schema.sql | Technical costing | Phase 8 (Costing) | Yes |
| V22 | V22__repair_project_brief_status.sql | Repair brief status | Phase 5 (Sales) | Yes |

*Note: V8, V17, and V21 are currently skipped or missing.*

## Migration Rules
- **DO NOT** edit an applied migration.
- **DO NOT** rename an applied migration.
- **DO NOT** delete an applied migration.
- **DO NOT** run Flyway repair automatically.
- **DO NOT** modify `flyway_schema_history` manually.

## Risks and Mitigation
- **Duplicate-version risks**: Because multiple members work on `main`, there is a high risk of duplicate version numbers.
- **Missing/orphaned migration risks**: Migrations created by other members may become orphaned if branches diverge, though we are working directly on `main`.
- **Latest Migration Version**: V22
- **Next available migration versions**: V23, V24, V25. 

**IMPORTANT**: Migration numbers must be rechecked immediately before Step C1 because all three members work on `main`.
