package pi.ms_properties.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import pi.ms_properties.domain.Type;

@Repository
public interface ITypeRepository extends JpaRepository<Type, Long> {
}
