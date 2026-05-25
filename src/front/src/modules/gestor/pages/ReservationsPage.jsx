import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';

export function ReservationsPage() {
  const navigate = useNavigate();
  const [reservaId, setReservaId] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!reservaId) return;
    navigate(`/gestor/reservas/${reservaId}/historico`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Consulte a timeline operacional vinculada ao encerramento de uso."
        title="Reservas"
      />

      <SectionCard
        subtitle="Use o ID informado no encerramento para acompanhar saída, retorno e liberação do veículo."
        title="Histórico da reserva"
      >
        <form className="reservation-lookup" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>ID da reserva</span>
            <input
              min="1"
              onChange={(event) => setReservaId(event.target.value)}
              placeholder="Ex.: 1024"
              required
              type="number"
              value={reservaId}
            />
          </label>
          <ActionButton icon="history" type="submit">
            Ver timeline
          </ActionButton>
        </form>
      </SectionCard>

      <SectionCard subtitle="Atalhos para a operação diária." title="Finalização e histórico">
        <div className="quick-links">
          <ActionButton icon="fleet" to="/gestor/frota" variant="secondary">
            Abrir frota
          </ActionButton>
          <ActionButton icon="reports" to="/gestor/relatorios" variant="secondary">
            Relatórios
          </ActionButton>
        </div>
      </SectionCard>
    </div>
  );
}
