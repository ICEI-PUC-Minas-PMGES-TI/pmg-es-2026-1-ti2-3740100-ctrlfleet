package com.ctrlfleet.api.dto.veiculo;

import com.ctrlfleet.api.domain.enums.StatusVeiculo;
import com.ctrlfleet.api.domain.enums.TipoVeiculo;
import com.ctrlfleet.api.domain.model.Usuario;
import com.ctrlfleet.api.domain.model.Veiculo;
import java.util.ArrayList;
import java.util.List;

/**
 * Representação de um Veículo para consumo do frontend (painel do gestor de
 * frota). Mantém apenas os campos atualmente persistidos pela entidade
 * {@link Veiculo}.
 */
public class VeiculoResponseDTO {

    public static class MotoristaResponsavelDTO {
        private Long id;
        private String nome;
        private String email;
        private String matricula;

        public MotoristaResponsavelDTO() {}

        public static MotoristaResponsavelDTO fromEntity(Usuario usuario) {
            if (usuario == null) return null;
            MotoristaResponsavelDTO dto = new MotoristaResponsavelDTO();
            dto.id = usuario.getId();
            dto.nome = usuario.getNome();
            dto.email = usuario.getEmail();
            dto.matricula = usuario.getMatricula();
            return dto;
        }

        public Long getId() {
            return id;
        }

        public String getNome() {
            return nome;
        }

        public String getEmail() {
            return email;
        }

        public String getMatricula() {
            return matricula;
        }
    }

    private Long id;
    private String placa;
    private String modelo;
    private String marca;
    private String secretaria;
    private int ano;
    private StatusVeiculo status;
    private TipoVeiculo tipoVeiculo;
    private MotoristaResponsavelDTO motorista;
    private List<DocumentacaoResponseDTO> documentos = new ArrayList<>();
    /** Hodômetro mais recente (registros de uso / abastecimentos). */
    private Double quilometragemAtual;

    public VeiculoResponseDTO() {}

    public static VeiculoResponseDTO fromEntity(Veiculo veiculo) {
        VeiculoResponseDTO dto = new VeiculoResponseDTO();
        dto.id = veiculo.getId();
        dto.placa = veiculo.getPlaca();
        dto.modelo = veiculo.getModelo();
        dto.marca = veiculo.getMarca();
        dto.secretaria = veiculo.getSecretaria();
        dto.ano = veiculo.getAno();
        dto.status = veiculo.getStatus();
        dto.tipoVeiculo = veiculo.getTipoVeiculo();
        dto.motorista = MotoristaResponsavelDTO.fromEntity(veiculo.getMotorista());
        return dto;
    }

    public static VeiculoResponseDTO fromEntity(Veiculo veiculo, List<DocumentacaoResponseDTO> documentos) {
        VeiculoResponseDTO dto = fromEntity(veiculo);
        dto.documentos = documentos == null ? new ArrayList<>() : documentos;
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getPlaca() {
        return placa;
    }

    public String getModelo() {
        return modelo;
    }

    public String getMarca() {
        return marca;
    }

    public String getSecretaria() {
        return secretaria;
    }

    public int getAno() {
        return ano;
    }

    public StatusVeiculo getStatus() {
        return status;
    }

    public TipoVeiculo getTipoVeiculo() {
        return tipoVeiculo;
    }

    public MotoristaResponsavelDTO getMotorista() {
        return motorista;
    }

    public List<DocumentacaoResponseDTO> getDocumentos() {
        return documentos;
    }

    public Double getQuilometragemAtual() {
        return quilometragemAtual;
    }

    public void setQuilometragemAtual(Double quilometragemAtual) {
        this.quilometragemAtual = quilometragemAtual;
    }
}
