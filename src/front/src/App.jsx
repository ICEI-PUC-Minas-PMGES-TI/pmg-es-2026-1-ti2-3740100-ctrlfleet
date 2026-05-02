import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { AdminAuditPage } from './modules/admin/pages/AdminAuditPage';
import { AdminDashboardPage } from './modules/admin/pages/AdminDashboardPage';
import { AdminRolesPage } from './modules/admin/pages/AdminRolesPage';
import { AdminSettingsPage } from './modules/admin/pages/AdminSettingsPage';
import { AdminUserFormPage } from './modules/admin/pages/AdminUserFormPage';
import { AdminUsersPage } from './modules/admin/pages/AdminUsersPage';

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
