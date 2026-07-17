package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.FavoritoRequestDTO;
import com.vuelafacil.api.dtos.FavoritoResponseDTO;
import com.vuelafacil.api.services.FavoritoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;

    public FavoritoController(FavoritoService favoritoService) {
        this.favoritoService = favoritoService;
    }

    @PostMapping
    public ResponseEntity<FavoritoResponseDTO> agregar(@Valid @RequestBody FavoritoRequestDTO datos) {
        var favorito = favoritoService.agregar(datos.getFlightId());
        return ResponseEntity.status(HttpStatus.CREATED).body(FavoritoResponseDTO.fromEntity(favorito));
    }

    @GetMapping("/mios")
    public ResponseEntity<List<FavoritoResponseDTO>> misFavoritos() {
        List<FavoritoResponseDTO> favoritos = favoritoService.misFavoritos().stream()
                .map(FavoritoResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(favoritos);
    }

    @DeleteMapping("/{flightId}")
    public ResponseEntity<Void> quitar(@PathVariable Long flightId) {
        favoritoService.quitar(flightId);
        return ResponseEntity.noContent().build();
    }
}
