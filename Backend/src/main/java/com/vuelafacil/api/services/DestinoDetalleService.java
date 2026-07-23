package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.DestinoDetalleRequestDTO;
import com.vuelafacil.api.entities.Caracteristica;
import com.vuelafacil.api.entities.DestinoDetalle;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.CaracteristicaRepository;
import com.vuelafacil.api.repositories.DestinoDetalleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class DestinoDetalleService {

    private final DestinoDetalleRepository destinoDetalleRepository;
    private final CaracteristicaRepository caracteristicaRepository;

    public DestinoDetalleService(DestinoDetalleRepository destinoDetalleRepository,
                                 CaracteristicaRepository caracteristicaRepository) {
        this.destinoDetalleRepository = destinoDetalleRepository;
        this.caracteristicaRepository = caracteristicaRepository;
    }

    @Transactional(readOnly = true)
    public List<DestinoDetalle> listar() {
        return destinoDetalleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DestinoDetalle obtenerPorNombre(String nombreDestino) {
        return destinoDetalleRepository.findByNombreDestinoIgnoreCase(nombreDestino)
                .orElseThrow(() -> new ResourceNotFoundException("El destino solicitado no tiene información registrada."));
    }

    @Transactional
    public DestinoDetalle guardar(DestinoDetalleRequestDTO datos) {
        String nombre = datos.getNombreDestino().trim();

        DestinoDetalle destino = destinoDetalleRepository.findByNombreDestinoIgnoreCase(nombre)
                .orElseGet(() -> {
                    DestinoDetalle nuevo = new DestinoDetalle();
                    nuevo.setNombreDestino(nombre);
                    return nuevo;
                });

        Set<Caracteristica> caracteristicas = new HashSet<>();
        if (datos.getCaracteristicaIds() != null) {
            for (Long caracteristicaId : datos.getCaracteristicaIds()) {
                Caracteristica caracteristica = caracteristicaRepository.findById(caracteristicaId)
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "La característica con ID " + caracteristicaId + " no existe."));
                caracteristicas.add(caracteristica);
            }
        }

        destino.setDescripcion(datos.getDescripcion());
        destino.setCaracteristicas(caracteristicas);
        return destinoDetalleRepository.save(destino);
    }
}
