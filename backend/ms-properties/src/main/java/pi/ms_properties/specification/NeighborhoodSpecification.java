package pi.ms_properties.specification;

import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Neighborhood;

@SuppressWarnings("unused")
public class NeighborhoodSpecification {
    public static Specification<Neighborhood> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            String likePattern = "%" + value.toLowerCase() + "%";

            return builder.or(
                    builder.like(builder.lower(root.get("name")), likePattern)
            );
        };
    }
}