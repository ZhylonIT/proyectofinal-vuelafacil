package com.vuelafacil.api.services;

import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class FlightService {

    private final FlightRepository flightRepository;
    private final FavoritoRepository favoritoRepository;
    private final ReservaRepository reservaRepository;
    private final ResenaRepository resenaRepository;

    @Autowired
    public FlightService(FlightRepository flightRepository, FavoritoRepository favoritoRepository,
                          ReservaRepository reservaRepository, ResenaRepository resenaRepository) {
        this.flightRepository = flightRepository;
        this.favoritoRepository = favoritoRepository;
        this.reservaRepository = reservaRepository;
        this.resenaRepository = resenaRepository;
    }

    @Transactional(readOnly = true)
    public List<Flight> obtenerTodosLosVuelos() {
        return flightRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Flight obtenerVueloPorId(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("El vuelo con el ID solicitado no existe."));
    }

    @Transactional(readOnly = true)
    public List<Flight> obtenerRecomendacionesAleatorias() {
        List<Flight> todos = flightRepository.findAll();
        List<Flight> listaModificable = new ArrayList<>(todos);
        Collections.shuffle(listaModificable);
        if (listaModificable.size() > 10) {
            return listaModificable.subList(0, 10);
        }
        return listaModificable;
    }

    @Transactional
    public Flight registrarVuelo(Flight flight) {
        if (flight.getName() == null || flight.getName().trim().isEmpty()) {
            throw new BadRequestException("El nombre del vuelo es un campo obligatorio.");
        }

        // Actualizado a existsByName para coincidir con la entidad en inglés
        if (flightRepository.existsByName(flight.getName().trim())) {
            throw new BadRequestException("Ya existe un vuelo registrado con ese nombre exacto.");
        }

        // Actualizado a setName y getName
        flight.setName(flight.getName().trim());
        return flightRepository.save(flight);
    }

    @Transactional
    public Flight actualizarVuelo(Long id, Flight datos) {
        Flight existente = flightRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: el vuelo especificado no existe."));

        if (datos.getName() == null || datos.getName().trim().isEmpty()) {
            throw new BadRequestException("El nombre del vuelo es un campo obligatorio.");
        }

        String nuevoNombre = datos.getName().trim();
        if (!nuevoNombre.equalsIgnoreCase(existente.getName()) && flightRepository.existsByName(nuevoNombre)) {
            throw new BadRequestException("Ya existe un vuelo registrado con ese nombre exacto.");
        }

        existente.setName(nuevoNombre);
        existente.setDescription(datos.getDescription());
        existente.setDestination(datos.getDestination());
        existente.setCategory(datos.getCategory());
        existente.setPrice(datos.getPrice());
        existente.setCurrency(datos.getCurrency());
        existente.setImages(datos.getImages());

        return flightRepository.save(existente);
    }

    @Transactional
    public void eliminarVuelo(Long id) {
        if (!flightRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el vuelo especificado no existe.");
        }
        // Se eliminan primero los registros dependientes (favoritos/reservas/reseñas)
        // para no violar la FK hacia flights.
        favoritoRepository.deleteByFlightId(id);
        reservaRepository.deleteByFlightId(id);
        resenaRepository.deleteByFlightId(id);
        flightRepository.deleteById(id);
    }
}