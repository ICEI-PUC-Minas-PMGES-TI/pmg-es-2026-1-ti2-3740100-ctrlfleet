import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ManagerLayout } from './components/layout/ManagerLayout';
import { VehicleFormProvider } from './context/VehicleFormContext';
import { DashboardPage } from './pages/DashboardPage';
import { FleetPage } from './pages/FleetPage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';
import { VehicleCreatePage } from './pages/VehicleCreatePage';
import { VehicleDetailPage } from './pages/VehicleDetailPage';
import { VehicleDocumentsPage } from './pages/VehicleDocumentsPage';

function App() {
  return (
    <BrowserRouter>
      <VehicleFormProvider>
        <Routes>
          <Route path="/" element={<ManagerLayout />}>
            <Route index element={<Navigate replace to="/frota" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="frota" element={<FleetPage />} />
            <Route path="frota/novo" element={<VehicleCreatePage />} />
            <Route path="frota/novo/documentacao" element={<VehicleDocumentsPage />} />
            <Route path="frota/:vehicleId" element={<VehicleDetailPage />} />
            <Route
              path="reservas"
              element={
                <ModulePlaceholderPage
                  ctaLabel="Ver veículos disponíveis"
                  ctaTo="/frota"
                  description="A fila de reservas, aprovações e disponibilidade pode entrar aqui na próxima etapa."
                  title="Reservas"
                />
              }
            />
            <Route
              path="manutencao"
              element={
                <ModulePlaceholderPage
                  ctaLabel="Acompanhar frota"
                  ctaTo="/frota"
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
                  ctaTo="/frota/novo"
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
                  ctaTo="/frota"
                  description="O espaço de relatórios ficou separado para encaixar indicadores, exportações e auditorias sem retrabalho."
                  title="Relatórios"
                />
              }
            />
            <Route path="*" element={<Navigate replace to="/frota" />} />
          </Route>
        </Routes>
      </VehicleFormProvider>
    </BrowserRouter>
  );
}

export default App;
