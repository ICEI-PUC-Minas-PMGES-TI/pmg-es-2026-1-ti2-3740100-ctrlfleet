# Código do projeto


[Código do front-end](../src/front) -- repositório do código do front-end

[Código do back-end](../src/back)  -- repositório do código do back-end

## Variáveis de ambiente

O backend lê configurações sensíveis via variáveis de ambiente (banco, JWT, e-mail).

### Docker Compose

1. Copie o template: `copy .env.example .env` (Windows) ou `cp .env.example .env` (Linux/macOS)
2. Edite o `src/.env` conforme necessário (ex.: credenciais do Brevo)
3. Suba os containers: `docker compose up -d`

O `.env` não vai para o Git (contém segredos). O `.env.example` documenta as variáveis disponíveis.

Sem `.env`, o Compose usa os valores padrão do `docker-compose.yml` (MailHog para e-mail).

### Backend local (`mvn spring-boot:run`)

O Spring Boot não carrega `.env` automaticamente fora do Docker. Exporte as variáveis do `src/.env` no terminal ou configure na IDE.

