-- =====================================================================
--  CtrlFleet — Carga inicial de dados mockados
-- ---------------------------------------------------------------------
--  • Estrutura baseada no diagrama ER do projeto.
--  • Idempotente: todas as inserções usam ON CONFLICT DO NOTHING,
--    portanto reexecuções não duplicam registros.
--  • Algumas tabelas/entidades referenciadas aqui ainda não existem no
--    código Java. O application.properties está configurado com
--    spring.sql.init.continue-on-error=true, então os INSERTs cujas
--    tabelas ainda não foram criadas pelo Hibernate são simplesmente
--    ignorados sem derrubar a aplicação. À medida que as entidades forem
--    sendo adicionadas, os respectivos blocos passam a popular o banco.
-- =====================================================================


-- =====================================================================
-- 1. USUARIOS
--   Entidade Usuario.java: coluna `role` = enum PapelUsuario (STRING).
--   Dados de CNH ficam na tabela motorista (composição 1:1).
--   A senha "$2a$10$N9qo8uLOickgx2..." é o hash BCrypt de "123456"
--   (somente para mocks/dev — nunca usar em produção).
-- =====================================================================
-- Em bancos antigos a coluna `departamento` ainda pode existir (ddl-auto=update
-- não dropa colunas removidas do entity). Como o conceito foi removido, dropamos
-- aqui em definitivo. `IF EXISTS` mantém o comando idempotente / seguro em
-- bancos novos onde a coluna nunca foi criada.
ALTER TABLE usuarios DROP COLUMN IF EXISTS departamento;

