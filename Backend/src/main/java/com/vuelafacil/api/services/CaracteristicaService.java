package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.CaracteristicaRequestDTO;
import com.vuelafacil.api.entities.Caracteristica;
import com.vuelafacil.api.entities.DestinoDetalle;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.CaracteristicaRepository;
import com.vuelafacil.api.repositories.DestinoDetalleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CaracteristicaService {

    private final CaracteristicaRepository caracteristicaRepository;
    private final DestinoDetalleRepository destinoDetalleRepository;

    public CaracteristicaService(CaracteristicaRepository caracteristicaRepository,
                                 DestinoDetalleRepository destinoDetalleRepository) {
        this.caracteristicaRepository = caracteristicaRepository;
        this.destinoDetalleRepository = destinoDetalleRepository;
    }

    @Transactional(readOnly = true)
    public List<Caracteristica> listar() {
        return caracteristicaRepository.findAll();
    }

    @Transactional
    public Caracteristica crear(CaracteristicaRequestDTO datos) {
        String nombre = datos.getNombre().trim();
        if (caracteristicaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BadRequestException("Ya existe una característica registrada con ese nombre.");
        }
        return caracteristicaRepository.save(new Caracteristica(null, nombre, datos.getIcono().trim()));
    }

    @Transactional
    public Caracteristica actualizar(Long id, CaracteristicaRequestDTO datos) {
        Caracteristica existente = caracteristicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: la característica especificada no existe."));

        String nuevoNombre = datos.getNombre().trim();
        if (!nuevoNombre.equalsIgnoreCase(existente.getNombre()) && caracteristicaRepository.existsByNombreIgnoreCase(nuevoNombre)) {
            throw new BadRequestException("Ya existe una característica registrada con ese nombre.");
        }

        existente.setNombre(nuevoNombre);
        existente.setIcono(datos.getIcono().trim());
        return caracteristicaRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Caracteristica caracteristica = caracteristicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar: la característica especificada no existe."));

        List<DestinoDetalle> destinos = destinoDetalleRepository.findAll();
        for (DestinoDetalle destino : destinos) {
            if (destino.getCaracteristicas().removeIf(c -> c.getId().equals(id))) {
                destinoDetalleRepository.save(destino);
            }
        }

        caracteristicaRepository.delete(caracteristica);
    }
}
