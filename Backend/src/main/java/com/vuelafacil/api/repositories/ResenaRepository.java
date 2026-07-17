package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByFlightIdOrderByFechaDesc(Long flightId);
    boolean existsByUsuarioIdAndFlightId(Long usuarioId, Long flightId);
    void deleteByFlightId(Long flightId);
}
