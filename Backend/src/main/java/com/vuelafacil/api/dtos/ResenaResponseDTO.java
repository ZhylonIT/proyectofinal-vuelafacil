package com.vuelafacil.api.dtos;

import com.vuelafacil.api.entities.Resena;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResenaResponseDTO {

    private Long id;
    private Long usuarioId;
    private String nombreUsuario;
    private Integer rating;
    private String comentario;
    private LocalDateTime fecha;

    public static ResenaResponseDTO fromEntity(Resena resena) {
        var usuario = resena.getUsuario();
        return new ResenaResponseDTO(
                resena.getId(),
                usuario.getId(),
                (usuario.getNombre() + " " + usuario.getApellido()).trim(),
                resena.getRating(),
                resena.getComentario(),
                resena.getFecha()
        );
    }
}
