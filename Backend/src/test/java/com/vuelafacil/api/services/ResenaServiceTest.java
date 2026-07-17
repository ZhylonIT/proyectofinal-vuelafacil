package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.ResenaPromedioDTO;
import com.vuelafacil.api.dtos.ResenaRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Resena;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ResenaService - Tests Unitarios")
class ResenaServiceTest {

    @Mock
    private ResenaRepository resenaRepository;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private ResenaService resenaService;

    private Usuario usuario;
    private Flight flight;

    @BeforeEach
    void setUp() {
        usuario = new Usuario(1L, "Ana", "Gomez", "ana@test.com", "hash", new Rol(1L, Rol.NombreRol.USER));
        flight = new Flight(10L, "Vuelo Test", "desc", "Bariloche", "montaña", 100.0, "USD", List.of("img.jpg"));
    }

    @Test
    @DisplayName("TC-01: Crear reseña válida se guarda correctamente")
    void TC01_crear_datosValidos_guardaCorrectamente() {
        ResenaRequestDTO datos = new ResenaRequestDTO();
        datos.setRating(5);
        datos.setComentario("Excelente viaje");

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(resenaRepository.existsByUsuarioIdAndFlightId(1L, 10L)).thenReturn(false);
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(resenaRepository.save(any(Resena.class))).thenAnswer(inv -> inv.getArgument(0));

        Resena resultado = resenaService.crear(10L, datos);

        assertEquals(5, resultado.getRating());
        assertEquals("Excelente viaje", resultado.getComentario());
        verify(resenaRepository, times(1)).save(any(Resena.class));
    }

    @Test
    @DisplayName("TC-02: Crear una segunda reseña para el mismo vuelo lanza BadRequestException")
    void TC02_crear_resenaDuplicada_lanzaExcepcion() {
        ResenaRequestDTO datos = new ResenaRequestDTO();
        datos.setRating(4);
        datos.setComentario("Otra vez");

        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(resenaRepository.existsByUsuarioIdAndFlightId(1L, 10L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> resenaService.crear(10L, datos));
        verify(resenaRepository, never()).save(any(Resena.class));
    }

    @Test
    @DisplayName("TC-03: Listar reseñas por vuelo calcula el promedio correctamente")
    void TC03_listarPorVuelo_calculaPromedioCorrectamente() {
        Resena r1 = new Resena(1L, usuario, flight, 5, "Genial", LocalDateTime.now());
        Resena r2 = new Resena(2L, usuario, flight, 3, "Bien", LocalDateTime.now());
        when(resenaRepository.findByFlightIdOrderByFechaDesc(10L)).thenReturn(List.of(r1, r2));

        ResenaPromedioDTO resultado = resenaService.listarPorVuelo(10L);

        assertEquals(4.0, resultado.getPromedio());
        assertEquals(2L, resultado.getCantidad());
        assertEquals(2, resultado.getResenas().size());
    }
}
