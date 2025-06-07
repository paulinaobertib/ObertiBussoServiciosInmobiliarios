package pi.ms_properties.specification;

import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.Owner;

public class OwnerSpecification {
    public static Specification<Owner> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            String likePattern = "%" + value.toLowerCase() + "%";

            return builder.or(
                    // creamos la condicion like en la consulta
                    builder.like(builder.lower(root.get("firstName")), likePattern),
                    builder.like(builder.lower(root.get("lastName")), likePattern),
                    builder.like(builder.lower(root.get("mail")), likePattern),
                    builder.like(builder.lower(root.get("phone")), likePattern)
            );
        };
    }
}

