package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.FlightRequestDTO;
import com.vuelafacil.api.entities.Categoria;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Reserva;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.CategoriaRepository;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FlightService {

    private final FlightRepository flightRepository;
    private final CategoriaRepository categoriaRepository;
    private final FavoritoRepository favoritoRepository;
    private final ReservaRepository reservaRepository;
    private final ResenaRepository resenaRepository;

    @Autowired
    public FlightService(FlightRepository flightRepository, CategoriaRepository categoriaRepository,
                          FavoritoRepository favoritoRepository, ReservaRepository reservaRepository,
                          ResenaRepository resenaRepository) {
        this.flightRepository = flightRepository;
        this.categoriaRepository = categoriaRepository;
        this.favoritoRepository = favoritoRepository;
        this.reservaRepository = reservaRepository;
        this.resenaRepository = resenaRepository;
    }

    @Transactional(readOnly = true)
    public List<Flight> obtenerTodosLosVuelos() {
        List<Flight> vuelos = flightRepository.findAll();
        completarDisponibilidad(vuelos);
        return vuelos;
    }

    @Transactional(readOnly = true)
    public Flight obtenerVueloPorId(Long id) {
        Flight vuelo = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El vuelo con el ID solicitado no existe."));
        completarDisponibilidad(List.of(vuelo));
        return vuelo;
    }

    @Transactional(readOnly = true)
    public List<Flight> obtenerRecomendacionesAleatorias() {
        List<Flight> todos = flightRepository.findAll();
        List<Flight> listaModificable = new ArrayList<>(todos);
        Collections.shuffle(listaModificable);
        List<Flight> seleccion = listaModificable.size() > 10
                ? listaModificable.subList(0, 10)
                : listaModificable;
        completarDisponibilidad(seleccion);
        return seleccion;
    }

    @Transactional
    public Flight registrarVuelo(FlightRequestDTO datos) {
        if (datos.getName() == null || datos.getName().trim().isEmpty()) {
            throw new BadRequestException("El nombre del vuelo es un campo obligatorio.");
        }

        String nombre = datos.getName().trim();
        if (flightRepository.existsByName(nombre)) {
            throw new BadRequestException("Ya existe un vuelo registrado con ese nombre exacto.");
        }

        Flight flight = new Flight();
        flight.setName(nombre);
        flight.setDescription(datos.getDescription());
        flight.setDestination(datos.getDestination());
        flight.setCategoria(resolverCategoria(datos.getCategory()));
        flight.setPrice(datos.getPrice());
        flight.setCurrency(datos.getCurrency());
        flight.setCapacity(datos.getCapacity());
        flight.setImages(datos.getImages());

        Flight guardado = flightRepository.save(flight);
        guardado.setAvailableSeats(guardado.getCapacity());
        return guardado;
    }

    @Transactional
    public Flight actualizarVuelo(Long id, FlightRequestDTO datos) {
        Flight existente = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: el vuelo especificado no existe."));

        if (datos.getName() == null || datos.getName().trim().isEmpty()) {
            throw new BadRequestException("El nombre del vuelo es un campo obligatorio.");
        }

        String nuevoNombre = datos.getName().trim();
        if (!nuevoNombre.equalsIgnoreCase(existente.getName()) && flightRepository.existsByName(nuevoNombre)) {
            throw new BadRequestException("Ya existe un vuelo registrado con ese nombre exacto.");
        }

        long confirmadas = reservaRepository.countByFlightIdAndEstado(id, Reserva.EstadoReserva.CONFIRMADA);
        if (datos.getCapacity() != null && datos.getCapacity() < confirmadas) {
            throw new BadRequestException("La capacidad no puede ser menor que las reservas confirmadas existentes (" + confirmadas + ").");
        }

        existente.setName(nuevoNombre);
        existente.setDescription(datos.getDescription());
        existente.setDestination(datos.getDestination());
        existente.setCategoria(resolverCategoria(datos.getCategory()));
        existente.setPrice(datos.getPrice());
        existente.setCurrency(datos.getCurrency());
        existente.setCapacity(datos.getCapacity());
        existente.setImages(datos.getImages());

        Flight guardado = flightRepository.save(existente);
        if (guardado.getCapacity() != null) {
            guardado.setAvailableSeats((int) Math.max(0, guardado.getCapacity() - confirmadas));
        }
        return guardado;
    }

    @Transactional
    public void eliminarVuelo(Long id) {
        if (!flightRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el vuelo especificado no existe.");
        }
        favoritoRepository.deleteByFlightId(id);
        reservaRepository.deleteByFlightId(id);
        resenaRepository.deleteByFlightId(id);
        flightRepository.deleteById(id);
    }

    private Categoria resolverCategoria(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new BadRequestException("La categoría del vuelo es un campo obligatorio.");
        }
        return categoriaRepository.findByNombreIgnoreCase(nombre.trim())
                .orElseThrow(() -> new BadRequestException(
                        "La categoría especificada no existe. Debe crearla primero desde el panel de administración."));
    }

    private void completarDisponibilidad(List<Flight> vuelos) {
        if (vuelos.isEmpty()) {
            return;
        }
        Map<Long, Long> confirmadasPorVuelo = new HashMap<>();
        for (Object[] fila : reservaRepository.contarPorVueloYEstado(Reserva.EstadoReserva.CONFIRMADA)) {
            confirmadasPorVuelo.put((Long) fila[0], (Long) fila[1]);
        }
        for (Flight vuelo : vuelos) {
            if (vuelo.getCapacity() != null) {
                long ocupados = confirmadasPorVuelo.getOrDefault(vuelo.getId(), 0L);
                vuelo.setAvailableSeats((int) Math.max(0, vuelo.getCapacity() - ocupados));
            }
        }
    }
}
