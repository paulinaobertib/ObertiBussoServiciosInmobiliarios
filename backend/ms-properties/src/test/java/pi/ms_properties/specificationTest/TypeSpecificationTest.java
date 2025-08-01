package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.ITypeRepository;
import pi.ms_properties.specification.TypeSpecification;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TypeSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ITypeRepository typeRepository;

    @BeforeEach
    void setUp() {
        Type type1 = new Type();
        type1.setName("Departamento");
        type1.setHasRooms(true);
        type1.setHasBathrooms(true);
        type1.setHasBedrooms(true);
        type1.setHasCoveredArea(true);

        Type type2 = new Type();
        type2.setName("Casa");
        type2.setHasRooms(true);
        type2.setHasBathrooms(true);
        type2.setHasBedrooms(true);
        type2.setHasCoveredArea(false);

        entityManager.persist(type1);
        entityManager.persist(type2);
        entityManager.flush();
    }

    // casos de exito

    @Test
    void whenSearchingByExactName_thenReturnsMatchingType() {
        Specification<Type> spec = TypeSpecification.textSearch("casa");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Casa");
    }

    @Test
    void whenSearchingByPartialName_thenReturnsMatchingTypes() {
        Specification<Type> spec = TypeSpecification.textSearch("a");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_thenReturnsAllTypes() {
        Specification<Type> spec = TypeSpecification.textSearch(null);
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_thenReturnsAllTypes() {
        Specification<Type> spec = TypeSpecification.textSearch("   ");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenNoMatchFound_thenReturnsEmptyList() {
        Specification<Type> spec = TypeSpecification.textSearch("nonexistent");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}
