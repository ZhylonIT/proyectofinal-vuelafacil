package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.ResenaPromedioDTO;
import com.vuelafacil.api.dtos.ResenaRequestDTO;
import com.vuelafacil.api.dtos.ResenaResponseDTO;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Resena;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.repositories.ResenaRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final FlightRepository flightRepository;
    private final CurrentUserProvider currentUserProvider;

    public ResenaService(ResenaRepository resenaRepository, FlightRepository flightRepository, CurrentUserProvider currentUserProvider) {
        this.resenaRepository = resenaRepository;
        this.flightRepository = flightRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public Resena crear(Long flightId, ResenaRequestDTO datos) {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();

        if (resenaRepository.existsByUsuarioIdAndFlightId(usuario.getId(), flightId)) {
            throw new BadRequestException("Ya dejaste una reseña para este vuelo.");
        }

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("El vuelo especificado no existe."));

        Resena resena = new Resena();
        resena.setUsuario(usuario);
        resena.setFlight(flight);
        resena.setRating(datos.getRating());
        resena.setComentario(datos.getComentario().trim());
        resena.setFecha(LocalDateTime.now());

        return resenaRepository.save(resena);
    }

    @Transactional(readOnly = true)
    public ResenaPromedioDTO listarPorVuelo(Long flightId) {
        List<Resena> resenas = resenaRepository.findByFlightIdOrderByFechaDesc(flightId);
        List<ResenaResponseDTO> dtos = resenas.stream().map(ResenaResponseDTO::fromEntity).toList();
        double promedio = resenas.stream().mapToInt(Resena::getRating).average().orElse(0.0);
        return new ResenaPromedioDTO(promedio, (long) resenas.size(), dtos);
    }
}
