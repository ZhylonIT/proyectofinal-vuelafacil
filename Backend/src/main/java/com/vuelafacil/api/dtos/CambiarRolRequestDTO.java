package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarRolRequestDTO {

    @NotBlank
    private String rol;
}
