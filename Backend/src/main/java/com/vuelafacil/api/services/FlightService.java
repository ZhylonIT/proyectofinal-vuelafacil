package com.vuelafacil.api.services;

import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FlightRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class FlightService {

    private final FlightRepository flightRepository;

    @Autowired
    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
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
    public void eliminarVuelo(Long id) {
        if (!flightRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar: el vuelo especificado no existe.");
        }
        flightRepository.deleteById(id);
    }
}