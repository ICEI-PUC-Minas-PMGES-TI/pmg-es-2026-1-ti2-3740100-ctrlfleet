package com.ctrlfleet.api.dto.motorista;

import com.ctrlfleet.api.domain.model.Usuario;

public class MotoristaResumoDTO {
    private Long id;
    private String nome;
    private String matricula;
    private String numeroCnh;
    private int veiculosVinculados;

    public static MotoristaResumoDTO from(Usuario usuario, int veiculosVinculados) {
        MotoristaResumoDTO dto = new MotoristaResumoDTO();
        dto.id = usuario.getId();
        dto.nome = usuario.getNome();
        dto.matricula = usuario.getMatricula();
        if (usuario.getMotorista() != null) {
            dto.numeroCnh = usuario.getMotorista().getNumeroCnh();
        }
        dto.veiculosVinculados = veiculosVinculados;
        return dto;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getMatricula() { return matricula; }
    public String getNumeroCnh() { return numeroCnh; }
    public int getVeiculosVinculados() { return veiculosVinculados; }
}
