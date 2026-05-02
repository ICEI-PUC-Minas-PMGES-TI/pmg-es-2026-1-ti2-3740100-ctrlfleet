# CtrlFleet — Guia de Arquitetura e Padrões

Este documento define **como criar novas features** no frontend seguindo o padrão de **módulos**, e também registra o padrão esperado do **backend (MVC)** para manter o projeto consistente e evitar novos refactors.

## Estrutura do Frontend (React + Vite)

### Pastas principais

- `src/`
  - `App.jsx`: **rotas** (React Router) e “ponto de entrada” do layout.
  - `main.jsx`: bootstrap do React.
  - `index.css`: estilos globais e classes utilitárias do projeto.
  - `components/`
    - `common/`: componentes reutilizáveis por qualquer módulo (ex.: `PageHeader`, `ActionButton`, `SectionCard`).
    - `layout/`: shell/layout da aplicação (ex.: `ManagerLayout`, `Sidebar`).
    - `admin/`: componentes **específicos** do módulo Admin (tabelas, formulários, etc).
    - `gestor/`: componentes **específicos** do módulo Gestor de Frotas (tabelas/filtros/visões de frota).
  - `modules/`
    - `admin/`
      - `pages/`: páginas do Admin (rotas `/admin/*`).
    - `gestor/`
      - `pages/`: páginas do Gestor (rotas “fora de `/admin`”, ex.: `/dashboard`, `/frota`, etc).
      - `context/`: estado/fluxos do módulo (ex.: fluxo de cadastro de veículo).
  - `data/`: mocks/dados estáticos e configurações de navegação (ex.: `adminData.js`, `fleetData.js`).

### Regra de ouro

- **Page** fica em `modules/<modulo>/pages/`
- **Componente do módulo** fica em `components/<modulo>/`
- **Componente reaproveitável** fica em `components/common/`
- **Layout** fica em `components/layout/`
- **Dados estáticos/mocks** ficam em `data/`

Isso reduz acoplamento e evita “import aleatório” entre telas.

## Criando uma nova feature no Front (padrão de módulos)

### 1) Escolha o módulo correto

- Se a feature é de **Administração**, ela entra em `modules/admin`.
- Se é do **Gestor de Frotas**, entra em `modules/gestor`.
- Se for um novo domínio (ex.: `motorista`, `reservas`), crie um novo módulo:
  - `src/modules/<novo-modulo>/pages`
  - `src/components/<novo-modulo>`
  - (opcional) `src/modules/<novo-modulo>/context`

### 2) Crie uma Page

Exemplo de arquivo:

- `src/modules/gestor/pages/MinhaNovaPage.jsx`

Boas práticas:

- Pages **não** devem conter componentes enormes inline: extraia para `components/<modulo>`.
- Pages devem orquestrar: carregar dados, montar layout, e “conectar” componentes.

### 3) Crie componentes do módulo

Exemplos:

- `src/components/gestor/MinhaTabela.jsx`
- `src/components/admin/MeuFormulario.jsx`

Boas práticas:

- Componentes do módulo **não** importam de outros módulos.
- Se algo for útil em mais de um módulo, mova para `components/common`.

### 4) Adicione/ajuste rotas no `App.jsx`

As rotas seguem o desenho atual:

- **Gestor**: rotas fora de `/admin` (ex.: `/dashboard`, `/frota`, `/reservas`, etc).
- **Admin**: rotas dentro de `/admin/*`.

Importante:

- A `Sidebar` é contextual: **em `/admin/*` aparece menu Admin**; fora disso aparece menu do **Gestor**.

### 5) Navegação (menu)

Os itens de navegação ficam em:

- `src/data/adminData.js` → `adminNavigationItems`
- `src/data/fleetData.js` → `fleetNavigationItems` (menu do Gestor de Frotas)

Para adicionar um item no menu:

- Inclua o item no arquivo de `data/`
- Crie a rota (Page) correspondente no `App.jsx`

### 6) Estado do módulo (Context / Hooks)

Quando um fluxo precisa de estado compartilhado (ex.: cadastro em etapas), use:

- `src/modules/<modulo>/context/*`

Regra:

- Context do módulo deve ser **local ao módulo** (não “global” sem necessidade).

## Como rodar com Docker (modo dev, com auto-reload)

O `docker-compose.yml` fica em `src/docker-compose.yml` e está configurado para:

- **Frontend**: Vite dev server com hot reload
- **Backend**: `mvn spring-boot:run` (desenvolvimento)
- **Postgres** e **PgAdmin**

