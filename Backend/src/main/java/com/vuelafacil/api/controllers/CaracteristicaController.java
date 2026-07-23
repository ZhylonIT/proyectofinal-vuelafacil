package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.CaracteristicaRequestDTO;
import com.vuelafacil.api.entities.Caracteristica;
import com.vuelafacil.api.services.CaracteristicaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/caracteristicas")
public class CaracteristicaController {

    private final CaracteristicaService caracteristicaService;

    public CaracteristicaController(CaracteristicaService caracteristicaService) {
        this.caracteristicaService = caracteristicaService;
    }

    @GetMapping
    public ResponseEntity<List<Caracteristica>> listar() {
        return ResponseEntity.ok(caracteristicaService.listar());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Caracteristica> crear(@Valid @RequestBody CaracteristicaRequestDTO datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caracteristicaService.crear(datos));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Caracteristica> actualizar(@PathVariable Long id, @Valid @RequestBody CaracteristicaRequestDTO datos) {
        return ResponseEntity.ok(caracteristicaService.actualizar(id, datos));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        caracteristicaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
