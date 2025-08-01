package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.IAmenityRepository;
import pi.ms_properties.specification.AmenitySpecification;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class AmenitySpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private IAmenityRepository amenityRepository;

    @BeforeEach
    void setUp() {
        amenityRepository.deleteAll();

        Amenity wifi = new Amenity();
        wifi.setName("WiFi");

        Amenity pool = new Amenity();
        pool.setName("Swimming Pool");

        Amenity parking = new Amenity();
        parking.setName("Parking");

        entityManager.persist(wifi);
        entityManager.persist(pool);
        entityManager.persist(parking);
        entityManager.flush();
    }

    // casos de exito

    @Test
    void whenSearchingByText_thenReturnsMatchingAmenities() {
        Specification<Amenity> spec = AmenitySpecification.textSearch("wifi");
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("WiFi");
    }

    @Test
    void whenSearchingByPartialText_thenReturnsMatchingAmenities() {
        Specification<Amenity> spec = AmenitySpecification.textSearch("pool");
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).isEqualTo("Swimming Pool");
    }

    @Test
    void whenSearchingByCommonSubstring_thenReturnsMultipleAmenities() {
        Specification<Amenity> spec = AmenitySpecification.textSearch("g");
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_thenReturnsAllAmenities() {
        Specification<Amenity> spec = AmenitySpecification.textSearch(null);
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).hasSize(3);
    }

    @Test
    void whenSearchValueIsBlank_thenReturnsAllAmenities() {
        Specification<Amenity> spec = AmenitySpecification.textSearch("   ");
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).hasSize(3);
    }

    @Test
    void whenNoMatchFound_thenReturnsEmptyList() {
        Specification<Amenity> spec = AmenitySpecification.textSearch("nonexistent");
        List<Amenity> result = amenityRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}

