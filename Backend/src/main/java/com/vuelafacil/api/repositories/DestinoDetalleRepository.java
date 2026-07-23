package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.DestinoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DestinoDetalleRepository extends JpaRepository<DestinoDetalle, Long> {
    Optional<DestinoDetalle> findByNombreDestinoIgnoreCase(String nombreDestino);
}
