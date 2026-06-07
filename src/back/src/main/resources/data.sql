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
-- 0.1 BACKFILL DE AUDITORIA
--   Versoes anteriores gravavam horarios com o fuso UTC do container.
--   Corrige eventos que ficaram no futuro em relacao ao horario de Brasilia.
-- =====================================================================
UPDATE auditoria_eventos
SET criado_em = criado_em - INTERVAL '3 hours'
WHERE criado_em > ((now() AT TIME ZONE 'America/Sao_Paulo') + INTERVAL '5 minutes');


-- =====================================================================
-- 1. USUARIOS
--   Entidade Usuario.java: coluna `role` = enum PapelUsuario (STRING).
--   Dados de CNH ficam na tabela motorista (composição 1:1).
--   A senha abaixo é o hash BCrypt de "123456" (somente mocks/dev).
-- =====================================================================
-- Em bancos antigos a coluna `departamento` ainda pode existir (ddl-auto=update
-- não dropa colunas removidas do entity). Como o conceito foi removido, dropamos
-- aqui em definitivo. `IF EXISTS` mantém o comando idempotente / seguro em
-- bancos novos onde a coluna nunca foi criada.
ALTER TABLE usuarios DROP COLUMN IF EXISTS departamento;

-- Corrige hashes legados que não correspondiam à senha mock "123456".
UPDATE usuarios
SET senha = '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS'
WHERE senha = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

-- Contas de acesso rápido na tela de login (senha mock: 123456).
-- Idempotente: sobrescreve hashes alterados manualmente ou via cadastro.
UPDATE usuarios
SET
  senha = '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS',
  status = 'ATIVO'
WHERE email IN (
  'ana.costa@ctrlfleet.gov.br',
  'joao.duarte@ctrlfleet.gov.br',
  'patricia.melo@ctrlfleet.gov.br',
  'fernando.tavares@ctrlfleet.gov.br'
);

