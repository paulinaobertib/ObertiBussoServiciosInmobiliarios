package pi.ms_properties.repository;

import io.micrometer.common.lang.Nullable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Status;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface IPropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {
    @EntityGraph(attributePaths = {"neighborhood", "type", "amenities", "images", "inquiries", "comments", "maintenances"})
    List<Property> findAll();

    @EntityGraph(attributePaths = {"neighborhood", "type", "amenities", "images", "inquiries", "comments", "maintenances"})
    Optional<Property> findById(Long id);

    @Query("select p from Property p where p.status = ?1")
    @EntityGraph(attributePaths = {"neighborhood", "type", "amenities", "images", "inquiries", "comments", "maintenances"})
    List<Property> findByStatus(Status status);

    @EntityGraph(attributePaths = {"neighborhood", "type", "amenities", "images", "inquiries", "comments", "maintenances"})
    List<Property> findAll(@Nullable Specification<Property> specification);

    @Query("select p from Property p where p.owner.id = ?1")
    @EntityGraph(attributePaths = {"neighborhood", "type", "amenities", "images", "inquiries", "comments", "maintenances"})
    List<Property> findByOwner(Long ownerId);

    @Query(value = """
    SELECT 
        p.id,
        p.title,
        p.operation,
        p.currency,
        p.price,
        CONCAT(p.street, ' ', p.number) AS address,
        n.name AS neighborhood,
        t.name AS type,
        p.bedrooms,
        p.bathrooms,
        p.rooms,
        p.credit,
        p.financing,
        p.expenses,
        p.description,
        JSON_ARRAYAGG(a.name) AS features
    FROM property p
    LEFT JOIN neighborhood n ON p.neighborhood_id = n.id
    LEFT JOIN type t ON p.type_id = t.id
    LEFT JOIN property_amenity pa ON p.id = pa.property_id
    LEFT JOIN amenity a ON pa.amenity_id = a.id
    WHERE p.status = 'DISPONIBLE'
    GROUP BY p.id
    """, nativeQuery = true)
    List<Map<String, Object>> getPropertiesForAI();
}