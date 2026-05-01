import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminRolesPage } from './pages/AdminRolesPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AdminUserFormPage } from './pages/AdminUserFormPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerLayout />}>
          <Route index element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="admin">
            <Route index element={<Navigate replace to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="usuarios/:userId/editar" element={<AdminUserFormPage />} />
            <Route path="perfis" element={<AdminRolesPage />} />
            <Route path="auditoria" element={<AdminAuditPage />} />
            <Route path="configuracoes" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/admin/dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
