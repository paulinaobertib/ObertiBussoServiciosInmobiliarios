package pi.ms_properties.specification;

import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Amenity;

@SuppressWarnings("unused")
public class AmenitySpecification {
    public static Specification<Amenity> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            String likePattern = "%" + value.toLowerCase() + "%";

            return builder.like(builder.lower(root.get("name")), likePattern);
        };
    }
}