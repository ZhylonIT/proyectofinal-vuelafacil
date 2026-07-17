package com.vuelafacil.api.dtos;

import com.vuelafacil.api.entities.Reserva;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservaResponseDTO {

    private Long id;
    private Long flightId;
    private String nombreVuelo;
    private String destino;
    private String imagen;
    private LocalDate fechaIda;
    private LocalDate fechaVuelta;
    private LocalDateTime fechaReserva;
    private String estado;
    private Double precioAlMomento;
    private String monedaAlMomento;

    public static ReservaResponseDTO fromEntity(Reserva reserva) {
        var flight = reserva.getFlight();
        String primeraImagen = (flight.getImages() != null && !flight.getImages().isEmpty())
                ? flight.getImages().get(0) : null;
        return new ReservaResponseDTO(
                reserva.getId(),
                flight.getId(),
                flight.getName(),
                flight.getDestination(),
                primeraImagen,
                reserva.getFechaIda(),
                reserva.getFechaVuelta(),
                reserva.getFechaReserva(),
                reserva.getEstado().name(),
                reserva.getPrecioAlMomento(),
                reserva.getMonedaAlMomento()
        );
    }
}
