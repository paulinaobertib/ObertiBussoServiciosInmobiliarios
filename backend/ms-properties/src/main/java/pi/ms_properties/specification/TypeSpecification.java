package pi.ms_properties.specification;

import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Type;

@SuppressWarnings("unused")
public class TypeSpecification {
    public static Specification<Type> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) return null;
            String likePattern = "%" + value.toLowerCase() + "%";
            return builder.like(builder.lower(root.get("name")), likePattern);
        };
    }
}