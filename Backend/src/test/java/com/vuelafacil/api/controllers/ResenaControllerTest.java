package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.dtos.AuthResponseDTO;
import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ResenaController - Tests de Integración")
class ResenaControllerTest {

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
    private ResenaRepository resenaRepository;

    private String token;
    private Long flightId;

    @BeforeEach
    void setUp() throws Exception {
        resenaRepository.deleteAll();
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
                null, 100.0, "USD", 10, List.of("img.jpg"), null));
        flightId = flight.getId();
    }

    @Test
    @DisplayName("TC-01: Crear reseña con token válido retorna 201")
    void TC01_crear_conToken_retorna201() throws Exception {
        mockMvc.perform(post("/api/vuelos/{id}/resenas", flightId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"comentario\":\"Excelente\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.rating").value(5))
                .andExpect(jsonPath("$.nombreUsuario").value("Ana Gomez"));
    }

    @Test
    @DisplayName("TC-02: Crear reseña sin token retorna 401")
    void TC02_crear_sinToken_retorna401() throws Exception {
        mockMvc.perform(post("/api/vuelos/{id}/resenas", flightId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"comentario\":\"Excelente\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-03: Listar reseñas de un vuelo es público y calcula el promedio")
    void TC03_listarPorVuelo_esPublicoYCalculaPromedio() throws Exception {
        mockMvc.perform(post("/api/vuelos/{id}/resenas", flightId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":4,\"comentario\":\"Muy bueno\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/vuelos/{id}/resenas", flightId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promedio").value(4.0))
                .andExpect(jsonPath("$.cantidad").value(1));
    }

    @Test
    @DisplayName("TC-04: Crear una segunda reseña para el mismo vuelo retorna 400")
    void TC04_crear_resenaDuplicada_retorna400() throws Exception {
        mockMvc.perform(post("/api/vuelos/{id}/resenas", flightId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"comentario\":\"Excelente\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/vuelos/{id}/resenas", flightId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":3,\"comentario\":\"De nuevo\"}"))
                .andExpect(status().isBadRequest());
    }
}
