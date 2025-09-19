package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.test.context.ActiveProfiles;
import pi.ms_properties.domain.Type;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.ITypeRepository;
import pi.ms_properties.specification.TypeSpecification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EnableJpaRepositories(
        basePackages = "pi.ms_properties.repository",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = IPropertyRepository.class
        )
)
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

    // casos de éxito

    @Test
    void whenSearchByExactName_shouldReturnMatchingType() {
        Specification<Type> spec = TypeSpecification.textSearch("casa");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).containsIgnoringCase("Casa");
    }

    @Test
    void whenSearchByPartialName_shouldReturnMultipleTypes() {
        Specification<Type> spec = TypeSpecification.textSearch("a");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_shouldReturnAll() {
        Specification<Type> spec = TypeSpecification.textSearch(null);
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_shouldReturnAll() {
        Specification<Type> spec = TypeSpecification.textSearch("   ");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueDoesNotMatch_shouldReturnEmptyList() {
        Specification<Type> spec = TypeSpecification.textSearch("inexistente");
        List<Type> result = typeRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}