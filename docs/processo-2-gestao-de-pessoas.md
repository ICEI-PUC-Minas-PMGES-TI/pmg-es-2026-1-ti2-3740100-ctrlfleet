### 3.3.2 Processo 2 – GESTÃO DE PESSOAS

O processo de gestão de pessoas, especialmente no controle de motoristas e usuários solicitantes, ainda apresenta falhas quando realizado de forma manual. Muitas vezes, os dados são armazenados em planilhas ou registros dispersos, o que pode gerar inconsistências, dificuldade no controle de habilitações, risco de alocar motoristas não aptos e falta de controle sobre quem está autorizado a solicitar veículos.

A melhoria está na utilização de um sistema digital que centralize essas informações. Com ele, será possível cadastrar motoristas e usuários de forma padronizada, evitando duplicidade de dados e garantindo maior organização. O sistema também permitirá o controle automático das habilitações (CNH), vinculando cada motorista aos tipos de veículos que pode conduzir e gerando alertas quando a habilitação estiver próxima do vencimento ou vencida, bloqueando sua utilização até a regularização.

Além disso, será possível atualizar habilitações com facilidade, gerenciar a escala de trabalho dos motoristas e garantir que apenas condutores disponíveis e habilitados sejam alocados. Para os usuários solicitantes, o sistema permitirá definir permissões de acesso e controlar quem pode realizar solicitações. Também será possível inativar motoristas e usuários quando necessário, mantendo todo o histórico registrado. Dessa forma, o processo se torna mais organizado, seguro e eficiente, reduzindo erros e melhorando o controle da frota.


![Exemplo de um Modelo BPMN do PROCESSO 2](images/process.png "Modelo BPMN do Processo 2.")


#### Detalhamento das atividades

**Cadastrar Motorista**

| **Campo** | **Tipo**       | **Restrições**     | **Valor default** |
| --------- | -------------- | ------------------ | ----------------- |
| Nome      | Caixa de Texto | Obrigatório        | —                 |
| CPF       | Caixa de Texto | Único; obrigatório | —                 |
| Matrícula | Caixa de Texto | Obrigatório        | —                 |
| Setor     | Seleção única  | Obrigatório        | —                 |
| Contato   | Caixa de Texto | Obrigatório        | —                 |

| **Comandos**     | **Destino**           | **Tipo** |
| ---------------- | --------------------- | -------- |
| Salvar motorista | Registrar Habilitação | default  |
| Cancelar         | Início do Processo    | cancel   |

**Registrar Habilitação (CNH)**

| **Campo**     | **Tipo**       | **Restrições**                 | **Valor default** |
| ------------- | -------------- | ------------------------------ | ----------------- |
| Categoria CNH | Seleção única  | A / B / C / D / E; obrigatório | —                 |
| Número da CNH | Caixa de Texto | Obrigatório                    | —                 |
| Validade      | Data           | Obrigatório                    | —                 |

| **Comandos**       | **Destino**       | **Tipo** |
| ------------------ | ----------------- | -------- |
| Salvar habilitação | Vincular Veículos | default  |

**Vincular Tipos de Veículo (Sistema)**

Executado automaticamente com base na categoria da CNH.

| **Campo**                   | **Tipo**       | **Restrições**              | **Valor default** |
| --------------------------- | -------------- | --------------------------- | ----------------- |
| Tipos de veículo permitidos | Lista          | Definido pela categoria CNH | —                 |
| Status do motorista         | Caixa de Texto | Ativo / Irregular           | Ativo             |

| **Comandos**    | **Destino**                  | **Tipo** |
| --------------- | ---------------------------- | -------- |
| Aplicar vínculo | Monitoramento de Habilitação | default  |

**Monitorar Habilitação (Sistema)**

Executado automaticamente para verificar vencimentos.

| **Campo**             | **Tipo**       | **Restrições**                           | **Valor default** |
| --------------------- | -------------- | ---------------------------------------- | ----------------- |
| Status da CNH         | Caixa de Texto | Válida / Próxima do vencimento / Vencida | —                 |
| Alerta                | Notificação    | Automático                               | —                 |
| Situação do motorista | Caixa de Texto | Bloqueado se vencida                     | —                 |

