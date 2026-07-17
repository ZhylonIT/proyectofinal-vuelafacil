package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FavoritoRequestDTO {

    @NotNull
    private Long flightId;
}
