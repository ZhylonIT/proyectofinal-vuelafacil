package com.vuelafacil.api.services;

import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FlightRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FlightService - Tests Unitarios")
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private FlightService flightService;

    private Flight flightValido;

    @BeforeEach
    void setUp() {
        flightValido = new Flight(
                null,
                "Vuelo Promocional Bariloche Invierno",
                "Paquete completo con hotel y traslados incluidos.",
                "Bariloche, Argentina",
                "montaña",
                450.0,
                "USD",
                List.of("https://example.com/bariloche.jpg")
        );
    }

    @Test
    @DisplayName("TC-01: Registrar vuelo con datos válidos guarda correctamente en la base de datos")
    void TC01_registrarVuelo_datosValidos_guardaYRetornaVuelo() {
        Flight flightConId = new Flight(
                1L,
                flightValido.getName(),
                flightValido.getDescription(),
                flightValido.getDestination(),
                flightValido.getCategory(),
                flightValido.getPrice(),
                flightValido.getCurrency(),
                flightValido.getImages()
        );
        when(flightRepository.existsByName(flightValido.getName().trim())).thenReturn(false);
        when(flightRepository.save(any(Flight.class))).thenReturn(flightConId);

        // Act
        Flight resultado = flightService.registrarVuelo(flightValido);

        // Assert
        assertNotNull(resultado, "El vuelo retornado no debe ser nulo");
        assertEquals(1L, resultado.getId(), "Debe tener un ID asignado por la base de datos");
        assertEquals("Vuelo Promocional Bariloche Invierno", resultado.getName());

        // Verifica que save() fue invocado exactamente una vez
        verify(flightRepository, times(1)).save(any(Flight.class));
    }

    @Test
    @DisplayName("TC-02: Registrar vuelo con nombre duplicado lanza BadRequestException y no guarda")
    void TC02_registrarVuelo_nombreDuplicado_lanzaExcepcion() {
        when(flightRepository.existsByName(flightValido.getName().trim())).thenReturn(true);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> flightService.registrarVuelo(flightValido),
                "Debe lanzar BadRequestException cuando el nombre ya existe"
        );

        assertTrue(
                ex.getMessage().contains("Ya existe un vuelo registrado con ese nombre"),
                "El mensaje de error debe indicar el nombre duplicado"
        );

        verify(flightRepository, never()).save(any(Flight.class));
    }

    @Test
    @DisplayName("TC-03: Registrar vuelo con nombre de solo espacios en blanco lanza BadRequestException")
    void TC03_registrarVuelo_nombreSoloEspacios_lanzaExcepcion() {
        flightValido.setName("     ");

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> flightService.registrarVuelo(flightValido),
                "Debe lanzar BadRequestException cuando el nombre es solo espacios"
        );
        assertEquals(
                "El nombre del vuelo es un campo obligatorio.",
                ex.getMessage()
        );

        verify(flightRepository, never()).existsByName(any());
        verify(flightRepository, never()).save(any(Flight.class));
    }

    @Test
    @DisplayName("TC-09: Eliminar vuelo con ID existente invoca deleteById y no lanza excepciones")
    void TC09_eliminarVuelo_idExistente_eliminaCorrectamente() {
        Long idExistente = 1L;
        when(flightRepository.existsById(idExistente)).thenReturn(true);
        doNothing().when(flightRepository).deleteById(idExistente);
        assertDoesNotThrow(
                () -> flightService.eliminarVuelo(idExistente),
                "No debe lanzar excepción al eliminar un vuelo existente"
        );
        verify(flightRepository, times(1)).deleteById(idExistente);
    }

    @Test
    @DisplayName("TC-10: Eliminar vuelo con ID inexistente lanza ResourceNotFoundException y no invoca deleteById")
    void TC10_eliminarVuelo_idInexistente_lanzaExcepcion() {
        Long idInexistente = 999L;
        when(flightRepository.existsById(idInexistente)).thenReturn(false);
        ResourceNotFoundException ex = assertThrows(
                ResourceNotFoundException.class,
                () -> flightService.eliminarVuelo(idInexistente),
                "Debe lanzar ResourceNotFoundException para un ID que no existe"
        );

        assertTrue(
                ex.getMessage().contains("No se puede eliminar"),
                "El mensaje debe indicar que no se puede eliminar"
        );
        verify(flightRepository, never()).deleteById(any());
    }
}