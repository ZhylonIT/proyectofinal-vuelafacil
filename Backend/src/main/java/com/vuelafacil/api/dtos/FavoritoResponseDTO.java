package com.vuelafacil.api.dtos;

import com.vuelafacil.api.entities.Favorito;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoResponseDTO {

    private Long id;
    private Long flightId;
    private String nombreVuelo;
    private String destino;
    private Double precio;
    private String moneda;
    private String imagen;

    public static FavoritoResponseDTO fromEntity(Favorito favorito) {
        var flight = favorito.getFlight();
        String primeraImagen = (flight.getImages() != null && !flight.getImages().isEmpty())
                ? flight.getImages().get(0) : null;
        return new FavoritoResponseDTO(
                favorito.getId(),
                flight.getId(),
                flight.getName(),
                flight.getDestination(),
                flight.getPrice(),
                flight.getCurrency(),
                primeraImagen
        );
    }
}
