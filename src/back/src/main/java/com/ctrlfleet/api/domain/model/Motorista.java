package com.ctrlfleet.api.domain.model;

import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * Dados de habilitação vinculados 1:1 ao {@link Usuario} quando atua como
 * motorista. Apenas usuários com cadastro do tipo motorista possuem registro
 * nesta tabela.
 */
@Entity
@Table(name = "motorista")
public class Motorista {

    @Id
    @Column(name = "usuario_id")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "numero_cnh", nullable = false, length = 40)
    private String numeroCnh;

    @Column(name = "validade_cnh", nullable = false)
    private LocalDate validadeCnh;

    protected Motorista() {}

    public Motorista(Usuario usuario, String numeroCnh, LocalDate validadeCnh) {
        this.usuario = usuario;
        this.numeroCnh = numeroCnh;
        this.validadeCnh = validadeCnh;
    }

    public Long getId() {
        return id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getNumeroCnh() {
        return numeroCnh;
    }

    public void setNumeroCnh(String numeroCnh) {
        this.numeroCnh = numeroCnh;
    }

    public LocalDate getValidadeCnh() {
        return validadeCnh;
    }

    public void setValidadeCnh(LocalDate validadeCnh) {
        this.validadeCnh = validadeCnh;
    }
}
