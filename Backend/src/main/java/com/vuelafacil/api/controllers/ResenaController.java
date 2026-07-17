package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.ResenaPromedioDTO;
import com.vuelafacil.api.dtos.ResenaRequestDTO;
import com.vuelafacil.api.dtos.ResenaResponseDTO;
import com.vuelafacil.api.services.ResenaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vuelos/{flightId}/resenas")
public class ResenaController {

    private final ResenaService resenaService;

    public ResenaController(ResenaService resenaService) {
        this.resenaService = resenaService;
    }

    @PostMapping
    public ResponseEntity<ResenaResponseDTO> crear(@PathVariable Long flightId, @Valid @RequestBody ResenaRequestDTO datos) {
        var resena = resenaService.crear(flightId, datos);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResenaResponseDTO.fromEntity(resena));
    }

    @GetMapping
    public ResponseEntity<ResenaPromedioDTO> listarPorVuelo(@PathVariable Long flightId) {
        return ResponseEntity.ok(resenaService.listarPorVuelo(flightId));
    }
}
