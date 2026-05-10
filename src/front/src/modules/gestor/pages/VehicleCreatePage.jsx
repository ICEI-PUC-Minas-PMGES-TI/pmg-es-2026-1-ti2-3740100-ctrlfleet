import { useNavigate } from 'react-router-dom';
import { ActionButton } from '../../../components/common/ActionButton';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { adminUsers } from '../../../data/adminData';
import { vehicleFormOptions } from '../../../data/fleetData';
import { useVehicleForm } from '../context/useVehicleForm';

export function VehicleCreatePage() {
  const navigate = useNavigate();
  const { formState, resetForm, updateForm } = useVehicleForm();
  const drivers = adminUsers.filter((user) => user.role === 'Motorista');
  const selectedDriver = drivers.find((driver) => driver.id === formState.driverId) ?? null;

  function handleSubmit(event) {
    event.preventDefault();

    const flashMessage = `Veículo ${formState.plate || formState.model || 'novo'} salvo com sucesso.`;
    resetForm();
    navigate('/gestor/frota', { state: { flashMessage } });
  }

  return (
    <div className="page-stack">
      <PageHeader
        subtitle="Preencha em uma única tela os dados do veículo e a documentação obrigatória."
        title="Cadastro de Novo Veículo"
      />

      <div className="content-grid content-grid--form">
        <SectionCard title="Dados do veículo e documentação">
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

            <div className="form-section-title">
              <strong>Motorista vinculado</strong>
              <span>Selecione o motorista fixo responsável por este veículo e confira seus dados cadastrais.</span>
            </div>

            <label className="form-field">
              <span>Motorista responsável</span>
              <select
                onChange={(event) => updateForm({ driverId: event.target.value })}
                required
                value={formState.driverId}
              >
                <option value="">Selecione um motorista</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="driver-association-card">
              {selectedDriver ? (
                <>
                  <div className="driver-association-card__header">
                    <strong>{selectedDriver.name}</strong>
                    <StatusBadge label={selectedDriver.status} />
                  </div>
                  <dl className="driver-association-card__grid">
                    <div>
                      <dt>E-mail</dt>
                      <dd>{selectedDriver.email}</dd>
                    </div>
                    <div>
                      <dt>CPF</dt>
                      <dd>{selectedDriver.cpf}</dd>
                    </div>
                    <div>
                      <dt>CNH</dt>
                      <dd>{selectedDriver.cnh || 'Não informada'}</dd>
                    </div>
                    <div>
                      <dt>Validade da CNH</dt>
                      <dd>{selectedDriver.cnhExpiry || 'Não informada'}</dd>
                    </div>
                    <div>
                      <dt>Último acesso</dt>
                      <dd>{selectedDriver.lastAccess}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="driver-association-card__empty">
                  Escolha um motorista para vincular o veículo ao responsável fixo.
                </p>
              )}
            </div>

            <div className="form-section-title">
              <strong>Documentação obrigatória</strong>
              <span>Campos obrigatórios conforme a definição funcional de IPVA, seguro e licenciamento.</span>
            </div>

            <label className="form-field">
              <span>IPVA</span>
              <input
                onChange={(event) => updateForm({ ipvaDueDate: event.target.value })}
                required
                type="date"
                value={formState.ipvaDueDate}
              />
            </label>

            <label className="form-field">
              <span>Seguro</span>
              <input
                onChange={(event) => updateForm({ insuranceDueDate: event.target.value })}
                required
                type="date"
                value={formState.insuranceDueDate}
              />
            </label>

            <label className="form-field">
              <span>Licenciamento</span>
              <input
                onChange={(event) => updateForm({ licenseDueDate: event.target.value })}
                required
                type="date"
                value={formState.licenseDueDate}
              />
            </label>

            <div className="form-actions">
              <ActionButton onClick={() => navigate('/gestor/frota')} type="button" variant="secondary">
                Cancelar
              </ActionButton>
              <ActionButton icon="chevronDown" type="submit">
                Salvar veículo
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
              <dt>Ano</dt>
              <dd>{formState.year || 'Não informado'}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{formState.status}</dd>
            </div>
            <div>
              <dt>Categoria CNH</dt>
              <dd>{formState.licenseCategory}</dd>
            </div>
            <div>
              <dt>Motorista</dt>
              <dd>{selectedDriver?.name || 'Não vinculado'}</dd>
            </div>
            <div>
              <dt>Status do motorista</dt>
              <dd>{selectedDriver ? <StatusBadge label={selectedDriver.status} /> : 'Pendente'}</dd>
            </div>
            <div>
              <dt>CNH do motorista</dt>
              <dd>{selectedDriver?.cnh || 'Não informada'}</dd>
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
