package pi.ms_properties.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
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
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "street", nullable = true)
    private String street;

    @Column(name = "number", nullable = true)
    private String number;

    @Column(name = "latitude", columnDefinition = "DECIMAL(10,8)")
    private Double latitude;

    @Column(name = "longitude", columnDefinition = "DECIMAL(11,8)")
    private Double longitude;

    @Column(name = "rooms", nullable = false)
    private Float rooms;

    @Column(name = "bathrooms", nullable = false)
    private Float bathrooms;

    @Column(name = "bedrooms", nullable = false)
    private Float bedrooms;

    @Column(name = "garages", nullable = true)
    private Integer garages;

    @Column(name = "floor", nullable = true)
    private Integer floor;

    @Column(name = "area", nullable = false)
    private Float area;

    @Column(name = "covered_area", nullable = false)
    private Float coveredArea;

    @Column(name = "private_area", nullable = true)
    private Float privateArea;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "show_price", nullable = false)
    private Boolean showPrice;

    @Column(name = "expenses", nullable = true)
    private BigDecimal expenses;

    @Column(name = "show_expenses", nullable = false)
    private Boolean showExpenses;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "video", nullable = true, length = 500)
    private String video;

    @Column(name = "zip_code", nullable = true, length = 20)
    private String zipCode;

    @Column(name = "date", nullable = false)
    private LocalDateTime date;

    @Column(name = "main_image", nullable = true)
    private String mainImage;

    @Enumerated(EnumType.STRING)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(name = "property_condition", nullable = true)
    private PropertyCondition propertyCondition;

    @Enumerated(EnumType.STRING)
    private Operation operation;

    @Enumerated(EnumType.STRING)
    @Column(name = "rents_type", nullable = true)
    private RentsType rentsType;

    @Enumerated(EnumType.STRING)
    private Currency currency;

    @Column(name = "credit", nullable = false)
    private Boolean credit;

    @Column(name = "financing", nullable = false)
    private Boolean financing;

    @Column(name = "network_share", nullable = true)
    private Boolean networkShare;

    @Column(name = "outstanding", nullable = false)
    private Boolean outstanding;

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

    @OneToMany(mappedBy = "property", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Set<Comment> comments = new HashSet<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonIgnore
    private Set<Maintenance> maintenances = new HashSet<>();
}
