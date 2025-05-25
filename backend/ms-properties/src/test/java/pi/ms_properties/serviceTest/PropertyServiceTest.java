package pi.ms_properties.serviceTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.*;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.dto.*;
import pi.ms_properties.repository.*;
import pi.ms_properties.service.impl.AzureBlobStorage;
import pi.ms_properties.service.impl.ImageService;
import pi.ms_properties.service.impl.PropertyService;
import pi.ms_properties.service.impl.ViewService;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PropertyServiceTest {

    @InjectMocks
    private PropertyService propertyService;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private IImageRepository imageRepository;

    @Mock
    private IOwnerRepository ownerRepository;

    @Mock
    private ITypeRepository typeRepository;

    @Mock
    private INeighborhoodRepository neighborhoodRepository;

    @Mock
    private IAmenityRepository amenityRepository;

    @Mock
    private ImageService imageService;

    @Mock
    private ObjectMapper mapper;

    @Mock
    private AzureBlobStorage azureBlobStorage;

    @Mock
    private ViewService viewService;

    private Property property;
    private PropertyDTO propertyDTO;
    private PropertySaveDTO propertySaveDTO;
    private PropertyUpdateDTO propertyUpdateDTO;
    private PropertySimpleDTO propertySimpleDTO;
    private Owner owner;
    private Neighborhood neighborhood;
    private Type type;
    private Set<Amenity> amenities;
    private Set<Image> images;

    @BeforeEach
    void setUp() {
        type = new Type();
        type.setId(1L);
        type.setName("Casa");
        type.setHasCoveredArea(true);
        type.setHasBedrooms(true);
        type.setHasRooms(true);
        type.setHasBathrooms(true);

        owner = new Owner();
        owner.setId(1L);
        owner.setFirstName("John");
        owner.setLastName("Doe");
        owner.setMail("john.doe@mail.com");
        owner.setPhone("123456789");

        NeighborhoodDTO neighborhoodDTO = new NeighborhoodDTO();
        neighborhoodDTO.setId(1L);
        neighborhoodDTO.setType(NeighborhoodType.ABIERTO.name());
        neighborhoodDTO.setName("Barrio Norte");
        neighborhoodDTO.setCity("CABA");

        neighborhood = new Neighborhood();
        neighborhood.setId(neighborhoodDTO.getId());
        neighborhood.setName(neighborhoodDTO.getName());
        neighborhood.setCity(neighborhoodDTO.getCity());
        neighborhood.setType(NeighborhoodType.valueOf(neighborhoodDTO.getType()));

        Amenity amenity = new Amenity();
        amenity.setId(1L);
        amenity.setName("Pileta");

        amenities = new HashSet<>();
        amenities.add(amenity);

        Image image = new Image();
        image.setId(1L);
        image.setUrl("https://ejemplo.com/image.jpg");

        Image image2 = new Image();
        image2.setUrl("https://example.com/image2.jpg");

        images = new HashSet<>();
        images.add(image);
        images.add(image2);

        property = new Property();
        property.setTitle("Hermosa casa en venta");
        property.setStreet("Av. Siempre Viva");
        property.setNumber("742");
        property.setRooms(4f);
        property.setBathrooms(2f);
        property.setBedrooms(3f);
        property.setArea(300f);
        property.setCoveredArea(250f);
        property.setPrice(150000f);
        property.setShowPrice(true);
        property.setExpenses(5000f);
        property.setDescription("Casa amplia con pileta y jardín. Ideal para familias.");
        property.setDate(LocalDateTime.now());
        property.setMainImage("https://ejemplo.com/mainImage.jpg");
        property.setStatus(Status.DISPONIBLE);
        property.setOperation(Operation.VENTA);
        property.setCurrency(Currency.USD);
        property.setCredit(true);
        property.setFinancing(false);
        property.setOwner(owner);
        property.setNeighborhood(neighborhood);
        property.setType(type);
        property.setAmenities(amenities);
        image.setProperty(property);
        image2.setProperty(property);
        property.setImages(images);

        propertyDTO = new PropertyDTO();
        propertyDTO.setId(1L);
        propertyDTO.setTitle("Hermosa casa en venta");
        propertyDTO.setStreet("Av. Siempre Viva");
        propertyDTO.setNumber("742");
        propertyDTO.setRooms(4f);
        propertyDTO.setBathrooms(2f);
        propertyDTO.setBedrooms(3f);
        propertyDTO.setArea(300f);
        propertyDTO.setCoveredArea(250f);
        propertyDTO.setPrice(150000f);
        propertyDTO.setShowPrice(true);
        propertyDTO.setExpenses(5000f);
        propertyDTO.setCredit(true);
        propertyDTO.setFinancing(false);
        propertyDTO.setDescription("Casa amplia con pileta y jardín. Ideal para familias.");
        propertyDTO.setDate(LocalDateTime.now());
        propertyDTO.setMainImage("https://ejemplo.com/mainImage.jpg");
        propertyDTO.setStatus("DISPONIBLE");
        propertyDTO.setOperation("VENTA");
        propertyDTO.setCurrency("USD");
        propertyDTO.setNeighborhood(neighborhoodDTO);
        propertyDTO.setType(type);
        propertyDTO.setAmenities(amenities);
        propertyDTO.setImages(images);

        propertySaveDTO = new PropertySaveDTO();
        propertySaveDTO.setTitle("Hermosa casa en venta");
        propertySaveDTO.setStreet("Av. Siempre Viva");
        propertySaveDTO.setNumber("742");
        propertySaveDTO.setRooms(4f);
        propertySaveDTO.setBathrooms(2f);
        propertySaveDTO.setBedrooms(3f);
        propertySaveDTO.setArea(300f);
        propertySaveDTO.setCoveredArea(250f);
        propertySaveDTO.setPrice(150000f);
        propertySaveDTO.setShowPrice(true);
        propertySaveDTO.setExpenses(5000f);
        propertySaveDTO.setCredit(true);
        propertySaveDTO.setFinancing(false);
        propertySaveDTO.setDescription("Casa amplia con pileta y jardín. Ideal para familias.");
        propertySaveDTO.setStatus("DISPONIBLE");
        propertySaveDTO.setOperation("VENTA");
        propertySaveDTO.setCurrency("USD");
        propertySaveDTO.setOwnerId(1L);
        propertySaveDTO.setNeighborhoodId(1L);
        propertySaveDTO.setTypeId(1L);
        propertySaveDTO.setAmenitiesIds(List.of(1L));

        MockMultipartFile mainImage = new MockMultipartFile(
                "mainImage",
                "mainImage.jpg",
                "image/jpeg",
                "contenido de imagen".getBytes()
        );
        propertySaveDTO.setMainImage(mainImage);

        MockMultipartFile image4 = new MockMultipartFile(
                "image4",
                "image4.jpg",
                "image/jpeg",
                "imagen 4".getBytes()
        );

        MockMultipartFile image3 = new MockMultipartFile(
                "image3",
                "image3.jpg",
                "image/jpeg",
                "imagen 3".getBytes()
        );

        propertySaveDTO.setImages(List.of(image4, image3));

        MockMultipartFile mainImageUpdated = new MockMultipartFile(
                "mainImageUpdated",
                "mainImageUpdated.jpg",
                "image/jpeg",
                "nueva imagen principal".getBytes()
        );

        propertyUpdateDTO = new PropertyUpdateDTO();
        propertyUpdateDTO.setTitle("Casa renovada en venta");
        propertyUpdateDTO.setStreet("Av. Siempre Viva");
        propertyUpdateDTO.setNumber("742");
        propertyUpdateDTO.setRooms(5f);
        propertyUpdateDTO.setBathrooms(3f);
        propertyUpdateDTO.setBedrooms(4f);
        propertyUpdateDTO.setArea(320f);
        propertyUpdateDTO.setCoveredArea(270f);
        propertyUpdateDTO.setPrice(160000f);
        propertyUpdateDTO.setShowPrice(true);
        propertyUpdateDTO.setExpenses(5200f);
        propertyUpdateDTO.setCredit(true);
        propertyUpdateDTO.setFinancing(true);
        propertyUpdateDTO.setDescription("Casa renovada, ideal para familias numerosas.");
        propertyUpdateDTO.setStatus("DISPONIBLE");
        propertyUpdateDTO.setOperation("VENTA");
        propertyUpdateDTO.setCurrency("USD");
        propertyUpdateDTO.setMainImageUpdated(mainImageUpdated);
        propertyUpdateDTO.setOwnerId(1L);
        propertyUpdateDTO.setNeighborhoodId(1L);
        propertyUpdateDTO.setTypeId(1L);
        propertyUpdateDTO.setAmenitiesIds(List.of(1L));

        propertySimpleDTO = new PropertySimpleDTO();
        propertySimpleDTO.setId(1L);
        propertySimpleDTO.setTitle("Hermosa casa en venta");
        propertySimpleDTO.setPrice(150000f);
        propertySimpleDTO.setDescription("Casa amplia con pileta y jardín. Ideal para familias.");
        propertySimpleDTO.setDate(LocalDateTime.now());
        propertySimpleDTO.setMainImage("https://ejemplo.com/mainImage.jpg");
        propertySimpleDTO.setStatus("DISPONIBLE");
        propertySimpleDTO.setOperation("VENTA");
        propertySimpleDTO.setCurrency("USD");
        propertySimpleDTO.setNeighborhood("Barrio Norte");
        propertySimpleDTO.setType("Casa");
    }

    // casos de exito

    @Test
    void testCreateProperty_success() {
        when(mapper.convertValue(propertySaveDTO, PropertyUpdateDTO.class))
                .thenReturn(propertyUpdateDTO);

        when(mapper.convertValue(propertyUpdateDTO, Property.class))
                .thenReturn(property);

        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhood));
        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenities.iterator().next()));

        when(propertyRepository.save(ArgumentMatchers.<Property>any())).thenReturn(property);

        when(imageService.uploadImageToProperty(
                eq(propertySaveDTO.getMainImage()),
                anyLong(), // acepta cualquier ID de propiedad
                eq(true)))
                .thenReturn("https://example.com/mainImage.jpg");

        when(imageService.uploadImageToProperty(
                ArgumentMatchers.<MultipartFile>any(),
                anyLong(),
                eq(false))
        ).thenReturn("https://example.com/extra.jpg");

        ResponseEntity<String> response = propertyService.createProperty(propertySaveDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha guardado la propiedad", response.getBody());
    }

    @Test
    void testDeleteProperty_success() {
        Long propertyId = 1L;
        Property property = new Property();
        property.setId(propertyId);

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(property));
        doNothing().when(propertyRepository).deleteById(propertyId);

        ResponseEntity<String> response = propertyService.deleteProperty(propertyId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Se ha eliminado la propiedad", response.getBody());

        verify(propertyRepository, times(1)).deleteById(propertyId);
    }

    @Test
    void testUpdateProperty_success_withNewMainImage() {
        when(ownerRepository.findById(anyLong())).thenReturn(Optional.of(owner));
        when(neighborhoodRepository.findById(anyLong())).thenReturn(Optional.of(neighborhood));
        when(typeRepository.findById(anyLong())).thenReturn(Optional.of(type));
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenities.iterator().next()));
        when(mapper.convertValue(propertyUpdateDTO, Property.class)).thenReturn(property);

        Long id = 1L;
        property.setId(id);

        MultipartFile newMainImage = mock(MultipartFile.class);
        when(newMainImage.isEmpty()).thenReturn(false);
        propertyUpdateDTO.setMainImageUpdated(newMainImage);

        when(propertyRepository.findById(id)).thenReturn(Optional.of(property));
        when(mapper.convertValue(propertyUpdateDTO, Property.class)).thenReturn(new Property());
        when(propertyRepository.save(ArgumentMatchers.<Property>any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(imageService.uploadImageToProperty(newMainImage, id, true)).thenReturn("newImagePath.jpg");
        String newImagePath = imageService.uploadImageToProperty(newMainImage, id, true);
        property.setMainImage(newImagePath);
        propertyDTO.setMainImage(newImagePath);

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(id, propertyUpdateDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testUpdateProperty_success_withoutNewMainImage() {
        when(ownerRepository.findById(anyLong())).thenReturn(Optional.of(owner));
        when(neighborhoodRepository.findById(anyLong())).thenReturn(Optional.of(neighborhood));
        when(typeRepository.findById(anyLong())).thenReturn(Optional.of(type));
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenities.iterator().next()));
        when(mapper.convertValue(propertyUpdateDTO, Property.class)).thenReturn(property);

        Long id = 1L;
        property.setId(id);

        propertyUpdateDTO.setMainImageUpdated(null);

        when(propertyRepository.findById(id)).thenReturn(Optional.of(property));
        when(mapper.convertValue(propertyUpdateDTO, Property.class)).thenReturn(new Property());
        when(propertyRepository.save(ArgumentMatchers.<Property>any())).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(id, propertyUpdateDTO);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        verify(imageService, never()).deleteImageByName(anyString());
    }

    @Test
    void testUpdateStatus_success() {
        Long id = 1L;
        Status newStatus = Status.ALQUILADA;

        property.setStatus(Status.DISPONIBLE);

        when(propertyRepository.findById(id)).thenReturn(Optional.of(property));

        when(propertyRepository.save(ArgumentMatchers.<Property>any())).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<String> response = propertyService.updateStatus(id, newStatus);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(newStatus.toString(), response.getBody());
        assertEquals(newStatus, property.getStatus());
        verify(propertyRepository).findById(id);
        verify(propertyRepository).save(property);
    }

    @Test
    void testGetAllProperties_success() {
        List<Property> propertyList = List.of(property);

        when(propertyRepository.findAll()).thenReturn(propertyList);

        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(propertyDTO.getTitle(), response.getBody().getFirst().getTitle());
    }

    @Test
    void testGetAllProperties_emptyList_returnsNoContent() {
        when(propertyRepository.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAll();

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
    }

    @Test
    void testGetAllUsers_success() {
        List<Property> propertyList = List.of(property);

        when(propertyRepository.findByStatus(Status.DISPONIBLE)).thenReturn(propertyList);
        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(propertyDTO.getTitle(), response.getBody().getFirst().getTitle());
    }

    @Test
    void testGetById_success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<PropertyDTO> response = propertyService.getById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(propertyDTO.getTitle(), response.getBody().getTitle());
    }

    @Test
    void testGetByStatus_success() {
        List<Property> propertyList = List.of(property);

        when(propertyRepository.findByStatus(Status.DISPONIBLE)).thenReturn(propertyList);
        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<List<PropertyDTO>> response = propertyService.getByStatus(Status.DISPONIBLE);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(propertyDTO.getTitle(), response.getBody().getFirst().getTitle());
    }

    @Test
    void testFindBy_success() {
        List<Property> propertyList = List.of(property);

        when(propertyRepository.findAll(ArgumentMatchers.<Specification<Property>>any())).thenReturn(propertyList);
        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<List<PropertyDTO>> response = propertyService.findBy(
                0, 1000000,
                0, 1000,
                0, 500,
                3,
                "VENTA",
                "CASA",
                List.of("Pileta"),
                "CABA",
                "Palermo",
                "ABIERTO",
                true,
                false
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(propertyDTO.getTitle(), response.getBody().getFirst().getTitle());
    }

    @Test
    void testFindByTitleDescription_success() {
        List<Property> propertyList = List.of(property);

        when(propertyRepository.findAll(ArgumentMatchers.<Specification<Property>>any())).thenReturn(propertyList);
        when(mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class))
                .thenReturn(propertyDTO.getNeighborhood());

        ResponseEntity<List<PropertyDTO>> response = propertyService.findByTitleDescription("moderno");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals(propertyDTO.getTitle(), response.getBody().getFirst().getTitle());
    }

    @Test
    void testGetSimpleById_success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(azureBlobStorage.getImageUrl(property.getMainImage())).thenReturn("https://example.com/mainImage.jpg");

        ResponseEntity<PropertySimpleDTO> response = propertyService.getSimpleById(1L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        PropertySimpleDTO dto = response.getBody();
        assertEquals(property.getId(), dto.getId());
        assertEquals(property.getTitle(), dto.getTitle());
        assertEquals(property.getPrice(), dto.getPrice());
        assertEquals(property.getDescription(), dto.getDescription());
        assertEquals(property.getDate(), dto.getDate());
        assertEquals("https://example.com/mainImage.jpg", dto.getMainImage());
        assertEquals(property.getStatus().toString(), dto.getStatus());
        assertEquals(property.getOperation().name(), dto.getOperation());
        assertEquals(property.getCurrency().name(), dto.getCurrency());
        assertEquals(property.getNeighborhood().getName(), dto.getNeighborhood());
        assertEquals(property.getType().getName(), dto.getType());
    }

    // casos de error

    @Test
    void testCreateProperty_fail_onSaveProperty() {
        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhood));
        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenities.iterator().next()));

        when(mapper.convertValue(propertySaveDTO, PropertyUpdateDTO.class))
                .thenReturn(propertyUpdateDTO);
        when(mapper.convertValue(propertyUpdateDTO, Property.class))
                .thenReturn(property);

        when(propertyRepository.save(ArgumentMatchers.<Property>any()))
                .thenThrow(new RuntimeException("DB error"));

        ResponseEntity<String> response = propertyService.createProperty(propertySaveDTO);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido guardar la propiedad"));
    }

    @Test
    void testCreateProperty_fail_onMainImageUpload() {
        when(mapper.convertValue(propertySaveDTO, PropertyUpdateDTO.class))
                .thenReturn(propertyUpdateDTO);
        when(mapper.convertValue(propertyUpdateDTO, Property.class))
                .thenReturn(property);

        when(ownerRepository.findById(1L)).thenReturn(Optional.of(owner));
        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhood));
        when(typeRepository.findById(1L)).thenReturn(Optional.of(type));
        when(amenityRepository.findById(1L)).thenReturn(Optional.of(amenities.iterator().next()));

        property.setId(1L);
        when(propertyRepository.save(ArgumentMatchers.<Property>any())).thenReturn(property);

        when(imageService.uploadImageToProperty(eq(propertySaveDTO.getMainImage()), anyLong(), eq(true)))
                .thenThrow(new RuntimeException("Falló subida imagen principal"));

        ResponseEntity<String> response = propertyService.createProperty(propertySaveDTO);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido guardar la propiedad"));
    }

    @Test
    void testDeleteProperty_notFound() {
        Long propertyId = 2L;

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.empty());

        ResponseEntity<String> response = propertyService.deleteProperty(propertyId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        verify(propertyRepository, never()).deleteById(anyLong());
    }

    @Test
    void testDeleteProperty_errorOnDelete() {
        Long propertyId = 3L;
        Property property = new Property();
        property.setId(propertyId);

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(property));
        doThrow(new RuntimeException("DB error")).when(propertyRepository).deleteById(propertyId);

        ResponseEntity<String> response = propertyService.deleteProperty(propertyId);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("No se ha podido eliminar la propiedad"));

        verify(propertyRepository, times(1)).deleteById(propertyId);
    }


    @Test
    void testUpdateProperty_notFound() {
        Long id = 42L;

        when(propertyRepository.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(id, propertyUpdateDTO);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testUpdateProperty_internalServerError() {
        Long id = 1L;

        when(propertyRepository.findById(id)).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<PropertyDTO> response = propertyService.updateProperty(id, propertyUpdateDTO);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testUpdateStatus_notFound() {
        Long id = 1L;
        Status newStatus = Status.DISPONIBLE;

        when(propertyRepository.findById(id)).thenReturn(Optional.empty());

        ResponseEntity<String> response = propertyService.updateStatus(id, newStatus);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        verify(propertyRepository).findById(id);
    }

    @Test
    void testUpdateStatus_exception() {
        Long id = 1L;
        Status newStatus = Status.DISPONIBLE;

        when(propertyRepository.findById(id)).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<String> response = propertyService.updateStatus(id, newStatus);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());

        verify(propertyRepository).findById(id);
    }

    @Test
    void testGetAllProperties_exceptionThrown_returnsInternalServerError() {
        when(propertyRepository.findAll()).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAll();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetAllUsers_exceptionThrown_returnsInternalServerError() {
        when(propertyRepository.findByStatus(Status.DISPONIBLE))
                .thenThrow(new RuntimeException("Error en DB"));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getAllUsers();

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetById_notFound() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        ResponseEntity<PropertyDTO> response = propertyService.getById(1L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetById_exceptionThrown_returnsInternalServerError() {
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<PropertyDTO> response = propertyService.getById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetByStatus_exceptionThrown_returnsInternalServerError() {
        when(propertyRepository.findByStatus(Status.DISPONIBLE))
                .thenThrow(new RuntimeException("DB error"));

        ResponseEntity<List<PropertyDTO>> response = propertyService.getByStatus(Status.DISPONIBLE);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testFindBy_internalServerError() {
        when(propertyRepository.findAll(ArgumentMatchers.<Specification<Property>>any())).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<List<PropertyDTO>> response = propertyService.findBy(
                0, 1000000,
                0, 1000,
                0, 500,
                3,
                "VENTA",
                "CASA",
                List.of("Pileta"),
                "CABA",
                "Palermo",
                "ABIERTO",
                true,
                false
        );

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testFindByTitleDescription_internalServerError() {
        when(propertyRepository.findAll(ArgumentMatchers.<Specification<Property>>any())).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<List<PropertyDTO>> response = propertyService.findByTitleDescription("moderno");

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void testGetSimpleById_notFound() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        ResponseEntity<PropertySimpleDTO> response = propertyService.getSimpleById(999L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testGetSimpleById_exception() {
        when(propertyRepository.findById(anyLong())).thenThrow(new RuntimeException("DB error"));

        ResponseEntity<PropertySimpleDTO> response = propertyService.getSimpleById(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}
