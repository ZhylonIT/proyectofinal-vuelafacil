package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.DestinoDetalleRequestDTO;
import com.vuelafacil.api.entities.DestinoDetalle;
import com.vuelafacil.api.services.DestinoDetalleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/destinos")
public class DestinoDetalleController {

    private final DestinoDetalleService destinoDetalleService;

    public DestinoDetalleController(DestinoDetalleService destinoDetalleService) {
        this.destinoDetalleService = destinoDetalleService;
    }

    @GetMapping
    public ResponseEntity<List<DestinoDetalle>> listar() {
        return ResponseEntity.ok(destinoDetalleService.listar());
    }

    @GetMapping("/{nombreDestino}")
    public ResponseEntity<DestinoDetalle> obtenerPorNombre(@PathVariable String nombreDestino) {
        return ResponseEntity.ok(destinoDetalleService.obtenerPorNombre(nombreDestino));
    }

    // Upsert: crea la información del destino si no existe, o la actualiza si ya existe.
    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DestinoDetalle> guardar(@Valid @RequestBody DestinoDetalleRequestDTO datos) {
        return ResponseEntity.ok(destinoDetalleService.guardar(datos));
    }
}
