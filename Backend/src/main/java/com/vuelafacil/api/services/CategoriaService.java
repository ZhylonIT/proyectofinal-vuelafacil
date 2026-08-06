package com.vuelafacil.api.services;

import com.vuelafacil.api.dtos.CategoriaRequestDTO;
import com.vuelafacil.api.entities.Categoria;
import com.vuelafacil.api.exceptions.BadRequestException;
import com.vuelafacil.api.exceptions.ResourceNotFoundException;
import com.vuelafacil.api.repositories.CategoriaRepository;
import com.vuelafacil.api.repositories.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final FlightRepository flightRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, FlightRepository flightRepository) {
        this.categoriaRepository = categoriaRepository;
        this.flightRepository = flightRepository;
    }

    @Transactional(readOnly = true)
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("La categoría solicitada no existe."));
    }

    @Transactional
    public Categoria crear(CategoriaRequestDTO datos) {
        String nombre = datos.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new BadRequestException("Ya existe una categoría registrada con ese nombre.");
        }
        return categoriaRepository.save(new Categoria(null, nombre, datos.getImagen().trim()));
    }

    @Transactional
    public Categoria actualizar(Long id, CategoriaRequestDTO datos) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede actualizar: la categoría especificada no existe."));

        String nuevoNombre = datos.getNombre().trim();
        if (!nuevoNombre.equalsIgnoreCase(existente.getNombre()) && categoriaRepository.existsByNombreIgnoreCase(nuevoNombre)) {
            throw new BadRequestException("Ya existe una categoría registrada con ese nombre.");
        }

        existente.setNombre(nuevoNombre);
        existente.setImagen(datos.getImagen().trim());
        return categoriaRepository.save(existente);
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar: la categoría especificada no existe."));

        if (flightRepository.existsByCategoriaId(categoria.getId())) {
            throw new BadRequestException("No se puede eliminar la categoría porque hay paquetes turísticos asociados a ella.");
        }
        categoriaRepository.delete(categoria);
    }
}
