package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.FlightRequestDTO;
import com.vuelafacil.api.entities.Categoria;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.CategoriaRepository;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
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
@DisplayName("FlightService - Tests Unitarios")
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private CategoriaRepository categoriaRepository;

    @Mock
    private FavoritoRepository favoritoRepository;

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private ResenaRepository resenaRepository;

    @InjectMocks
    private FlightService flightService;

    private FlightRequestDTO datosValidos;
    private Categoria categoriaMontana;

    @BeforeEach
    void setUp() {
        categoriaMontana = new Categoria(1L, "Montaña", "https://example.com/montania.jpg");
        datosValidos = new FlightRequestDTO(
                "Vuelo Promocional Bariloche Invierno",
                "Paquete completo con hotel y traslados incluidos.",
                "Bariloche, Argentina",
                "montaña",
                450.0,
                "USD",
                12,
                List.of("https://example.com/bariloche.jpg")
        );
    }

    @Test
    @DisplayName("TC-01: Registrar vuelo con datos válidos guarda correctamente en la base de datos")
    void TC01_registrarVuelo_datosValidos_guardaYRetornaVuelo() {
        when(flightRepository.existsByName(datosValidos.getName().trim())).thenReturn(false);
        when(categoriaRepository.findByNombreIgnoreCase("montaña")).thenReturn(Optional.of(categoriaMontana));
        when(flightRepository.save(any(Flight.class))).thenAnswer(inv -> {
            Flight guardado = inv.getArgument(0);
            guardado.setId(1L);
            return guardado;
        });

        // Act
        Flight resultado = flightService.registrarVuelo(datosValidos);

        // Assert
        assertNotNull(resultado, "El vuelo retornado no debe ser nulo");
        assertEquals(1L, resultado.getId(), "Debe tener un ID asignado por la base de datos");
        assertEquals("Vuelo Promocional Bariloche Invierno", resultado.getName());
        assertEquals("Montaña", resultado.getCategory(), "La categoría debe resolverse contra la entidad Categoria");
        assertEquals(12, resultado.getCapacity());
        assertEquals(12, resultado.getAvailableSeats(), "Un vuelo nuevo tiene todos sus cupos libres");

        // Verifica que save() fue invocado exactamente una vez
        verify(flightRepository, times(1)).save(any(Flight.class));
    }

    @Test
    @DisplayName("TC-02: Registrar vuelo con nombre duplicado lanza BadRequestException y no guarda")
    void TC02_registrarVuelo_nombreDuplicado_lanzaExcepcion() {
        when(flightRepository.existsByName(datosValidos.getName().trim())).thenReturn(true);

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> flightService.registrarVuelo(datosValidos),
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
        datosValidos.setName("     ");

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> flightService.registrarVuelo(datosValidos),
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
    @DisplayName("TC-031: Registrar vuelo con una categoría inexistente lanza BadRequestException y no guarda")
    void TC031_registrarVuelo_categoriaInexistente_lanzaExcepcion() {
        datosValidos.setCategory("categoria-fantasma");
        when(flightRepository.existsByName(datosValidos.getName().trim())).thenReturn(false);
        when(categoriaRepository.findByNombreIgnoreCase("categoria-fantasma")).thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(
                BadRequestException.class,
                () -> flightService.registrarVuelo(datosValidos),
                "Debe lanzar BadRequestException cuando la categoría no existe"
        );

        assertTrue(
                ex.getMessage().contains("La categoría especificada no existe"),
                "El mensaje debe indicar que la categoría no existe"
        );
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
    @DisplayName("TC-091: Eliminar vuelo borra primero sus favoritos, reservas y reseñas asociadas")
    void TC091_eliminarVuelo_borraDependenciasAntesDeEliminarElVuelo() {
        Long idExistente = 1L;
        when(flightRepository.existsById(idExistente)).thenReturn(true);

        flightService.eliminarVuelo(idExistente);

        verify(favoritoRepository, times(1)).deleteByFlightId(idExistente);
        verify(reservaRepository, times(1)).deleteByFlightId(idExistente);
        verify(resenaRepository, times(1)).deleteByFlightId(idExistente);
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
