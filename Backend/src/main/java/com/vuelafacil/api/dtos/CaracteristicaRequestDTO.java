package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CaracteristicaRequestDTO {

    @NotBlank
    private String nombre;

    @NotBlank
    private String icono;
}
