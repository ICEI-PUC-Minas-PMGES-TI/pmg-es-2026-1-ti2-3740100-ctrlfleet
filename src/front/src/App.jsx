import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/auth/RequireAuth';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { AdminAuditPage } from './modules/admin/pages/AdminAuditPage';
import { AdminDashboardPage } from './modules/admin/pages/AdminDashboardPage';
import { AdminRolesPage } from './modules/admin/pages/AdminRolesPage';
import { AdminUserFormPage } from './modules/admin/pages/AdminUserFormPage';
import { AdminUsersPage } from './modules/admin/pages/AdminUsersPage';
import { VehicleFormProvider } from './modules/gestor/context/VehicleFormContext';
import { FleetDashboardPage } from './modules/gestor/pages/FleetDashboardPage';
import { FleetPage } from './modules/gestor/pages/FleetPage';
import { ManutencaoGestorPage } from './modules/gestor/pages/ManutencaoGestorPage';
import { ProgramacaoPreventivaGestorPage } from './modules/gestor/pages/ProgramacaoPreventivaGestorPage';
import { ReportsPage } from './modules/gestor/pages/ReportsPage';
import { ReservasGestorPage } from './modules/gestor/pages/ReservasGestorPage';
import { ReservationTimelinePage } from './modules/gestor/pages/ReservationTimelinePage';
import { VehicleCreatePage } from './modules/gestor/pages/VehicleCreatePage';
import { VehicleDetailPage } from './modules/gestor/pages/VehicleDetailPage';
import { VehicleHistoryPage } from './modules/gestor/pages/VehicleHistoryPage';
import { ChecklistRetornoPage } from './modules/motorista/pages/ChecklistRetornoPage';
import { ChecklistRetornoFinalizarPage } from './modules/motorista/pages/ChecklistRetornoFinalizarPage';
import { ChecklistRetornoTipoPage } from './modules/motorista/pages/ChecklistRetornoTipoPage';
import { ChecklistSaidaPage } from './modules/motorista/pages/ChecklistSaidaPage';
import { ChecklistSaidaTipoPage } from './modules/motorista/pages/ChecklistSaidaTipoPage';
import { MotoristaDashboardPage } from './modules/motorista/pages/MotoristaDashboardPage';
import { MotoristaHistoricoPage } from './modules/motorista/pages/MotoristaHistoricoPage';
import { MotoristaCorridaPage } from './modules/motorista/pages/MotoristaCorridaPage';
import { MotoristaIniciarCorridaPage } from './modules/motorista/pages/MotoristaIniciarCorridaPage';
import { MotoristaReservaDetalhePage } from './modules/motorista/pages/MotoristaReservaDetalhePage';
import { MotoristaReservaHistoricoPage } from './modules/motorista/pages/MotoristaReservaHistoricoPage';
import { MotoristaVeiculoDetalhePage } from './modules/motorista/pages/MotoristaVeiculoDetalhePage';
import { MotoristaManutencaoPage } from './modules/motorista/pages/MotoristaManutencaoPage';
import { MotoristaSolicitarManutencaoPage } from './modules/motorista/pages/MotoristaSolicitarManutencaoPage';
import { MotoristaVeiculosPage } from './modules/motorista/pages/MotoristaVeiculosPage';
import { HomePage } from './modules/public/pages/HomePage';
import { LoginPage } from './modules/public/pages/LoginPage';
import { RequesterDashboardPage } from './modules/solicitante/pages/RequesterDashboardPage';
import { RequesterReservationCreatePage } from './modules/solicitante/pages/RequesterReservationCreatePage';
import { RequesterReservationsPage } from './modules/solicitante/pages/RequesterReservationsPage';
import { getMotoristaHomePathFromSession } from './services/authSession';

