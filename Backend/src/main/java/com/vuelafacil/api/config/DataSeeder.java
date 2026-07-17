package com.vuelafacil.api.config;

import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@vuelafacil.com";
    private static final String ADMIN_PASSWORD_INICIAL = "Admin123!";

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RolRepository rolRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        Rol rolAdmin = rolRepository.findByNombre(Rol.NombreRol.ADMIN)
                .orElseGet(() -> rolRepository.save(new Rol(null, Rol.NombreRol.ADMIN)));
        rolRepository.findByNombre(Rol.NombreRol.USER)
                .orElseGet(() -> rolRepository.save(new Rol(null, Rol.NombreRol.USER)));

        if (!usuarioRepository.existsByEmail(ADMIN_EMAIL)) {
            Usuario admin = new Usuario();
            admin.setNombre("Admin");
            admin.setApellido("Vuela Fácil");
            admin.setEmail(ADMIN_EMAIL);
            admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD_INICIAL));
            admin.setRol(rolAdmin);
            usuarioRepository.save(admin);
        }
    }
}
