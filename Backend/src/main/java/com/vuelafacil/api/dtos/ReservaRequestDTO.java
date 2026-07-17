package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservaRequestDTO {

    @NotNull
    private Long flightId;

    @NotNull
    private LocalDate fechaIda;

    private LocalDate fechaVuelta;
}