| **Comandos** | **Destino**           | **Tipo** |
| ------------ | --------------------- | -------- |
| Gerar alerta | Atualizar Habilitação | default  |

**Atualizar Habilitação**

| **Campo**     | **Tipo**      | **Restrições**    | **Valor default** |
| ------------- | ------------- | ----------------- | ----------------- |
| Categoria CNH | Seleção única | A / B / C / D / E | —                 |
| Nova validade | Data          | Obrigatório       | —                 |
| Comprovante   | Upload        | Opcional          | —                 |

| **Comandos**       | **Destino**            | **Tipo** |
| ------------------ | ---------------------- | -------- |
| Salvar atualização | Histórico do Motorista | default  |
| Cancelar           | Início do Processo     | cancel   |

**Gerenciar Escala de Trabalho**

| **Campo**        | **Tipo**           | **Restrições**       | **Valor default** |
| ---------------- | ------------------ | -------------------- | ----------------- |
| Dias de trabalho | Seleção múltipla   | Obrigatório          | —                 |
| Horários         | Intervalo de tempo | Obrigatório          | —                 |
| Disponibilidade  | Caixa de Texto     | Ativo / Indisponível | Ativo             |

| **Comandos**  | **Destino**                   | **Tipo** |
| ------------- | ----------------------------- | -------- |
| Salvar escala | Disponibilidade para Alocação | default  |
| Cancelar      | Início do Processo            | cancel   |

**Inativar Motorista**

| **Campo**          | **Tipo**       | **Restrições**  | **Valor default** |
| ------------------ | -------------- | --------------- | ----------------- |
| Motivo             | Área de Texto  | Obrigatório     | —                 |
| Data de inativação | Data           | Obrigatório     | Data atual        |
| Status final       | Caixa de Texto | Somente leitura | Inativo           |

| **Comandos**         | **Destino**            | **Tipo** |
| -------------------- | ---------------------- | -------- |
| Confirmar inativação | Histórico do Motorista | default  |
| Cancelar             | Início do Processo     | cancel   |

---

**Cadastrar Usuário Solicitante**

| **Campo** | **Tipo**       | **Restrições**     | **Valor default** |
| --------- | -------------- | ------------------ | ----------------- |
| Nome      | Caixa de Texto | Obrigatório        | —                 |
| CPF       | Caixa de Texto | Único; obrigatório | —                 |
| Matrícula | Caixa de Texto | Obrigatório        | —                 |
| Setor     | Seleção única  | Obrigatório        | —                 |
| Contato   | Caixa de Texto | Obrigatório        | —                 |

| **Comandos**   | **Destino**        | **Tipo** |
| -------------- | ------------------ | -------- |
| Salvar usuário | Definir Permissões | default  |
| Cancelar       | Início do Processo | cancel   |

**Definir Permissões**

| **Campo**            | **Tipo**         | **Restrições**       | **Valor default** |
| -------------------- | ---------------- | -------------------- | ----------------- |
| Nível de acesso      | Seleção única    | Definido pelo gestor | —                 |
| Tipos de solicitação | Seleção múltipla | Opcional             | —                 |

| **Comandos**      | **Destino**         | **Tipo** |
| ----------------- | ------------------- | -------- |
| Salvar permissões | Liberação de Acesso | default  |

**Inativar Usuário Solicitante**

| **Campo**          | **Tipo**       | **Restrições**  | **Valor default** |
| ------------------ | -------------- | --------------- | ----------------- |
| Motivo             | Área de Texto  | Obrigatório     | —                 |
| Data de inativação | Data           | Obrigatório     | Data atual        |
| Status final       | Caixa de Texto | Somente leitura | Inativo           |

| **Comandos**         | **Destino**          | **Tipo** |
| -------------------- | -------------------- | -------- |
| Confirmar inativação | Histórico do Usuário | default  |
| Cancelar             | Início do Processo   | cancel   |
