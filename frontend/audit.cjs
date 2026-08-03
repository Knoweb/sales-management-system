const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/v1';

async function runAudit() {
    console.log("=== PHASE 6 RUNTIME AUDIT ===");
    let token = '';
    
    try {
        console.log("\n[1] Login as SYSTEM_ADMIN");
        let res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@knoweb.lk',
            password: 'password'
        }, { validateStatus: () => true });
        
        if (res.status !== 200) {
            console.error("Login failed!", res.status, res.data);
            return;
        }
        token = res.data.accessToken;
        console.log("-> SUCCESS");

        const headers = { 'Authorization': `Bearer ${token}` };
        const reqOpts = { headers, validateStatus: () => true };

        console.log("\n[1.1] Get Product Categories");
        res = await axios.get(`${BASE_URL}/product-categories`, reqOpts);
        const productCategoryId = res.data[0].id;
        console.log(`-> Category ID: ${productCategoryId}`);

        console.log("\n[1.2] Get Employees");
        res = await axios.get(`${BASE_URL}/employees`, reqOpts);
        const employees = res.data.content || res.data;
        const employeeId = employees[0].id;
        console.log(`-> Employee ID: ${employeeId}`);

        console.log("\n[1.3] Get Departments");
        res = await axios.get(`${BASE_URL}/departments`, reqOpts);
        const departmentId = res.data[0].id;
        console.log(`-> Department ID: ${departmentId}`);

        const uuid = Date.now().toString();
        console.log(`\n[2] Create Client (Phase 6 Test Client ${uuid})`);
        res = await axios.post(`${BASE_URL}/clients`, {
            name: `Phase 6 Test Client ${uuid}`,
            email: `client${uuid}@example.com`,
            clientType: 'COMPANY',
            phone: uuid.substring(0,10),
            address: "123 Test St"
        }, reqOpts);
        console.log(`-> Client POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        if (res.status !== 201 && res.status !== 200) return;
        const clientId = res.data.id;

        console.log(`\n[3] Create Client Contact`);
        res = await axios.post(`${BASE_URL}/clients/${clientId}/contacts`, {
            firstName: 'Phase 6',
            lastName: 'Contact',
            email: `contact${uuid}@example.com`,
            isPrimary: true,
            jobTitle: "Manager",
            phone: uuid.substring(0,10)
        }, reqOpts);
        console.log(`-> Contact POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        const contactId = res.data.id;

        console.log(`\n[4] Create Lead`);
        res = await axios.post(`${BASE_URL}/leads`, {
            clientId: clientId,
            contactId: contactId,
            title: `Phase 6 Verification Project ${uuid}`,
            status: 'NEW',
            inquirySource: 'WEBSITE'
        }, reqOpts);
        console.log(`-> Lead POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        if (res.status !== 201 && res.status !== 200) return;
        const leadId = res.data.id;

        console.log(`\n[5] Qualify Lead`);
        res = await axios.patch(`${BASE_URL}/leads/${leadId}/status`, { status: 'QUALIFIED' }, reqOpts);
        console.log(`-> Lead Qualify PATCH: HTTP ${res.status} ${JSON.stringify(res.data)}`);

        console.log(`\n[6] Convert Lead to Opportunity`);
        res = await axios.post(`${BASE_URL}/leads/${leadId}/convert-to-opportunity`, {
            title: `Phase 6 Opp ${uuid}`,
            productCategoryId: productCategoryId,
            assignedSalesOfficerId: employeeId,
            expectedCloseDate: '2027-01-01',
            estimatedValue: 50000,
            currency: 'USD'
        }, reqOpts);
        console.log(`-> Convert POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        if (res.status !== 201 && res.status !== 200) return;
        const oppId = res.data.id;
        const briefId = res.data.projectBrief.id;
        console.log('-> Brief initialized implicitly: ' + briefId);

        console.log(`\n[8] Save Draft`);
        const draftBody = {
            projectTitle: `Phase 6 Title ${uuid}`,
            businessProblem: "Need automation",
            requiredSolution: "Automation software",
            projectScope: "End to end",
            technicalRequirements: "Java, Spring Boot",
            expectedBudget: 50000,
            currency: 'USD',
            expectedDeadline: '2027-01-01',
            requiredDepartmentIds: [departmentId],
            versionNumber: 1
        };
        res = await axios.put(`${BASE_URL}/project-briefs/${briefId}/draft`, draftBody, reqOpts);
        console.log(`-> Save Draft PUT: HTTP ${res.status} ${JSON.stringify(res.data)}`);

        console.log(`\n[9] Save Version`);
        res = await axios.post(`${BASE_URL}/project-briefs/${briefId}/version`, draftBody, reqOpts);
        console.log(`-> Save Version POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        const versionNumber = res.data.currentVersionNumber;
        console.log(`-> Version incremented to: ${versionNumber}`);
        console.log(`-> Snapshot not null: ${!!res.data.snapshot}`);

        console.log(`\n[10] Submit Brief`);
        res = await axios.post(`${BASE_URL}/project-briefs/${briefId}/submit`, { comments: "Submitting for review" }, reqOpts);
        console.log(`-> Submit POST: HTTP ${res.status} ${JSON.stringify(res.data)}`);
        
        console.log(`\n[11] Verify Opportunity Stage is BRIEF_SUBMITTED`);
        res = await axios.get(`${BASE_URL}/opportunities/${oppId}`, reqOpts);
        console.log(`-> Opp Stage: ${res.data.stage} (HTTP ${res.status})`);
        
        console.log(`\n[12] BDM Approval Queue`);
        res = await axios.get(`${BASE_URL}/bdm-approvals`, reqOpts);
        console.log(`-> Queue GET: HTTP ${res.status}`);
        const approvals = res.data.content || res.data;
        const approval = approvals.find(a => a.projectBriefId === briefId);
        if (approval) {
            console.log(`-> Found approval in queue: ID ${approval.id}`);
            console.log(`-> Opportunity Title: ${approval.opportunityTitle}`);
            console.log(`-> Status: ${approval.status}`);
        } else {
            console.log(`-> ERROR: Approval not found in queue!`);
        }
        const approvalId = approval ? approval.id : null;

        if (approvalId) {
            console.log(`\n[13] Duplicate Decision (Approve twice check)`);
            res = await axios.post(`${BASE_URL}/bdm-approvals/${approvalId}/approve`, { comments: "Looks good" }, reqOpts);
            console.log(`-> First Approve POST: HTTP ${res.status}`);
            
            res = await axios.post(`${BASE_URL}/bdm-approvals/${approvalId}/approve`, { comments: "Looks good again" }, reqOpts);
            console.log(`-> Second Approve POST: HTTP ${res.status} (Expected 409)`);
        }

        console.log(`\n[14] Generate Client Verification`);
        res = await axios.post(`${BASE_URL}/project-briefs/${briefId}/create-verification`, {}, reqOpts);
        console.log(`-> Generate POST: HTTP ${res.status}`);
        let verificationUrl = res.data.token ? `/client-verification/${res.data.token}` : null;
        console.log(`-> URL token: ${res.data.token}`);
        
        if (res.data.token) {
            const token = res.data.token;
            console.log(`\n[15] Client Confirm (External Route)`);
            res = await axios.post(`${BASE_URL}/client-verifications/${token}/confirm`, {
                verifierName: "Test Client",
                verifierEmail: "client@example.com",
                digitalConfirmation: true,
                comments: "looks good"
            }, { validateStatus: () => true });
            console.log(`-> Client Confirm POST: HTTP ${res.status}`);
            
            console.log(`\n[16] Used Token Check`);
            res = await axios.post(`${BASE_URL}/client-verifications/${token}/confirm`, {
                verifierName: "Test Client",
                verifierEmail: "client@example.com",
                digitalConfirmation: true,
                comments: "looks good"
            }, { validateStatus: () => true });
            console.log(`-> Used Token POST: HTTP ${res.status} (Expected 409 or 400)`);
        }
        
        console.log(`\n[17] Final Opportunity State`);
        res = await axios.get(`${BASE_URL}/opportunities/${oppId}`, reqOpts);
        console.log(`-> Final Opp Stage: ${res.data.stage} (Expected READY_FOR_TECHNICAL_ROUTING)`);
        
        console.log(`\n[18] Approval History`);
        res = await axios.get(`${BASE_URL}/opportunities/${oppId}/approval-history`, reqOpts);
        console.log(`-> History GET: HTTP ${res.status}`);
        console.log(`-> History Records: ${res.data.length}`);
        
        console.log("\n[19] Notifications");
        res = await axios.get(`${BASE_URL}/notifications`, reqOpts);
        console.log(`-> Notifications GET: HTTP ${res.status}`);
        const notifs = res.data.content || res.data;
        console.log(`-> Total Notifications: ${notifs.length}`);

        console.log("\n=== AUDIT COMPLETE ===");

    } catch (err) {
        console.error("Audit script failed:", err.message);
    }
}

runAudit();
