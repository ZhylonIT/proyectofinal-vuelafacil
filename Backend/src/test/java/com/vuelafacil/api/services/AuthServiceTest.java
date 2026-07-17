package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.AuthResponseDTO;
import com.vuelafacil.api.dtos.LoginRequestDTO;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.InvalidCredentialsException;
import com.vuelafacil.api.repositories.UsuarioRepository;
import com.vuelafacil.api.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService - Tests Unitarios")
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private UsuarioService usuarioService;

    @InjectMocks
    private AuthService authService;

    private Usuario usuario;
    private LoginRequestDTO loginValido;

    @BeforeEach
    void setUp() {
        Rol rolUser = new Rol(1L, Rol.NombreRol.USER);
        usuario = new Usuario(1L, "Ana", "Gomez", "ana@test.com", "hash", rolUser);

        loginValido = new LoginRequestDTO();
        loginValido.setEmail("ana@test.com");
        loginValido.setPassword("12345678");
    }

    @Test
    @DisplayName("TC-01: Login con credenciales válidas retorna token y datos del usuario")
    void TC01_login_credencialesValidas_retornaToken() {
        when(usuarioRepository.findByEmail("ana@test.com")).thenReturn(Optional.of(usuario));
        when(jwtService.generarToken(any(UserDetails.class))).thenReturn("token-jwt-generado");

        AuthResponseDTO resultado = authService.login(loginValido);

        assertEquals("token-jwt-generado", resultado.getToken());
        assertEquals("ana@test.com", resultado.getUsuario().getEmail());
    }

    @Test
    @DisplayName("TC-02: Login con credenciales inválidas lanza InvalidCredentialsException")
    void TC02_login_credencialesInvalidas_lanzaExcepcion() {
        doThrow(new BadCredentialsException("bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(loginValido));
        verify(jwtService, never()).generarToken(any());
    }
}
