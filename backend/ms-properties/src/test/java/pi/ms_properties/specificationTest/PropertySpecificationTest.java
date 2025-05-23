package pi.ms_properties.specificationTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.specification.PropertySpecification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
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
        owner.setMail("juan@mail.com");
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
        property.setPrice(95000f);
        property.setShowPrice(true);
        property.setExpenses(2000f);
        property.setDescription("Casa con pileta en el centro de Córdoba");
        property.setDate(LocalDateTime.now());
        property.setStatus(Status.DISPONIBLE);
        property.setOperation(Operation.VENTA);
        property.setCurrency(Currency.ARS);
        property.setCredit(true);
        property.setFinancing(false);
        property.setOwner(owner);
        property.setNeighborhood(neighborhood);
        property.setType(type);
        property.setAmenities(Set.of(pileta));

        testProperty = entityManager.persist(property);
    }


    // casos de exito

    @Test
    void shouldReturnPropertyByPriceRange() {
        Specification<Property> spec = Specification.where(PropertySpecification.hasPriceFrom(90000f))
                .and(PropertySpecification.hasPriceTo(100000f));
        List<Property> results = propertyRepository.findAll(spec);
        assertEquals(1, results.size());
    }

    @Test
    void shouldReturnPropertyByAreaRange() {
        Specification<Property> spec = PropertySpecification.hasAreaFrom(100f)
                .and(PropertySpecification.hasAreaTo(130f));
        List<Property> results = propertyRepository.findAll(spec);
        assertFalse(results.isEmpty());
    }

    @Test
    void shouldReturnPropertyByAmenity() {
        Specification<Property> spec = PropertySpecification.hasAmenity(List.of("pileta"));
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.contains(testProperty));
    }

    @Test
    void shouldReturnPropertyByCity() {
        Specification<Property> spec = PropertySpecification.hasCity("córdoba");
        List<Property> results = propertyRepository.findAll(spec);
        assertEquals(1, results.size());
    }

    @Test
    void shouldReturnPropertyByNeighborhood() {
        Specification<Property> spec = PropertySpecification.hasNeighborhood("centro");
        List<Property> results = propertyRepository.findAll(spec);
        assertFalse(results.isEmpty());
    }

    @Test
    void shouldReturnPropertyByTextSearch() {
        Specification<Property> spec = PropertySpecification.textSearch("pileta");
        List<Property> results = propertyRepository.findAll(spec);
        assertFalse(results.isEmpty());
    }

    // casos de error

    @Test
    void shouldReturnEmptyWhenPriceTooLow() {
        Specification<Property> spec = PropertySpecification.hasPriceFrom(200000f);
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenAreaTooHigh() {
        Specification<Property> spec = PropertySpecification.hasAreaTo(50f);
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenAmenityNotPresent() {
        Specification<Property> spec = PropertySpecification.hasAmenity(List.of("jacuzzi"));
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenCityDoesNotMatch() {
        Specification<Property> spec = PropertySpecification.hasCity("Buenos Aires");
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.isEmpty());
    }

    @Test
    void shouldReturnEmptyWhenTextSearchFails() {
        Specification<Property> spec = PropertySpecification.textSearch("inexistente");
        List<Property> results = propertyRepository.findAll(spec);
        assertTrue(results.isEmpty());
    }
}

