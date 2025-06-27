package pi.ms_users.specification;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import pi.ms_users.domain.Notice;

@SuppressWarnings("unused")
public class NoticeSpecification {

    public static Specification<Notice> textSearch(String value) {
        return (root, query, builder) -> {
            if (value == null || value.isBlank()) {
                return null;
            }

            String likePattern = "%" + value.toLowerCase() + "%";

            Predicate titlePredicate = builder.like(builder.lower(root.get("title")), likePattern);
            Predicate descriptionPredicate = builder.like(builder.lower(root.get("description")), likePattern);

            return builder.or(titlePredicate, descriptionPredicate);
        };
    }
}
