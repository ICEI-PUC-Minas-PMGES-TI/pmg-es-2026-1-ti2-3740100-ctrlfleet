package com.ctrlfleet.api.config;

import com.ctrlfleet.api.domain.model.Role;
import com.ctrlfleet.api.repository.RoleRepository;
import java.util.List;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class RoleBootstrap implements ApplicationRunner {

    private final RoleRepository roleRepository;

    public RoleBootstrap(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (roleRepository.count() > 0) {
            return;
        }
        List.of(
                        "ROLE_SOLICITANTE",
                        "ROLE_ADMINISTRADOR",
                        "ROLE_GESTOR_FROTA",
                        "ROLE_MOTORISTA")
                .forEach(
                        nome -> {
                            Role r = new Role();
                            r.setNome(nome);
                            roleRepository.save(r);
                        });
    }
}
