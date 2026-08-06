package com.vuelafacil.api.services;

import com.vuelafacil.api.entities.Favorito;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Rol;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FavoritoService - Tests Unitarios")
class FavoritoServiceTest {

    @Mock
    private FavoritoRepository favoritoRepository;

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private CurrentUserProvider currentUserProvider;

    @InjectMocks
    private FavoritoService favoritoService;

    private Usuario usuario;
    private Flight flight;

    @BeforeEach
    void setUp() {
        usuario = new Usuario(1L, "Ana", "Gomez", "ana@test.com", "hash", new Rol(1L, Rol.NombreRol.USER));
        flight = new Flight(10L, "Vuelo Test", "desc", "Bariloche", null, 100.0, "USD", 10, List.of("img.jpg"), null);
    }

    @Test
    @DisplayName("TC-01: Agregar favorito nuevo lo guarda correctamente")
    void TC01_agregar_favoritoNuevo_guardaCorrectamente() {
        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(favoritoRepository.existsByUsuarioIdAndFlightId(1L, 10L)).thenReturn(false);
        when(flightRepository.findById(10L)).thenReturn(Optional.of(flight));
        when(favoritoRepository.save(any(Favorito.class))).thenAnswer(inv -> inv.getArgument(0));

        Favorito resultado = favoritoService.agregar(10L);

        assertEquals(usuario, resultado.getUsuario());
        assertEquals(flight, resultado.getFlight());
        verify(favoritoRepository, times(1)).save(any(Favorito.class));
    }

    @Test
    @DisplayName("TC-02: Agregar favorito duplicado lanza BadRequestException")
    void TC02_agregar_favoritoDuplicado_lanzaExcepcion() {
        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(favoritoRepository.existsByUsuarioIdAndFlightId(1L, 10L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> favoritoService.agregar(10L));
        verify(favoritoRepository, never()).save(any(Favorito.class));
    }

    @Test
    @DisplayName("TC-03: Quitar favorito inexistente lanza ResourceNotFoundException")
    void TC03_quitar_favoritoInexistente_lanzaExcepcion() {
        when(currentUserProvider.obtenerUsuarioActual()).thenReturn(usuario);
        when(favoritoRepository.findByUsuarioIdAndFlightId(1L, 10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> favoritoService.quitar(10L));
        verify(favoritoRepository, never()).delete(any(Favorito.class));
    }
}
