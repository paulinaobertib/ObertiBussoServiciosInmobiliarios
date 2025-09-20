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
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.specification.PropertySpecification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EnableJpaRepositories(
        basePackages = "pi.ms_properties.repository",
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {}
        )
)
@ActiveProfiles("test")
class PropertySpecificationTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private IPropertyRepository propertyRepository;

    private Property testProperty;

    @BeforeEach
    void setUp() {
        Owner owner = new Owner();
        owner.setFirstName("Juan");
        owner.setLastName("Pérez");
        owner.setEmail("juan@email.com");
        owner.setPhone("123456");
        entityManager.persist(owner);

        Type type = new Type();
        type.setName("Casa");
        type.setHasBathrooms(true);
        type.setHasRooms(true);
        type.setHasBedrooms(true);
        type.setHasCoveredArea(true);
        entityManager.persist(type);

        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setName("Centro");
        neighborhood.setCity("Córdoba");
        neighborhood.setType(NeighborhoodType.ABIERTO);
        neighborhood.setLatitude(-34.6037);
        neighborhood.setLongitude(-58.3816);
        entityManager.persist(neighborhood);

        Amenity pileta = new Amenity();
        pileta.setName("Pileta");
        entityManager.persist(pileta);

        Property property = new Property();
        property.setTitle("Propiedad con pileta");
        property.setStreet("Av. Siempre Viva");
        property.setNumber("742");
        property.setRooms(3f);
        property.setBathrooms(2f);
        property.setBedrooms(3f);
        property.setArea(120f);
        property.setCoveredArea(100f);
        property.setPrice(BigDecimal.valueOf(150000.0));
        property.setShowPrice(true);
        property.setExpenses(BigDecimal.valueOf(2000));
        property.setDescription("Casa con pileta en el centro de Córdoba");
        property.setDate(LocalDateTime.now());
        property.setStatus(Status.DISPONIBLE);
        property.setOperation(Operation.VENTA);
        property.setCurrency(Currency.ARS);
        property.setCredit(true);
        property.setFinancing(false);
        property.setOutstanding(false);
        property.setOwner(owner);
        property.setNeighborhood(neighborhood);
        property.setType(type);
        property.setAmenities(Set.of(pileta));

        testProperty = entityManager.persist(property);
        entityManager.flush();
    }

    // casos de exito

    @Test
    void whenSearchByPriceRange_shouldReturnProperty() {
        Specification<Property> spec = Specification.where(PropertySpecification.hasPriceFrom(BigDecimal.valueOf(90000)))
                .and(PropertySpecification.hasPriceTo(BigDecimal.valueOf(150000.0)));

        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).hasSize(1);
        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByAreaRange_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasAreaFrom(100f)
                .and(PropertySpecification.hasAreaTo(130f));

        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByAmenity_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasAmenity(List.of("pileta"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByCity_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasCity(List.of("córdoba"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).hasSize(1);
    }

    @Test
    void whenSearchByNeighborhood_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasNeighborhood(List.of("centro"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isNotEmpty();
    }

    @Test
    void whenSearchByText_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.textSearch("pileta");
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isNotEmpty();
    }

    @Test
    void whenSearchByCoveredAreaRange_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasCoveredAreaFrom(90f)
                .and(PropertySpecification.hasCoveredAreaTo(110f));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByRooms_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasRooms(List.of(3f));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByOperation_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasOperation("venta");
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByType_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasType(List.of("casa"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByCreditTrue_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasCredit(true);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByFinancingFalse_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasFinancing(false);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenSearchByCurrency_shouldReturnProperty() {
        Specification<Property> spec = PropertySpecification.hasCurrency(Currency.ARS);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenPriceFromIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasPriceFrom(BigDecimal.ZERO);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenPriceToIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasPriceTo(BigDecimal.ZERO);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenAreaFromIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasAreaFrom(0f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenAreaToIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasAreaTo(0f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCoveredAreaFromIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCoveredAreaFrom(0f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCoveredAreaToIsZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCoveredAreaTo(0f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenRoomsListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasRooms(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenRoomsListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasRooms(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenRoomsListOnlyHasZero_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasRooms(List.of(0f));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenOperationIsBlank_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasOperation("   ");
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenTypeListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasType(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenTypeListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasType(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenAmenityListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasAmenity(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenAmenityListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasAmenity(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCityListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCity(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCityListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCity(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenNeighborhoodListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasNeighborhood(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenNeighborhoodListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasNeighborhood(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenNeighborhoodTypeListIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasNeighborhoodType(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenNeighborhoodTypeListIsEmpty_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasNeighborhoodType(List.of());
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCreditIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCredit(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenFinancingIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasFinancing(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    @Test
    void whenCurrencyIsNull_shouldReturnAll() {
        Specification<Property> spec = PropertySpecification.hasCurrency(null);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).contains(testProperty);
    }

    // casos de error

    @Test
    void whenSearchPriceTooLow_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasPriceFrom(BigDecimal.valueOf(200000));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenSearchAreaTooHigh_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasAreaTo(50f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenAmenityNotPresent_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasAmenity(List.of("jacuzzi"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenCityDoesNotMatch_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasCity(List.of("Buenos Aires"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenTextSearchFails_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.textSearch("inexistente");
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenCoveredAreaOutOfRange_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasCoveredAreaTo(50f);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenRoomsDoNotMatch_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasRooms(List.of(5f));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenOperationDoesNotMatch_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasOperation("alquiler");
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenTypeDoesNotMatch_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasType(List.of("departamento"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenNeighborhoodTypeDoesNotMatch_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasNeighborhoodType(List.of("cerrado"));
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenCreditFalse_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasCredit(false);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }

    @Test
    void whenFinancingTrue_shouldReturnEmpty() {
        Specification<Property> spec = PropertySpecification.hasFinancing(true);
        List<Property> result = propertyRepository.findAll(spec);

        assertThat(result).isEmpty();
    }
}