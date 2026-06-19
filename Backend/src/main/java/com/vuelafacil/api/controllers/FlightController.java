package com.vuelafacil.api.controllers;

import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.services.FlightService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vuelos")
public class FlightController {

    private final FlightService flightService;

    @Autowired
    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<List<Flight>> obtenerTodos() {
        return ResponseEntity.ok(flightService.obtenerTodosLosVuelos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.obtenerVueloPorId(id));
    }

    @GetMapping("/recomendaciones")
    public ResponseEntity<List<Flight>> obtenerRecomendaciones() {
        return ResponseEntity.ok(flightService.obtenerRecomendacionesAleatorias());
    }

    @PostMapping
    public ResponseEntity<Flight> registrarVuelo(@Valid @RequestBody Flight flight) {
        Flight nuevoVuelo = flightService.registrarVuelo(flight);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoVuelo);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarVuelo(@PathVariable Long id) {
        flightService.eliminarVuelo(id);
        return ResponseEntity.noContent().build();
    }
}