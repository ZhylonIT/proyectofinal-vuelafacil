package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.ReservaRequestDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Reserva;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ReservaRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final FlightRepository flightRepository;
    private final CurrentUserProvider currentUserProvider;

    public ReservaService(ReservaRepository reservaRepository, FlightRepository flightRepository, CurrentUserProvider currentUserProvider) {
        this.reservaRepository = reservaRepository;
        this.flightRepository = flightRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public Reserva crear(ReservaRequestDTO datos) {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();

        Flight flight = flightRepository.findById(datos.getFlightId())
                .orElseThrow(() -> new ResourceNotFoundException("El vuelo especificado no existe."));

        if (datos.getFechaVuelta() != null && datos.getFechaVuelta().isBefore(datos.getFechaIda())) {
            throw new BadRequestException("La fecha de vuelta no puede ser anterior a la fecha de ida.");
        }

        Reserva reserva = new Reserva();
        reserva.setUsuario(usuario);
        reserva.setFlight(flight);
        reserva.setFechaIda(datos.getFechaIda());
        reserva.setFechaVuelta(datos.getFechaVuelta());
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setEstado(Reserva.EstadoReserva.CONFIRMADA);
        reserva.setPrecioAlMomento(flight.getPrice());
        reserva.setMonedaAlMomento(flight.getCurrency());

        return reservaRepository.save(reserva);
    }

    @Transactional(readOnly = true)
    public List<Reserva> misReservas() {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();
        return reservaRepository.findByUsuarioId(usuario.getId());
    }

    @Transactional
    public void cancelar(Long id) {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La reserva especificada no existe."));

        if (!reserva.getUsuario().getId().equals(usuario.getId())) {
            throw new BadRequestException("No podés cancelar una reserva que no es tuya.");
        }

        reserva.setEstado(Reserva.EstadoReserva.CANCELADA);
        reservaRepository.save(reserva);
    }
}
