import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StepProgress } from '../components/common/StepProgress';
import { useVehicleForm } from '../context/useVehicleForm';
import { registrationSteps } from '../data/fleetData';

export function VehicleDocumentsPage() {
  const navigate = useNavigate();
  const { formState, resetForm, updateForm } = useVehicleForm();

  function handleSubmit(event) {
    event.preventDefault();

    const flashMessage = `Veículo ${formState.plate || formState.model || 'novo'} salvo com sucesso.`;
    resetForm();
    navigate('/frota', { state: { flashMessage } });
  }

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Segunda etapa do fluxo com vencimentos que impactam a regularidade e a disponibilidade."
        title="Cadastro de Novo Veículo"
      />

      <StepProgress currentStep={2} steps={registrationSteps} />

      <div className="content-grid content-grid--form">
        <SectionCard title="Documentação">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Vencimento IPVA</span>
              <input
                onChange={(event) => updateForm({ ipvaDueDate: event.target.value })}
                required
                type="date"
                value={formState.ipvaDueDate}
              />
            </label>

            <label className="form-field">
              <span>Vencimento seguro</span>
              <input
                onChange={(event) => updateForm({ insuranceDueDate: event.target.value })}
                required
                type="date"
                value={formState.insuranceDueDate}
              />
            </label>

            <label className="form-field">
              <span>Vencimento licenciamento</span>
              <input
                onChange={(event) => updateForm({ licenseDueDate: event.target.value })}
                required
                type="date"
                value={formState.licenseDueDate}
              />
            </label>

            <div className="form-actions">
              <ActionButton onClick={() => navigate('/frota/novo')} type="button" variant="secondary">
                Voltar
              </ActionButton>
              <ActionButton icon="chevronDown" type="submit">
                Salvar veículo
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Conferência antes de concluir." title="Resumo do cadastro">
          <dl className="summary-list">
            <div>
              <dt>Placa</dt>
              <dd>{formState.plate || 'Não informada'}</dd>
            </div>
            <div>
              <dt>Modelo</dt>
              <dd>{formState.model || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Status inicial</dt>
              <dd>{formState.status}</dd>
            </div>
            <div>
              <dt>IPVA</dt>
              <dd>{formState.ipvaDueDate || 'Pendente'}</dd>
            </div>
            <div>
              <dt>Seguro</dt>
              <dd>{formState.insuranceDueDate || 'Pendente'}</dd>
            </div>
            <div>
              <dt>Licenciamento</dt>
              <dd>{formState.licenseDueDate || 'Pendente'}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
