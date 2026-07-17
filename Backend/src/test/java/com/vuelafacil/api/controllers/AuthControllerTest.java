package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.dtos.LoginRequestDTO;
import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
import com.vuelafacil.api.entities.Rol;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("AuthController - Tests de Integración")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        rolRepository.flush();
        rolRepository.save(new Rol(null, Rol.NombreRol.USER));
        rolRepository.save(new Rol(null, Rol.NombreRol.ADMIN));
    }

    private RegistroRequestDTO datosRegistro() {
        RegistroRequestDTO datos = new RegistroRequestDTO();
        datos.setNombre("Ana");
        datos.setApellido("Gomez");
        datos.setEmail("ana@test.com");
        datos.setPassword("12345678");
        return datos;
    }

    @Test
    @DisplayName("TC-01: Registro con datos válidos retorna 201 con token y usuario sin passwordHash")
    void TC01_registro_datosValidos_retorna201ConTokenYUsuario() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosRegistro())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.email").value("ana@test.com"))
                .andExpect(jsonPath("$.usuario.rol").value("USER"))
                .andExpect(jsonPath("$.usuario.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("TC-02: Registro con email duplicado retorna 400")
    void TC02_registro_emailDuplicado_retorna400() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosRegistro())))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosRegistro())))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-03: Login con credenciales válidas retorna 200 con token")
    void TC03_login_credencialesValidas_retorna200ConToken() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosRegistro())));

        LoginRequestDTO login = new LoginRequestDTO();
        login.setEmail("ana@test.com");
        login.setPassword("12345678");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("TC-04: Login con contraseña incorrecta retorna 401")
    void TC04_login_passwordIncorrecta_retorna401() throws Exception {
        mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(datosRegistro())));

        LoginRequestDTO login = new LoginRequestDTO();
        login.setEmail("ana@test.com");
        login.setPassword("password-incorrecta");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }
}
