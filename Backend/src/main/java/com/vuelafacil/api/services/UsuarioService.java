package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserProvider currentUserProvider;

    public UsuarioService(UsuarioRepository usuarioRepository, RolRepository rolRepository,
                           PasswordEncoder passwordEncoder, CurrentUserProvider currentUserProvider) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public Usuario registrar(RegistroRequestDTO datos) {
        if (usuarioRepository.existsByEmail(datos.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("Ya existe una cuenta registrada con ese email.");
        }

        Rol rolUser = rolRepository.findByNombre(Rol.NombreRol.USER)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el rol USER."));

        Usuario usuario = new Usuario();
        usuario.setNombre(datos.getNombre().trim());
        usuario.setApellido(datos.getApellido().trim());
        usuario.setEmail(datos.getEmail().trim().toLowerCase());
        usuario.setPasswordHash(passwordEncoder.encode(datos.getPassword()));
        usuario.setRol(rolUser);

        return usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional
    public Usuario cambiarRol(Long usuarioId, String nuevoRolStr) {
        Usuario usuarioActual = currentUserProvider.obtenerUsuarioActual();
        if (usuarioActual.getId().equals(usuarioId)) {
            throw new BadRequestException("No podés modificar tu propio rol.");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("El usuario especificado no existe."));

        Rol.NombreRol nombreRol;
        try {
            nombreRol = Rol.NombreRol.valueOf(nuevoRolStr.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("El rol indicado no es válido. Debe ser ADMIN o USER.");
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el rol " + nombreRol + "."));

        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }
}
