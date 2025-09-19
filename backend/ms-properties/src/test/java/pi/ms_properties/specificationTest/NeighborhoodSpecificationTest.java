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
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.NeighborhoodType;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.specification.NeighborhoodSpecification;

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
class NeighborhoodSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private INeighborhoodRepository neighborhoodRepository;

    @BeforeEach
    void setUp() {
        Neighborhood neighborhood1 = new Neighborhood();
        neighborhood1.setName("Las Flores");
        neighborhood1.setType(NeighborhoodType.SEMICERRADO);
        neighborhood1.setCity("Córdoba");
        neighborhood1.setLatitude(-31.4201);
        neighborhood1.setLongitude(-64.1888);

        Neighborhood neighborhood2 = new Neighborhood();
        neighborhood2.setName("Centro");
        neighborhood2.setType(NeighborhoodType.ABIERTO);
        neighborhood2.setCity("Córdoba");
        neighborhood2.setLatitude(-31.4167);
        neighborhood2.setLongitude(-64.1833);

        entityManager.persist(neighborhood1);
        entityManager.persist(neighborhood2);
        entityManager.flush();
    }

    // casos de éxito

    @Test
    void whenSearchByExactName_shouldReturnMatchingNeighborhood() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("centro");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Centro");
    }

    @Test
    void whenSearchByPartialName_shouldReturnMultipleNeighborhoods() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("o");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_shouldReturnAll() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch(null);
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_shouldReturnAll() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("   ");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueDoesNotMatch_shouldReturnEmptyList() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("nonexistent");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}