function App() {
  return (
    <BrowserRouter>
      <VehicleFormProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth area="gestor" />}>
            <Route path="gestor" element={<ManagerLayout />}>
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<FleetDashboardPage />} />
              <Route path="frota" element={<FleetPage />} />
              <Route path="frota/novo" element={<VehicleCreatePage />} />
              <Route path="frota/novo/documentacao" element={<Navigate replace to="/gestor/frota/novo" />} />
              <Route path="frota/:vehicleId/editar" element={<VehicleCreatePage />} />
              <Route path="frota/:vehicleId/historico" element={<VehicleHistoryPage />} />
              <Route path="frota/:vehicleId" element={<VehicleDetailPage />} />
              <Route path="reservas" element={<ReservasGestorPage />} />
              <Route path="reservas/:reservaId/historico" element={<ReservationTimelinePage />} />
              <Route path="manutencao" element={<ManutencaoGestorPage />} />
              <Route path="programacao-preventiva" element={<ProgramacaoPreventivaGestorPage />} />
              <Route path="relatorios" element={<ReportsPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth area="admin" />}>
            <Route path="admin" element={<ManagerLayout />}>
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="usuarios" element={<AdminUsersPage />} />
              <Route path="usuarios/novo" element={<AdminUserFormPage />} />
              <Route path="usuarios/:userId/editar" element={<AdminUserFormPage />} />
              <Route path="perfis" element={<AdminRolesPage />} />
              <Route path="auditoria" element={<AdminAuditPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth area="motorista" />}>
            <Route path="motorista" element={<ManagerLayout />}>
              <Route index element={<Navigate replace to={getMotoristaHomePathFromSession()} />} />
              <Route path=":motoristaId" element={<MotoristaDashboardPage />} />
              <Route path=":motoristaId/veiculos" element={<MotoristaVeiculosPage />} />
              <Route path=":motoristaId/veiculos/:vehicleId" element={<MotoristaVeiculoDetalhePage />} />
              <Route path=":motoristaId/historico" element={<MotoristaHistoricoPage />} />
              <Route path=":motoristaId/manutencao" element={<MotoristaManutencaoPage />} />
              <Route path=":motoristaId/manutencao/solicitar" element={<MotoristaSolicitarManutencaoPage />} />
              <Route path=":motoristaId/reservas/:reservaId" element={<MotoristaReservaDetalhePage />} />
              <Route path=":motoristaId/reservas/:reservaId/checklist-saida" element={<ChecklistSaidaPage />} />
              <Route
                path=":motoristaId/reservas/:reservaId/checklist-saida/tipos/:tipoId"
                element={<ChecklistSaidaTipoPage />}
              />
              <Route path=":motoristaId/reservas/:reservaId/iniciar-corrida" element={<MotoristaIniciarCorridaPage />} />
              <Route path=":motoristaId/reservas/:reservaId/corrida" element={<MotoristaCorridaPage />} />
              <Route path=":motoristaId/reservas/:reservaId/historico" element={<MotoristaReservaHistoricoPage />} />
              <Route path=":motoristaId/reservas/:reservaId/checklist-retorno" element={<ChecklistRetornoPage />} />
              <Route
                path=":motoristaId/reservas/:reservaId/checklist-retorno/tipos/:tipoId"
                element={<ChecklistRetornoTipoPage />}
              />
              <Route
                path=":motoristaId/reservas/:reservaId/checklist-retorno/finalizar"
                element={<ChecklistRetornoFinalizarPage />}
              />
              <Route
                path=":motoristaId/reservas/:reservaId/checklist-retorno/encerrar"
                element={<ChecklistRetornoFinalizarPage />}
              />
              <Route path="reservas/:reservaId/checklist-saida" element={<ChecklistSaidaPage />} />
              <Route path="reservas/:reservaId/checklist-retorno" element={<ChecklistRetornoPage />} />
            </Route>
          </Route>

          <Route element={<RequireAuth area="solicitante" />}>
            <Route path="solicitante" element={<ManagerLayout />}>
              <Route index element={<Navigate replace to="dashboard" />} />
              <Route path="dashboard" element={<RequesterDashboardPage />} />
              <Route path="reservas" element={<RequesterReservationsPage />} />
              <Route path="reservas/nova" element={<RequesterReservationCreatePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </VehicleFormProvider>
    </BrowserRouter>
  );
}

export default App;