INSERT INTO usuarios (id, nome, email, senha, matricula, cargo, data_admissao, tipo_cadastro, perfil_acesso, role, data_desligamento, status) VALUES
(1,  'Ana Costa',         'ana.costa@ctrlfleet.gov.br',         '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0001', 'Coordenadora Administrativa', '2018-03-12', 'usuario',         'Administrador',   'ROLE_ADMINISTRADOR', NULL,         'ATIVO'),
(2,  'João Duarte',       'joao.duarte@ctrlfleet.gov.br',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0002', 'Gestor de Frota',             '2019-06-20', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  NULL,         'ATIVO'),
(3,  'Marina Silva',      'marina.silva@ctrlfleet.gov.br',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0003', 'Assistente Administrativa',   '2024-02-01', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'PENDENTE'),
(4,  'Carlos Rocha',      'carlos.rocha@ctrlfleet.gov.br',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0004', 'Motorista Pleno',             '2020-09-15', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'BLOQUEADO'),
(5,  'Patrícia Melo',     'patricia.melo@ctrlfleet.gov.br',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0005', 'Motorista Sênior',            '2017-11-04', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'ATIVO'),
(6,  'Leandro Sousa',     'leandro.sousa@ctrlfleet.gov.br',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0006', 'Motorista Pleno',             '2021-01-22', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'ATIVO'),
(7,  'Beatriz Lima',      'beatriz.lima@ctrlfleet.gov.br',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0007', 'Gestora de Frota',            '2016-04-18', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  '2025-12-30', 'INATIVO'),
(8,  'Rafael Menezes',    'rafael.menezes@ctrlfleet.gov.br',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0008', 'Motorista Júnior',            '2025-08-05', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'PENDENTE'),
(9,  'Lúcia Albuquerque', 'lucia.albuquerque@ctrlfleet.gov.br', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0009', 'Gestora de Frota',            '2022-07-19', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  NULL,         'ATIVO'),
(10, 'Fernando Tavares',  'fernando.tavares@ctrlfleet.gov.br',  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0010', 'Servidor Público',            '2023-03-08', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(11, 'Juliana Martins',   'juliana.martins@ctrlfleet.gov.br',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0011', 'Servidora Pública',           '2019-10-14', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(12, 'Roberto Alves',     'roberto.alves@ctrlfleet.gov.br',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0012', 'Auditor de Sistemas',         '2015-02-26', 'usuario',         'Administrador',   'ROLE_ADMINISTRADOR', NULL,         'ATIVO'),
(13, 'Camila Reis',       'camila.reis@ctrlfleet.gov.br',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0013', 'Servidora Pública',           '2021-05-17', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(14, 'Eduardo Pereira',   'eduardo.pereira@ctrlfleet.gov.br',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0014', 'Servidor Público',            '2020-08-23', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(15, 'Tatiane Cardoso',   'tatiane.cardoso@ctrlfleet.gov.br',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'MAT-0015', 'Servidora Pública',           '2024-11-04', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO')
ON CONFLICT DO NOTHING;

-- Avança a sequence do IDENTITY para evitar colisão de PK ao criar novos usuários via POST.
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 0));


-- =====================================================================
-- 1.1 BACKFILL legado — preenche `role` a partir de usuario_roles (antes
--     de remover as tabelas), apenas onde `role` ainda é nulo.
-- =====================================================================
UPDATE usuarios u
SET
  role = COALESCE(u.role, sub.role_nome),
  perfil_acesso = COALESCE(
    u.perfil_acesso,
    CASE sub.role_nome
      WHEN 'ROLE_ADMINISTRADOR' THEN 'Administrador'
      WHEN 'ROLE_GESTOR_FROTA'  THEN 'Gestor de Frota'
      WHEN 'ROLE_MOTORISTA'     THEN 'Motorista'
      WHEN 'ROLE_SOLICITANTE'   THEN 'Solicitante'
    END
  ),
  status = COALESCE(u.status, 'ATIVO')
FROM (
  SELECT ur.usuario_id, MIN(r.nome) AS role_nome
  FROM usuario_roles ur
  JOIN roles r ON r.id = ur.role_id
  GROUP BY ur.usuario_id
) AS sub
WHERE u.id = sub.usuario_id
  AND (u.role IS NULL OR u.perfil_acesso IS NULL OR u.status IS NULL);


-- =====================================================================
-- 1.2 MOTORISTA (composição com usuario) — migra CNH de colunas antigas
--     em `usuarios` quando ainda existirem (erro ignorado em bancos novos).
-- =====================================================================
INSERT INTO motorista (usuario_id, numero_cnh, validade_cnh)
SELECT u.id, u.numero_cnh, u.validade_cnh
FROM usuarios u
WHERE u.tipo_cadastro = 'motorista'
  AND u.numero_cnh IS NOT NULL
ON CONFLICT (usuario_id) DO NOTHING;

INSERT INTO motorista (usuario_id, numero_cnh, validade_cnh) VALUES
(4, '03124567890', '2027-11-18'),
(5, '04567891234', '2028-08-09'),
(6, '05891234765', '2029-02-21'),
(8, '06234587190', '2026-12-05')
ON CONFLICT (usuario_id) DO NOTHING;


-- =====================================================================
-- 1.3 Remove tabelas de roles em N:N e colunas de CNH em `usuarios`.
-- =====================================================================
DROP TABLE IF EXISTS usuario_roles;
DROP TABLE IF EXISTS roles;
ALTER TABLE usuarios DROP COLUMN IF EXISTS numero_cnh;
ALTER TABLE usuarios DROP COLUMN IF EXISTS validade_cnh;


-- =====================================================================
-- 1.4 NORMALIZAÇÃO DE MATRÍCULAS
--   Padroniza todas as matrículas no formato MAT-XXXX (zero-padded em
--   4 dígitos a partir do id do usuário). Usuários antigos que tinham
--   prefixos como SOL-0003 / MOT-0004 / ADM-0001 / GES-0002 passam a
--   seguir o mesmo padrão dos novos. Idempotente: linhas já no formato
--   MAT-XXXX não sofrem alteração efetiva.
-- =====================================================================
UPDATE usuarios SET matricula = 'MAT-' || LPAD(id::text, 4, '0');


-- =====================================================================
-- 2. MOTORISTAS
-- =====================================================================
INSERT INTO motoristas (id_motorista, cpf, cnh_numero, cnh_categoria, cnh_vencimento, status_cnh) VALUES
(1, '456.789.012-43', '03124567890', 'D',  '2027-11-18', 'VALIDA'),
(2, '612.443.981-02', '04567891234', 'D',  '2028-08-09', 'VALIDA'),
(3, '703.554.192-14', '05891234765', 'D',  '2029-02-21', 'VALIDA'),
(4, '871.234.665-09', '06234587190', 'B',  '2026-12-05', 'VALIDA'),
(5, '224.119.054-88', '07120593428', 'AB', '2025-09-30', 'VENCIDA'),
(6, '358.902.741-22', '08245619073', 'D',  '2030-05-14', 'VALIDA')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 3. VEICULOS
--   Mapeamento de colunas (entidade Veiculo.java / @Table("veiculos")):
--    id (PK, IDENTITY) | placa (UNIQUE) | modelo | marca | ano | status
--   `status` é o enum StatusVeiculo persistido como STRING:
--    DISPONIVEL | EM_USO | MANUTENCAO | DESATIVADO
--   Quando a entidade evoluir (chassi, renavam, quilometragem, combustível,
--   etc.) basta acrescentar as novas colunas no INSERT abaixo.
-- =====================================================================
-- Migração: versões antigas do Hibernate criavam a tabela citada "Veiculos";
-- a entidade usa `veiculos` (minúsculas). Copia dados e remove a tabela legada.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = 'Veiculos'
  ) THEN
    INSERT INTO veiculos (id, placa, modelo, marca, ano, status)
    SELECT v.id, v.placa, v.modelo, v.marca, v.ano, v.status
    FROM "Veiculos" v
    ON CONFLICT (id) DO NOTHING;
    DROP TABLE "Veiculos" CASCADE;
  END IF;
END $$;

INSERT INTO veiculos (id, placa, modelo, marca, ano, status) VALUES
(1,  'ABC1A23', 'Onix',              'Chevrolet',  2022, 'DISPONIVEL'),
(2,  'XYZ5B67', 'HB20',              'Hyundai',    2023, 'DISPONIVEL'),
(3,  'LMN9C12', 'Corsa',             'Chevrolet',  2021, 'DISPONIVEL'),
(4,  'VXY8D01', 'March',             'Nissan',     2023, 'DISPONIVEL'),
(5,  'DEF3E56', 'Prisma',            'Chevrolet',  2020, 'EM_USO'),
(6,  'GHI7F90', 'Gol',               'Volkswagen', 2022, 'EM_USO'),
(7,  'JKL2G45', 'Celta',             'Chevrolet',  2019, 'MANUTENCAO'),
(8,  'OPQ6H89', 'Fit',               'Honda',      2021, 'MANUTENCAO'),
(9,  'RST0I23', 'Palio',             'Fiat',       2015, 'DESATIVADO'),
(10, 'UVW4J56', 'Strada',            'Fiat',       2024, 'DISPONIVEL')
ON CONFLICT DO NOTHING;

-- Avança a sequence do IDENTITY (só se existir; evita erro se pg_get_serial_sequence for NULL).
DO $$
DECLARE
  seq_name text;
  max_id bigint;
  has_rows boolean;
BEGIN
  seq_name := pg_get_serial_sequence('veiculos', 'id');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM veiculos;
    SELECT EXISTS (SELECT 1 FROM veiculos) INTO has_rows;
    IF has_rows THEN
      PERFORM setval(seq_name::regclass, max_id, true);
    ELSE
      PERFORM setval(seq_name::regclass, 1, false);
    END IF;
  END IF;
END $$;


-- =====================================================================
-- 4. TIPO_INSPECAO
-- =====================================================================
INSERT INTO tipo_inspecao (id_tipo_inspecao, nome, descricao) VALUES
(1, 'Saída de viagem', 'Checklist obrigatório antes da retirada do veículo da garagem.'),
(2, 'Retorno de viagem', 'Conferência de itens e estado do veículo após o uso.'),
(3, 'Inspeção mensal', 'Vistoria periódica preventiva da frota.')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 5. ITEM_CHECKLIST
-- =====================================================================
INSERT INTO item_checklist (id_item, id_tipo_inspecao, nome) VALUES
(1,  1, 'Pneus calibrados'),
(2,  1, 'Triângulo, macaco e chave de roda'),
(3,  1, 'Nível de combustível'),
(4,  1, 'Documentação do veículo'),
(5,  1, 'Limpeza interna e externa'),
(6,  2, 'Quilometragem registrada'),
(7,  2, 'Avarias visíveis'),
(8,  2, 'Combustível remanescente'),
(9,  2, 'Itens pessoais retirados'),
(10, 3, 'Óleo do motor'),
(11, 3, 'Sistema de freios'),
(12, 3, 'Iluminação e setas'),
(13, 3, 'Bateria e sistema elétrico')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 6. DOCUMENTACAO
-- =====================================================================
INSERT INTO documentacao (id_documento, id_veiculo, tipo_documento, data_vencimento, valor_pago, status_pagamento) VALUES
(1,  1,  'IPVA',          '2026-04-30', 1450.00, 'PAGO'),
(2,  1,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(3,  1,  'SEGURO',        '2026-12-01', 2380.00, 'PAGO'),
(4,  2,  'IPVA',          '2026-04-30', 1620.00, 'PAGO'),
(5,  2,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(6,  2,  'SEGURO',        '2027-02-10', 2510.00, 'PAGO'),
(7,  3,  'IPVA',          '2026-04-30', 980.00,  'PAGO'),
(8,  3,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PENDENTE'),
(9,  4,  'IPVA',          '2026-04-30', 1740.00, 'PAGO'),
(10, 4,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(11, 5,  'IPVA',          '2026-04-30', 1180.00, 'ATRASADO'),
(12, 5,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(13, 5,  'SEGURO',        '2026-07-22', 2110.00, 'PAGO'),
(14, 6,  'IPVA',          '2026-04-30', 1290.00, 'PAGO'),
(15, 6,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(16, 7,  'IPVA',          '2026-04-30', 720.00,  'PAGO'),
(17, 7,  'LICENCIAMENTO', '2026-09-15', 165.00,  'ATRASADO'),
(18, 8,  'IPVA',          '2026-04-30', 1080.00, 'PAGO'),
(19, 8,  'SEGURO',        '2026-11-08', 2240.00, 'PAGO'),
(20, 9,  'IPVA',          '2026-04-30', 540.00,  'ATRASADO'),
(21, 10, 'IPVA',          '2026-04-30', 1980.00, 'PAGO'),
(22, 10, 'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(23, 10, 'SEGURO',        '2027-04-01', 2890.00, 'PAGO'),
(24, 10, 'DPVAT',         '2026-12-31', 50.00,   'PAGO')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 7. MANUTENCOES
-- =====================================================================
INSERT INTO manutencoes (id_manutencao, id_veiculo, tipo_manutencao, descricao_problema, data_realizada, quilometragem_registro, custo_total, oficina_executor, status) VALUES
(1, 7, 'CORRETIVA',  'Troca da correia dentada e tensores após ruído anormal no motor.',          '2026-04-12', 87850.00, 1840.00, 'Mecânica Central LTDA', 'EM_ANDAMENTO'),
(2, 8, 'CORRETIVA',  'Reparo no sistema de injeção eletrônica.',                                  '2026-04-20', 51120.00, 920.00,  'Auto Center Brasil',    'EM_ANDAMENTO'),
(3, 1, 'PREVENTIVA', 'Revisão de 15.000 km — troca de óleo, filtros e checagem geral.',           '2026-03-04', 14980.00, 480.00,  'Concessionária GM',     'CONCLUIDA'),
(4, 5, 'PREVENTIVA', 'Revisão dos 60.000 km e troca de pastilhas de freio.',                      '2026-02-18', 60050.00, 1320.00, 'Concessionária GM',     'CONCLUIDA'),
(5, 6, 'CORRETIVA',  'Substituição da bateria após falha em partida fria.',                       '2026-03-22', 27500.00, 690.00,  'Baterias Express',      'CONCLUIDA'),
(6, 9, 'CORRETIVA',  'Diagnóstico de falha geral no motor — viabilidade de reparo em análise.',   '2026-01-10', 141900.00,0.00,    'Mecânica Central LTDA', 'CANCELADA'),
(7, 2, 'PREVENTIVA', 'Alinhamento, balanceamento e rodízio de pneus.',                            '2026-04-02', 8100.00,  240.00,  'Pneus & Cia',           'CONCLUIDA'),
(8, 3, 'PREVENTIVA', 'Revisão programada dos 45.000 km.',                                         '2026-04-25', 46900.00, 560.00,  'Concessionária GM',     'AGENDADA')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 8. ALERTAS
-- =====================================================================
INSERT INTO alertas (id_alerta, id_veiculo, prioridade, mensagem, data_geracao, lido) VALUES
(1, 7,  'ALTA',    'Veículo em manutenção há mais de 15 dias.',                  '2026-04-27 09:12:00', false),
(2, 9,  'CRITICA', 'Veículo inativo aguarda decisão sobre baixa patrimonial.',   '2026-04-25 14:30:00', false),
(3, 5,  'MEDIA',   'IPVA com pagamento em atraso.',                              '2026-05-02 08:00:00', false),
(4, 7,  'MEDIA',   'Licenciamento em atraso — necessário regularização urgente.','2026-05-02 08:00:00', true),
(5, 9,  'ALTA',    'IPVA em atraso — risco de bloqueio do veículo.',             '2026-05-02 08:00:00', false),
(6, 3,  'BAIXA',   'Licenciamento próximo ao vencimento (60 dias).',             '2026-05-08 07:30:00', false),
(7, 1,  'BAIXA',   'Próxima revisão preventiva em 1.500 km.',                    '2026-05-09 10:15:00', false),
(8, 6,  'MEDIA',   'Quilometragem mensal acima da média da frota.',              '2026-05-09 11:42:00', true)
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 9. ABASTECIMENTOS
-- =====================================================================
INSERT INTO abastecimentos (id_abastecimento, id_veiculo, id_motorista, data_abastecimento, quantidade_litros, valor_litro, valor_total, quilometragem_odometro) VALUES
(1,  1, 1, '2026-04-10 07:45:00', 38.50, 5.79, 222.92, 15182.00),
(2,  1, 1, '2026-04-18 07:20:00', 32.80, 5.82, 190.90, 15338.00),
(3,  1, 3, '2026-04-25 08:50:00', 41.20, 5.85, 241.02, 15405.00),
(4,  2, 3, '2026-04-05 06:30:00', 35.10, 5.79, 203.23, 32088.00),
(5,  2, 6, '2026-04-22 09:50:00', 33.90, 5.84, 197.98, 32242.00),
(6,  5, 6, '2026-04-02 08:05:00', 45.20, 5.79, 261.71, 47988.00),
(7,  5, 1, '2026-04-15 06:55:00', 39.60, 5.82, 230.47, 48172.00),
(8,  5, 6, '2026-04-28 12:50:00', 42.10, 5.85, 246.29, 48254.00),
(9,  6, 2, '2026-04-12 10:30:00', 36.40, 5.84, 212.58, 27880.00),
(10, 6, 4, '2026-04-26 07:15:00', 38.90, 5.86, 227.95, 28045.00),
(11, 3, 5, '2026-04-08 11:20:00', 30.50, 5.79, 176.60, 46850.00),
(12, 4, 4, '2026-04-14 08:00:00', 25.30, 5.82, 147.25, 5320.00),
(13, 10,2, '2026-04-30 09:40:00', 62.40, 6.18, 385.63, 1180.00),
(14, 8, 5, '2026-04-09 14:10:00', 31.70, 5.79, 183.54, 51080.00),
(15, 6, 6, '2026-05-03 07:50:00', 35.20, 5.86, 206.27, 28095.00)
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 10. MULTAS
-- =====================================================================
INSERT INTO multas (id_multa, id_veiculo, id_motorista, codigo_infracao, valor_multa, data_hora_infracao, local, status_pagamento) VALUES
(1, 5, 6, '7455-1', 195.23, '2026-03-18 14:22:00', 'Av. Brasil, 1240 — Centro',         'PAGO'),
(2, 6, 4, '5169-1', 130.16, '2026-03-25 09:15:00', 'Rua das Acácias, 88 — Bairro Norte','PENDENTE'),
(3, 1, 1, '7366-2', 88.38,  '2026-04-04 17:48:00', 'BR-101 km 320',                     'PAGO'),
(4, 5, 1, '5185-1', 195.23, '2026-04-19 11:05:00', 'Av. Beira Mar, 502',                'RECORRENDO'),
(5, 7, 3, '7048-5', 293.47, '2026-04-22 22:30:00', 'Rua XV de Novembro, 215',           'PENDENTE')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 11. RESERVAS
-- =====================================================================
INSERT INTO reservas (id_reserva, id_usuario, id_veiculo, datahora_solicitacao, datahora_inicio_prevista, datahora_fim_estimada, destino, origem, status_reserva) VALUES
(1, 3,  1, '2026-04-08 16:20:00', '2026-04-10 08:00:00', '2026-04-10 18:00:00', 'Vistoria Regional Norte',         'Garagem Central', 'CONCLUIDA'),
(2, 10, 2, '2026-04-03 11:00:00', '2026-04-05 06:30:00', '2026-04-05 14:30:00', 'Secretaria de Educação',          'Garagem Central', 'CONCLUIDA'),
(3, 11, 5, '2026-03-30 09:40:00', '2026-04-02 08:00:00', '2026-04-02 18:00:00', 'Fiscalização de obras Zona Sul',  'Garagem Central', 'CONCLUIDA'),
(4, 10, 5, '2026-04-13 13:25:00', '2026-04-15 07:00:00', '2026-04-15 12:00:00', 'Entrega de documentos no Fórum',  'Garagem Central', 'CONCLUIDA'),
(5, 3,  6, '2026-05-08 15:10:00', '2026-05-12 08:00:00', '2026-05-12 17:30:00', 'Reunião na Secretaria de Saúde',  'Garagem Central', 'APROVADA'),
(6, 11, 4, '2026-05-09 10:00:00', '2026-05-11 09:00:00', '2026-05-11 16:00:00', 'Visita técnica ao distrito',      'Garagem Central', 'APROVADA'),
(7, 10, 3, '2026-05-09 14:30:00', '2026-05-13 07:30:00', '2026-05-13 18:00:00', 'Auditoria em escola municipal',   'Garagem Central', 'SOLICITADA'),
(8, 3,  10,'2026-05-09 16:45:00', '2026-05-14 06:00:00', '2026-05-14 19:00:00', 'Transporte de equipamentos',      'Garagem Central', 'SOLICITADA')
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 12. REGISTROS_USO
--   id_veiculo / id_motorista são NOT NULL na entidade; alinhar com reservas (id_veiculo)
--   e usuários motoristas existentes (id_motorista).
-- =====================================================================
INSERT INTO registros_uso (id_uso, id_reserva, id_veiculo, id_motorista, data_saida, quilometragem_saida, data_retorno, quilometragem_retorno, observacoes_veiculo) VALUES
(1, 1, 1, 5, '2026-04-10 08:00:00', 15200.00, '2026-04-10 17:30:00', 15340.00, 'Viagem para vistoria na regional norte. Veículo entregue em ordem.'),
(2, 2, 2, 6, '2026-04-05 06:45:00', 32100.00, '2026-04-05 14:00:00', 32250.00, 'Deslocamento à Secretaria de Educação. Sem ocorrências.'),
(3, 3, 5, 4, '2026-04-02 08:15:00', 48000.00, '2026-04-02 17:00:00', 48180.00, 'Fiscalização de obras na zona sul.'),
(4, 4, 5, 6, '2026-04-15 07:00:00', 48180.00, '2026-04-15 11:30:00', 48260.00, 'Entrega de documentos no fórum.'),
(5, 5, 6, 5, '2026-05-12 08:00:00', 28100.00, NULL,                  NULL,     NULL),
(6, 6, 4, 6, '2026-05-11 09:00:00', 5400.00,  NULL,                  NULL,     NULL)
ON CONFLICT DO NOTHING;


-- =====================================================================
-- 13. CARRO_CHECKLIST
-- =====================================================================
INSERT INTO carro_checklist (id_checklist, id_uso, id_item, data_checklist, observacoes) VALUES
(1, 1, 1,  '2026-04-10 07:50:00', 'Calibragem dianteira ajustada na garagem.'),
(2, 1, 3,  '2026-04-10 07:50:00', 'Tanque saiu com 3/4 da capacidade.'),
(3, 1, 6,  '2026-04-10 17:35:00', 'Quilometragem conferida e registrada.'),
(4, 2, 4,  '2026-04-05 06:30:00', 'CRLV em dia, deixado no porta-luvas.'),
(5, 3, 7,  '2026-04-02 17:05:00', 'Pequeno arranhão no para-choque traseiro identificado.'),
(6, 4, 9,  '2026-04-15 11:40:00', 'Veículo entregue limpo e sem itens pessoais.'),
(7, 5, 1,  '2026-05-12 07:55:00', 'Pneus calibrados antes da saída.'),
(8, 5, 3,  '2026-05-12 07:55:00', 'Tanque cheio.'),
(9, 6, 5,  '2026-05-11 08:50:00', 'Higienização interna realizada.')
ON CONFLICT DO NOTHING;
