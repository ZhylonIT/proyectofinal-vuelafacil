package com.vuelafacil.api.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightRequestDTO {

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotBlank
    private String destination;

    @NotBlank
    private String category;

    @NotNull
    @Positive
    private Double price;

    @NotBlank
    private String currency;

    @NotNull
    @Positive
    private Integer capacity;

    @NotEmpty
    private List<String> images;
}
