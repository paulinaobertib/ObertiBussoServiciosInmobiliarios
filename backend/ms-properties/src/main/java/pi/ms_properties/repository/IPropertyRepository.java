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
import pi.ms_properties.dto.PropertyFilterDTO;

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

    @Query("""
        SELECT p FROM Property p
        WHERE p.status = 'DISPONIBLE'
        AND (:#{#f.street} IS NULL 
            OR LOWER(p.street) LIKE LOWER(CONCAT('%', :#{#f.street}, '%')))
        AND (COALESCE(:#{#f.rooms}, p.rooms) IS NULL 
            OR p.rooms >= COALESCE(:#{#f.rooms}, p.rooms))
        AND (COALESCE(:#{#f.bathrooms}, p.bathrooms) IS NULL 
            OR p.bathrooms >= COALESCE(:#{#f.bathrooms}, p.bathrooms))
        AND (COALESCE(:#{#f.bedrooms}, p.bedrooms) IS NULL 
            OR p.bedrooms >= COALESCE(:#{#f.bedrooms}, p.bedrooms))
        AND (COALESCE(:#{#f.area}, p.area) IS NULL 
            OR p.area >= COALESCE(:#{#f.area}, p.area))
        AND (COALESCE(:#{#f.coveredArea}, p.coveredArea) IS NULL 
            OR p.coveredArea >= COALESCE(:#{#f.coveredArea}, p.coveredArea))
        AND (COALESCE(:#{#f.price}, p.price) IS NULL 
            OR p.price <= COALESCE(:#{#f.price}, p.price))
        AND (COALESCE(:#{#f.expenses}, p.expenses) IS NULL 
            OR p.expenses <= COALESCE(:#{#f.expenses}, p.expenses))
        AND (:#{#f.currency} IS NULL 
            OR LOWER(p.currency) = LOWER(:#{#f.currency}))
        AND (:#{#f.operation} IS NULL 
            OR LOWER(p.operation) = LOWER(:#{#f.operation}))
        AND (:#{#f.type} IS NULL 
            OR LOWER(p.type.name) = LOWER(:#{#f.type}))
        AND (:#{#f.neighborhood} IS NULL 
            OR LOWER(p.neighborhood.name) LIKE LOWER(CONCAT('%', :#{#f.neighborhood}, '%')))
        AND (:#{#f.credit} IS NULL 
            OR p.credit = :#{#f.credit})
        AND (:#{#f.financing} IS NULL 
            OR p.financing = :#{#f.financing})
    """)
    List<Property> searchByFilters(@Param("f") PropertyFilterDTO f);
}