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