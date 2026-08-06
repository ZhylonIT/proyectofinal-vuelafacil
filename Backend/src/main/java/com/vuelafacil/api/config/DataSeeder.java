package com.vuelafacil.api.config;

import com.vuelafacil.api.entities.Caracteristica;
import com.vuelafacil.api.entities.Categoria;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.repositories.CaracteristicaRepository;
import com.vuelafacil.api.repositories.CategoriaRepository;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@vuelafacil.com";
    private static final String ADMIN_PASSWORD_INICIAL = "Admin123!";
    private static final int CAPACIDAD_POR_DEFECTO = 10;
    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final CaracteristicaRepository caracteristicaRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(RolRepository rolRepository, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
                      CategoriaRepository categoriaRepository, CaracteristicaRepository caracteristicaRepository,
                      JdbcTemplate jdbcTemplate) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoriaRepository = categoriaRepository;
        this.caracteristicaRepository = caracteristicaRepository;
        this.jdbcTemplate = jdbcTemplate;
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

        if (categoriaRepository.count() == 0) {
            categoriaRepository.saveAll(List.of(
                    new Categoria(null, "Playa", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80"),
                    new Categoria(null, "Montaña", "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=80"),
                    new Categoria(null, "Ciudad", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=500&q=80"),
                    new Categoria(null, "Histórico", "https://images.unsplash.com/photo-1599946347371-68eb71b16afc?auto=format&fit=crop&w=500&q=80"),
                    new Categoria(null, "Naturaleza", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=500&q=80")
            ));
        }

        if (caracteristicaRepository.count() == 0) {
            caracteristicaRepository.saveAll(List.of(
                    new Caracteristica(null, "Apto Familia", "👨‍👩‍👧‍👦"),
                    new Caracteristica(null, "Aventura Extrema", "🧗"),
                    new Caracteristica(null, "Relajación Total", "💆"),
                    new Caracteristica(null, "Wifi", "📶")
            ));
        }

        migrarVuelosLegacy();
    }

    private void migrarVuelosLegacy() {
        Integer columnaLegacy = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_NAME = 'FLIGHTS' AND COLUMN_NAME = 'CATEGORY'",
                Integer.class);

        if (columnaLegacy != null && columnaLegacy > 0) {
            jdbcTemplate.execute("ALTER TABLE FLIGHTS ALTER COLUMN CATEGORY SET NULL");
            jdbcTemplate.update(
                    "UPDATE FLIGHTS f SET CATEGORIA_ID = " +
                    "(SELECT c.ID FROM CATEGORIAS c WHERE LOWER(c.NOMBRE) = LOWER(f.CATEGORY)) " +
                    "WHERE f.CATEGORIA_ID IS NULL AND f.CATEGORY IS NOT NULL");
        }

        jdbcTemplate.update("UPDATE FLIGHTS SET CAPACITY = ? WHERE CAPACITY IS NULL", CAPACIDAD_POR_DEFECTO);
    }
}
