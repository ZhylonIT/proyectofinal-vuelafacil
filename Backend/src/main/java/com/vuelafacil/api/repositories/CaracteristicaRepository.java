package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.Caracteristica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaracteristicaRepository extends JpaRepository<Caracteristica, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
}
