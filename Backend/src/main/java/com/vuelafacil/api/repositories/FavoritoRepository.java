package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    List<Favorito> findByUsuarioId(Long usuarioId);
    boolean existsByUsuarioIdAndFlightId(Long usuarioId, Long flightId);
    Optional<Favorito> findByUsuarioIdAndFlightId(Long usuarioId, Long flightId);
    void deleteByFlightId(Long flightId);
}
