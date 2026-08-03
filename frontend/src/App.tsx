import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserManagement } from './pages/UserManagement';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { AuthenticatedLayout } from './components/AuthenticatedLayout';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { DepartmentFormPage } from './pages/DepartmentFormPage';
import { SkillsPage } from './pages/SkillsPage';
import { SkillFormPage } from './pages/SkillFormPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailsPage } from './pages/EmployeeDetailsPage';
import SalesOpportunitiesPage from './pages/SalesOpportunitiesPage';
import SalesOpportunityDetailsPage from './pages/SalesOpportunityDetailsPage';
import { BdmApprovalsPage } from './pages/BdmApprovalsPage';
import { BdmReviewPage } from './pages/BdmReviewPage';
import { ClientVerificationPage } from './pages/ClientVerificationPage';
import ProjectBriefEditor from './pages/ProjectBriefEditor';
import ProductCategoriesPage from './pages/ProductCategoriesPage';
import { EmployeeFormPage } from './pages/EmployeeFormPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { LeadsPage } from './pages/LeadsPage';
import { LeadFormPage } from './pages/LeadFormPage';
import { LeadDetailsPage } from './pages/LeadDetailsPage';
import { FollowUpDashboard } from './pages/FollowUpDashboard';

import './index.css';
import './styles/auth.css';
import './styles/dashboard.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Removed from here */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/client-verification/:token" element={<ClientVerificationPage />} />
          
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/bdm-approvals" element={
              <ProtectedRoute requiredPermission="BDM_APPROVAL_READ">
                <BdmApprovalsPage />
              </ProtectedRoute>
            } />
            <Route path="/bdm-approvals/:id" element={
              <ProtectedRoute requiredPermission="BDM_APPROVAL_DECIDE">
                <BdmReviewPage />
              </ProtectedRoute>
            } />

            
            <Route path="/users" element={
              <ProtectedRoute requiredPermission="USER_READ">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/departments" element={
              <ProtectedRoute requiredPermission="DEPARTMENT_READ">
                <DepartmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/departments/new" element={
              <ProtectedRoute requiredPermission="DEPARTMENT_CREATE">
                <DepartmentFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute requiredPermission="EMPLOYEE_READ">
                <EmployeesPage />
              </ProtectedRoute>
            } />
            <Route path="/employees/new" element={
              <ProtectedRoute requiredPermission="EMPLOYEE_CREATE">
                <EmployeeFormPage />
              </ProtectedRoute>
            } />
            <Route path="/employees/:id" element={
              <ProtectedRoute requiredPermission={["EMPLOYEE_READ", "EMPLOYEE_SELF_READ"]}>
                <EmployeeDetailsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/skills" element={
              <ProtectedRoute requiredPermission="SKILL_CATALOG_READ">
                <SkillsPage />
              </ProtectedRoute>
            } />
            <Route path="/skills/new" element={
              <ProtectedRoute requiredPermission="SKILL_CATALOG_MANAGE">
                <SkillFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute requiredPermission="CLIENT_READ">
                <ClientsPage />
              </ProtectedRoute>
            } />
            <Route path="/clients/new" element={
              <ProtectedRoute requiredPermission="CLIENT_CREATE">
                <ClientFormPage />
              </ProtectedRoute>
            } />
            <Route path="/clients/:id" element={
              <ProtectedRoute requiredPermission="CLIENT_READ">
                <ClientDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/clients/:id/edit" element={
              <ProtectedRoute requiredPermission="CLIENT_UPDATE">
                <ClientFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="/leads" element={
              <ProtectedRoute requiredPermission="LEAD_READ">
                <LeadsPage />
              </ProtectedRoute>
            } />
            <Route path="/leads/new" element={
              <ProtectedRoute requiredPermission="LEAD_CREATE">
                <LeadFormPage />
              </ProtectedRoute>
            } />
            <Route path="/leads/:id" element={
              <ProtectedRoute requiredPermission="LEAD_READ">
                <LeadDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/leads/:id/edit" element={
              <ProtectedRoute requiredPermission="LEAD_UPDATE">
                <LeadFormPage />
              </ProtectedRoute>
            } />

            <Route path="/follow-ups" element={
              <ProtectedRoute requiredPermission="LEAD_READ">
                <FollowUpDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/opportunities" element={
              <ProtectedRoute requiredPermission="OPPORTUNITY_READ">
                <SalesOpportunitiesPage />
              </ProtectedRoute>
            } />
            <Route path="/opportunities/:id" element={
              <ProtectedRoute requiredPermission="OPPORTUNITY_READ">
                <SalesOpportunityDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/opportunities/:opportunityId/project-brief" element={
              <ProtectedRoute requiredPermission="PROJECT_BRIEF_READ">
                <ProjectBriefEditor />
              </ProtectedRoute>
            } />
            <Route path="/project-briefs/:id" element={
              <ProtectedRoute requiredPermission="PROJECT_BRIEF_READ">
                <ProjectBriefEditor />
              </ProtectedRoute>
            } />
            <Route path="/product-categories" element={
              <ProtectedRoute requiredPermission="PRODUCT_CATEGORY_READ">
                <ProductCategoriesPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
