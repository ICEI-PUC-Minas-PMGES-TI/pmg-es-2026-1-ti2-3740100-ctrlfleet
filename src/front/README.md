# CtrlFleet Frontend

Guia rápido do frontend. Para padrões de pastas/arquitetura e como criar features, veja:

- **`GUIA-DE-ARQUITETURA-E-PADROES.md`**

## Rodando com Docker (dev)

```bash
docker compose -f src/docker-compose.yml up -d
```

### Logs
```bash
docker compose -f src/docker-compose.yml logs -f frontend
docker compose -f src/docker-compose.yml logs -f backend
```

### Restart
```bash
docker compose -f src/docker-compose.yml restart frontend
docker compose -f src/docker-compose.yml restart backend
```
