package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.repositories.FlightRepository;
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
    private ObjectMapper objectMapper;

    private Flight flightValido;

    @BeforeEach
    void setUp() {
        flightRepository.deleteAll();
        flightValido = new Flight(
                null,
                "Vuelo Promocional Bariloche Invierno",
                "Paquete completo con hotel y traslados incluidos en la cordillera.",
                "Bariloche, Argentina",
                "montaña",
                450.0,
                "USD",
                List.of("https://example.com/bariloche.jpg")
        );
    }

    @Test
    @DisplayName("TC-04: POST /api/vuelos con payload válido retorna 201 y persiste en base de datos")
    void TC04_postVuelo_payloadValido_retorna201YPersiste() throws Exception {
        String payloadJson = objectMapper.writeValueAsString(flightValido);

        mockMvc.perform(post("/api/vuelos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payloadJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Vuelo Promocional Bariloche Invierno"))
                .andExpect(jsonPath("$.destination").value("Bariloche, Argentina"))
                .andExpect(jsonPath("$.price").value(450.0))
                .andExpect(jsonPath("$.images", hasSize(1)));

        List<Flight> vuelos = flightRepository.findAll();
        assertEquals(1, vuelos.size(), "Debe existir exactamente un vuelo en la base de datos");
        assertEquals("Vuelo Promocional Bariloche Invierno", vuelos.get(0).getName());
    }

    @Test
    @DisplayName("TC-05: POST /api/vuelos con nombre duplicado retorna error y no crea duplicado en DB")
    void TC05_postVuelo_nombreDuplicado_retornaErrorYNoDuplica() throws Exception {
        flightRepository.save(flightValido);

        Flight vuelo2 = new Flight(
                null,
                "Vuelo Promocional Bariloche Invierno", // mismo nombre
                "Otra descripción distinta.",
                "Bariloche, Argentina",
                "montaña",
                500.0,
                "USD",
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
    void TC06_postVuelo_sinCampoName_retorna400() throws Exception {
        Flight vueloSinNombre = new Flight(
                null,
                null, // <- campo requerido ausente
                "Descripción válida del vuelo.",
                "Mendoza, Argentina",
                "montaña",
                300.0,
                "USD",
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
    @DisplayName("TC-11: DELETE /api/vuelos/{id} con ID existente retorna 204 y elimina de DB e imágenes")
    void TC11_deleteVuelo_idExistente_retorna204YEliminaDeDB() throws Exception {
        Flight vueloGuardado = flightRepository.save(flightValido);
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
}