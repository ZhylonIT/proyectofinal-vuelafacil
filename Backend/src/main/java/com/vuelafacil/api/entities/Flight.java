package com.vuelafacil.api.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String name;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String destination;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categoria_id")
    @JsonIgnore
    private Categoria categoria;

    @NotNull
    @Positive
    @Column(nullable = false)
    private Double price;

    @NotBlank
    @Column(nullable = false)
    private String currency;

    @Positive
    private Integer capacity;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "flight_images", joinColumns = @JoinColumn(name = "flight_id"))
    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    @NotEmpty
    private List<String> images;

    @Transient
    private Integer availableSeats;

    @JsonProperty("category")
    public String getCategory() {
        return categoria != null ? categoria.getNombre() : null;
    }

    @JsonProperty("available")
    public boolean isAvailable() {
        return availableSeats == null || availableSeats > 0;
    }
}
