import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { AdminAuditPage } from './modules/admin/pages/AdminAuditPage';
import { AdminDashboardPage } from './modules/admin/pages/AdminDashboardPage';
import { AdminRolesPage } from './modules/admin/pages/AdminRolesPage';
import { AdminUserFormPage } from './modules/admin/pages/AdminUserFormPage';
import { AdminUsersPage } from './modules/admin/pages/AdminUsersPage';
import { VehicleFormProvider } from './modules/gestor/context/VehicleFormContext';
import { FleetDashboardPage } from './modules/gestor/pages/FleetDashboardPage';
import { FleetPage } from './modules/gestor/pages/FleetPage';
import { ModulePlaceholderPage } from './modules/gestor/pages/ModulePlaceholderPage';
import { ReservationTimelinePage } from './modules/gestor/pages/ReservationTimelinePage';
import { ReservationsPage } from './modules/gestor/pages/ReservationsPage';
import { VehicleCreatePage } from './modules/gestor/pages/VehicleCreatePage';
import { VehicleDetailPage } from './modules/gestor/pages/VehicleDetailPage';
import { VehicleHistoryPage } from './modules/gestor/pages/VehicleHistoryPage';
import { HomePage } from './modules/public/pages/HomePage';
import { LoginPage } from './modules/public/pages/LoginPage';
import { RequesterReservationCreatePage } from './modules/solicitante/pages/RequesterReservationCreatePage';
import { RequesterReservationsPage } from './modules/solicitante/pages/RequesterReservationsPage';


function App() {
  return (
    <BrowserRouter>
      <VehicleFormProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="gestor" element={<ManagerLayout />}>
            <Route index element={<Navigate replace to="dashboard" />} />

            <Route path="dashboard" element={<FleetDashboardPage />} />
            <Route path="frota" element={<FleetPage />} />
            <Route path="frota/novo" element={<VehicleCreatePage />} />
            <Route path="frota/novo/documentacao" element={<Navigate replace to="/gestor/frota/novo" />} />
            <Route path="frota/:vehicleId/editar" element={<VehicleCreatePage />} />
            <Route path="frota/:vehicleId/historico" element={<VehicleHistoryPage />} />
            <Route path="frota/:vehicleId" element={<VehicleDetailPage />} />
            <Route path="reservas" element={<ReservationsPage />} />
            <Route path="reservas/:reservaId/historico" element={<ReservationTimelinePage />} />
            <Route
              path="manutencao"
              element={
                <ModulePlaceholderPage
                  ctaLabel="Acompanhar frota"
                  ctaTo="/gestor/frota"
                  description="Esta área já está preparada na navegação para receber triagem, prioridades e ordens de serviço."
                  title="Manutenção"
                />
              }
            />
            <Route
              path="programacao-preventiva"
              element={
                <ModulePlaceholderPage
                  ctaLabel="Cadastrar veículo"
                  ctaTo="/gestor/frota/novo"
                  description="Aqui podemos evoluir para um calendário preventivo com quilometragem, vencimentos e recorrências."
                  title="Prog. Preventiva"
                />
              }
            />
            <Route
              path="relatorios"
              element={
                <ModulePlaceholderPage
                  ctaLabel="Voltar para frota"
                  ctaTo="/gestor/frota"
                  description="O espaço de relatórios ficou separado para encaixar indicadores, exportações e auditorias sem retrabalho."
                  title="Relatórios"
                />
              }
            />
          </Route>

          <Route path="admin" element={<ManagerLayout />}>
            <Route index element={<Navigate replace to="dashboard" />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="usuarios/novo" element={<AdminUserFormPage />} />
            <Route path="usuarios/:userId/editar" element={<AdminUserFormPage />} />
            <Route path="perfis" element={<AdminRolesPage />} />
            <Route path="auditoria" element={<AdminAuditPage />} />
          </Route>

          <Route path="solicitante" element={<ManagerLayout />}>
            <Route index element={<Navigate replace to="reservas" />} />
            <Route path="reservas" element={<RequesterReservationsPage />} />
            <Route path="reservas/nova" element={<RequesterReservationCreatePage />} />
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </VehicleFormProvider>
    </BrowserRouter>
  );
}

export default App;
