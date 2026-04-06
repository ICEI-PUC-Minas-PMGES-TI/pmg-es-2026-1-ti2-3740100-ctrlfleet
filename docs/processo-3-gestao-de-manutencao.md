### 3.3.3 Processo 3 – Gestão de Manutenção

O processo de gestão de manutenção representa uma das principais lacunas nos controles manuais atualmente adotados pelas organizações. Na situação atual, o acompanhamento de manutenções preventivas e corretivas é frequentemente realizado de forma descentralizada, dependendo de planilhas isoladas, anotações informais ou da própria memória dos motoristas. Isso favorece a ocorrência de quebras inesperadas, o aumento significativo dos custos operacionais, riscos à segurança dos condutores e a ausência de rastreabilidade sobre o histórico de serviços e peças substituídas em cada veículo.

A principal oportunidade de melhoria consiste em digitalizar e automatizar o ciclo de acompanhamento e registro dos reparos da frota. O sistema monitorará a quilometragem e o tempo de uso de cada veículo, gerando alertas automáticos para as manutenções preventivas e eliminando a dependência de verificações manuais. No caso das manutenções corretivas, os relatos de falhas poderão ser registrados de forma padronizada. Cada ordem de serviço deverá ser avaliada e aprovada pelo gestor de frota antes da execução na oficina. Após a conclusão, os dados de custos e o tempo de inatividade alimentarão diretamente o módulo de histórico do veículo e os relatórios de despesas, garantindo rastreabilidade completa sem retrabalho.

O modelo BPMN do processo encontra-se representado a seguir:

![Exemplo de um Modelo BPMN do PROCESSO 3](images/gestao_de_manutencao_bpmn.png "Modelo BPMN do Processo 3.")


#### Detalhamento das atividades

_Descreva aqui cada uma das propriedades das atividades do processo 3. 
Devem estar relacionadas com o modelo de processo apresentado anteriormente._

_Os tipos de dados a serem utilizados são:_

_* **Área de texto** - campo texto de múltiplas linhas_

_* **Caixa de texto** - campo texto de uma linha_

_* **Número** - campo numérico_

_* **Data** - campo do tipo data (dd-mm-aaaa)_

_* **Hora** - campo do tipo hora (hh:mm:ss)_

_* **Data e Hora** - campo do tipo data e hora (dd-mm-aaaa, hh:mm:ss)_

_* **Imagem** - campo contendo uma imagem_

_* **Seleção única** - campo com várias opções de valores que são mutuamente exclusivas (tradicional radio button ou combobox)_

_* **Seleção múltipla** - campo com várias opções que podem ser selecionadas mutuamente (tradicional checkbox ou listbox)_

_* **Arquivo** - campo de upload de documento_

_* **Link** - campo que armazena uma URL_

_* **Tabela** - campo formado por uma matriz de valores_

**Nome da atividade 1**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| [Nome do campo] | [tipo de dados]  |                |                   |
| ***Exemplo:***  |                  |                |                   |
| login           | Caixa de Texto   | formato de e-mail |                |
| senha           | Caixa de Texto   | mínimo de 8 caracteres |           |

| **Comandos**         |  **Destino**                   | **Tipo** |
| ---                  | ---                            | ---               |
| [Nome do botão/link] | Atividade/processo de destino  | (default/cancel  ) |
| ***Exemplo:***       |                                |                   |
| entrar               | Fim do Processo 1              | default           |
| cadastrar            | Início do proceso de cadastro  |                   |


**Nome da atividade 2**

| **Campo**       | **Tipo**         | **Restrições** | **Valor default** |
| ---             | ---              | ---            | ---               |
| [Nome do campo] | [tipo de dados]  |                |                   |
|                 |                  |                |                   |

| **Comandos**         |  **Destino**                   | **Tipo**          |
| ---                  | ---                            | ---               |
| [Nome do botão/link] | Atividade/processo de destino  | (default/cancel/  ) |
|                      |                                |                   |
