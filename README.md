# CtrlFleet 🚗
> Sistema Web de Gestão de Frota Pública

Sistema web desenvolvido para centralizar e automatizar a gestão de frotas de veículos em órgãos públicos, substituindo métodos manuais e planilhas por uma solução informatizada. O projeto visa resolver problemas como falta de controle de manutenções, uso não autorizado de veículos, dificuldades em auditorias e ausência de rastreabilidade de quilometragem e consumo de combustível.
A plataforma contempla cadastro e gestão de veículos (dados técnicos, documentação e status operacional), reservas, registro de uso, checklists, controle de manutenções preventivas e corretivas com alertas, auditoria e relatórios gerenciais. O controle de abastecimento possui base de dados inicial, mas ainda não possui fluxo completo de interface e API dedicado. O sistema é destinado a gestores de frota, motoristas, solicitantes e administradores.

## 👥 Integrantes

* Alexia Fernanda Alves de Andrade
* Guilherme Augusto Martins de Carvalho
* Ítalo Eduardo Carneiro da Silva
* João Victor Vial Leite Soares
* Lucas Maia Marques Pinheiro
* Rafael Galileu Thales Oliveira

## 👨‍🏫 Corpo Docente

* Lucca Soares de Paiva Lacerda
* Michelle Hanne Soares de Andrade
* Luiz Carlos da Silva


## 📂 Estrutura de Pastas do Projeto

Abaixo está descrita a arquitetura macro de diretórios do repositório, destacando a separação das responsabilidades de documentação, ecossistema do back-end e interface do front-end:

```text
PMG-ES-2026-1-TI2-3740100-CTRLFLEET/
├── docs/                                 # Documentação de Processos (Markdown)
│   ├── images/                           # Imagens e Diagramas BPMN/DER/UML
│   ├── presentations/                    # Slides e materiais de apresentação
│   └── video/                            # Vídeos de demonstração do sistema
├── src/                                  # Código-Fonte do Ecossistema
│   ├── back/                             # Back-end (Java 21 / Spring Boot)
│   │   ├── .mvn/                         # Wrapper do Maven
│   │   └── src/
│   │       ├── main/
│   │       │   ├── java/com/ctrlfleet/api/
│   │       │   │   ├── config/           # Beans e configurações gerais
│   │       │   │   ├── controller/       # Endpoints REST da API
│   │       │   │   ├── domain/           # Entidades JPA (Banco de Dados)
│   │       │   │   ├── dto/              # Objetos de transferência (Requests/Responses)
│   │       │   │   ├── exception/        # Tratamento de erros global
│   │       │   │   ├── repository/       # Repositórios Spring Data JPA
│   │       │   │   ├── scheduler/        # Tarefas agendadas e alertas automáticos
│   │       │   │   ├── security/         # Configurações de filtros JWT e segurança
│   │       │   │   ├── service/          # Regras de negócio da aplicação
│   │       │   │   └── util/             # Utilitários e helpers
│   │       │   └── resources/            # Propriedades da aplicação e scripts SQL
│   │       └── test/                     # Testes automatizados da API
│   └── front/                            # Front-end (React.js / Vite)
│       ├── public/                       # Ativos estáticos públicos (Imagens, Logos)
│       └── src/
│           ├── components/               # Componentes divididos por contextos de uso
│           │   ├── admin/                # Telas do Administrador do sistema
│           │   ├── auth/                 # Login e controle de sessão
│           │   ├── common/               # Componentes reutilizáveis (Botões, Inputs)
│           │   ├── fleet/                # Telas de Gestão de Frota
│           │   ├── gestor/               # Funcionalidades exclusivas do Gestor
│           │   ├── layout/               # Estrutura de navegação (Sidebar, Navbar)
│           │   ├── maintenance/          # Telas de Ordem de Serviço e Oficinas
│           │   ├── motorista/            # Interface simplificada do Motorista
│           │   └── solicitante/          # Interface de pedidos do Solicitante
│           ├── data/                     # Dados estáticos de configuração
│           ├── hooks/                    # Custom Hooks do React
│           ├── services/                 # Integração e requisições HTTP (Axios)
│           ├── styles/                   # Estilizações globais e temas
│           └── utils/                    # Funções utilitárias de front-end
```

