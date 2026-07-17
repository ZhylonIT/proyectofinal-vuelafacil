package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.ReservaRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Reserva;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ReservaService - Tests Unitarios")
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private ReservaService reservaService;

    private Usuario usuario;
    private Flight flight;

    @BeforeEach
    void setUp() {
        usuario = new Usuario(1L, "Ana", "Gomez", "ana@test.com", "hash", new Rol(1L, Rol.NombreRol.USER));
        flight = new Flight(10L, "Vuelo Test", "desc", "Bariloche", "montaña", 100.0, "USD", List.of("img.jpg"));
    }

    @Test
    @DisplayName("TC-01: Crear reserva válida copia el precio y moneda del vuelo al momento de reservar")
    void TC01_crear_datosValidos_copiaPrecioYMoneda() {
        ReservaRequestDTO datos = new ReservaRequestDTO();
        datos.setFlightId(10L);
        datos.setFechaIda(LocalDate.of(2026, 8, 1));
        datos.setFechaVuelta(LocalDate.of(2026, 8, 10));

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(inv -> inv.getArgument(0));

        Reserva resultado = reservaService.crear(datos);

        assertEquals(100.0, resultado.getPrecioAlMomento());
        assertEquals("USD", resultado.getMonedaAlMomento());
        assertEquals(Reserva.EstadoReserva.CONFIRMADA, resultado.getEstado());
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    @DisplayName("TC-02: Crear reserva con fecha de vuelta anterior a la ida lanza BadRequestException")
    void TC02_crear_fechaVueltaAnteriorAIda_lanzaExcepcion() {
        ReservaRequestDTO datos = new ReservaRequestDTO();
        datos.setFlightId(10L);
        datos.setFechaIda(LocalDate.of(2026, 8, 10));
        datos.setFechaVuelta(LocalDate.of(2026, 8, 1));

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));

        assertThrows(BadRequestException.class, () -> reservaService.crear(datos));
        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    @DisplayName("TC-03: Cancelar reserva de otro usuario lanza BadRequestException")
    void TC03_cancelar_reservaDeOtroUsuario_lanzaExcepcion() {
        Usuario otroUsuario = new Usuario(2L, "Luis", "Perez", "luis@test.com", "hash", new Rol(2L, Rol.NombreRol.USER));
        Reserva reservaAjena = new Reserva(5L, otroUsuario, flight, LocalDate.now(), null,
                java.time.LocalDateTime.now(), Reserva.EstadoReserva.CONFIRMADA, 100.0, "USD");

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(reservaRepository.findById(5L)).thenReturn(Optional.of(reservaAjena));

        assertThrows(BadRequestException.class, () -> reservaService.cancelar(5L));
        verify(reservaRepository, never()).save(any(Reserva.class));
    }
}
