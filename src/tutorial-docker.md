### Pré-requsito
Instalar o docker em sua maquina via https://docs.docker.com/desktop/setup/install/windows-install/

### PostgreSQL

* **Host:** `localhost`
* **Porta:** `5432`
* **Database:** `ctrl_fleet`
* **Usuário:** `admin`
* **Senha:** `admin`

### pgAdmin (interface web)
Ambiente para gerenciar o banco via web

* **URL:** http://localhost:5050
* **Email:** `admin@admin.com`
* **Senha:** `admin`

---

## 🚀 Como rodar o ambiente

### 1. Subir os containers

```bash
docker compose up -d
```

---

### 2. Parar os containers

```bash
docker compose down
```

---

### 3. Parar e remover tudo (incluindo dados)

```bash
docker compose down -v
```

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

* Name: `ctrl-fleet-db`

**Connection**

* Host: `postgres`
* Port: `5432`
* Username: `admin`
* Password: `admin`

---

## Persistência de dados

Os dados do banco são armazenados em um volume Docker:

```
postgres_data
```

Isso significa que:

* Os dados **não são perdidos** ao parar os containers
* Só são apagados se usar: `docker compose down -v`

---

## Problemas comuns

### Porta 5432 já em uso

Altere no `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"
```

---

### Não consegue conectar no banco

* Verifique se usou `postgres` como host (não `localhost`)
* Confirme se os containers estão rodando:

```bash
docker ps
```
