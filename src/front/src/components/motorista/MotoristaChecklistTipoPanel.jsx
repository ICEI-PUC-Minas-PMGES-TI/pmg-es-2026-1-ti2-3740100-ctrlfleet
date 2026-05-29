import { Icon } from '../common/Icon';

/**
 * @param {{
 *   tipo: { idTipoInspecao?: number, nome: string, descricao?: string | null },
 *   items: Array<{ id: number, nome: string, critico?: boolean }>,
 *   checkedItems: Set<number>,
 *   onToggle: (itemId: number) => void,
 *   observacoes: Record<number, string>,
 *   onObservacaoChange: (itemId: number, value: string) => void,
 * }} props
 */
export function MotoristaChecklistTipoPanel({
  tipo,
  items,
  checkedItems,
  onToggle,
  observacoes,
  onObservacaoChange,
}) {
  if (!items.length) {
    return (
      <div className="driver-checklist-tipo driver-checklist-tipo--empty">
        <p>Nenhum item cadastrado para este tipo de inspeção.</p>
      </div>
    );
  }

  return (
    <section aria-labelledby="checklist-tipo-title" className="driver-checklist-tipo">
      <header className="driver-checklist-tipo__header">
        <div>
          <span className="driver-checklist-tipo__eyebrow">Tipo de inspeção</span>
          <h3 className="driver-checklist-tipo__title" id="checklist-tipo-title">
            {tipo.nome}
          </h3>
          {tipo.descricao ? <p className="driver-checklist-tipo__desc">{tipo.descricao}</p> : null}
        </div>
        <span className="driver-checklist-tipo__count">
          {items.length} {items.length === 1 ? 'item' : 'itens'}
        </span>
      </header>

      <p className="driver-checklist-tipo__hint">
        <Icon name="alert" />
        <span>
          Marque cada item do checklist. A documentação do veículo é controlada automaticamente pelo sistema.
          Informe observações quando necessário.
        </span>
      </p>

      <div className="driver-checklist-list">
        {items.map((item) => (
          <div className="driver-checklist-item" key={item.id}>
            <label>
              <input
                checked={checkedItems.has(item.id)}
                onChange={() => onToggle(item.id)}
                type="checkbox"
              />
              <span>{item.nome}</span>
              {item.critico ? <span className="driver-critical-badge">Crítico</span> : null}
            </label>
            <input
              aria-label={`Observação de ${item.nome}`}
              onChange={(event) => onObservacaoChange(item.id, event.target.value)}
              placeholder={item.critico ? 'Ocorrência crítica bloqueia a saída' : 'Observação opcional'}
              type="text"
              value={observacoes[item.id] || ''}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
