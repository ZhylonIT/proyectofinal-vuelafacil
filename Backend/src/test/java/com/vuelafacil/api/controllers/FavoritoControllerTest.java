package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.dtos.AuthResponseDTO;
import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.RolRepository;
import com.vuelafacil.api.repositories.UsuarioRepository;
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

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("FavoritoController - Tests de Integración")
class FavoritoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FavoritoRepository favoritoRepository;

    private String token;
    private Long flightId;

    @BeforeEach
    void setUp() throws Exception {
        favoritoRepository.deleteAll();
        usuarioRepository.deleteAll();
        rolRepository.deleteAll();
        rolRepository.flush();
        rolRepository.save(new Rol(null, Rol.NombreRol.USER));
        rolRepository.save(new Rol(null, Rol.NombreRol.ADMIN));

        RegistroRequestDTO registro = new RegistroRequestDTO();
        registro.setNombre("Ana");
        registro.setApellido("Gomez");
        registro.setEmail("ana@test.com");
        registro.setPassword("12345678");

        String response = mockMvc.perform(post("/api/auth/registro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registro)))
                .andReturn().getResponse().getContentAsString();
        token = objectMapper.readValue(response, AuthResponseDTO.class).getToken();

        Flight flight = flightRepository.save(new Flight(null, "Vuelo Test", "desc", "Bariloche",
                "montaña", 100.0, "USD", List.of("img.jpg")));
        flightId = flight.getId();
    }

    @Test
    @DisplayName("TC-01: Agregar favorito con token válido retorna 201")
    void TC01_agregar_conToken_retorna201() throws Exception {
        mockMvc.perform(post("/api/favoritos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"flightId\":" + flightId + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.flightId").value(flightId));
    }

    @Test
    @DisplayName("TC-02: Agregar favorito sin token retorna 401")
    void TC02_agregar_sinToken_retorna401() throws Exception {
        mockMvc.perform(post("/api/favoritos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"flightId\":" + flightId + "}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-03: Agregar el mismo favorito dos veces retorna 400 en el segundo intento")
    void TC03_agregar_duplicado_retorna400() throws Exception {
        mockMvc.perform(post("/api/favoritos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"flightId\":" + flightId + "}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/favoritos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"flightId\":" + flightId + "}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC-04: Listar y eliminar favoritos propios funciona correctamente")
    void TC04_listarYEliminar_favoritosPropios() throws Exception {
        mockMvc.perform(post("/api/favoritos")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"flightId\":" + flightId + "}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/favoritos/mios").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(delete("/api/favoritos/{flightId}", flightId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertEquals(0, favoritoRepository.findByUsuarioId(usuarioRepository.findByEmail("ana@test.com").orElseThrow().getId()).size());
    }
}
