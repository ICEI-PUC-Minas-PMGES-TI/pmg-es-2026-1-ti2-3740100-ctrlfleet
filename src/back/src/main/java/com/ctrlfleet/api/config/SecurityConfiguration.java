package com.ctrlfleet.api.config;

import com.ctrlfleet.api.security.JwtAuthFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfiguration(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers("/auth/login").permitAll()

                .requestMatchers("/health").permitAll()

                .requestMatchers("/usuarios/**")
                    .hasAuthority("ROLE_ADMINISTRADOR")

                .requestMatchers(HttpMethod.GET, "/veiculos/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA", "ROLE_MOTORISTA", "ROLE_SOLICITANTE")
                .requestMatchers(HttpMethod.POST, "/veiculos/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")
                .requestMatchers(HttpMethod.PUT, "/veiculos/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")
                .requestMatchers(HttpMethod.PATCH, "/veiculos/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")

                .requestMatchers(HttpMethod.GET, "/reservas/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA", "ROLE_MOTORISTA", "ROLE_SOLICITANTE")
                .requestMatchers(HttpMethod.POST, "/reservas")
                    .hasAnyAuthority("ROLE_SOLICITANTE", "ROLE_ADMINISTRADOR")
                .requestMatchers("/reservas/*/aprovar", "/reservas/*/reprovar")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers("/reservas/*/cancelar")
                    .hasAnyAuthority("ROLE_SOLICITANTE", "ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/reservas/**")
                    .hasAnyAuthority("ROLE_SOLICITANTE", "ROLE_ADMINISTRADOR")

                .requestMatchers(HttpMethod.GET, "/gestor/manutencoes/preventiva")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/gestor/manutencoes/contagem")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/gestor/manutencoes/**")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.GET, "/manutencoes/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")
                .requestMatchers(HttpMethod.PATCH, "/manutencoes/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/motoristas/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA", "ROLE_MOTORISTA", "ROLE_SOLICITANTE")
                .requestMatchers(HttpMethod.POST, "/motoristas/**")
                    .hasAnyAuthority("ROLE_MOTORISTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/motoristas/**")
                    .hasAnyAuthority("ROLE_MOTORISTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.PATCH, "/motoristas/**")
                    .hasAnyAuthority("ROLE_MOTORISTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/motoristas/**")
                    .hasAnyAuthority("ROLE_MOTORISTA", "ROLE_ADMINISTRADOR")

                .requestMatchers("/auditoria/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA")

                .requestMatchers("/registros-uso/**")
                    .hasAnyAuthority("ROLE_ADMINISTRADOR", "ROLE_GESTOR_FROTA", "ROLE_MOTORISTA")

                .requestMatchers(
                                "/gestor/manutencoes/*/aprovar",
                                "/gestor/manutencoes/*/reprovar",
                                "/gestor/manutencoes/*/iniciar",
                                "/gestor/manutencoes/*/concluir")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")
                .requestMatchers(HttpMethod.PATCH, "/gestor/manutencoes/*/prioridade")
                    .hasAnyAuthority("ROLE_GESTOR_FROTA", "ROLE_ADMINISTRADOR")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(
                List.of("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
