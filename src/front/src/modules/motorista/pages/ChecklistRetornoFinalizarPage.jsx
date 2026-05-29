import { Navigate, useLocation, useParams } from 'react-router-dom';
import { getCurrentMotoristaId } from '../../../services/currentMotorista';

/** Redireciona rota legada para o hub unificado de checklist de retorno. */
export function ChecklistRetornoFinalizarPage() {
  const { reservaId } = useParams();
  const location = useLocation();
  const motoristaId = getCurrentMotoristaId();
  const hubPath = `/motorista/${motoristaId}/reservas/${reservaId}/checklist-retorno`;

  return <Navigate replace state={location.state} to={hubPath} />;
}
