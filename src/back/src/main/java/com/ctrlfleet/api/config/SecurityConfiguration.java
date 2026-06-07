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
                    .hasRole("ADMINISTRADOR")

                .requestMatchers(HttpMethod.GET, "/veiculos/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA", "MOTORISTA", "SOLICITANTE")
                .requestMatchers(HttpMethod.POST, "/veiculos/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA")
                .requestMatchers(HttpMethod.PUT, "/veiculos/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA")
                .requestMatchers(HttpMethod.PATCH, "/veiculos/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA")

                .requestMatchers(HttpMethod.GET, "/reservas/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA", "MOTORISTA", "SOLICITANTE")
                .requestMatchers(HttpMethod.POST, "/reservas")
                    .hasAnyRole("SOLICITANTE", "ADMINISTRADOR")
                .requestMatchers("/reservas/*/aprovar", "/reservas/*/reprovar")
                    .hasAnyRole("GESTOR_FROTA", "ADMINISTRADOR")
                .requestMatchers("/reservas/*/cancelar")
                    .hasAnyRole("SOLICITANTE", "GESTOR_FROTA", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/reservas/**")
                    .hasAnyRole("SOLICITANTE", "ADMINISTRADOR")

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
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA")

                .requestMatchers("/registros-uso/**")
                    .hasAnyRole("ADMINISTRADOR", "GESTOR_FROTA", "MOTORISTA")

                .requestMatchers(HttpMethod.GET, "/gestor/manutencoes/**")
                    .hasAnyRole("GESTOR_FROTA", "ADMINISTRADOR")
                .requestMatchers(
                                "/gestor/manutencoes/*/aprovar",
                                "/gestor/manutencoes/*/reprovar",
                                "/gestor/manutencoes/*/iniciar",
                                "/gestor/manutencoes/*/concluir")
                    .hasAnyRole("GESTOR_FROTA", "ADMINISTRADOR")
                .requestMatchers(HttpMethod.PATCH, "/gestor/manutencoes/*/prioridade")
                    .hasAnyRole("GESTOR_FROTA", "ADMINISTRADOR")

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