## 📦 Instruções de Utilização e Instalação

Requisitos principais:

* Docker e Docker Compose para executar a stack completa.
* Node.js 20+ para rodar comandos do front-end localmente.
* Java 21 para compilar/testar o back-end fora do Docker.

### 🐳 Execução via Docker
Para subir todos os serviços (Banco de dados PostgreSQL, Back-end Spring Boot e Front-end React) de maneira automática e orquestrada, execute o seguinte comando a partir da raiz do projeto:

```bash
docker compose -f src/docker-compose.yml up -d
```

### Serviços locais:

* Front-end: http://localhost:5173
* Back-end: http://localhost:8080
* PgAdmin: http://localhost:5050

### Comandos de verificação:

```bash
cd src/front
npm run lint
npm run build

cd ../back
./mvnw test
```

### 🔑Usuários de demonstração disponíveis na carga inicial:

* Administrador: ana.costa@ctrlfleet.gov.br
* Gestor de frota: joao.duarte@ctrlfleet.gov.br
* Motorista: patricia.melo@ctrlfleet.gov.br
* Solicitante: fernando.tavares@ctrlfleet.gov.br

Senha padrão: `123456`

## ⏳ Histórico de Versões

### 0.1.0 — Sprint 1 – Planejamento e Modelagem
* **CHANGE:** Criação do backlog do produto, documentação técnica inicial e modelagem BPMN dos 4 processos principais da frota.

### 0.1.1 — Refinamento Documental
* **CHANGE:** Atualização das documentações e ajustes finos nos diagramas de processos. Código-fonte permaneceu inalterado.

### 0.2.0 — Sprint 2 – Gestão de Frotas (Base)
* **ADD:** Implementação do processo de Gestão de Frotas (Cadastro detalhado de veículos e monitoramento de documentos).
* **MIGRATION:** Estruturação inicial do ecossistema e componentes React (Front-end) integrado ao Vite.

### 0.3.0 — Sprint 3 – Gestão de Pessoas e Acessos
* **ADD:** Desenvolvimento do processo de Gestão de Pessoas (Cadastro de motoristas e controle de usuários solicitantes).
* **ALTER:** Ajustes visuais de usabilidade nas tabelas e formulários.
* **UPDATE:** Integração contínua e comunicação das primeiras telas com a API do Back-end.
* **TEST:** Protótipo inicial do fluxo de autenticação e validação de rotas no cliente.

### 0.4.0 — Sprint 4 – Gestão de Reservas
* **ADD:** Lógica de negócio do Processo de Reserva de veículos (Validação de disponibilidade no período).
* **ADD:** Filtros avançados na tela de frota por status operacional e secretaria responsável.
* **UPDATE:** Transição contínua das telas de solicitação e aprovação para componentes funcionais em React.
* **SETUP:** Configuração inicial de contêineres individuais no ambiente via Dockerfile.

### 0.5.0 — Sprint 5 – Gestão de Manutenção e Segurança
* **ADD:** Implementação do processo de Gestão de Manutenção (Abertura de ordens de serviço, preventivas e corretivas).
* **UPDATE:** Criação de rotinas agendadas (*Schedulers*) para checagem automática e alertas de vencimento de CNH e IPVA.
* **ADD:** Nova lógica de controle de acesso rígido e Login integrado ao banco PostgreSQL utilizando Spring Security e tokens JWT.

### 0.6.0 — Sprint 6 – Relatórios e Dashboards
* **ADD:** Desenvolvimento do módulo de relatórios gerenciais e dashboards analíticos para monitoramento de custos e desempenho da frota.
* **UPDATE:** Integração contínua de todas as telas de processos ao ecossistema unificado em React.
* **FIX:** Correções de permissões de endpoints e regras de navegação por perfil de usuário.

### 0.7.0 — Sprint 7 – Finalização e Entrega do Sistema
* **SETUP:** Configuração final da orquestração do ambiente completo (Back, Front, Banco e PgAdmin) utilizando Docker Compose para a banca.
* **SEC:** Ajustes de segurança nas requisições, tratamento global de exceções e proteção contra vulnerabilidades.
* **QUALITY:** Homologação final do sistema com massa de dados de teste, correções rigorosas de Lint (Front) e validação dos builds de produção.