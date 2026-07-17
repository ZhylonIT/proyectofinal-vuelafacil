package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.ReservaRequestDTO;
import com.vuelafacil.api.dtos.ReservaResponseDTO;
import com.vuelafacil.api.services.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ResponseEntity<ReservaResponseDTO> crear(@Valid @RequestBody ReservaRequestDTO datos) {
        var reserva = reservaService.crear(datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(ReservaResponseDTO.fromEntity(reserva));
    }

    @GetMapping("/mias")
    public ResponseEntity<List<ReservaResponseDTO>> misReservas() {
        List<ReservaResponseDTO> reservas = reservaService.misReservas().stream()
                .map(ReservaResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(reservas);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        reservaService.cancelar(id);
        return ResponseEntity.noContent().build();
    }
}
