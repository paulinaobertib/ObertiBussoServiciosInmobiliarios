package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.*;
import pi.ms_properties.dto.*;
import pi.ms_properties.dto.feign.NotificationDTO;
import pi.ms_properties.dto.feign.NotificationType;
import pi.ms_properties.repository.*;
import pi.ms_properties.repository.feign.NotificationRepository;
import pi.ms_properties.service.interf.IPropertyService;
import pi.ms_properties.specification.PropertySpecification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService implements IPropertyService {

    private final IPropertyRepository propertyRepository;

    private final IOwnerRepository ownerRepository;

    private final INeighborhoodRepository neighborhoodRepository;

    private final ITypeRepository typeRepository;

    private final IAmenityRepository amenityRepository;

    private final ViewService viewService;

    private final ObjectMapper mapper;

    private final ImageService imageService;

    private final NotificationRepository notificationRepository;

    private final AzureBlobStorage azureBlobStorage;

    private Property SaveProperty(PropertyUpdateDTO propertyDTO) {
        Property property = mapper.convertValue(propertyDTO, Property.class);

        property.setStatus(Status.fromString(propertyDTO.getStatus()));
        property.setOperation(Operation.fromString(propertyDTO.getOperation()));
        property.setCurrency(Currency.fromString(propertyDTO.getCurrency()));

        property.setOwner(ownerRepository.findById(propertyDTO.getOwnerId()).orElseThrow());
        property.setNeighborhood(neighborhoodRepository.findById(propertyDTO.getNeighborhoodId()).orElseThrow());
        property.setType(typeRepository.findById(propertyDTO.getTypeId()).orElseThrow());

        Set<Amenity> amenities = propertyDTO.getAmenitiesIds().stream()
                .map(id -> amenityRepository.findById(id)
                        .orElseThrow())
                .collect(Collectors.toSet());
        property.setAmenities(amenities);

        return property;
    }

    private PropertyDTO toDTO(Property property) {
        PropertyDTO response = new PropertyDTO();
        response.setId(property.getId());
        response.setTitle(property.getTitle());
        response.setStreet(property.getStreet());
        response.setNumber(property.getNumber());
        response.setRooms(property.getRooms());
        response.setBathrooms(property.getBathrooms());
        response.setBedrooms(property.getBedrooms());
        response.setArea(property.getArea());
        response.setCoveredArea(property.getCoveredArea());
        response.setPrice(property.getPrice());
        response.setShowPrice(property.getShowPrice());
        response.setExpenses(property.getExpenses());
        response.setCredit(property.getCredit());
        response.setFinancing(property.getFinancing());
        response.setDescription(property.getDescription());
        response.setDate(property.getDate());
        response.setMainImage(azureBlobStorage.getImageUrl(property.getMainImage()));

        NeighborhoodDTO neighborhoodDTO = mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class);

        response.setNeighborhood(neighborhoodDTO);
        response.setType(property.getType());
        response.setAmenities(property.getAmenities());
        response.setImages(property.getImages());
        response.setStatus(property.getStatus().toString());
        response.setOperation(property.getOperation().toString());
        response.setCurrency(property.getCurrency().toString());

        return response;
    }

    @Override
    public ResponseEntity<String> createProperty(PropertySaveDTO propertyDTO) {
        try {
            PropertyUpdateDTO propertyUpdateDTO = mapper.convertValue(propertyDTO, PropertyUpdateDTO.class);
            Property property = SaveProperty(propertyUpdateDTO);
            property.setDate(LocalDateTime.now());
            // la tenemos que guardar antes de settearle las imagenes asi existe el id
            propertyRepository.save(property);

            // para la imagen principal
            try {
                String path = imageService.uploadImageToProperty(propertyDTO.getMainImage(), property.getId(), true);
                property.setMainImage(path);
            } catch (RuntimeException e) {
                throw new RuntimeException("Fallo al subir la imagen principal", e);
            }
            // para el resto de imagenes
            List<MultipartFile> images = propertyDTO.getImages();
            if (images != null && !images.isEmpty()) {
                for (MultipartFile image : images) {
                    imageService.uploadImageToProperty(image, property.getId(), false);
                }
            }
            propertyRepository.save(property);

            // creamos la notificacion de que se agrega una nueva propiedad
            try {
                NotificationDTO notificationDTO = new NotificationDTO();
                notificationDTO.setDate(property.getDate());
                notificationDTO.setType(NotificationType.valueOf("PROPIEDADNUEVA"));
                notificationRepository.createNotification(notificationDTO, property.getId());
            } catch (Exception e) {
                System.err.println("Error al crear la notificación: " + e.getMessage());
            }

            return ResponseEntity.ok("Se ha guardado la propiedad");
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido guardar la propiedad" + e);
        }
    }

    @Override
    public ResponseEntity<String> deleteProperty(Long id) {
        try {
            Optional<Property> property = propertyRepository.findById(id);

            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            } else {
                propertyRepository.deleteById(id);
                return ResponseEntity.ok("Se ha eliminado la propiedad");
            }
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("No se ha podido eliminar la propiedad" + e);
        }
    }

    @Override
    public ResponseEntity<PropertyDTO> updateProperty(Long id, PropertyUpdateDTO propertyDTO) {
        try {
            // 1) Verificamos que la propiedad exista
            Optional<Property> optProperty = propertyRepository.findById(id);
            if (optProperty.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Property current = optProperty.get();

            Property updated = SaveProperty(propertyDTO);
            updated.setId(id);
            updated.setDate(current.getDate());

            // 3) Manejo flexible de la imagen principal
            MultipartFile newMain = propertyDTO.getMainImageUpdated();  // puede ser null
            if (newMain != null && !newMain.isEmpty()) {
                // → El usuario subió una nueva imagen: reemplazamos la anterior
                imageService.deleteImageByName(current.getMainImage());
                String path = imageService.uploadImageToProperty(newMain, id, true);
                updated.setMainImage(path);
            } else {
                // → El usuario no cambió la imagen: mantenemos la existente
                updated.setMainImage(current.getMainImage());
            }

            updated.setImages(current.getImages());
            propertyRepository.save(updated);

            PropertyDTO response = toDTO(updated);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id, Status status) {
        try {
            Optional<Property> search = propertyRepository.findById(id);
            if (search.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Property property = search.get();
            property.setStatus(status);
            propertyRepository.save(property);

            return ResponseEntity.ok(property.getStatus().toString());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getAll() {
        try {
            List<Property> properties = propertyRepository.findAll();

            if (properties.isEmpty()) {
                return ResponseEntity.noContent().build();
            }

            List<PropertyDTO> propertyDTOS = properties.stream()
                    .map(this::toDTO)
                    .toList();

            return ResponseEntity.ok(propertyDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getAllUsers() {
        try {
            List<Property> properties = propertyRepository.findByStatus(Status.valueOf("DISPONIBLE"));
            List<PropertyDTO> propertyDTOS = properties.stream()
                    .map(this::toDTO)
                    .toList();

            return ResponseEntity.ok(propertyDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<PropertyDTO> getById(Long id) {
        try {
            Optional<Property> property = propertyRepository.findById(id);

            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PropertyDTO propertyDTO = toDTO(property.get());

            Property get = property.get();
            viewService.createView(get, LocalDateTime.now());

            return ResponseEntity.ok(propertyDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getByStatus(Status status) {
        try {
            List<Property> properties = propertyRepository.findByStatus(status);
            List<PropertyDTO> propertyDTOS = properties.stream()
                    .map(this::toDTO)
                    .toList();

            return ResponseEntity.ok(propertyDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> findBy(float priceFrom, float priceTo, float areaFrom, float areaTo, float coveredAreaFrom, float coveredAreaTo, float rooms, String operation, String type, List<String> amenities, String city, String neighborhood, String neighborhoodType, Boolean credit, Boolean financing) {
        try {
            Specification<Property> spec = Specification
                    .where(PropertySpecification.hasPriceFrom(priceFrom))
                    .and(PropertySpecification.hasPriceTo(priceTo))
                    .and(PropertySpecification.hasAreaFrom(areaFrom))
                    .and(PropertySpecification.hasAreaTo(areaTo))
                    .and(PropertySpecification.hasCoveredAreaFrom(coveredAreaFrom))
                    .and(PropertySpecification.hasCoveredAreaTo(coveredAreaTo))
                    .and(PropertySpecification.hasRooms(rooms))
                    .and(PropertySpecification.hasOperation(operation))
                    .and(PropertySpecification.hasType(type))
                    .and(PropertySpecification.hasAmenity(amenities))
                    .and(PropertySpecification.hasCity(city))
                    .and(PropertySpecification.hasNeighborhood(neighborhood))
                    .and(PropertySpecification.hasNeighborhoodType(neighborhoodType))
                    .and(PropertySpecification.hasCredit(credit))
                    .and(PropertySpecification.hasFinancing(financing));

            List<Property> properties = propertyRepository.findAll(spec);
            List<PropertyDTO> propertyDTOS = properties.stream()
                    .map(this::toDTO)
                    .toList();

            return ResponseEntity.ok(propertyDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> findByTitleDescription(String value) {
        try {
            Specification<Property> specification = PropertySpecification.textSearch(value);
            List<Property> properties = propertyRepository.findAll(specification);
            List<PropertyDTO> propertyDTOS = properties.stream()
                    .map(this::toDTO)
                    .toList();
            return ResponseEntity.ok(propertyDTOS);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @Override
    public ResponseEntity<PropertySimpleDTO> getSimpleById(Long id) {
        try {
            Optional<Property> property = propertyRepository.findById(id);

            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Property get = property.get();

            PropertySimpleDTO propertyDTO = new PropertySimpleDTO();
            propertyDTO.setId(get.getId());
            propertyDTO.setTitle(get.getTitle());
            propertyDTO.setPrice(get.getPrice());
            propertyDTO.setDescription(get.getDescription());
            propertyDTO.setDate(get.getDate());
            propertyDTO.setMainImage(azureBlobStorage.getImageUrl(get.getMainImage()));
            propertyDTO.setStatus(get.getStatus().toString());
            propertyDTO.setOperation(get.getOperation().name());
            propertyDTO.setCurrency(get.getCurrency().name());
            propertyDTO.setNeighborhood(get.getNeighborhood().getName());
            propertyDTO.setType(get.getType().getName());

            return ResponseEntity.ok(propertyDTO);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
