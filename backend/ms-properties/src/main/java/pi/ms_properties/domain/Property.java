package pi.ms_properties.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Property")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "street", nullable = false)
    private String street;

    @Column(name = "number", nullable = false)
    private String number;

    @Column(name = "rooms", nullable = false)
    private Float rooms;

    @Column(name = "bathrooms", nullable = false)
    private Float bathrooms;

    @Column(name = "bedrooms", nullable = false)
    private Float bedrooms;

    @Column(name = "area", nullable = false)
    private Float area;

    @Column(name = "covered_area", nullable = false)
    private Float coveredArea;

    @Column(name = "price", nullable = false)
    private Float price;

    @Column(name = "show_price", nullable = false)
    private Boolean showPrice;

    @Column(name = "expenses", nullable = true)
    private Float expenses;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "main_image", nullable = true)
    private String mainImage;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    private Operation operation;

    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Column(name = "credit", nullable = false)
    private Boolean credit;

    @Column(name = "financing", nullable = false)
    private Boolean financing;

    // relaciones

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @ManyToOne
    @JoinColumn(name = "neighborhood_id", nullable = false)
    private Neighborhood neighborhood;

    @ManyToOne
    @JoinColumn(name = "type_id", nullable = false)
    private Type type;

    @ManyToMany
    @JoinTable(
            name = "property_amenity",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "amenity_id")
    )
    private Set<Amenity> amenities = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Image> images = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "property_inquiry",
            joinColumns = @JoinColumn(name = "property_id"),
            inverseJoinColumns = @JoinColumn(name = "inquiry_id")
    )
    private Set<Inquiry> inquiries = new HashSet<>();
}
