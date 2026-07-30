import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import { EmployeeFormPage } from './pages/EmployeeFormPage';

import './index.css';
import './styles/auth.css';
import './styles/dashboard.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            <Route path="/users" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <UserManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/departments" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <DepartmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/departments/new" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <DepartmentFormPage />
              </ProtectedRoute>
            } />
            
            <Route path="/employees" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <EmployeesPage />
              </ProtectedRoute>
            } />
            <Route path="/employees/new" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <EmployeeFormPage />
              </ProtectedRoute>
            } />
            <Route path="/employees/:id" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <EmployeeDetailsPage />
              </ProtectedRoute>
            } />
            
            <Route path="/skills" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <SkillsPage />
              </ProtectedRoute>
            } />
            <Route path="/skills/new" element={
              <ProtectedRoute requiredRole="SYSTEM_ADMIN">
                <SkillFormPage />
              </ProtectedRoute>
            } />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