INSERT INTO usuarios (id, nome, email, senha, matricula, cargo, data_admissao, tipo_cadastro, perfil_acesso, role, data_desligamento, status) VALUES
(1,  'Ana Costa',         'ana.costa@ctrlfleet.gov.br',         '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0001', 'Coordenadora Administrativa', '2018-03-12', 'usuario',         'Administrador',   'ROLE_ADMINISTRADOR', NULL,         'ATIVO'),
(2,  'João Duarte',       'joao.duarte@ctrlfleet.gov.br',       '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0002', 'Gestor de Frota',             '2019-06-20', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  NULL,         'ATIVO'),
(3,  'Marina Silva',      'marina.silva@ctrlfleet.gov.br',      '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0003', 'Assistente Administrativa',   '2024-02-01', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'PENDENTE'),
(4,  'Carlos Rocha',      'carlos.rocha@ctrlfleet.gov.br',      '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0004', 'Motorista Pleno',             '2020-09-15', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'BLOQUEADO'),
(5,  'Patrícia Melo',     'patricia.melo@ctrlfleet.gov.br',     '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0005', 'Motorista Sênior',            '2017-11-04', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'ATIVO'),
(6,  'Leandro Sousa',     'leandro.sousa@ctrlfleet.gov.br',     '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0006', 'Motorista Pleno',             '2021-01-22', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'ATIVO'),
(7,  'Beatriz Lima',      'beatriz.lima@ctrlfleet.gov.br',      '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0007', 'Gestora de Frota',            '2016-04-18', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  '2025-12-30', 'INATIVO'),
(8,  'Rafael Menezes',    'rafael.menezes@ctrlfleet.gov.br',    '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0008', 'Motorista Júnior',            '2025-08-05', 'motorista',       'Motorista',       'ROLE_MOTORISTA',     NULL,         'PENDENTE'),
(9,  'Lúcia Albuquerque', 'lucia.albuquerque@ctrlfleet.gov.br', '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0009', 'Gestora de Frota',            '2022-07-19', 'usuario',         'Gestor de Frota', 'ROLE_GESTOR_FROTA',  NULL,         'ATIVO'),
(10, 'Fernando Tavares',  'fernando.tavares@ctrlfleet.gov.br',  '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0010', 'Servidor Público',            '2023-03-08', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(11, 'Juliana Martins',   'juliana.martins@ctrlfleet.gov.br',   '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0011', 'Servidora Pública',           '2019-10-14', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(12, 'Roberto Alves',     'roberto.alves@ctrlfleet.gov.br',     '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0012', 'Auditor de Sistemas',         '2015-02-26', 'usuario',         'Administrador',   'ROLE_ADMINISTRADOR', NULL,         'ATIVO'),
(13, 'Camila Reis',       'camila.reis@ctrlfleet.gov.br',       '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0013', 'Servidora Pública',           '2021-05-17', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(14, 'Eduardo Pereira',   'eduardo.pereira@ctrlfleet.gov.br',   '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0014', 'Servidor Público',            '2020-08-23', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO'),
(15, 'Tatiane Cardoso',   'tatiane.cardoso@ctrlfleet.gov.br',   '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0015', 'Servidora Pública',           '2024-11-04', 'usuario',         'Solicitante',     'ROLE_SOLICITANTE',   NULL,         'ATIVO')
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

-- Motoristas adicionais para a frota (10 motoristas ativos no painel do solicitante)
INSERT INTO usuarios (id, nome, email, senha, matricula, cargo, data_admissao, tipo_cadastro, perfil_acesso, role, data_desligamento, status) VALUES
(16, 'Marcos Oliveira',     'marcos.oliveira@ctrlfleet.gov.br',     '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0016', 'Motorista Pleno',   '2022-04-11', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(17, 'Renata Freitas',      'renata.freitas@ctrlfleet.gov.br',      '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0017', 'Motorista Pleno',   '2021-08-30', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(18, 'Diego Nascimento',    'diego.nascimento@ctrlfleet.gov.br',    '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0018', 'Motorista Sênior',  '2019-02-14', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(19, 'Camila Rodrigues',    'camila.rodrigues@ctrlfleet.gov.br',    '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0019', 'Motorista Pleno',   '2023-01-09', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(20, 'Thiago Barbosa',      'thiago.barbosa@ctrlfleet.gov.br',      '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0020', 'Motorista Júnior',  '2024-06-17', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(21, 'Aline Correia',       'aline.correia@ctrlfleet.gov.br',       '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0021', 'Motorista Pleno',   '2020-11-25', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO'),
(22, 'Gustavo Pires',       'gustavo.pires@ctrlfleet.gov.br',       '$2a$10$mZeEwcIuS.uTYWHG95418OjTf7NU3CbAuzRNczbten/HjJ6BmF1SS', 'MAT-0022', 'Motorista Sênior',  '2018-07-03', 'motorista', 'Motorista', 'ROLE_MOTORISTA', NULL, 'ATIVO')
ON CONFLICT (id) DO NOTHING;

INSERT INTO motorista (usuario_id, numero_cnh, validade_cnh) VALUES
(16, '07120593429', '2028-03-15'),
(17, '08245619074', '2029-06-20'),
(18, '09356720185', '2030-01-10'),
(19, '10467831296', '2028-11-28'),
(20, '11578942307', '2027-05-07'),
(21, '12689053418', '2029-09-14'),
(22, '13790164529', '2030-12-01')
ON CONFLICT (usuario_id) DO NOTHING;

UPDATE usuarios SET status = 'ATIVO' WHERE id IN (5, 6, 8, 16, 17, 18, 19, 20, 21, 22) AND tipo_cadastro = 'motorista';

SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 0));


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
-- Migração: bancos criados antes do campo `secretaria` precisam receber a coluna
-- antes dos SELECTs/INSERTs da entidade atual.
ALTER TABLE IF EXISTS veiculos ADD COLUMN IF NOT EXISTS secretaria varchar(255);
UPDATE veiculos
SET secretaria = 'Garagem Central'
WHERE secretaria IS NULL OR btrim(secretaria) = '';
ALTER TABLE IF EXISTS veiculos ALTER COLUMN secretaria SET NOT NULL;

ALTER TABLE IF EXISTS veiculos ADD COLUMN IF NOT EXISTS tipo_veiculo varchar(30);
UPDATE veiculos SET tipo_veiculo = 'SEDAN' WHERE tipo_veiculo IS NULL OR btrim(tipo_veiculo) = '';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname = 'Veiculos'
  ) THEN
    INSERT INTO veiculos (id, placa, modelo, marca, ano, status, secretaria)
    SELECT v.id, v.placa, v.modelo, v.marca, v.ano, v.status, 'Garagem Central'
    FROM "Veiculos" v
    ON CONFLICT (id) DO NOTHING;
    DROP TABLE "Veiculos" CASCADE;
  END IF;
END $$;

INSERT INTO veiculos (id, placa, modelo, marca, ano, status, secretaria, tipo_veiculo) VALUES
(1,  'ABC1A23', 'Onix',         'Chevrolet',  2022, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(2,  'XYZ5B67', 'HB20',         'Hyundai',    2023, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(3,  'LMN9C12', 'Corsa',        'Chevrolet',  2021, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(4,  'VXY8D01', 'March',        'Nissan',     2023, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(5,  'DEF3E56', 'Prisma',       'Chevrolet',  2020, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(6,  'GHI7F90', 'Gol',          'Volkswagen', 2022, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(7,  'JKL2G45', 'Celta',        'Chevrolet',  2019, 'MANUTENCAO', 'Garagem Central',               'HATCH'),
(8,  'OPQ6H89', 'Fit',          'Honda',      2021, 'DISPONIVEL', 'Secretaria de Saude',         'HATCH'),
(9,  'RST0I23', 'Palio',        'Fiat',       2015, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(10, 'UVW4J56', 'Strada',       'Fiat',       2024, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE'),
(11, 'RKM1A11', 'Polo',         'Volkswagen', 2023, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(12, 'TBN2B22', 'Argo',         'Fiat',       2022, 'DISPONIVEL', 'Secretaria de Educacao',      'HATCH'),
(13, 'FCH3C33', 'Mobi',         'Fiat',       2021, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(14, 'JLP4D44', 'Kwid',         'Renault',    2023, 'DISPONIVEL', 'Secretaria de Obras',         'HATCH'),
(15, 'MNR5E55', 'Sandero',      'Renault',    2022, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(16, 'QST6F66', 'Ka',           'Ford',       2020, 'DISPONIVEL', 'Secretaria de Meio Ambiente', 'HATCH'),
(17, 'VWX7G77', 'Yaris',        'Toyota',     2024, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(18, 'YZA8H88', 'Etios',        'Toyota',     2019, 'DISPONIVEL', 'Secretaria de Saude',         'HATCH'),
(19, 'BCD9I99', 'Up!',          'Volkswagen', 2021, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(20, 'EFG0J00', 'Picanto',      'Kia',        2022, 'DISPONIVEL', 'Garagem Central',               'HATCH'),
(21, 'HIJ1K11', 'Compass',      'Jeep',       2024, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(22, 'KLM2L22', 'Creta',        'Hyundai',    2023, 'DISPONIVEL', 'Secretaria de Educacao',      'SUV'),
(23, 'NOP3M33', 'Tracker',      'Chevrolet',  2022, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(24, 'QRS4N44', 'T-Cross',      'Volkswagen', 2023, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(25, 'TUV5O55', 'Duster',       'Renault',    2021, 'DISPONIVEL', 'Secretaria de Obras',         'SUV'),
(26, 'WXY6P66', 'Corolla Cross','Toyota',     2024, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(27, 'ZAB7Q77', 'HR-V',         'Honda',      2022, 'DISPONIVEL', 'Secretaria de Saude',         'SUV'),
(28, 'CDE8R88', 'Sportage',     'Kia',        2023, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(29, 'FGH9S99', 'Nivus',        'Volkswagen', 2022, 'DISPONIVEL', 'Garagem Central',               'SUV'),
(30, 'IJK0T10', 'Sprinter',     'Mercedes-Benz',2022,'DISPONIVEL','Garagem Central',               'VAN'),
(31, 'LMN1U21', 'Ducato',       'Fiat',       2021, 'DISPONIVEL', 'Secretaria de Educacao',      'VAN'),
(32, 'OPQ2V32', 'Master',       'Renault',    2023, 'DISPONIVEL', 'Secretaria de Obras',         'VAN'),
(33, 'RST3W43', 'Daily',        'Iveco',      2020, 'DISPONIVEL', 'Garagem Central',               'VAN'),
(34, 'UVW4X54', 'Kombi',        'Volkswagen', 2014, 'MANUTENCAO', 'Garagem Central',               'VAN'),
(35, 'XYZ5Y65', 'Fiorino',      'Fiat',       2022, 'DISPONIVEL', 'Secretaria de Saude',         'VAN'),
(36, 'ABC6Z76', 'Partner',      'Peugeot',    2021, 'DISPONIVEL', 'Garagem Central',               'VAN'),
(37, 'DEF7A87', 'Expert',       'Peugeot',    2023, 'DISPONIVEL', 'Secretaria de Meio Ambiente', 'VAN'),
(38, 'GHI8B98', 'OF-1519',      'Mercedes-Benz',2019,'DISPONIVEL','Secretaria de Educacao',      'ONIBUS'),
(39, 'JKL9C09', 'Volare W9',    'Marcopolo',  2020, 'DISPONIVEL', 'Garagem Central',               'ONIBUS'),
(40, 'MNO0D10', 'Apache U',     'Volkswagen', 2018, 'DISPONIVEL', 'Secretaria de Obras',         'ONIBUS'),
(41, 'PQR1E21', 'Paradiso',     'Marcopolo',  2021, 'DISPONIVEL', 'Garagem Central',               'ONIBUS'),
(42, 'STU2F32', 'Torino',       'Caio',       2022, 'MANUTENCAO', 'Garagem Central',               'ONIBUS'),
(43, 'VWX3G43', 'Millennium',   'Busscar',    2017, 'DESATIVADO', 'Garagem Central',               'ONIBUS'),
(44, 'YZA4H54', 'Corolla',      'Toyota',     2023, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(45, 'BCD5I65', 'Civic',        'Honda',      2022, 'DISPONIVEL', 'Secretaria de Saude',         'SEDAN'),
(46, 'EFG6J76', 'Virtus',       'Volkswagen', 2024, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(47, 'HIJ7K87', 'Cronos',       'Fiat',       2021, 'DISPONIVEL', 'Secretaria de Educacao',      'SEDAN'),
(48, 'KLM8L98', 'Sentra',       'Nissan',     2022, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(49, 'NOP9M09', 'Jetta',        'Volkswagen', 2020, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(50, 'QRS0N10', 'Cruze',        'Chevrolet',  2023, 'DISPONIVEL', 'Secretaria de Obras',         'SEDAN'),
(51, 'TUV1O21', 'Logan',        'Renault',    2019, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(52, 'WXY2P32', 'Voyage',       'Volkswagen', 2021, 'DISPONIVEL', 'Garagem Central',               'SEDAN'),
(53, 'ZAB3Q43', 'Hilux',        'Toyota',     2024, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE'),
(54, 'CDE4R54', 'Ranger',       'Ford',       2023, 'DISPONIVEL', 'Secretaria de Meio Ambiente', 'CAMINHONETE'),
(55, 'FGH5S65', 'S10',          'Chevrolet',  2022, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE'),
(56, 'IJK6T76', 'Amarok',       'Volkswagen', 2021, 'DISPONIVEL', 'Secretaria de Obras',         'CAMINHONETE'),
(57, 'LMN7U87', 'Toro',         'Fiat',       2023, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE'),
(58, 'OPQ8V98', 'Frontier',     'Nissan',     2022, 'DISPONIVEL', 'Secretaria de Educacao',      'CAMINHONETE'),
(59, 'RST9W09', 'L200',         'Mitsubishi', 2020, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE'),
(60, 'UVW0X10', 'Saveiro',      'Volkswagen', 2022, 'DISPONIVEL', 'Garagem Central',               'CAMINHONETE')
ON CONFLICT (id) DO UPDATE SET
  placa = EXCLUDED.placa,
  modelo = EXCLUDED.modelo,
  marca = EXCLUDED.marca,
  ano = EXCLUDED.ano,
  status = EXCLUDED.status,
  secretaria = EXCLUDED.secretaria,
  tipo_veiculo = EXCLUDED.tipo_veiculo;

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

UPDATE veiculos
SET secretaria = 'Garagem Central'
WHERE secretaria IS NULL OR btrim(secretaria) = '';

-- Vínculo motorista ↔ veículo (cada motorista com frota própria espalhada na base)
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS id_motorista bigint;

UPDATE veiculos SET id_motorista = 5  WHERE id BETWEEN 1  AND 6;
UPDATE veiculos SET status = 'DISPONIVEL' WHERE id BETWEEN 1 AND 6 AND id_motorista = 5;

-- Documentação em dia nos veículos da Patrícia (ids 1–6) — status Ativo na UI
UPDATE documentacao SET data_vencimento = '2027-06-30', status_pagamento = 'PAGO' WHERE id_documento = 1;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 2;
UPDATE documentacao SET data_vencimento = '2027-01-15', status_pagamento = 'PAGO' WHERE id_documento = 3;
UPDATE documentacao SET data_vencimento = '2027-03-20', status_pagamento = 'PAGO' WHERE id_documento = 4;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 5;
UPDATE documentacao SET data_vencimento = '2027-02-10', status_pagamento = 'PAGO' WHERE id_documento = 6;
UPDATE documentacao SET data_vencimento = '2027-04-30', status_pagamento = 'PAGO' WHERE id_documento = 7;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 8;
UPDATE documentacao SET data_vencimento = '2027-02-10', status_pagamento = 'PAGO' WHERE id_documento = 9;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 10;
UPDATE documentacao SET data_vencimento = '2027-04-30', status_pagamento = 'PAGO' WHERE id_documento = 11;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 12;
UPDATE documentacao SET data_vencimento = '2027-07-22', status_pagamento = 'PAGO' WHERE id_documento = 13;
UPDATE documentacao SET data_vencimento = '2027-05-01', status_pagamento = 'PAGO' WHERE id_documento = 14;
UPDATE documentacao SET data_vencimento = '2027-09-15', status_pagamento = 'PAGO' WHERE id_documento = 15;
UPDATE veiculos SET id_motorista = 6  WHERE id BETWEEN 7  AND 12;
UPDATE veiculos SET id_motorista = 8  WHERE id BETWEEN 13 AND 18;
UPDATE veiculos SET id_motorista = 16 WHERE id BETWEEN 19 AND 24;
UPDATE veiculos SET id_motorista = 17 WHERE id BETWEEN 25 AND 30;
UPDATE veiculos SET id_motorista = 18 WHERE id BETWEEN 31 AND 36;
UPDATE veiculos SET id_motorista = 19 WHERE id BETWEEN 37 AND 42;
UPDATE veiculos SET id_motorista = 20 WHERE id BETWEEN 43 AND 48;
UPDATE veiculos SET id_motorista = 21 WHERE id BETWEEN 49 AND 54;
UPDATE veiculos SET id_motorista = 22 WHERE id BETWEEN 55 AND 60;


-- =====================================================================
-- 4. TIPO_INSPECAO
-- =====================================================================
ALTER TABLE tipo_inspecao ADD COLUMN IF NOT EXISTS fase varchar(20);
UPDATE tipo_inspecao SET fase = 'MENSAL' WHERE fase IS NULL OR btrim(fase) = '';

INSERT INTO tipo_inspecao (id_tipo_inspecao, nome, descricao, fase) VALUES
(1,  'Saída de viagem (legado)', 'Substituído por tipos Limpeza, Mecânica, Iluminação e Combustível.', 'SAIDA'),
(2,  'Retorno de viagem (legado)', 'Substituído por tipos de retorno abaixo.', 'RETORNO'),
(3,  'Inspeção mensal', 'Vistoria periódica preventiva da frota.', 'MENSAL'),
(4,  'Limpeza', 'Higienização e apresentação do veículo antes da saída.', 'SAIDA'),
(5,  'Mecânica', 'Itens mecânicos e de segurança para a saída.', 'SAIDA'),
(6,  'Iluminação', 'Sistema de iluminação e sinalização.', 'SAIDA'),
(7,  'Combustível', 'Nível de combustível e abastecimento para o trajeto.', 'SAIDA'),
(8,  'Estado do veículo', 'Conferência visual e itens deixados no veículo.', 'RETORNO'),
(9,  'Combustível e entrega', 'Combustível remanescente e condição na devolução.', 'RETORNO')
ON CONFLICT (id_tipo_inspecao) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  fase = EXCLUDED.fase;

UPDATE tipo_inspecao SET fase = 'LEGADO' WHERE id_tipo_inspecao IN (1, 2);
UPDATE tipo_inspecao SET fase = 'SAIDA' WHERE id_tipo_inspecao IN (4, 5, 6, 7);
UPDATE tipo_inspecao SET fase = 'RETORNO' WHERE id_tipo_inspecao IN (8, 9);
UPDATE tipo_inspecao SET fase = 'MENSAL' WHERE id_tipo_inspecao = 3;

-- =====================================================================
-- 5. ITEM_CHECKLIST (itens por tipo de inspeção)
-- =====================================================================
DELETE FROM carro_checklist WHERE id_item IN (SELECT id_item FROM item_checklist WHERE id_tipo_inspecao IN (1, 2));
DELETE FROM item_checklist WHERE id_tipo_inspecao IN (1, 2);

INSERT INTO item_checklist (id_item, id_tipo_inspecao, nome) VALUES
(1,  4, 'Limpeza interna'),
(2,  4, 'Limpeza externa'),
(3,  4, 'Vidros e espelhos limpos'),
(4,  5, 'Pneus calibrados'),
(5,  5, 'Freios e pedal conferidos'),
(6,  5, 'Triângulo, macaco e chave de roda'),
(7,  6, 'Faróis, lanternas e setas'),
(8,  6, 'Luz de freio e ré'),
(9,  7, 'Nível de combustível adequado'),
(10, 8, 'Avarias visíveis'),
(11, 8, 'Itens pessoais retirados'),
(12, 9, 'Combustível remanescente registrado'),
(13, 9, 'Veículo entregue em condições de uso'),
(14, 3, 'Óleo do motor'),
(15, 3, 'Sistema de freios'),
(16, 3, 'Iluminação e setas'),
(17, 3, 'Bateria e sistema elétrico')
ON CONFLICT (id_item) DO UPDATE SET
  id_tipo_inspecao = EXCLUDED.id_tipo_inspecao,
  nome = EXCLUDED.nome;

DELETE FROM item_checklist WHERE nome ILIKE '%documenta%';


-- =====================================================================
-- 6. DOCUMENTACAO
-- =====================================================================
INSERT INTO documentacao (id_documento, id_veiculo, tipo_documento, data_vencimento, valor_pago, status_pagamento) VALUES
(1,  1,  'IPVA',          '2027-06-30', 1450.00, 'PAGO'),
(2,  1,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(3,  1,  'SEGURO',        '2027-01-15', 2380.00, 'PAGO'),
(4,  2,  'IPVA',          '2027-03-20', 1620.00, 'PAGO'),
(5,  2,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(6,  2,  'SEGURO',        '2027-02-10', 2510.00, 'PAGO'),
(7,  3,  'IPVA',          '2027-04-30', 980.00,  'PAGO'),
(8,  3,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(9,  4,  'IPVA',          '2027-02-10', 1740.00, 'PAGO'),
(10, 4,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(11, 5,  'IPVA',          '2027-04-30', 1180.00, 'PAGO'),
(12, 5,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(13, 5,  'SEGURO',        '2027-07-22', 2110.00, 'PAGO'),
(14, 6,  'IPVA',          '2027-05-01', 1290.00, 'PAGO'),
(15, 6,  'LICENCIAMENTO', '2027-09-15', 165.00,  'PAGO'),
(16, 7,  'IPVA',          '2026-04-30', 720.00,  'PAGO'),
(17, 7,  'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(18, 8,  'IPVA',          '2026-04-30', 1080.00, 'PAGO'),
(19, 8,  'SEGURO',        '2026-11-08', 2240.00, 'PAGO'),
(20, 9,  'IPVA',          '2026-04-30', 540.00,  'PAGO'),
(21, 10, 'IPVA',          '2026-04-30', 1980.00, 'PAGO'),
(22, 10, 'LICENCIAMENTO', '2026-09-15', 165.00,  'PAGO'),
(23, 10, 'SEGURO',        '2027-04-01', 2890.00, 'PAGO')
ON CONFLICT (id_documento) DO UPDATE SET
  id_veiculo = EXCLUDED.id_veiculo,
  tipo_documento = EXCLUDED.tipo_documento,
  data_vencimento = EXCLUDED.data_vencimento,
  valor_pago = EXCLUDED.valor_pago,
  status_pagamento = EXCLUDED.status_pagamento;

-- Garante cobertura mínima de documentação para TODA a frota:
-- cada veículo deve ter IPVA, LICENCIAMENTO e SEGURO.
-- Mantém parte dos documentos vencidos/pendentes para cenários de demonstração.
WITH tipos_documento AS (
  SELECT 'IPVA'::varchar AS tipo_documento
  UNION ALL SELECT 'LICENCIAMENTO'::varchar
  UNION ALL SELECT 'SEGURO'::varchar
),
faltantes AS (
  SELECT
    v.id AS id_veiculo,
    t.tipo_documento
  FROM veiculos v
  CROSS JOIN tipos_documento t
  WHERE NOT EXISTS (
    SELECT 1
    FROM documentacao d
    WHERE d.id_veiculo = v.id
      AND UPPER(d.tipo_documento) = t.tipo_documento
  )
),
base AS (
  SELECT COALESCE(MAX(id_documento), 0) AS max_id
  FROM documentacao
),
novos AS (
  SELECT
    (base.max_id + ROW_NUMBER() OVER (ORDER BY f.id_veiculo, f.tipo_documento))::bigint AS id_documento,
    f.id_veiculo,
    f.tipo_documento,
    CASE
      WHEN MOD(f.id_veiculo, 7) = 0 THEN CURRENT_DATE - INTERVAL '45 days'
      WHEN MOD(f.id_veiculo, 4) = 0 THEN CURRENT_DATE + INTERVAL '10 days'
      ELSE CURRENT_DATE + INTERVAL '180 days'
    END::date AS data_vencimento,
    CASE f.tipo_documento
      WHEN 'IPVA' THEN 900 + (f.id_veiculo * 31)
      WHEN 'LICENCIAMENTO' THEN 165
      ELSE 1800 + (f.id_veiculo * 22)
    END::numeric(12, 2) AS valor_pago,
    CASE
      WHEN MOD(f.id_veiculo, 7) = 0 THEN 'ATRASADO'
      WHEN MOD(f.id_veiculo, 4) = 0 THEN 'PENDENTE'
      ELSE 'PAGO'
    END::varchar AS status_pagamento
  FROM faltantes f
  CROSS JOIN base
)
INSERT INTO documentacao (
  id_documento,
  id_veiculo,
  tipo_documento,
  data_vencimento,
  valor_pago,
  status_pagamento
)
SELECT
  n.id_documento,
  n.id_veiculo,
  n.tipo_documento,
  n.data_vencimento,
  n.valor_pago,
  n.status_pagamento
FROM novos n;


-- =====================================================================
-- 7. REGISTROS_USO
--   Histórico operacional usado pelas telas de histórico do veículo e timeline
--   da reserva. `id_motorista` referencia usuarios.id dos motoristas mockados.
-- =====================================================================
INSERT INTO registros_uso (
  id_uso,
  id_veiculo,
  id_motorista,
  id_reserva,
  data_saida,
  quilometragem_saida,
  data_retorno,
  quilometragem_retorno,
  observacoes_veiculo
) VALUES
(101,  1, 5, NULL, '2026-05-02 08:10:00', 15405.0, '2026-05-02 12:35:00', 15538.4, 'Retorno sem avarias. Veículo entregue limpo.'),
(102,  1, 6, NULL, '2026-05-08 13:20:00', 15538.4, '2026-05-08 17:55:00', 15622.0, 'Abastecimento recomendado antes da próxima saída.'),
(103,  2, 5, NULL, '2026-05-03 07:40:00', 32242.0, '2026-05-03 11:15:00', 32318.7, 'Uso institucional concluído sem ocorrências.'),
(104,  2, 6, NULL, '2026-05-10 09:00:00', 32318.7, '2026-05-10 15:25:00', 32472.1, 'Motorista relatou ruído leve ao frear em baixa velocidade.'),
(105,  3, 5, NULL, '2026-05-04 10:30:00', 46900.0, '2026-05-04 16:45:00', 47058.2, 'Conferência de documentos realizada no retorno.'),
(106,  4, 6, NULL, '2026-05-05 08:00:00', 5320.0,  '2026-05-05 10:20:00', 5364.6,  'Sem observações no retorno.'),
(107,  5, 5, NULL, '2026-05-06 07:30:00', 48254.0, '2026-05-06 18:10:00', 48512.9, 'Viagem longa concluída. Solicitar limpeza interna.'),
(108,  6, 6, NULL, '2026-05-07 06:50:00', 28095.0, '2026-05-07 14:40:00', 28218.3, 'Veículo liberado com tanque acima de meio.'),
(109, 10, 5, NULL, '2026-05-09 08:25:00', 1180.0,  '2026-05-09 13:05:00', 1276.8,  'Carga entregue e veículo liberado para nova agenda.'),
(110,  6, 5, NULL, '2026-05-12 07:15:00', 28218.3, '2026-05-12 12:30:00', 28304.5, 'Pequenos riscos já existentes conferidos no retorno.')
ON CONFLICT (id_uso) DO UPDATE SET
  id_veiculo = EXCLUDED.id_veiculo,
  id_motorista = EXCLUDED.id_motorista,
  id_reserva = EXCLUDED.id_reserva,
  data_saida = EXCLUDED.data_saida,
  quilometragem_saida = EXCLUDED.quilometragem_saida,
  data_retorno = EXCLUDED.data_retorno,
  quilometragem_retorno = EXCLUDED.quilometragem_retorno,
  observacoes_veiculo = EXCLUDED.observacoes_veiculo;

DO $$
DECLARE
  seq_name text;
  max_id bigint;
  has_rows boolean;
BEGIN
  seq_name := pg_get_serial_sequence('registros_uso', 'id_uso');
  IF seq_name IS NOT NULL THEN
    SELECT COALESCE(MAX(id_uso), 0) INTO max_id FROM registros_uso;
    SELECT EXISTS (SELECT 1 FROM registros_uso) INTO has_rows;
    IF has_rows THEN
      PERFORM setval(seq_name::regclass, max_id, true);
    ELSE
      PERFORM setval(seq_name::regclass, 1, false);
    END IF;
  END IF;
END $$;


-- =====================================================================
-- 8. MANUTENCOES
-- =====================================================================
INSERT INTO manutencoes (
  id_manutencao, id_veiculo, tipo_manutencao, descricao_problema, data_realizada,
  quilometragem_registro, custo_total, oficina_executor, status, data_identificacao, emergencia, prioridade
) VALUES
(1, 7, 'CORRETIVA',  'Troca da correia dentada e tensores após ruído anormal no motor.',          '2026-04-12', 87850.00, 1840.00, 'Mecânica Central LTDA', 'EM_ANDAMENTO', '2026-04-08 09:00:00', false, 'ALTA'),
(2, 8, 'CORRETIVA',  'Reparo no sistema de injeção eletrônica.',                                  '2026-04-20', 51120.00, 920.00,  'Auto Center Brasil',    'EM_ANDAMENTO', '2026-04-15 11:30:00', false, 'ALTA'),
(3, 1, 'PREVENTIVA', 'Revisão de 15.000 km — troca de óleo, filtros e checagem geral.',           '2026-03-04', 14980.00, 480.00,  'Concessionária GM',     'CONCLUIDA',    '2026-02-11 08:00:00', false, 'BAIXA'),
(4, 5, 'PREVENTIVA', 'Revisão dos 60.000 km e troca de pastilhas de freio.',                      '2026-02-18', 60050.00, 1320.00, 'Concessionária GM',     'CONCLUIDA',    '2026-01-28 14:00:00', false, 'BAIXA'),
(5, 6, 'CORRETIVA',  'Substituição da bateria após falha em partida fria.',                       '2026-03-22', 27500.00, 690.00,  'Baterias Express',      'CONCLUIDA',    '2026-03-18 07:45:00', false, 'MEDIA'),
(6, 9, 'CORRETIVA',  'Diagnóstico de falha geral no motor — viabilidade de reparo em análise.',   '2026-01-10', 141900.00,0.00,    'Mecânica Central LTDA', 'CANCELADA',    '2026-01-05 10:20:00', false, 'ALTA'),
(7, 2, 'PREVENTIVA', 'Alinhamento, balanceamento e rodízio de pneus.',                            '2026-04-02', 8100.00,  240.00,  'Pneus & Cia',           'CONCLUIDA',    '2026-03-12 09:15:00', false, 'BAIXA'),
(8, 3, 'PREVENTIVA', 'Revisão programada dos 45.000 km.',                                         '2026-04-25', 46900.00, 560.00,  'Concessionária GM',     'AGENDADA',     '2026-04-04 08:30:00', false, 'BAIXA'),
(9, 1, 'PREVENTIVA', 'Revisão programada dos 60.000 km — fluido de freio e filtros.',            '2026-06-15', 60000.00, null,    null,                    'AGENDADA',     '2026-05-25 09:00:00', false, 'BAIXA')
ON CONFLICT DO NOTHING;

-- Solicitações pendentes para triagem do gestor (issue 8.2)
INSERT INTO manutencoes (
  id_manutencao, id_veiculo, id_motorista, tipo_manutencao, descricao_problema,
  data_realizada, quilometragem_registro, custo_total, oficina_executor, status,
  data_identificacao, emergencia, prioridade
) VALUES
(10, 4,  1, 'CORRETIVA', 'Barulho metálico na suspensão dianteira ao passar em lombadas.',              NULL, 32450.00, NULL, NULL, 'PENDENTE', '2026-05-28 08:15:00', false, 'ALTA'),
(11, 10, 3, 'CORRETIVA', 'Superaquecimento em viagem — veículo perdeu potência e acendeu luz de temperatura.', NULL, 61200.00, NULL, NULL, 'PENDENTE', '2026-05-29 14:42:00', true,  'CRITICA'),
(12, 2,  1, 'CORRETIVA', 'Ar-condicionado sem refrigeração adequada para transporte de medicamentos.',    NULL, 19800.00, NULL, NULL, 'PENDENTE', '2026-05-30 09:05:00', false, 'MEDIA'),
(13, 11, 4, 'CORRETIVA', 'Vazamento de óleo identificado no retorno da última viagem institucional.',   NULL, 44120.00, NULL, NULL, 'PENDENTE', '2026-05-31 11:20:00', false, 'ALTA'),
(14, 12, 2, 'CORRETIVA', 'Luz de injeção acesa intermitentemente durante aceleração em subidas.',       NULL, 28700.00, NULL, NULL, 'PENDENTE', '2026-06-01 07:50:00', false, 'BAIXA')
ON CONFLICT (id_manutencao) DO NOTHING;

UPDATE manutencoes SET data_identificacao = '2026-04-08 09:00:00' WHERE id_manutencao = 1  AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-04-15 11:30:00' WHERE id_manutencao = 2  AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-02-11 08:00:00' WHERE id_manutencao = 3  AND tipo_manutencao = 'PREVENTIVA' AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-01-28 14:00:00' WHERE id_manutencao = 4  AND tipo_manutencao = 'PREVENTIVA' AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-03-18 07:45:00' WHERE id_manutencao = 5  AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-01-05 10:20:00' WHERE id_manutencao = 6  AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-03-12 09:15:00' WHERE id_manutencao = 7  AND tipo_manutencao = 'PREVENTIVA' AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-04-04 08:30:00' WHERE id_manutencao = 8  AND tipo_manutencao = 'PREVENTIVA' AND (data_identificacao IS NULL);
UPDATE manutencoes SET data_identificacao = '2026-05-25 09:00:00' WHERE id_manutencao = 9  AND tipo_manutencao = 'PREVENTIVA' AND (data_identificacao IS NULL);


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
-- Bancos criados antes da entidade Reserva completa podem não ter estas colunas
-- (ddl-auto=update nem sempre adiciona em tabelas já existentes).
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS justificativa TEXT;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS matricula_solicitante VARCHAR(30);
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS origem_lat DOUBLE PRECISION;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS origem_lng DOUBLE PRECISION;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS destino_lat DOUBLE PRECISION;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS destino_lng DOUBLE PRECISION;
ALTER TABLE registros_uso ADD COLUMN IF NOT EXISTS checklist_saida_registrado boolean NOT NULL DEFAULT false;
ALTER TABLE registros_uso ADD COLUMN IF NOT EXISTS checklist_retorno_registrado boolean NOT NULL DEFAULT false;

UPDATE reservas
SET justificativa = 'Viagem de serviço'
WHERE justificativa IS NULL OR TRIM(justificativa) = '';

UPDATE reservas r
SET matricula_solicitante = u.matricula
FROM usuarios u
WHERE r.id_usuario = u.id
  AND (r.matricula_solicitante IS NULL OR TRIM(r.matricula_solicitante) = '');

INSERT INTO reservas (id_reserva, id_usuario, id_veiculo, datahora_solicitacao, datahora_inicio_prevista, datahora_fim_estimada, destino, origem, justificativa, status_reserva) VALUES
(1, 3,  1, '2026-04-08 16:20:00', '2026-04-10 08:00:00', '2026-04-10 18:00:00', 'Vistoria Regional Norte',         'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(2, 10, 2, '2026-04-03 11:00:00', '2026-04-05 06:30:00', '2026-04-05 14:30:00', 'Secretaria de Educação',          'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(3, 11, 5, '2026-03-30 09:40:00', '2026-04-02 08:00:00', '2026-04-02 18:00:00', 'Fiscalização de obras Zona Sul',  'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(4, 10, 5, '2026-04-13 13:25:00', '2026-04-15 07:00:00', '2026-04-15 12:00:00', 'Entrega de documentos no Fórum',  'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(5, 3,  6, '2026-05-08 15:10:00', '2026-05-12 08:00:00', '2026-05-12 17:30:00', 'Reunião na Secretaria de Saúde',  'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(6, 11, 4, '2026-05-09 10:00:00', '2026-05-11 09:00:00', '2026-05-11 16:00:00', 'Visita técnica ao distrito',      'Garagem Central', 'Viagem de serviço', 'CONCLUIDA'),
(7, 10, 3, '2026-05-09 14:30:00', '2026-05-13 07:30:00', '2026-05-13 18:00:00', 'Auditoria em escola municipal',   'Garagem Central', 'Viagem de serviço', 'SOLICITADA'),
(8, 3,  10,'2026-05-09 16:45:00', '2026-05-14 06:00:00', '2026-05-14 19:00:00', 'Transporte de equipamentos',      'Garagem Central', 'Viagem de serviço', 'SOLICITADA')
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('reservas', 'id_reserva'), COALESCE((SELECT MAX(id_reserva) FROM reservas), 0));

-- ---------------------------------------------------------------------
-- Mock teste Patrícia Melo (usuario id 5): encerra trajetos 5/6 legados
-- ---------------------------------------------------------------------
UPDATE registros_uso ru
SET
  data_retorno = CASE ru.id_uso
    WHEN 5 THEN '2026-05-12 17:45:00'::timestamp
    WHEN 6 THEN '2026-05-11 16:10:00'::timestamp
  END,
  quilometragem_retorno = CASE ru.id_uso WHEN 5 THEN 28148.0 WHEN 6 THEN 5488.0 END,
  observacoes_veiculo = COALESCE(ru.observacoes_veiculo, 'Encerrado no seed para teste de fluxo.')
WHERE ru.id_uso IN (5, 6)
  AND ru.data_retorno IS NULL;

UPDATE reservas r
SET status_reserva = 'CONCLUIDA'
WHERE r.id_reserva IN (5, 6)
  AND r.status_reserva = 'APROVADA';

UPDATE veiculos v
SET status = 'DISPONIVEL'
WHERE v.id = 6
  AND NOT EXISTS (SELECT 1 FROM registros_uso ru WHERE ru.id_veiculo = v.id AND ru.data_retorno IS NULL);

INSERT INTO reservas (id_reserva, id_usuario, id_veiculo, datahora_solicitacao, datahora_inicio_prevista, datahora_fim_estimada, destino, origem, justificativa, status_reserva)
SELECT
  9,
  10,
  1,
  '2026-05-27 22:00:00',
  '2026-05-28 22:00:00',
  '2026-05-28 23:30:00',
  'Praça da Liberdade — Savassi, Belo Horizonte',
  'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte',
  'Viagem de serviço',
  'APROVADA'
ON CONFLICT (id_reserva) DO UPDATE SET
  id_usuario = EXCLUDED.id_usuario,
  id_veiculo = EXCLUDED.id_veiculo,
  datahora_solicitacao = EXCLUDED.datahora_solicitacao,
  datahora_inicio_prevista = EXCLUDED.datahora_inicio_prevista,
  datahora_fim_estimada = EXCLUDED.datahora_fim_estimada,
  destino = EXCLUDED.destino,
  origem = EXCLUDED.origem,
  justificativa = EXCLUDED.justificativa,
  status_reserva = EXCLUDED.status_reserva;

UPDATE reservas r
SET matricula_solicitante = u.matricula
FROM usuarios u
WHERE r.id_reserva = 9
  AND r.id_usuario = u.id
  AND (r.matricula_solicitante IS NULL OR trim(r.matricula_solicitante) = '');

-- (Datas da reserva #9 são atualizadas no bloco Patrícia Melo abaixo.)

SELECT setval(pg_get_serial_sequence('reservas', 'id_reserva'), COALESCE((SELECT MAX(id_reserva) FROM reservas), 0));

-- Coordenadas do trajeto (garagem da frota + destinos aproximados em BH)
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.8820, destino_lng = -43.9200
WHERE id_reserva = 1 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9240, destino_lng = -43.9370
WHERE id_reserva = 2 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9650, destino_lng = -43.9680
WHERE id_reserva = 3 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9310, destino_lng = -43.9380
WHERE id_reserva = 4 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9150, destino_lng = -43.9290
WHERE id_reserva = 5 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9200, destino_lng = -43.9500
WHERE id_reserva = 6 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.8780, destino_lng = -43.9280
WHERE id_reserva = 7 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9050, destino_lng = -43.9420
WHERE id_reserva = 8 AND (origem_lat IS NULL OR destino_lat IS NULL);
UPDATE reservas SET origem_lat = -19.9167, origem_lng = -43.9345, destino_lat = -19.9080, destino_lng = -43.9360
WHERE id_reserva = 9 AND (origem_lat IS NULL OR destino_lat IS NULL);

-- Demais reservas: origem na garagem quando texto for Garagem Central
UPDATE reservas
SET origem_lat = -19.9167, origem_lng = -43.9345
WHERE origem_lat IS NULL AND origem ILIKE '%Garagem Central%';

UPDATE reservas
SET justificativa = 'Viagem de serviço'
WHERE justificativa IS NULL OR TRIM(justificativa) = '';

ALTER TABLE reservas ALTER COLUMN justificativa SET NOT NULL;


-- =====================================================================
-- 12. REGISTROS_USO
--   id_veiculo / id_motorista são NOT NULL na entidade; alinhar com reservas (id_veiculo)
--   e usuários motoristas existentes (id_motorista).
-- =====================================================================
INSERT INTO registros_uso (id_uso, id_reserva, id_veiculo, id_motorista, data_saida, quilometragem_saida, data_retorno, quilometragem_retorno, observacoes_veiculo) VALUES
(1, 1, 1, 5, '2026-04-10 08:00:00', 45230.00, '2026-04-10 17:30:00', 45278.00, 'Viagem para vistoria na regional norte. Veículo entregue em ordem.'),
(2, 2, 2, 6, '2026-04-05 06:45:00', 32100.00, '2026-04-05 14:00:00', 32250.00, 'Deslocamento à Secretaria de Educação. Sem ocorrências.'),
(3, 3, 5, 4, '2026-04-02 08:15:00', 48000.00, '2026-04-02 17:00:00', 48180.00, 'Fiscalização de obras na zona sul.'),
(4, 4, 5, 6, '2026-04-15 07:00:00', 48180.00, '2026-04-15 11:30:00', 48260.00, 'Entrega de documentos no fórum.'),
(5, 5, 6, 5, '2026-05-12 08:00:00', 27950.00, '2026-05-12 17:45:00', 28012.00, 'Viagem concluída — KM saída +62 km.'),
(6, 6, 4, 5, '2026-05-11 09:00:00', 5312.00,  '2026-05-11 16:10:00', 5380.00,  'Viagem concluída — KM saída +68 km.')
ON CONFLICT (id_uso) DO UPDATE SET
  id_reserva = EXCLUDED.id_reserva,
  id_veiculo = EXCLUDED.id_veiculo,
  id_motorista = EXCLUDED.id_motorista,
  data_saida = EXCLUDED.data_saida,
  quilometragem_saida = EXCLUDED.quilometragem_saida,
  data_retorno = EXCLUDED.data_retorno,
  quilometragem_retorno = EXCLUDED.quilometragem_retorno,
  observacoes_veiculo = EXCLUDED.observacoes_veiculo;

UPDATE reservas r
SET id_motorista = ru.id_motorista
FROM registros_uso ru
WHERE r.id_reserva = ru.id_reserva
  AND r.id_motorista IS NULL;

-- Status operacional da frota: EM_USO somente quando existir uso em aberto.
UPDATE veiculos v
SET status = 'EM_USO'
WHERE EXISTS (
  SELECT 1
  FROM registros_uso ru
  WHERE ru.id_veiculo = v.id
    AND ru.data_retorno IS NULL
);

UPDATE veiculos v
SET status = 'DISPONIVEL'
WHERE v.status = 'EM_USO'
  AND NOT EXISTS (
    SELECT 1
    FROM registros_uso ru
    WHERE ru.id_veiculo = v.id
      AND ru.data_retorno IS NULL
  );

-- Regra de negócio do mock: o motorista do registro/reserva precisa ser o
-- motorista dono do veículo (veiculos.id_motorista), evitando divergências.
UPDATE registros_uso ru
SET id_motorista = v.id_motorista
FROM veiculos v
WHERE v.id = ru.id_veiculo
  AND v.id_motorista IS NOT NULL
  AND ru.id_motorista IS DISTINCT FROM v.id_motorista;

UPDATE reservas r
SET id_motorista = v.id_motorista
FROM veiculos v
WHERE v.id = r.id_veiculo
  AND v.id_motorista IS NOT NULL
  AND r.id_motorista IS DISTINCT FROM v.id_motorista;


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


-- =====================================================================
-- 14. MOCK VIAGENS PATRÍCIA MELO (motorista id 5) — datas relativas e KM alinhados
--     Lista no app: Viagem 1 (mais recente) … Viagem N. Filtros: 7d / 30d / 90d / 180d.
-- =====================================================================

INSERT INTO reservas (
  id_reserva, id_usuario, id_veiculo, datahora_solicitacao,
  datahora_inicio_prevista, datahora_fim_estimada, destino, origem, justificativa, status_reserva
) VALUES
(10, 10, 2, NOW() - INTERVAL '26 days', NOW() - INTERVAL '25 days' + TIME '08:00', NOW() - INTERVAL '25 days' + TIME '17:00',
 'Cidade Administrativa Minas Gerais — Belo Horizonte', 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte', 'Viagem de serviço', 'CONCLUIDA'),
(11, 3,  3, NOW() - INTERVAL '51 days', NOW() - INTERVAL '50 days' + TIME '07:30', NOW() - INTERVAL '50 days' + TIME '16:30',
 'Parque Municipal Américo Renné Giannetti — Belo Horizonte', 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte', 'Viagem de serviço', 'CONCLUIDA'),
(12, 11, 4, NOW() - INTERVAL '2 days',  NOW() + INTERVAL '1 day'  + TIME '09:00',  NOW() + INTERVAL '1 day'  + TIME '18:00',
 'Aeroporto Internacional de Confins — Confins, MG', 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte', 'Viagem de serviço', 'APROVADA')
ON CONFLICT (id_reserva) DO UPDATE SET
  id_usuario = EXCLUDED.id_usuario,
  id_veiculo = EXCLUDED.id_veiculo,
  datahora_solicitacao = EXCLUDED.datahora_solicitacao,
  datahora_inicio_prevista = EXCLUDED.datahora_inicio_prevista,
  datahora_fim_estimada = EXCLUDED.datahora_fim_estimada,
  destino = EXCLUDED.destino,
  origem = EXCLUDED.origem,
  justificativa = EXCLUDED.justificativa,
  status_reserva = EXCLUDED.status_reserva;

-- Viagens concluídas recentes (Patrícia / veículos 1–6)
UPDATE reservas SET
  datahora_solicitacao = NOW() - INTERVAL '2 days',
  datahora_inicio_prevista = NOW() - INTERVAL '1 day' + TIME '08:00',
  datahora_fim_estimada = NOW() - INTERVAL '1 day' + TIME '17:30',
  status_reserva = 'CONCLUIDA',
  destino = 'Hospital Risoleta Tolentino Neves — Ribeirão das Neves, MG',
  origem = 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte'
WHERE id_reserva = 1;

UPDATE reservas SET
  datahora_solicitacao = NOW() - INTERVAL '6 days',
  datahora_inicio_prevista = NOW() - INTERVAL '5 days' + TIME '08:00',
  datahora_fim_estimada = NOW() - INTERVAL '5 days' + TIME '17:30',
  status_reserva = 'CONCLUIDA',
  destino = 'Hospital Júlia Kubitschek — Av. Cristiano Machado, Belo Horizonte',
  origem = 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte'
WHERE id_reserva = 5;

UPDATE reservas SET
  datahora_solicitacao = NOW() - INTERVAL '14 days',
  datahora_inicio_prevista = NOW() - INTERVAL '13 days' + TIME '09:00',
  datahora_fim_estimada = NOW() - INTERVAL '13 days' + TIME '16:00',
  status_reserva = 'CONCLUIDA',
  destino = 'Prefeitura de Contagem — Centro, Contagem, MG',
  origem = 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte'
WHERE id_reserva = 6;

-- Reservas de teste em aberto ficam fora da listagem do motorista (somente CONCLUIDA por enquanto)
UPDATE reservas SET status_reserva = 'CANCELADA' WHERE id_reserva IN (9, 12);

INSERT INTO registros_uso (
  id_uso, id_reserva, id_veiculo, id_motorista,
  data_saida, quilometragem_saida, data_retorno, quilometragem_retorno,
  observacoes_veiculo, checklist_saida_registrado, checklist_retorno_registrado
) VALUES
(1, 1,  1, 5, NOW() - INTERVAL '1 day' + TIME '08:05', 45230.0, NOW() - INTERVAL '1 day' + TIME '17:20', 45278.0,
 'Viagem concluída sem ocorrências.', true, true),
(5, 5,  6, 5, NOW() - INTERVAL '5 days' + TIME '08:10', 27950.0, NOW() - INTERVAL '5 days' + TIME '17:40', 28012.0,
 'Retorno com tanque acima de meio.', true, true),
(6, 6,  4, 5, NOW() - INTERVAL '13 days' + TIME '09:05', 5312.0,  NOW() - INTERVAL '13 days' + TIME '15:55', 5380.0,
 'Veículo liberado na garagem.', true, true),
(10, 10, 2, 5, NOW() - INTERVAL '25 days' + TIME '08:00', 32148.0, NOW() - INTERVAL '25 days' + TIME '16:50', 32220.0,
 'Deslocamento institucional concluído.', true, true),
(11, 11, 3, 5, NOW() - INTERVAL '50 days' + TIME '07:45', 46800.0, NOW() - INTERVAL '50 days' + TIME '16:20', 46892.0,
 'Auditoria regional finalizada.', true, true)
ON CONFLICT (id_uso) DO UPDATE SET
  id_reserva = EXCLUDED.id_reserva,
  id_veiculo = EXCLUDED.id_veiculo,
  id_motorista = EXCLUDED.id_motorista,
  data_saida = EXCLUDED.data_saida,
  quilometragem_saida = EXCLUDED.quilometragem_saida,
  data_retorno = EXCLUDED.data_retorno,
  quilometragem_retorno = EXCLUDED.quilometragem_retorno,
  observacoes_veiculo = EXCLUDED.observacoes_veiculo,
  checklist_saida_registrado = EXCLUDED.checklist_saida_registrado,
  checklist_retorno_registrado = EXCLUDED.checklist_retorno_registrado;

-- Garante coerência: km final = km inicial + km percorrida (evita leituras antigas no ON CONFLICT)
UPDATE registros_uso SET quilometragem_saida = 45230.0, quilometragem_retorno = 45278.0
WHERE id_uso = 1 AND id_reserva = 1;
UPDATE registros_uso SET quilometragem_saida = 27950.0, quilometragem_retorno = 28012.0
WHERE id_uso = 5 AND id_reserva = 5;
UPDATE registros_uso SET quilometragem_saida = 5312.0, quilometragem_retorno = 5380.0
WHERE id_uso = 6 AND id_reserva = 6;
UPDATE registros_uso SET quilometragem_saida = 32148.0, quilometragem_retorno = 32220.0
WHERE id_uso = 10 AND id_reserva = 10;
UPDATE registros_uso SET quilometragem_saida = 46800.0, quilometragem_retorno = 46892.0
WHERE id_uso = 11 AND id_reserva = 11;

-- Checklist completo (tipos saída 4–7 e retorno 8–9) nos registros de viagem da Patrícia
DELETE FROM carro_checklist WHERE id_uso IN (1, 5, 6, 10, 11);

INSERT INTO carro_checklist (id_checklist, id_uso, id_item, data_checklist, observacoes)
SELECT
  1000 + ru.id_uso * 20 + ic.id_item,
  ru.id_uso,
  ic.id_item,
  ru.data_saida - INTERVAL '10 minutes',
  NULL
FROM registros_uso ru
CROSS JOIN item_checklist ic
WHERE ru.id_uso IN (1, 5, 6, 10, 11)
  AND ic.id_tipo_inspecao IN (4, 5, 6, 7)
ON CONFLICT DO NOTHING;

INSERT INTO carro_checklist (id_checklist, id_uso, id_item, data_checklist, observacoes)
SELECT
  2000 + ru.id_uso * 20 + ic.id_item,
  ru.id_uso,
  ic.id_item,
  ru.data_retorno - INTERVAL '5 minutes',
  NULL
FROM registros_uso ru
CROSS JOIN item_checklist ic
WHERE ru.id_uso IN (1, 5, 6, 10, 11)
  AND ic.id_tipo_inspecao IN (8, 9)
ON CONFLICT DO NOTHING;

SELECT setval(pg_get_serial_sequence('reservas', 'id_reserva'), COALESCE((SELECT MAX(id_reserva) FROM reservas), 0));
SELECT setval(pg_get_serial_sequence('registros_uso', 'id_uso'), COALESCE((SELECT MAX(id_uso) FROM registros_uso), 0));

-- =====================================================================
-- 15. RESERVA 11 — reset para testes de corrida ida e volta
-- =====================================================================
DELETE FROM carro_checklist WHERE id_uso IN (SELECT id_uso FROM registros_uso WHERE id_reserva = 11);
DELETE FROM registros_uso WHERE id_reserva = 11;

UPDATE reservas SET
  status_reserva = 'APROVADA',
  datahora_solicitacao = DATE_TRUNC('day', NOW()) + TIME '17:30:00',
  datahora_inicio_prevista = DATE_TRUNC('day', NOW()) + TIME '20:40:00',
  datahora_fim_estimada = DATE_TRUNC('day', NOW()) + TIME '23:30:00',
  origem = 'Garagem Central — Av. Afonso Pena, 1212, Centro, Belo Horizonte',
  destino = 'Parque Municipal Américo Renné Giannetti — Belo Horizonte',
  justificativa = 'Viagem de teste — corrida ida e volta'
WHERE id_reserva = 11;

UPDATE veiculos SET status = 'DISPONIVEL' WHERE id = 3;
