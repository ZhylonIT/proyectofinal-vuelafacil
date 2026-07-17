package com.vuelafacil.api.controllers;

import com.vuelafacil.api.dtos.CambiarRolRequestDTO;
import com.vuelafacil.api.dtos.UsuarioResponseDTO;
import com.vuelafacil.api.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> obtenerTodos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.obtenerTodos().stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(usuarios);
    }

    @PatchMapping("/{id}/rol")
    public ResponseEntity<UsuarioResponseDTO> cambiarRol(@PathVariable Long id, @Valid @RequestBody CambiarRolRequestDTO datos) {
        var usuario = usuarioService.cambiarRol(id, datos.getRol());
        return ResponseEntity.ok(UsuarioResponseDTO.fromEntity(usuario));
    }
}
