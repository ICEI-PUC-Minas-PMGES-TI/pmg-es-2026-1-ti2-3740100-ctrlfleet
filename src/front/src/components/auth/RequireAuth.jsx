import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom';
import { AccessDeniedPage } from '../auth/AccessDeniedPage';
import {
  canAccessArea,
  getAreaForRole,
  getAreaLabel,
  getAuthSession,
  getHomePathForSession,
  getMotoristaIdFromSession,
} from '../../services/authSession';

export function RequireAuth({ area }) {
  const location = useLocation();
  const params = useParams();
  const session = getAuthSession();

  if (!session?.token) {
    return (
      <Navigate
        replace
        state={{
          from: location.pathname,
          message: 'Faça login para acessar esta área.',
        }}
        to="/login"
      />
    );
  }

  if (!canAccessArea(session, area)) {
    const userArea = getAreaForRole(session.role);
    const homePath = getHomePathForSession(session);

    return (
      <AccessDeniedPage
        homeLabel={`Voltar para ${getAreaLabel(userArea)}`}
        homePath={homePath}
        message={`Sua conta (${session.perfilAcesso ?? session.role}) não tem permissão para acessar a área de ${getAreaLabel(area)}.`}
        title="Acesso negado"
      />
    );
  }

  if (area === 'motorista' && params.motoristaId) {
    const expectedId = getMotoristaIdFromSession(session);
  const requestedId = Number(params.motoristaId);

    if (expectedId && Number.isFinite(requestedId) && requestedId !== expectedId) {
      return (
        <AccessDeniedPage
          homeLabel="Ir para meu painel"
          homePath={getHomePathForSession(session)}
          message="Você só pode visualizar os seus próprios dados de motorista."
          title="Acesso negado"
        />
      );
    }
  }

  return <Outlet context={{ session }} />;
}
