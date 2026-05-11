package com.ctrlfleet.api.domain.enums;

/**
 * Papel de acesso do usuário (exatamente um por conta). Persistido na coluna
 * {@code role} da tabela {@code usuarios} como texto canônico ROLE_*.
 */
public enum PapelUsuario {
    ROLE_ADMINISTRADOR,
    ROLE_GESTOR_FROTA,
    ROLE_MOTORISTA,
    ROLE_SOLICITANTE
}
