/**
 * Datas por tipo: corretiva → abertura; preventiva → abertura + agendamento.
 */
export function MaintenanceDateMeta({ item }) {
  const isPreventiva = item.tipo === 'PREVENTIVA';

  return (
    <>
      <div>
        <dt>Abertura</dt>
        <dd>{item.dataAberturaLabel}</dd>
      </div>
      {isPreventiva ? (
        <div>
          <dt>Agendamento</dt>
          <dd className={item.atrasada ? 'maintenance-date-meta__overdue' : undefined}>
            {item.dataAgendamentoLabel}
            {item.atrasada ? <span className="maintenance-date-meta__tag">Atrasada</span> : null}
          </dd>
        </div>
      ) : null}
    </>
  );
}
