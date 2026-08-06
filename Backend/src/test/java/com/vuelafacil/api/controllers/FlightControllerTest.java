package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.dtos.FlightRequestDTO;
import com.vuelafacil.api.entities.Categoria;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.repositories.CategoriaRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests de Integración — levanta el contexto completo de Spring Boot
 * contra la base H2 en memoria, aislada del archivo de disco.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("FlightController - Tests de Integración")
class FlightControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private FlightRequestDTO flightValido;
    private Categoria categoriaMontana;

    @BeforeEach
    void setUp() {
        flightRepository.deleteAll();
        categoriaMontana = categoriaRepository.findByNombreIgnoreCase("Montaña")
                .orElseGet(() -> categoriaRepository.save(
                        new Categoria(null, "Montaña", "https://example.com/montania.jpg")));
        flightValido = new FlightRequestDTO(
                "Vuelo Promocional Bariloche Invierno",
                "Paquete completo con hotel y traslados incluidos en la cordillera.",
                "Bariloche, Argentina",
                "montaña",
                450.0,
                "USD",
                12,
                List.of("https://example.com/bariloche.jpg")
        );
    }

    private Flight guardarFlightValidoEnDb() {
        return flightRepository.save(new Flight(
                null,
                flightValido.getName(),
                flightValido.getDescription(),
                flightValido.getDestination(),
                categoriaMontana,
                flightValido.getPrice(),
                flightValido.getCurrency(),
                flightValido.getCapacity(),
                flightValido.getImages(),
                null
        ));
    }

    @Test
    @DisplayName("TC-04: POST /api/vuelos con payload válido retorna 201 y persiste en base de datos")
    @WithMockUser(roles = "ADMIN")
    void TC04_postVuelo_payloadValido_retorna201YPersiste() throws Exception {
        String payloadJson = objectMapper.writeValueAsString(flightValido);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Vuelo Promocional Bariloche Invierno"))
                .andExpect(jsonPath("$.destination").value("Bariloche, Argentina"))
                .andExpect(jsonPath("$.category").value("Montaña"))
                .andExpect(jsonPath("$.price").value(450.0))
                .andExpect(jsonPath("$.capacity").value(12))
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.images", hasSize(1)));

        List<Flight> vuelos = flightRepository.findAll();
        assertEquals(1, vuelos.size(), "Debe existir exactamente un vuelo en la base de datos");
        assertEquals("Vuelo Promocional Bariloche Invierno", vuelos.get(0).getName());
        assertEquals(categoriaMontana.getId(), vuelos.get(0).getCategoria().getId(),
                "El vuelo debe quedar vinculado por FK a la categoría");
    }

    @Test
    @DisplayName("TC-05: POST /api/vuelos con nombre duplicado retorna error y no crea duplicado en DB")
    @WithMockUser(roles = "ADMIN")
    void TC05_postVuelo_nombreDuplicado_retornaErrorYNoDuplica() throws Exception {
        guardarFlightValidoEnDb();

        FlightRequestDTO vuelo2 = new FlightRequestDTO(
                "Vuelo Promocional Bariloche Invierno", // mismo nombre
                "Otra descripción distinta.",
                "Bariloche, Argentina",
                "montaña",
                500.0,
                "USD",
                8,
                List.of("https://example.com/otra.jpg")
        );
        String payloadJson = objectMapper.writeValueAsString(vuelo2);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().is4xxClientError());
        assertEquals(1, flightRepository.count(), "No debe existir un registro duplicado en la DB");
    }

    @Test
    @DisplayName("TC-06: POST /api/vuelos sin campo 'name' retorna 400 Bad Request")
    @WithMockUser(roles = "ADMIN")
    void TC06_postVuelo_sinCampoName_retorna400() throws Exception {
        FlightRequestDTO vueloSinNombre = new FlightRequestDTO(
                null, // <- campo requerido ausente
                "Descripción válida del vuelo.",
                "Mendoza, Argentina",
                "montaña",
                300.0,
                "USD",
                10,
                List.of("https://example.com/mendoza.jpg")
        );
        String payloadJson = objectMapper.writeValueAsString(vueloSinNombre);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isBadRequest());
        assertEquals(0, flightRepository.count(), "La DB debe estar vacía tras un request inválido");
    }

    @Test
    @DisplayName("TC-07: POST /api/vuelos con categoría inexistente retorna 400 y no persiste")
    @WithMockUser(roles = "ADMIN")
    void TC07_postVuelo_categoriaInexistente_retorna400() throws Exception {
        flightValido.setCategory("categoria-fantasma");
        String payloadJson = objectMapper.writeValueAsString(flightValido);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isBadRequest());
        assertEquals(0, flightRepository.count(), "No debe persistirse un vuelo con categoría inexistente");
    }

    @Test
    @DisplayName("TC-11: DELETE /api/vuelos/{id} con ID existente retorna 204 y elimina de DB e imágenes")
    @WithMockUser(roles = "ADMIN")
    void TC11_deleteVuelo_idExistente_retorna204YEliminaDeDB() throws Exception {
        Flight vueloGuardado = guardarFlightValidoEnDb();
        Long idAEliminar = vueloGuardado.getId();
        assertEquals(1, flightRepository.count(), "Precondición: debe existir 1 vuelo antes del delete");

        mockMvc.perform(delete("/api/vuelos/{id}", idAEliminar))
                .andExpect(status().isNoContent());
        assertEquals(0, flightRepository.count(), "El vuelo debe haber sido eliminado de la base de datos");

        assertFalse(
                flightRepository.existsById(idAEliminar),
                "El ID eliminado no debe existir más en la base de datos"
        );
    }

    @Test
    @DisplayName("TC-12: POST /api/vuelos sin autenticación retorna 401")
    void TC12_postVuelo_sinToken_retorna401() throws Exception {
        String payloadJson = objectMapper.writeValueAsString(flightValido);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isUnauthorized());
        assertEquals(0, flightRepository.count(), "No debe crearse ningún vuelo sin autenticación");
    }

    @Test
    @DisplayName("TC-13: POST /api/vuelos con rol USER (no ADMIN) retorna 403")
    @WithMockUser(roles = "USER")
    void TC13_postVuelo_rolUsuario_retorna403() throws Exception {
        String payloadJson = objectMapper.writeValueAsString(flightValido);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isForbidden());
        assertEquals(0, flightRepository.count(), "No debe crearse ningún vuelo con rol insuficiente");
    }

    @Test
    @DisplayName("TC-14: PUT /api/vuelos/{id} con rol ADMIN actualiza el vuelo existente")
    @WithMockUser(roles = "ADMIN")
    void TC14_putVuelo_rolAdmin_actualizaVuelo() throws Exception {
        Flight guardado = guardarFlightValidoEnDb();

        FlightRequestDTO actualizado = new FlightRequestDTO(
                "Vuelo Bariloche Actualizado",
                "Descripción actualizada.",
                "Bariloche, Argentina",
                "montaña",
                600.0,
                "USD",
                20,
                List.of("https://example.com/nueva.jpg")
        );
        String payloadJson = objectMapper.writeValueAsString(actualizado);

        mockMvc.perform(put("/api/vuelos/{id}", guardado.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Vuelo Bariloche Actualizado"))
                .andExpect(jsonPath("$.price").value(600.0))
                .andExpect(jsonPath("$.capacity").value(20));

        Flight enDb = flightRepository.findById(guardado.getId()).orElseThrow();
        assertEquals("Vuelo Bariloche Actualizado", enDb.getName());
    }
}
