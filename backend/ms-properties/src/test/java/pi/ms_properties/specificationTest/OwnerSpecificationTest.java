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
import pi.ms_properties.domain.Owner;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.specification.OwnerSpecification;

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
class OwnerSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private IOwnerRepository ownerRepository;

    @BeforeEach
    void setUp() {
        Owner owner1 = new Owner();
        owner1.setFirstName("Juan");
        owner1.setLastName("Pérez");
        owner1.setEmail("juan@example.com");
        owner1.setPhone("123456");

        Owner owner2 = new Owner();
        owner2.setFirstName("Ana");
        owner2.setLastName("García");
        owner2.setEmail("ana@example.com");
        owner2.setPhone("654321");

        entityManager.persist(owner1);
        entityManager.persist(owner2);
        entityManager.flush();
    }

    // casos de éxito

    @Test
    void whenSearchByFirstName_shouldReturnMatchingOwner() {
        Specification<Owner> spec = OwnerSpecification.textSearch("juan");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getFirstName()).containsIgnoringCase("Juan");
    }

    @Test
    void whenSearchByLastName_shouldReturnMatchingOwner() {
        Specification<Owner> spec = OwnerSpecification.textSearch("garcía");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getLastName()).containsIgnoringCase("García");
    }

    @Test
    void whenSearchByEmail_shouldReturnMatchingOwners() {
        Specification<Owner> spec = OwnerSpecification.textSearch("example");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchByPhone_shouldReturnMatchingOwner() {
        Specification<Owner> spec = OwnerSpecification.textSearch("123456");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getPhone()).contains("123456");
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_shouldReturnAll() {
        Specification<Owner> spec = OwnerSpecification.textSearch(null);
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_shouldReturnAll() {
        Specification<Owner> spec = OwnerSpecification.textSearch("   ");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueDoesNotMatch_shouldReturnEmptyList() {
        Specification<Owner> spec = OwnerSpecification.textSearch("inexistente");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}