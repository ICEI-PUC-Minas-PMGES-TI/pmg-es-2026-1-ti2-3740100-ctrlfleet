# CtrlFleet

Sistema web desenvolvido para centralizar e automatizar a gestão de frotas de veículos em órgãos públicos, substituindo métodos manuais e planilhas por uma solução informatizada. O projeto visa resolver problemas como falta de controle de manutenções, uso não autorizado de veículos, dificuldades em auditorias e ausência de rastreabilidade de quilometragem e consumo de combustível.
A plataforma contempla cadastro e gestão de veículos (dados técnicos, documentação e status operacional), reservas, registro de uso, checklists, controle de manutenções preventivas e corretivas com alertas, auditoria e relatórios gerenciais. O controle de abastecimento possui base de dados inicial, mas ainda não possui fluxo completo de interface e API dedicado. O sistema é destinado a gestores de frota, motoristas, solicitantes e administradores.

## Integrantes

* Alexia Fernanda Alves de Andrade
* Guilherme Augusto Martins de Carvalho
* Ítalo Eduardo Carneiro da Silva
* João Victor Vial Leite Soares
* Lucas Maia Marques Pinheiro
* Rafael Galileu Thales Oliveira

## Professor

* Lucca Soares de Paiva Lacerda
* Michelle Hanne Soares de Andrade
* Luiz Carlos da Silva

## Instruções de utilização

Requisitos principais:

* Docker e Docker Compose para executar a stack completa.
* Node.js 20+ para rodar comandos do front-end localmente.
* Java 21 para compilar/testar o back-end fora do Docker.

Execução com Docker:

```bash
docker compose -f src/docker-compose.yml up -d
```

Serviços locais:

* Front-end: http://localhost:5173
* Back-end: http://localhost:8080
* PgAdmin: http://localhost:5050

Comandos de verificação:

```bash
cd src/front
npm run lint
npm run build

cd ../back
./mvnw test
```

Usuários de demonstração disponíveis na carga inicial:

* Administrador: ana.costa@ctrlfleet.gov.br
* Gestor de frota: joao.duarte@ctrlfleet.gov.br
* Motorista: patricia.melo@ctrlfleet.gov.br
* Solicitante: fernando.tavares@ctrlfleet.gov.br

Senha padrão: `123456`

## Histórico de versões

* 0.2.0
    * Implementação de relatórios gerenciais, ajustes de permissões de manutenção e correções de lint/build.
* 0.1.1
    * CHANGE: Atualização das documentações. Código permaneceu inalterado.
* 0.1.0
    * Implementação da funcionalidade X pertencente ao processo P.
* 0.0.1
    * Trabalhando na modelagem do processo de negócio.
