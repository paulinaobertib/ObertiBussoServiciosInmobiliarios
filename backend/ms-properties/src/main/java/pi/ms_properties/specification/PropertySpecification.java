package pi.ms_properties.specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Property;

import java.math.BigDecimal;
import java.util.List;

@SuppressWarnings("unused")
public class PropertySpecification {

    private static Predicate getPredicate(List<String> types, CriteriaBuilder criteriaBuilder, Join<Object, Object> join) {
        List<Predicate> predicates = types.stream()
                .filter(type -> type != null && !type.isBlank())
                .map(type -> criteriaBuilder.like(
                        criteriaBuilder.lower(join.get("name")), "%" + type.toLowerCase() + "%"))
                .toList();
        return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
    }

    public static Specification<Property> hasPriceFrom(BigDecimal priceFrom) {
        return (root, query, criteriaBuilder) -> {
            if (priceFrom.compareTo(BigDecimal.ZERO) == 0) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("price"), priceFrom);
        };
    }

    public static Specification<Property> hasPriceTo(BigDecimal priceTo) {
        return (root, query, criteriaBuilder) -> {
            if (priceTo.compareTo(BigDecimal.ZERO) == 0) {
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

    public static Specification<Property> hasRooms(List<Float> roomsList) {
        return (root, query, criteriaBuilder) -> {
            if (roomsList == null || roomsList.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            CriteriaBuilder.In<Float> inClause = criteriaBuilder.in(root.get("rooms"));
            boolean hasValidValues = false;
            for (Float r : roomsList) {
                if (r != null && r != 0) {
                    inClause.value(r);
                    hasValidValues = true;
                }
            }
            return hasValidValues ? inClause : criteriaBuilder.conjunction();
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

    public static Specification<Property> hasType(List<String> types) {
        return (root, query, criteriaBuilder) -> {
            if (types == null || types.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("type");
            return getPredicate(types, criteriaBuilder, join);
        };
    }

    public static Specification<Property> hasAmenity(List<String> amenities) {
        return (root, query, criteriaBuilder) -> {
            if (amenities == null || amenities.isEmpty()) {
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

    public static Specification<Property> hasCity(List<String> cities) {
        return (root, query, criteriaBuilder) -> {
            if (cities == null || cities.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");
            List<Predicate> predicates = cities.stream()
                    .filter(city -> city != null && !city.isBlank())
                    .map(city -> criteriaBuilder.like(
                            criteriaBuilder.lower(join.get("city")), "%" + city.toLowerCase() + "%"))
                    .toList();
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Property> hasNeighborhood(List<String> neighborhoods) {
        return (root, query, criteriaBuilder) -> {
            if (neighborhoods == null || neighborhoods.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");
            return getPredicate(neighborhoods, criteriaBuilder, join);
        };
    }

    public static Specification<Property> hasNeighborhoodType(List<String> neighborhoodTypes) {
        return (root, query, criteriaBuilder) -> {
            if (neighborhoodTypes == null || neighborhoodTypes.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            Join<Object, Object> join = root.join("neighborhood");

            List<Predicate> predicates = neighborhoodTypes.stream()
                    .filter(t -> t != null && !t.isBlank())
                    .map(t -> criteriaBuilder.equal(
                            criteriaBuilder.lower(join.get("type")), t.toLowerCase().trim()))
                    .toList();

            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
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

    public static Specification<Property> hasCurrency(Currency currency) {
        return (root, query, criteriaBuilder) -> {
            if (currency == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("currency"), currency);
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
