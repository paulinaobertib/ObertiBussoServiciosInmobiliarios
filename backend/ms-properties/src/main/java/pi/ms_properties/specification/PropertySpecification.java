package pi.ms_properties.specification;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Property;

import java.util.List;

public class PropertySpecification {

    public static Specification<Property> hasPriceFrom(float priceFrom) {
        return (root, query, criteriaBuilder) -> {
            if (priceFrom == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), priceFrom);
        };
    }

    public static Specification<Property> hasPriceTo(float priceTo) {
        return (root, query, criteriaBuilder) -> {
            if (priceTo == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("price"), priceTo);
        };
    }

    public static Specification<Property> hasAreaFrom(float areaFrom) {
        return (root, query, criteriaBuilder) -> {
            if (areaFrom == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("area"), areaFrom);
        };
    }

    public static Specification<Property> hasAreaTo(float areaTo) {
        return (root, query, criteriaBuilder) -> {
            if (areaTo == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("area"), areaTo);
        };
    }

    public static Specification<Property> hasCoveredAreaFrom(float areaFrom) {
        return (root, query, criteriaBuilder) -> {
            if (areaFrom == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("coveredArea"), areaFrom);
        };
    }

    public static Specification<Property> hasCoveredAreaTo(float areaTo) {
        return (root, query, criteriaBuilder) -> {
            if (areaTo == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.lessThanOrEqualTo(root.get("coveredArea"), areaTo);
        };
    }

    public static Specification<Property> hasRooms(float rooms) {
        return (root, query, criteriaBuilder) -> {
            if (rooms == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("rooms"), rooms);
        };
    }

    public static Specification<Property> hasOperation(String operation) {
        return (root, query, criteriaBuilder) -> {
            if (operation.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("operation")), "%" + operation.toLowerCase() + "%");
        };
    }

    public static Specification<Property> hasType(String type) {
        return (root, query, criteriaBuilder) -> {
            if (type.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("type");
            return criteriaBuilder.like(criteriaBuilder.lower(join.get("name")), "%" + type.toLowerCase() + "%");
        };
    }

    public static Specification<Property> hasAmenity(List<String> amenities) {
        return (root, query, criteriaBuilder) -> {
            if (amenities.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            List<String> lowerCaseAmenities = amenities.stream()
                    .map(String::toLowerCase)
                    .toList();
            return criteriaBuilder.and(lowerCaseAmenities.stream()
                    .map(amenity -> {
                        Join<Object, Object> join = root.join("amenities");
                        return criteriaBuilder.like(
                                criteriaBuilder.lower(join.get("name")),
                                "%" + amenity + "%"
                        );
                    })
                    .toArray(Predicate[]::new));
        };
    }

    public static Specification<Property> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (city.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");
            return criteriaBuilder.like(criteriaBuilder.lower(join.get("city")), "%" + city.toLowerCase() + "%");
        };
    }

    public static Specification<Property> hasNeighborhood(String neighborhood) {
        return (root, query, criteriaBuilder) -> {
            if (neighborhood.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");
            return criteriaBuilder.like(criteriaBuilder.lower(join.get("name")), "%" + neighborhood.toLowerCase() + "%");
        };
    }

    public static Specification<Property> hasNeighborhoodType(String neighborhoodType) {
        return (root, query, criteriaBuilder) -> {
            if (neighborhoodType.isBlank()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");
            return criteriaBuilder.like(criteriaBuilder.lower(join.get("type")), "%" + neighborhoodType.toUpperCase() + "%");
        };
    }

    public static Specification<Property> hasCredit(Boolean credit) {
        return (root, query, criteriaBuilder) -> {
            if (credit == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("credit"), credit);
        };
    }

    public static Specification<Property> hasFinancing(Boolean financing) {
        return (root, query, criteriaBuilder) -> {
            if (financing == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("financing"), financing);
        };
    }

    public static Specification<Property> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            String likePattern = "%" + value.toLowerCase() + "%";

            return builder.or(
                    builder.like(builder.lower(root.get("title")), likePattern),
                    builder.like(builder.lower(root.get("description")), likePattern)
            );
        };
    }
}
