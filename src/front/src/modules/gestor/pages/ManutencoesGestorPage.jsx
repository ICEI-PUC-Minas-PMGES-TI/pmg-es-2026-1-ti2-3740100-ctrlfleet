import { useState, useEffect, useCallback } from 'react';
import { ActionButton } from '../../../components/common/ActionButton';
import { Modal } from '../../../components/common/Modal';
import { PageHeader } from '../../../components/common/PageHeader';
import { SectionCard } from '../../../components/common/SectionCard';
import { Icon } from '../../../components/common/Icon';
import { listarManutencoesPendentes, encaminharParaOficina } from '../../../services/manutencaoApi';

export function ManutencoesGestorPage() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [uiState, setUiState] = useState({ loading: true, error: null });
  const [modal, setModal] = useState({ open: false, item: null, oficina: '', submitting: false });

  const carregarTriagem = useCallback(async () => {
    setUiState({ loading: true, error: null });
    try {
      const data = await listarManutencoesPendentes();
      setSolicitacoes(data || []);
      setUiState({ loading: false, error: null });
    } catch (err) {
      setUiState({ loading: false, error: err.message });
    }
  }, []);

  useEffect(() => {
    carregarTriagem();
  }, [carregarTriagem]);

  const abrirEncaminhamento = (item) => {
    setModal({ open: true, item, oficina: '', submitting: false });
  };

  const fecharModal = () => {
    if (modal.submitting) return;
    setModal({ open: false, item: null, oficina: '', submitting: false });
  };

  const handleConfirmarOficina = async (e) => {
    e.preventDefault();
    if (!modal.oficina.trim() || modal.submitting) return;

    setModal(curr => ({ ...curr, submitting: true }));
    try {
      await encaminharParaOficina(modal.item.id, {
        idGestor: 2, // ID simulado do Gestor autenticado
        oficinaExecutor: modal.oficina.trim()
      });
      setModal({ open: false, item: null, oficina: '', submitting: false });
      carregarTriagem();
    } catch (err) {
      alert(err.message);
      setModal(curr => ({ ...curr, submitting: false }));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader 
        title="Triagem de Manutenções" 
        subtitle="Analise chamados abertos por motoristas e direcione os veículos com problemas mecânicos." 
      />

      <SectionCard title="Fila de Solicitações Pendentes">
        {uiState.loading ? (
          <div className="admin-dashboard__loading">
            <span className="admin-dashboard__spinner" aria-hidden="true" />
            <p>Buscando pendências da frota...</p>
          </div>
        ) : uiState.error ? (
          <div className="admin-dashboard__error">
            <Icon name="alert" />
            <div>
              <strong>Erro ao carregar</strong>
              <p>{uiState.error}</p>
            </div>
          </div>
        ) : solicitacoes.length === 0 ? (
          <div className="admin-empty">
            <Icon name="maintenance" />
            <p>Nenhuma solicitação mecânica aguardando decisão no momento.</p>
          </div>
        ) : (
          <>
            <div className="table-summary">
              <span>Mostrando {solicitacoes.length} chamados pendentes</span>
            </div>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Veículo</th>
                    <th>Tipo</th>
                    <th>Descrição do Defeito</th>
                    <th>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map(item => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>
                      <td>
                        <strong>{item.placa}</strong>
                        <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.marca} {item.modelo}
                        </span>
                      </td>
                      <td>
                        {item.emergencia ? (
                          <span className="badge badge--danger" style={{ color: '#fff', backgroundColor: '#dc3545', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>EMERGÊNCIA</span>
                        ) : (
                          <span className="badge badge--info" style={{ color: '#fff', backgroundColor: '#17a2b8', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>{item.tipoManutencao}</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.descricaoProblema}
                      </td>
                      <td>
                        <ActionButton variant="primary" onClick={() => abrirEncaminhamento(item)}>
                          Encaminhar Oficina
                        </ActionButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SectionCard>

      <Modal
        open={modal.open}
        title="Encaminhar para Oficina"
        subtitle="Informe o estabelecimento responsável pelo reparo mecânico do veículo."
        onClose={fecharModal}
        footer={
          <>
            <ActionButton variant="secondary" disabled={modal.submitting} onClick={fecharModal}>
              Cancelar
            </ActionButton>
            <ActionButton 
              variant="primary" 
              disabled={!modal.oficina.trim() || modal.submitting} 
              onClick={handleConfirmarOficina}
            >
              {modal.submitting ? 'Salvando...' : 'Confirmar Envio'}
            </ActionButton>
          </>
        }
      >
        {modal.item && (
          <div className="reservation-decision-modal">
            <dl className="admin-modal-list">
              <div>
                <dt>Veículo</dt>
                <dd>{modal.item.modelo} ({modal.item.placa})</dd>
              </div>
              <div>
                <dt>Problema</dt>
                <dd style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>"{modal.item.descricaoProblema}"</dd>
              </div>
            </dl>

            <form onSubmit={handleConfirmarOficina} style={{ marginTop: '1.5rem' }}>
              <label className="admin-form-field admin-form-field--full">
                <span className="admin-form-field__label">
                  Nome do Estabelecimento / Oficina <span className="admin-form-field__req">*</span>
                </span>
                <input 
                  type="text"
                  className="admin-form-field__input"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  value={modal.oficina}
                  onChange={(e) => setModal(curr => ({ ...curr, oficina: e.target.value }))}
                  placeholder="Ex: Auto Center e Oficina mecânica Silva"
                  maxLength={100}
                  required
                  disabled={modal.submitting}
                />
              </label>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}