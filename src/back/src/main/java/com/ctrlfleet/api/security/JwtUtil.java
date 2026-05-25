package com.ctrlfleet.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final long EXPIRACAO_MS = 8 * 60 * 60 * 1000L; 

    private final SecretKey chave;

    public JwtUtil(@Value("${jwt.secret}") String secret) {
        this.chave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String gerar(Long id, String email, String role, String nome) {
        long agora = System.currentTimeMillis();
        return Jwts.builder()
                .subject(email)
                .claim("id", id)
                .claim("role", role)
                .claim("nome", nome)
                .issuedAt(new Date(agora))
                .expiration(new Date(agora + EXPIRACAO_MS))
                .signWith(chave)
                .compact();
    }

    public Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValido(String token) {
        try {
            extrairClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extrairRole(String token) {
        return extrairClaims(token).get("role", String.class);
    }

    public Long extrairId(String token) {
        return extrairClaims(token).get("id", Long.class);
    }
}
