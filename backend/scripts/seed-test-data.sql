-- Safely seed data for Technical Routing tests

DO $$
DECLARE
    v_client_id UUID := gen_random_uuid();
    v_lead_id UUID := gen_random_uuid();
    v_category_id UUID := gen_random_uuid();
    v_opp_id UUID := gen_random_uuid();
    v_brief_id UUID := gen_random_uuid();
    v_user_id UUID;
    v_dev_dept_id UUID;
    v_qa_dept_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM users WHERE email = 'admin@knoweb.lk';
    SELECT id INTO v_dev_dept_id FROM departments WHERE code = 'SOFTWARE';
    SELECT id INTO v_qa_dept_id FROM departments WHERE code = 'MECHANICAL';

    INSERT INTO clients (id, name, client_type, created_at, updated_at)
    VALUES (v_client_id, 'Test Client Co', 'COMPANY', now(), now());

    INSERT INTO leads (id, title, client_id, inquiry_source, status, created_at, updated_at)
    VALUES (v_lead_id, 'Test Lead', v_client_id, 'WEBSITE', 'NEW', now(), now());

    INSERT INTO product_categories (id, code, name)
    VALUES (v_category_id, 'CAT-TEST', 'Test Category');

    INSERT INTO sales_opportunities (id, opportunity_number, title, client_id, lead_id, product_category_id, stage, estimated_value, expected_close_date, created_at, updated_at)
    VALUES (v_opp_id, 'OPP-TEST', 'Test Opp', v_client_id, v_lead_id, v_category_id, 'QUALIFIED', 10000, CURRENT_DATE + 30, now(), now());

    INSERT INTO project_briefs (id, opportunity_id, status, current_version_number, project_title, business_problem, required_solution, project_scope, technical_requirements, expected_budget, currency, expected_deadline, due_at, created_at, updated_at)
    VALUES (v_brief_id, v_opp_id, 'CLIENT_VERIFIED', 1, 'Test Routing Title', 'Prob', 'Sol', 'Scope', 'Tech', 1000, 'USD', CURRENT_DATE + 10, now() + interval '5 days', now(), now());

    INSERT INTO project_brief_departments (project_brief_id, department_id)
    VALUES (v_brief_id, v_dev_dept_id), (v_brief_id, v_qa_dept_id);

    INSERT INTO bdm_approvals (id, project_brief_id, project_brief_version_number, opportunity_id, decision_maker_id, status, decision_date, created_at)
    VALUES (gen_random_uuid(), v_brief_id, 1, v_opp_id, v_user_id, 'APPROVED', now(), now());

    INSERT INTO client_verifications (id, project_brief_id, project_brief_version_number, opportunity_id, created_by, status, token_hash, expires_at, decision_date, verifier_name, verifier_email, created_at)
    VALUES (gen_random_uuid(), v_brief_id, 1, v_opp_id, v_user_id, 'CONFIRMED', 'test-token', now() + interval '1 day', now(), 'Client Name', 'client@test.com', now());

    RAISE NOTICE 'Seed completed. Project Brief ID: %', v_brief_id;
END $$;
