package com.vuelafacil.api.services;

import com.vuelafacil.api.entities.Favorito;
import com.vuelafacil.api.entities.Flight;
import com.vuelafacil.api.entities.Usuario;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.FavoritoRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import com.vuelafacil.api.security.CurrentUserProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final FlightRepository flightRepository;
    private final CurrentUserProvider currentUserProvider;

    public FavoritoService(FavoritoRepository favoritoRepository, FlightRepository flightRepository, CurrentUserProvider currentUserProvider) {
        this.favoritoRepository = favoritoRepository;
        this.flightRepository = flightRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional
    public Favorito agregar(Long flightId) {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();

        if (favoritoRepository.existsByUsuarioIdAndFlightId(usuario.getId(), flightId)) {
            throw new BadRequestException("Este vuelo ya está en tus favoritos.");
        }

        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new ResourceNotFoundException("El vuelo especificado no existe."));

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setFlight(flight);
        return favoritoRepository.save(favorito);
    }

    @Transactional
    public void quitar(Long flightId) {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();
        Favorito favorito = favoritoRepository.findByUsuarioIdAndFlightId(usuario.getId(), flightId)
                .orElseThrow(() -> new ResourceNotFoundException("Ese vuelo no está en tus favoritos."));
        favoritoRepository.delete(favorito);
    }

    @Transactional(readOnly = true)
    public List<Favorito> misFavoritos() {
        Usuario usuario = currentUserProvider.obtenerUsuarioActual();
        return favoritoRepository.findByUsuarioId(usuario.getId());
    }
}
