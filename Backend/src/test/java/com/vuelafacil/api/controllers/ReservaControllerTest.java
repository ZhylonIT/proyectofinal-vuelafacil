package com.vuelafacil.api.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vuelafacil.api.dtos.AuthResponseDTO;
import com.vuelafacil.api.dtos.RegistroRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
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

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@DisplayName("ReservaController - Tests de Integración")
class ReservaControllerTest {

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
    private ReservaRepository reservaRepository;

    private String token;
    private Long flightId;
    private final String fechaIdaFutura = LocalDate.now().plusDays(10).toString();
    private final String fechaVueltaFutura = LocalDate.now().plusDays(20).toString();

    @BeforeEach
    void setUp() throws Exception {
        reservaRepository.deleteAll();
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
    @DisplayName("TC-01: Crear reserva con token válido retorna 201 con precio copiado del vuelo")
    void TC01_crear_conToken_retorna201ConPrecioCopiado() throws Exception {
        String payload = "{\"flightId\":" + flightId + ",\"fechaIda\":\"" + fechaIdaFutura + "\",\"fechaVuelta\":\"" + fechaVueltaFutura + "\"}";

        mockMvc.perform(post("/api/reservas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.precioAlMomento").value(100.0))
                .andExpect(jsonPath("$.monedaAlMomento").value("USD"))
                .andExpect(jsonPath("$.estado").value("CONFIRMADA"));
    }

    @Test
    @DisplayName("TC-02: Crear reserva sin token retorna 401")
    void TC02_crear_sinToken_retorna401() throws Exception {
        String payload = "{\"flightId\":" + flightId + ",\"fechaIda\":\"" + fechaIdaFutura + "\"}";

        mockMvc.perform(post("/api/reservas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-03: Listar mis reservas retorna solo las del usuario autenticado")
    void TC03_listarMisReservas_retornaSoloPropias() throws Exception {
        String payload = "{\"flightId\":" + flightId + ",\"fechaIda\":\"" + fechaIdaFutura + "\"}";
        mockMvc.perform(post("/api/reservas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/reservas/mias").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @DisplayName("TC-04: Cancelar una reserva propia cambia su estado a CANCELADA")
    void TC04_cancelar_reservaPropia_cambiaEstado() throws Exception {
        String payload = "{\"flightId\":" + flightId + ",\"fechaIda\":\"" + fechaIdaFutura + "\"}";
        String creada = mockMvc.perform(post("/api/reservas")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andReturn().getResponse().getContentAsString();

        Long reservaId = objectMapper.readTree(creada).get("id").asLong();

        mockMvc.perform(delete("/api/reservas/{id}", reservaId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());

        assertEquals(com.vuelafacil.api.entities.Reserva.EstadoReserva.CANCELADA,
                reservaRepository.findById(reservaId).orElseThrow().getEstado());
    }
}
