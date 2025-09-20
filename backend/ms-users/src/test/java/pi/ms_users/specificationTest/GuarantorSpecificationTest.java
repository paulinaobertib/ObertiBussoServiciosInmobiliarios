package pi.ms_users.specificationTest;

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
import pi.ms_users.domain.Guarantor;
import pi.ms_users.repository.IGuarantorRepository;
import pi.ms_users.repository.IContractRepository;
import pi.ms_users.specification.GuarantorSpecification;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EnableJpaRepositories(
        basePackages = "pi.ms_users.repository",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = IContractRepository.class
        )
)
@ActiveProfiles("test")
class GuarantorSpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private IGuarantorRepository guarantorRepository;

    @BeforeEach
    void setUp() {
        Guarantor g1 = new Guarantor();
        g1.setName("Juan Perez");
        g1.setEmail("juan.perez@example.com");
        g1.setPhone("123456789");

        Guarantor g2 = new Guarantor();
        g2.setName("Maria Lopez");
        g2.setEmail("maria.lopez@example.com");
        g2.setPhone("987654321");

        entityManager.persist(g1);
        entityManager.persist(g2);
        entityManager.flush();
    }

    // casos de éxito

    @Test
    void whenSearchByName_shouldReturnMatchingGuarantor() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("Juan");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getName()).containsIgnoringCase("Juan");
    }

    @Test
    void whenSearchByEmail_shouldReturnMatchingGuarantor() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("maria.lopez");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getEmail()).contains("maria.lopez");
    }

    @Test
    void whenSearchByPhone_shouldReturnMatchingGuarantor() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("123456");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getPhone()).contains("123456");
    }

    @Test
    void whenSearchCommonSubstring_shouldReturnMultipleGuarantors() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("example");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    // casos de error

    @Test
    void whenSearchValueIsNull_shouldReturnAll() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch(null);
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueIsBlank_shouldReturnAll() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("   ");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).hasSize(2);
    }

    @Test
    void whenSearchValueDoesNotMatch_shouldReturnEmptyList() {
        Specification<Guarantor> spec = GuarantorSpecification.textSearch("inexistente");
        List<Guarantor> result = guarantorRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}