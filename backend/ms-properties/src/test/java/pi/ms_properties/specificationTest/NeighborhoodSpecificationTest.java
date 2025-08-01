package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.specification.NeighborhoodSpecification;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
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

    // casos de exito

    @Test
    void whenSearchingByExactName_thenReturnsMatchingNeighborhood() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("centro");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Centro");
    }

    @Test
    void whenSearchingByPartialName_thenReturnsMatchingNeighborhoods() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("o");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_thenReturnsAllNeighborhoods() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch(null);
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_thenReturnsAllNeighborhoods() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("   ");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenNoMatchFound_thenReturnsEmptyList() {
        Specification<Neighborhood> spec = NeighborhoodSpecification.textSearch("nonexistent");
        List<Neighborhood> result = neighborhoodRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}