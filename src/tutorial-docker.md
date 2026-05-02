## Pré-requisito

Instalar o Docker Desktop:

- [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/)

> Todos os comandos deste tutorial usam o arquivo `src/docker-compose.yml`.

## PostgreSQL

- **Host:** `localhost`
- **Porta:** `5432`
- **Database:** `ctrl_fleet`
- **Usuário:** `admin`
- **Senha:** `admin`

## pgAdmin (interface web)
Ambiente para gerenciar o banco via web

- **URL:** http://localhost:5050
- **Email:** `admin@admin.com`
- **Senha:** `admin`

---

## Como rodar o ambiente

### 1. Subir os containers

```bash
docker compose -f src/docker-compose.yml up -d
```

---

### 2. Parar os containers

```bash
docker compose -f src/docker-compose.yml down
```

---

### 3. Parar e remover tudo (incluindo dados)

```bash
docker compose -f src/docker-compose.yml down -v
```

---

### 4. Ver logs dos serviços (recomendado)

```bash
docker compose -f src/docker-compose.yml logs -f frontend
docker compose -f src/docker-compose.yml logs -f backend
docker compose -f src/docker-compose.yml logs -f postgres
```

---

### 5. Reiniciar um serviço específico

```bash
docker compose -f src/docker-compose.yml restart frontend
docker compose -f src/docker-compose.yml restart backend
```

---

## Autoatualização do código (sem `--build`)

Este ambiente foi configurado para desenvolvimento:

- `frontend` roda `npm run dev` com hot reload (Vite)
- `backend` roda `mvn spring-boot:run`
- código local é montado via volume (`./front` e `./back`)

Isso significa que, no dia a dia, você **não precisa** rodar `docker compose up --build -d` para cada alteração de código.

Quando reiniciar:

- Mudou só código `.jsx/.js/.java/.css`: normalmente atualiza sozinho
- Mudou dependências (`package.json` ou `pom.xml`): reinicie o serviço correspondente

---

## Como conectar ao banco

### Pelo backend (Spring Boot)

Use as seguintes configurações:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/ctrl_fleet
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=admin
```

**Importante:**
Dentro do Docker, o host **não é `localhost`**, é `postgres` (nome do serviço).

---

### Pelo pgAdmin

1. Acesse: http://localhost:5050
2. Faça login
3. Clique em "Add New Server"

#### Configuração:

**General**

- Name: `ctrl-fleet-db`

**Connection**

- Host: `postgres`
- Port: `5432`
- Username: `admin`
- Password: `admin`

---

## Persistência de dados

Os dados do banco são armazenados em um volume Docker:

```
src_postgres_data
```

Isso significa que:

- Os dados **não são perdidos** ao parar os containers
- Só são apagados se usar: `docker compose -f src/docker-compose.yml down -v`

---

## Problemas comuns

### Porta 5432 já em uso

Altere no `src/docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

---

### Não consegue conectar no banco

- Verifique se usou `postgres` como host (não `localhost`)
- Confirme se os containers estão rodando:

```bash
docker compose -f src/docker-compose.yml ps
```

---

### Frontend não atualiza após salvar

- Verifique se o serviço `frontend` está rodando:

```bash
docker compose -f src/docker-compose.yml logs -f frontend
```

- Se necessário, reinicie:

```bash
docker compose -f src/docker-compose.yml restart frontend
```

---

### Backend não sobe

- Verifique logs do backend:

```bash
docker compose -f src/docker-compose.yml logs -f backend
```
