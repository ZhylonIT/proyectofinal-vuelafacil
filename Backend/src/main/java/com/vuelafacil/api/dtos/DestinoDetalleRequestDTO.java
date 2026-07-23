package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class DestinoDetalleRequestDTO {

    @NotBlank
    private String nombreDestino;

    private String descripcion;

    private List<Long> caracteristicaIds = new ArrayList<>();
}
