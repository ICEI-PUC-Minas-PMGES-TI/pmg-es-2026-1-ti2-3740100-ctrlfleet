-- Seed inicial do CtrlFleet.
-- O Hibernate cria/atualiza as tabelas e este arquivo popula dados de exemplo.

INSERT INTO roles (id, nome) VALUES
(1, 'ROLE_SOLICITANTE'),
(2, 'ROLE_ADMINISTRADOR'),
(3, 'ROLE_GESTOR_FROTA'),
(4, 'ROLE_MOTORISTA')
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome;

INSERT INTO usuarios (
    id, nome, email, senha, matricula, departamento, cargo, data_admissao,
    tipo_cadastro, numero_cnh, validade_cnh
) VALUES
(1, 'Ana Costa', 'ana.costa@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'ADM-0001', 'Administracao', 'Administrador', '2024-01-08', 'usuario', NULL, NULL),
(2, 'Joao Duarte', 'joao.duarte@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'GES-0002', 'Gabinete', 'Gestor de Frota', '2024-02-12', 'usuario', NULL, NULL),
(3, 'Marina Silva', 'marina.silva@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'SOL-0003', 'Saude', 'Servidor Solicitante', '2024-03-18', 'usuario', NULL, NULL),
(4, 'Carlos Rocha', 'carlos.rocha@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'MOT-0004', 'Obras', 'Motorista', '2023-11-20', 'motorista', '03124567890', '2027-11-18'),
(5, 'Patricia Melo', 'patricia.melo@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'MOT-0005', 'Saude', 'Motorista', '2023-09-14', 'motorista', '04567891234', '2028-08-09'),
(6, 'Leandro Sousa', 'leandro.sousa@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'MOT-0006', 'Gabinete', 'Motorista', '2022-06-06', 'motorista', '05891234765', '2029-02-21'),
(7, 'Beatriz Lima', 'beatriz.lima@ctrlfleet.gov.br', '$2a$10$oy4vI2x.rVcsgHc3y.HWxOwYML5z0tJmkrBBtOHfdxzaRwByaS88K', 'GES-0007', 'Educacao', 'Gestor de Frota', '2022-10-03', 'usuario', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    matricula = EXCLUDED.matricula,
    departamento = EXCLUDED.departamento,
    cargo = EXCLUDED.cargo,
    data_admissao = EXCLUDED.data_admissao,
    tipo_cadastro = EXCLUDED.tipo_cadastro,
    numero_cnh = EXCLUDED.numero_cnh,
    validade_cnh = EXCLUDED.validade_cnh;

DELETE FROM usuario_roles WHERE usuario_id IN (1, 2, 3, 4, 5, 6, 7);

INSERT INTO usuario_roles (usuario_id, role_id) VALUES
(1, 2),
(2, 3),
(3, 1),
(4, 4),
(5, 4),
(6, 4),
(7, 3)
ON CONFLICT DO NOTHING;

INSERT INTO veiculos (
    id, placa, modelo, marca, ano, secretaria, categoria_cnh, quilometragem,
    vencimento_ipva, vencimento_seguro, vencimento_licenciamento, motorista_id, status
) VALUES
(1, 'RBC-4E21', 'Toyota Hilux SW4', 'Toyota', 2024, 'Gabinete', 'B', 48230.0, '2026-05-12', '2026-11-28', '2026-09-17', 6, 'DISPONIVEL'),
(2, 'KMS-8812', 'Fiat Ducato Maxxi', 'Fiat', 2021, 'Saude', 'D', 126100.0, '2026-02-10', '2026-08-22', '2026-01-15', 4, 'DESATIVADO'),
(3, 'RVA-3021', 'Renault Oroch', 'Renault', 2023, 'Obras', 'B', 62455.0, '2026-08-18', '2026-08-18', '2026-08-30', 4, 'MANUTENCAO'),
(4, 'MTA-9011', 'Mercedes Sprinter', 'Mercedes-Benz', 2022, 'Educacao', 'D', 84020.0, '2026-10-12', '2026-12-03', '2026-10-22', 5, 'DISPONIVEL'),
(5, 'ABC-1D23', 'Chevrolet Onix LT', 'Chevrolet', 2022, 'Administracao', 'B', 15340.0, '2026-07-04', '2026-09-09', '2026-07-30', 6, 'EM_USO')
ON CONFLICT (id) DO UPDATE SET
    placa = EXCLUDED.placa,
    modelo = EXCLUDED.modelo,
    marca = EXCLUDED.marca,
    ano = EXCLUDED.ano,
    secretaria = EXCLUDED.secretaria,
    categoria_cnh = EXCLUDED.categoria_cnh,
    quilometragem = EXCLUDED.quilometragem,
    vencimento_ipva = EXCLUDED.vencimento_ipva,
    vencimento_seguro = EXCLUDED.vencimento_seguro,
    vencimento_licenciamento = EXCLUDED.vencimento_licenciamento,
    motorista_id = EXCLUDED.motorista_id,
    status = EXCLUDED.status;

INSERT INTO registros_uso (
    id_uso, id_veiculo, id_motorista, id_reserva, data_saida,
    quilometragem_saida, data_retorno, quilometragem_retorno, observacoes_veiculo
) VALUES
(1, 1, 6, NULL, '2026-04-10T08:00:00', 48090.0, '2026-04-10T17:30:00', 48160.0, 'Agenda institucional no gabinete.'),
(2, 1, 6, NULL, '2026-04-28T07:30:00', 48160.0, '2026-04-28T12:45:00', 48230.0, 'Reserva concluida para agenda institucional.'),
(3, 3, 4, NULL, '2026-04-17T09:00:00', 62320.0, '2026-04-17T18:00:00', 62455.0, 'Troca de pneus dianteiros.'),
(4, 4, 5, NULL, '2026-04-24T06:45:00', 83810.0, '2026-04-24T14:00:00', 84020.0, 'Veiculo alocado para rota da educacao.'),
(5, 5, 6, NULL, '2026-04-18T10:00:00', 15200.0, '2026-04-18T16:30:00', 15340.0, 'Deslocamento administrativo.')
ON CONFLICT (id_uso) DO NOTHING;

SELECT setval(pg_get_serial_sequence('roles', 'id'), COALESCE((SELECT MAX(id) FROM roles), 1), true);
SELECT setval(pg_get_serial_sequence('usuarios', 'id'), COALESCE((SELECT MAX(id) FROM usuarios), 1), true);
SELECT setval(pg_get_serial_sequence('veiculos', 'id'), COALESCE((SELECT MAX(id) FROM veiculos), 1), true);
SELECT setval(pg_get_serial_sequence('registros_uso', 'id_uso'), COALESCE((SELECT MAX(id_uso) FROM registros_uso), 1), true);
