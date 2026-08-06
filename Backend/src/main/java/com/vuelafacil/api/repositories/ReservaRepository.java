package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    List<Reserva> findByUsuarioId(Long usuarioId);
    void deleteByFlightId(Long flightId);

    long countByFlightIdAndEstado(Long flightId, Reserva.EstadoReserva estado);

    @Query("SELECT r.flight.id, COUNT(r) FROM Reserva r WHERE r.estado = :estado GROUP BY r.flight.id")
    List<Object[]> contarPorVueloYEstado(@Param("estado") Reserva.EstadoReserva estado);
}
