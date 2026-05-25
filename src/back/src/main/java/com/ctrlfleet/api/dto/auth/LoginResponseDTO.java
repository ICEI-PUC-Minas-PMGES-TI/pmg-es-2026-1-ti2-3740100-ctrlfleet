package com.ctrlfleet.api.dto.auth;

public class LoginResponseDTO {

    private String token;
    private Long id;
    private String nome;
    private String email;
    private String role;
    private String perfilAcesso;
    private Long motoristaId;

    public LoginResponseDTO() {}

    public LoginResponseDTO(
            String token,
            Long id,
            String nome,
            String email,
            String role,
            String perfilAcesso,
            Long motoristaId) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.role = role;
        this.perfilAcesso = perfilAcesso;
        this.motoristaId = motoristaId;
    }

    public String getToken() { return token; }
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getPerfilAcesso() { return perfilAcesso; }
    public Long getMotoristaId() { return motoristaId; }
}