### Subir tudo

Na raiz do repositório:

```bash
docker compose -f src/docker-compose.yml up -d
```

### Ver logs

```bash
docker compose -f src/docker-compose.yml logs -f frontend
docker compose -f src/docker-compose.yml logs -f backend
```

### Reiniciar um serviço

```bash
docker compose -f src/docker-compose.yml restart frontend
docker compose -f src/docker-compose.yml restart backend
```

### Rebuild (quando realmente precisar)

Com o compose atual, **mudanças de código não exigem rebuild**.
Em geral, só reconstrua/recrie quando mudar infraestrutura/ambiente. Para “resetar tudo”:

```bash
docker compose -f src/docker-compose.yml down
docker compose -f src/docker-compose.yml up -d
```

## Backend — Padrão MVC (como o time deve organizar)

Hoje o backend está simples e ainda não está totalmente separado por camadas. **A regra daqui pra frente** é: implementar features novas (e refatorar aos poucos o legado) seguindo este padrão.

### Estrutura recomendada de pacotes (Java / Spring)

Use como base `com.ctrlfleet` (ou mantenha `com.ctrlfleet.api` e crie subpacotes abaixo).

Sugestão:

- `com.ctrlfleet.<dominio>.controller`
  - recebe HTTP, valida request, chama service, devolve response
- `com.ctrlfleet.<dominio>.service`
  - regras de negócio, transações, orquestração
- `com.ctrlfleet.<dominio>.repository`
  - interfaces do Spring Data JPA (`JpaRepository`)
- `com.ctrlfleet.<dominio>.model`
  - entidades JPA (`@Entity`) + enums do domínio
- `com.ctrlfleet.<dominio>.dto`
  - objetos de entrada/saída (request/response), sem JPA
- `com.ctrlfleet.<dominio>.mapper` (opcional)
  - conversões entre `model` ⇄ `dto`
- `com.ctrlfleet.config`
  - configurações (Security, CORS, Swagger, etc)
- `com.ctrlfleet.exception`
  - exceptions + handler global (`@ControllerAdvice`)

Onde `<dominio>` pode ser: `veiculo`, `usuario`, `reserva`, etc.

### O que vai em cada camada (resumo)

- **Model** (`model/`)
  - representa o domínio e o schema do banco (JPA)
  - não deve carregar lógica de controller nem “montar JSON”
- **DTO** (`dto/`)
  - entrada (`CreateXRequest`, `UpdateXRequest`) e saída (`XResponse`)
  - evita vazar entidade JPA na API
- **Repository** (`repository/`)
  - consultas ao banco (JPA)
  - regra: repository não contém regra de negócio
- **Service** (`service/`)
  - regra de negócio (validações, cálculos, fluxos)
  - chamada de `repository` + controle transacional quando necessário
- **Controller** (`controller/`)
  - define endpoints (`@RestController`)
  - traduz HTTP ⇄ Service ⇄ DTO

### Como criar uma feature nova no backend (passo a passo)

Exemplo: criar CRUD de “Veículo”.

1) **Model**
   - `model/Veiculo.java` (`@Entity`)
   - `model/StatusVeiculo.java` (`enum`)

2) **DTOs**
   - `dto/VeiculoCreateRequest.java`
   - `dto/VeiculoUpdateRequest.java`
   - `dto/VeiculoResponse.java`

3) **Repository**
   - `repository/VeiculoRepository.java extends JpaRepository<Veiculo, Long>`
   - métodos de busca (ex.: `Optional<Veiculo> findByPlaca(String placa)`)

4) **Service**
   - `service/VeiculoService.java`
   - implementa: criar, listar, buscar por id, atualizar, remover
   - valida regras (ex.: placa única, status permitido, etc)

5) **Controller**
   - `controller/VeiculoController.java`
   - endpoints típicos:
     - `POST /api/veiculos`
     - `GET /api/veiculos`
     - `GET /api/veiculos/{id}`
     - `PUT /api/veiculos/{id}`
     - `DELETE /api/veiculos/{id}`

6) **Tratamento de erro**
   - exceptions (ex.: `NotFoundException`, `BusinessException`)
   - handler global em `exception/ApiExceptionHandler`

### Regras para evitar “bagunça”

- **Não** criar controller chamando repository direto (sempre passa por service).
- **Não** retornar `@Entity` diretamente na API (use DTO).
- **Não** misturar tudo em um pacote único (`api/`) quando o projeto crescer.
- **Cada domínio** tem seu conjunto (controller/service/repository/model/dto).

