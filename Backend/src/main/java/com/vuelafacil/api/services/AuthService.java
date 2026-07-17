package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.AuthResponseDTO;
import com.vuelafacil.api.dtos.LoginRequestDTO;
import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.dtos.UsuarioResponseDTO;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.InvalidCredentialsException;
import com.vuelafacil.api.repositories.UsuarioRepository;
import com.vuelafacil.api.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final UsuarioService usuarioService;

    public AuthService(AuthenticationManager authenticationManager,
                        UsuarioRepository usuarioRepository,
                        JwtService jwtService,
                        UsuarioService usuarioService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.jwtService = jwtService;
        this.usuarioService = usuarioService;
    }

    public AuthResponseDTO registrar(RegistroRequestDTO datos) {
        Usuario usuario = usuarioService.registrar(datos);
        String token = jwtService.generarToken(aUserDetails(usuario));
        return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(usuario));
    }

    public AuthResponseDTO login(LoginRequestDTO datos) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(datos.getEmail().trim().toLowerCase(), datos.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new InvalidCredentialsException("Email o contraseña incorrectos.");
        }

        Usuario usuario = usuarioRepository.findByEmail(datos.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Email o contraseña incorrectos."));

        String token = jwtService.generarToken(aUserDetails(usuario));
        return new AuthResponseDTO(token, UsuarioResponseDTO.fromEntity(usuario));
    }

    private UserDetails aUserDetails(Usuario usuario) {
        return org.springframework.security.core.userdetails.User
                .withUsername(usuario.getEmail())
                .password(usuario.getPasswordHash())
                .authorities("ROLE_" + usuario.getRol().getNombre().name())
                .build();
    }
}
