package com.vuelafacil.api.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResenaPromedioDTO {
    private Double promedio;
    private Long cantidad;
    private List<ResenaResponseDTO> resenas;
}
