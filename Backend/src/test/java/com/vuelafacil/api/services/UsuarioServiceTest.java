package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UsuarioService - Tests Unitarios")
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private RolRepository rolRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private UsuarioService usuarioService;

    private RegistroRequestDTO datosValidos;
    private Rol rolUser;
    private Rol rolAdmin;

    @BeforeEach
    void setUp() {
        datosValidos = new RegistroRequestDTO();
        datosValidos.setNombre("Ana");
        datosValidos.setApellido("Gomez");
        datosValidos.setEmail("ana@test.com");
        datosValidos.setPassword("12345678");

        rolUser = new Rol(1L, Rol.NombreRol.USER);
        rolAdmin = new Rol(2L, Rol.NombreRol.ADMIN);
    }

    @Test
    @DisplayName("TC-01: Registrar usuario con datos válidos encripta la contraseña y asigna rol USER")
    void TC01_registrar_datosValidos_encriptaYAsignaRolUser() {
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(rolRepository.findByNombre(Rol.NombreRol.USER)).thenReturn(Optional.of(rolUser));
        when(passwordEncoder.encode("12345678")).thenReturn("hash-encriptado");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.registrar(datosValidos);

        assertEquals("ana@test.com", resultado.getEmail());
        assertEquals("hash-encriptado", resultado.getPasswordHash());
        assertEquals(Rol.NombreRol.USER, resultado.getRol().getNombre());
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
    }

    @Test
    @DisplayName("TC-02: Registrar usuario con email ya existente lanza BadRequestException y no guarda")
    void TC02_registrar_emailDuplicado_lanzaExcepcion() {
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> usuarioService.registrar(datosValidos));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("TC-03: Cambiar rol de otro usuario a ADMIN actualiza correctamente")
    void TC03_cambiarRol_otroUsuario_actualizaCorrectamente() {
        Usuario admin = new Usuario(1L, "Admin", "Vuela Fácil", "admin@vuelafacil.com", "hash", rolAdmin);
        Usuario usuarioObjetivo = new Usuario(2L, "Ana", "Gomez", "ana@test.com", "hash", rolUser);

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(admin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioObjetivo));
        when(rolRepository.findByNombre(Rol.NombreRol.ADMIN)).thenReturn(Optional.of(rolAdmin));
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(inv -> inv.getArgument(0));

        Usuario resultado = usuarioService.cambiarRol(2L, "ADMIN");

        assertEquals(Rol.NombreRol.ADMIN, resultado.getRol().getNombre());
        verify(usuarioRepository, times(1)).save(usuarioObjetivo);
    }

    @Test
    @DisplayName("TC-04: Cambiar el propio rol lanza BadRequestException")
    void TC04_cambiarRol_propioUsuario_lanzaExcepcion() {
        Usuario admin = new Usuario(1L, "Admin", "Vuela Fácil", "admin@vuelafacil.com", "hash", rolAdmin);
        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(admin);

        assertThrows(BadRequestException.class, () -> usuarioService.cambiarRol(1L, "USER"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }

    @Test
    @DisplayName("TC-05: Cambiar rol con un valor inválido lanza BadRequestException")
    void TC05_cambiarRol_valorInvalido_lanzaExcepcion() {
        Usuario admin = new Usuario(1L, "Admin", "Vuela Fácil", "admin@vuelafacil.com", "hash", rolAdmin);
        Usuario usuarioObjetivo = new Usuario(2L, "Ana", "Gomez", "ana@test.com", "hash", rolUser);

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(admin);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(usuarioObjetivo));

        assertThrows(BadRequestException.class, () -> usuarioService.cambiarRol(2L, "SUPERADMIN"));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
