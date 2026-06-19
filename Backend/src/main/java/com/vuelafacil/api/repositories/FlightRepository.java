package com.vuelafacil.api.repositories;

import com.vuelafacil.api.entities.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {
    boolean existsByName(String nombre);
    Optional<Flight> findByName(String nombre);
}