-- ==========================================
-- USUARIOS (BASE)
-- ==========================================
INSERT INTO usuarios (id, nome, email, senha) VALUES
(1, 'João Silva', 'joao.silva@ctrlfleet.com', '123456'),
(2, 'Maria Santos', 'maria.santos@ctrlfleet.com', '123456'),
(3, 'Pedro Oliveira', 'pedro.oliveira@ctrlfleet.com', '123456'),
(4, 'Ana Costa', 'ana.costa@ctrlfleet.com', '123456'),
(5, 'Carlos Souza', 'carlos.souza@ctrlfleet.com', '123456'),
(6, 'Fernanda Lima', 'fernanda.lima@ctrlfleet.com', '123456'),
(7, 'Roberto Alves', 'roberto.alves@ctrlfleet.com', '123456'),
(8, 'Juliana Martins', 'juliana.martins@ctrlfleet.com', '123456'),
(9, 'Lucas Ferreira', 'lucas.ferreira@ctrlfleet.com', '123456'),
(10, 'Patricia Rocha', 'patricia.rocha@ctrlfleet.com', '123456')
ON CONFLICT DO NOTHING;


-- ==========================================
-- MOTORISTAS
-- ==========================================
INSERT INTO motoristas (usuario_id, cnh, validade_cnh) VALUES
(1, '12345678900', '2027-05-10'),
(3, '98765432100', '2026-11-20'),
(6, '45612378900', '2028-01-15'),
(9, '78945612300', '2025-09-30')
ON CONFLICT DO NOTHING;


-- ==========================================
-- SOLICITANTES
-- ==========================================
INSERT INTO solicitantes (usuario_id) VALUES
(2),
(4),
(8),
(10)
ON CONFLICT DO NOTHING;


-- ==========================================
-- GESTORES
-- ==========================================
INSERT INTO gestores (usuario_id) VALUES
(5),
(7)
ON CONFLICT DO NOTHING;


-- ==========================================
-- VEICULOS
-- ==========================================
INSERT INTO veiculos (placa, modelo, marca, ano, status) VALUES

-- DISPONÍVEIS
('ABC1A23', 'Onix', 'Chevrolet', 2022, 'DISPONIVEL'),
('XYZ5B67', 'HB20', 'Hyundai', 2023, 'DISPONIVEL'),
('LMN9C12', 'Corsa', 'Chevrolet', 2021, 'DISPONIVEL'),
('VXY8D01', 'March', 'Nissan', 2023, 'DISPONIVEL'),

-- EM USO
('DEF3E56', 'Prisma', 'Chevrolet', 2020, 'EM_USO'),
('GHI7F90', 'Gol', 'Volkswagen', 2022, 'EM_USO'),

-- MANUTENÇÃO
('JKL2G45', 'Celta', 'Chevrolet', 2019, 'MANUTENCAO'),
('OPQ6H89', 'Fit', 'Honda', 2021, 'MANUTENCAO'),

-- DESATIVADOS
('RST0I23', 'Palio', 'Fiat', 2015, 'DESATIVADO')
ON CONFLICT DO NOTHING;


-- ==========================================
-- REGISTROS DE USO
-- ==========================================
INSERT INTO registros_uso (id_uso, id_veiculo, id_motorista, id_reserva, data_saida, quilometragem_saida, data_retorno, quilometragem_retorno, observacoes_veiculo) VALUES

-- Veículo 1 (Onix ABC1A23) — motorista João Silva (id 1)
(1, 1, 1, NULL, '2026-04-10T08:00:00', 15200.0, '2026-04-10T17:30:00', 15340.0, 'Viagem para vistoria na regional norte.'),
(2, 1, 1, NULL, '2026-04-18T07:30:00', 15340.0, '2026-04-18T12:45:00', 15410.0, NULL),
(3, 1, 3, NULL, '2026-04-25T09:00:00', 15410.0, '2026-04-25T18:00:00', 15580.0, 'Transporte de materiais para evento.'),

-- Veículo 2 (HB20 XYZ5B67) — motorista Pedro Oliveira (id 3)
(4, 2, 3, NULL, '2026-04-05T06:45:00', 32100.0, '2026-04-05T14:00:00', 32250.0, 'Deslocamento à secretaria de educação.'),
(5, 2, 6, NULL, '2026-04-22T10:00:00', 32250.0, '2026-04-22T16:30:00', 32390.0, NULL),

-- Veículo 5 (Prisma DEF3E56) — motorista Fernanda Lima (id 6)
(6, 5, 6, NULL, '2026-04-02T08:15:00', 48000.0, '2026-04-02T17:00:00', 48180.0, 'Fiscalização de obras na zona sul.'),
(7, 5, 9, NULL, '2026-04-15T07:00:00', 48180.0, '2026-04-15T11:30:00', 48260.0, 'Entrega de documentos no fórum.'),
(8, 5, 1, NULL, '2026-04-28T13:00:00', 48260.0, '2026-04-28T18:45:00', 48420.0, NULL)

ON CONFLICT DO NOTHING;