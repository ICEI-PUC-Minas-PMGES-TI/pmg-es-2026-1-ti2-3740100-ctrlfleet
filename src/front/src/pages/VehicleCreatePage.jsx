import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../components/common/ActionButton';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { StepProgress } from '../components/common/StepProgress';
import { useVehicleForm } from '../context/useVehicleForm';
import { registrationSteps, vehicleFormOptions } from '../data/fleetData';

export function VehicleCreatePage() {
  const navigate = useNavigate();
  const { formState, updateForm } = useVehicleForm();

  function handleSubmit(event) {
    event.preventDefault();
    navigate('/frota/novo/documentacao');
  }

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Primeira etapa do cadastro do veículo com dados operacionais e vínculo da secretaria."
        title="Cadastro de Novo Veículo"
      />

      <StepProgress currentStep={1} steps={registrationSteps} />

      <div className="content-grid content-grid--form">
        <SectionCard title="Dados do veículo">
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Placa</span>
              <input
                onChange={(event) => updateForm({ plate: event.target.value.toUpperCase() })}
                placeholder="ABC-1234"
                required
                value={formState.plate}
              />
            </label>

            <label className="form-field">
              <span>Modelo</span>
              <input
                onChange={(event) => updateForm({ model: event.target.value })}
                placeholder="Ex.: Toyota Hilux SW4"
                required
                value={formState.model}
              />
            </label>

            <label className="form-field">
              <span>Ano</span>
              <input
                inputMode="numeric"
                maxLength={4}
                onChange={(event) => updateForm({ year: event.target.value.replace(/\D/g, '') })}
                placeholder="2026"
                required
                value={formState.year}
              />
            </label>

            <label className="form-field">
              <span>Secretaria responsável</span>
              <select
                onChange={(event) => updateForm({ secretariat: event.target.value })}
                value={formState.secretariat}
              >
                {vehicleFormOptions.secretariats.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Status inicial</span>
              <select onChange={(event) => updateForm({ status: event.target.value })} value={formState.status}>
                {vehicleFormOptions.statuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Categoria CNH</span>
              <select
                onChange={(event) => updateForm({ licenseCategory: event.target.value })}
                value={formState.licenseCategory}
              >
                {vehicleFormOptions.licenseCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-actions">
              <ActionButton onClick={() => navigate('/frota')} type="button" variant="secondary">
                Cancelar
              </ActionButton>
              <ActionButton icon="chevronRight" type="submit">
                Salvar e avançar
              </ActionButton>
            </div>
          </form>
        </SectionCard>

        <SectionCard subtitle="Resumo ao vivo do cadastro." title="Pré-visualização">
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
              <dt>Secretaria</dt>
              <dd>{formState.secretariat}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{formState.status}</dd>
            </div>
            <div>
              <dt>Categoria CNH</dt>
              <dd>{formState.licenseCategory}</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}
