package pi.ms_users.specification;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import pi.ms_users.domain.Guarantor;

public class GuarantorSpecification {

    public static Specification<Guarantor> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) return null;

            String like = "%" + value.toLowerCase().trim() + "%";
            Predicate byName  = builder.like(builder.lower(root.get("name")),  like);
            Predicate byEmail = builder.like(builder.lower(root.get("email")), like);
            Predicate byPhone = builder.like(builder.lower(root.get("phone")), like);

            return builder.or(byName, byEmail, byPhone);
        };
    }
}

