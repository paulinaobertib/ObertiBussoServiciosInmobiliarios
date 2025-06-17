package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.test.context.ActiveProfiles;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.IOwnerRepository;
import pi.ms_properties.specification.OwnerSpecification;

import java.util.List;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@DataJpaTest
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
        owner1.setMail("juan@example.com");
        owner1.setPhone("123456");

        Owner owner2 = new Owner();
        owner2.setFirstName("Ana");
        owner2.setLastName("García");
        owner2.setMail("ana@example.com");
        owner2.setPhone("654321");

        entityManager.persist(owner1);
        entityManager.persist(owner2);
        entityManager.flush();
    }

    // casos de exito

    @Test
    void whenSearchingByText_thenReturnsMatchingOwners() {
        Specification<Owner> spec = OwnerSpecification.textSearch("juan");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getFirstName()).isEqualTo("Juan");
    }

    @Test
    void whenSearchingByPartialMail_thenReturnsMatchingOwners() {
        Specification<Owner> spec = OwnerSpecification.textSearch("example");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_thenReturnsAllOwners() {
        Specification<Owner> spec = OwnerSpecification.textSearch(null);
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_thenReturnsAllOwners() {
        Specification<Owner> spec = OwnerSpecification.textSearch("   ");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenNoMatchFound_thenReturnsEmptyList() {
        Specification<Owner> spec = OwnerSpecification.textSearch("nonexistent");
        List<Owner> result = ownerRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}
