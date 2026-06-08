## 5. Indicadores de desempenho

Os indicadores abaixo foram definidos com base nos quatro processos de negócio do **CtrlFleet** (gestão de frotas, gestão de pessoas, gestão de manutenção e gestão de reservas) e nas entidades persistidas no modelo relacional do sistema. Cada métrica pode ser calculada a partir dos dados registrados nas tabelas `veiculos`, `documentacao`, `usuarios`, `motorista`, `manutencoes`, `reservas`, `registros_uso` e `alertas`, conforme indicado na coluna **Fonte de dados**.

Parte desses valores já é acompanhada de forma operacional no dashboard do gestor de frota (disponibilidade da frota, reservas pendentes, manutenções em andamento e alertas de documentação).

---

### Processo 1 — Gestão de frotas

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de disponibilidade operacional da frota | Garantir que a maior parte da frota esteja pronta para atender solicitações de uso. **Meta: ≥ 70%.** | Mede o percentual de veículos com status `DISPONIVEL` em relação ao total de veículos ativos (excluindo os `DESATIVADO`). Reflete a capacidade imediata da frota para novas reservas. | Tabela `veiculos` (`status`) | `(nº de veículos com status = 'DISPONIVEL' / nº de veículos com status ≠ 'DESATIVADO') × 100` |
| Índice de regularidade documental | Reduzir o risco de circulação com IPVA, seguro ou licenciamento irregular. **Meta: ≥ 95%.** | Mede o percentual de documentos cadastrados que se encontram dentro da validade (`data_vencimento` igual ou posterior à data corrente). Complementa os alertas exibidos no painel do gestor. | Tabelas `documentacao` (`data_vencimento`, `id_veiculo`) e `veiculos` | `(nº de registros em documentacao com data_vencimento ≥ data atual / nº total de registros em documentacao) × 100` |

---

### Processo 2 — Gestão de pessoas

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de motoristas aptos para condução | Assegurar que apenas condutores habilitados e ativos sejam alocados às viagens. **Meta: ≥ 90%.** | Mede o percentual de motoristas com conta `ATIVO` em `usuarios` e CNH válida (`validade_cnh` ≥ data atual) em relação ao total de motoristas cadastrados. | Tabelas `usuarios` (`status`, `tipo_cadastro`) e `motorista` (`validade_cnh`) | `(nº de motoristas com status = 'ATIVO' e validade_cnh ≥ data atual / nº total de registros em motorista) × 100` |
| Taxa de contas de acesso regularizadas | Agilizar a liberação de novos solicitantes e reduzir contas bloqueadas indevidamente. **Meta: ≥ 85%.** | Mede o percentual de usuários com status `ATIVO` em relação ao total de contas cadastradas, excluindo registros `INATIVO` (desligados). Indica a eficiência do fluxo de aprovação de cadastros pelo administrador. | Tabela `usuarios` (`status`) | `(nº de usuários com status = 'ATIVO' / nº de usuários com status ≠ 'INATIVO') × 100` |

---

### Processo 3 — Gestão de manutenção

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de conclusão de ordens de manutenção | Reduzir o acúmulo de serviços pendentes e veículos parados. **Meta: ≥ 80% no mês.** | Mede o percentual de ordens de serviço encerradas com status `CONCLUIDA` em relação ao total de ordens abertas no período (status `PENDENTE`, `AGENDADA`, `EM_ANDAMENTO`, `CONCLUIDA`, `REPROVADA` ou `CANCELADA`), considerando `data_identificacao` no intervalo analisado. | Tabela `manutencoes` (`status`, `data_identificacao`, `data_realizada`) | `(nº de manutenções com status = 'CONCLUIDA' no período / nº total de manutenções abertas no período) × 100` |
| Índice de aderência à manutenção preventiva | Antecipar revisões e evitar quebras corretivas por falta de preventiva. **Meta: ≥ 75%.** | Mede o percentual de veículos ativos que **não** possuem preventiva `AGENDADA` em atraso ou dentro da janela de proximidade (até 45 dias ou 2.000 km, conforme regra do sistema). Utiliza `quilometragem_registro` da preventiva e a quilometragem mais recente em `registros_uso`. | Tabelas `manutencoes` (`tipo_manutencao`, `status`, `quilometragem_registro`, `data_realizada`), `veiculos` e `registros_uso` (`quilometragem_retorno`, `quilometragem_saida`) | `(nº de veículos ativos sem preventiva atrasada ou crítica / nº de veículos com status ≠ 'DESATIVADO') × 100` |

---

### Processo 4 — Gestão de reservas

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de aprovação de solicitações de reserva | Mensurar a eficiência do fluxo decisório do gestor de frota. **Meta: ≥ 85%.** | Mede o percentual de reservas `APROVADA` em relação ao total de solicitações já analisadas (`APROVADA` + `REPROVADA`) em um período, com base em `datahora_solicitacao`. | Tabela `reservas` (`status_reserva`, `datahora_solicitacao`) | `(nº de reservas com status_reserva = 'APROVADA' / nº de reservas com status_reserva ∈ {'APROVADA','REPROVADA'}) × 100` |
| Taxa de conclusão de viagens reservadas | Avaliar se as reservas aprovadas são efetivamente utilizadas e encerradas com registro de uso. **Meta: ≥ 70%.** | Mede o percentual de reservas finalizadas com status `CONCLUIDA` em relação às reservas que chegaram a ser aprovadas ou utilizadas (`APROVADA`, `EM_USO` ou `CONCLUIDA`). Confirma a rastreabilidade entre reserva e jornada do motorista. | Tabelas `reservas` (`status_reserva`) e `registros_uso` (`id_reserva`, `data_retorno`, `checklist_retorno_registrado`) | `(nº de reservas com status_reserva = 'CONCLUIDA' / nº de reservas com status_reserva ∈ {'APROVADA','EM_USO','CONCLUIDA'}) × 100` |

---

### Indicador transversal — Monitoramento de alertas

| **Indicador** | **Objetivos** | **Descrição** | **Fonte de dados** | **Fórmula de cálculo** |
| --- | --- | --- | --- | --- |
| Taxa de resolução de alertas operacionais | Reduzir pendências críticas de documentação, manutenção e frota. **Meta: ≥ 90% em até 7 dias.** | Mede o percentual de alertas marcados como lidos (`lido = true`) em relação ao total de alertas gerados no período, considerando `data_geracao`. Complementa o painel de alertas do gestor. | Tabela `alertas` (`lido`, `data_geracao`, `prioridade`, `id_veiculo`) | `(nº de alertas com lido = true no período / nº total de alertas gerados no período) × 100` |

---

_Obs.: todas as informações para gerar os indicadores estão contempladas no modelo relacional do CtrlFleet. As metas sugeridas podem ser revisadas periodicamente pelo gestor de frota conforme o tamanho e o perfil de uso da frota._
