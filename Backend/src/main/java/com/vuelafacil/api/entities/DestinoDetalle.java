package com.vuelafacil.api.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "destino_detalles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "nombre_destino", unique = true, nullable = false)
    private String nombreDestino;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "destino_caracteristicas",
            joinColumns = @JoinColumn(name = "destino_id"),
            inverseJoinColumns = @JoinColumn(name = "caracteristica_id")
    )
    private Set<Caracteristica> caracteristicas = new HashSet<>();
}
