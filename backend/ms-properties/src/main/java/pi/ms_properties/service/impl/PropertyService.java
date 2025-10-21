package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import pi.ms_properties.domain.*;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.dto.*;
import pi.ms_properties.dto.feign.ContractDTO;
import pi.ms_properties.dto.feign.NotificationDTO;
import pi.ms_properties.dto.feign.NotificationType;
import pi.ms_properties.recommendation.service.RecommendationService;
import pi.ms_properties.repository.*;
import pi.ms_properties.repository.feign.ContractRepository;
import pi.ms_properties.repository.feign.NotificationRepository;
import pi.ms_properties.service.interf.IImageService;
import pi.ms_properties.service.interf.IPropertyService;
import pi.ms_properties.service.interf.IViewService;
import pi.ms_properties.specification.PropertySpecification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService implements IPropertyService {

    private final IPropertyRepository propertyRepository;

    private final IOwnerRepository ownerRepository;

    private final INeighborhoodRepository neighborhoodRepository;

    private final ITypeRepository typeRepository;

    private final IAmenityRepository amenityRepository;

    private final IViewService viewService;

    private final ObjectMapper mapper;

    private final IImageService imageService;

    private final NotificationRepository notificationRepository;

    private final AzureBlobStorage azureBlobStorage;

    private final RecommendationService recommendationService;

    private final IChatSessionRepository chatSessionRepository;

    private final IChatMessageRepository chatMessageRepository;

    private final IChatDerivationRepository chatDerivationRepository;

    private final ContractRepository contractRepository;

    private final IViewRepository viewRepository;

    private Property SaveProperty(PropertyUpdateDTO propertyDTO) {
        Property property = mapper.convertValue(propertyDTO, Property.class);

        property.setStatus(Status.fromString(propertyDTO.getStatus()));
        property.setOperation(Operation.fromString(propertyDTO.getOperation()));
        property.setCurrency(Currency.fromString(propertyDTO.getCurrency()));

        property.setOwner(ownerRepository.findById(propertyDTO.getOwnerId())
                .orElseThrow(() -> new NoSuchElementException("No se encontró el Owner con ID: " + propertyDTO.getOwnerId())));

        property.setNeighborhood(neighborhoodRepository.findById(propertyDTO.getNeighborhoodId())
                .orElseThrow(() -> new NoSuchElementException("No se encontró el Neighborhood con ID: " + propertyDTO.getNeighborhoodId())));

        property.setType(typeRepository.findById(propertyDTO.getTypeId())
                .orElseThrow(() -> new NoSuchElementException("No se encontró el Type con ID: " + propertyDTO.getTypeId())));

        Set<Amenity> amenities = propertyDTO.getAmenitiesIds().stream()
                .map(id -> amenityRepository.findById(id)
                        .orElseThrow(() -> new NoSuchElementException("No se encontró el Amenity con ID: " + id)))
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
        response.setOutstanding(property.getOutstanding());
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
        PropertyUpdateDTO propertyUpdateDTO = mapper.convertValue(propertyDTO, PropertyUpdateDTO.class);
        Property property = SaveProperty(propertyUpdateDTO);
        property.setDate(LocalDateTime.now());

        propertyRepository.save(property);

        String path = imageService.uploadImageToProperty(propertyDTO.getMainImage(), property.getId(), true);
        property.setMainImage(path);

        List<MultipartFile> images = propertyDTO.getImages();
        if (images != null && !images.isEmpty()) {
            for (MultipartFile image : images) {
                imageService.uploadImageToProperty(image, property.getId(), false);
            }
        }

        propertyRepository.save(property);

        boolean notificationFailed = false;
        boolean recommendationFailed = false;

        try {
            NotificationDTO notificationDTO = new NotificationDTO();
            notificationDTO.setDate(property.getDate());
            notificationDTO.setType(NotificationType.PROPIEDADNUEVA);
            notificationRepository.createNotification(notificationDTO, property.getId());
        } catch (Exception e) {
            notificationFailed = true;
        }

        try {
            recommendationService.evaluateNewProperty(property);
        } catch (Exception e) {
            recommendationFailed = true;
        }

        if (notificationFailed && recommendationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero fallaron la notificación y la recomendación.");
        } else if (notificationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero falló la notificación.");
        } else if (recommendationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero falló el servicio de recomendación.");
        } else {
            return ResponseEntity.ok("La propiedad se ha guardado correctamente.");
        }
    }

    @Transactional
    @Override
    public ResponseEntity<String> deleteProperty(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada"));

        List<ContractDTO> contractDTOS = contractRepository.findByPropertyId(property.getId());
        if (!contractDTOS.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se puede eliminar una propiedad que tiene contratos vinculados");
        }

        List<Long> sessionIds = chatSessionRepository.findIdsByPropertyId(id);

        if (!sessionIds.isEmpty()) {
            chatMessageRepository.deleteAllBySessionIds(sessionIds);
            chatDerivationRepository.deleteAllBySessionIds(sessionIds);
        }

        viewRepository.deleteAllByPropertyId(id);
        chatSessionRepository.deleteAllByPropertyId(id);
        propertyRepository.delete(property);

        return ResponseEntity.ok("Se ha eliminado la propiedad");
    }

    @Override
    public ResponseEntity<PropertyDTO> updateProperty(Long id, PropertyUpdateDTO propertyDTO) {
        Property current = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada"));

        Property updated = SaveProperty(propertyDTO);
        updated.setId(id);
        updated.setDate(current.getDate());

        MultipartFile newMain = propertyDTO.getMainImageUpdated();
        if (newMain != null && !newMain.isEmpty()) {
            imageService.deleteImageByName(current.getMainImage());
            String path = imageService.uploadImageToProperty(newMain, id, true);
            updated.setMainImage(path);
        } else {
            updated.setMainImage(current.getMainImage());
        }

        updated.setImages(current.getImages());
        propertyRepository.save(updated);

        return ResponseEntity.ok(toDTO(updated));
    }

    @Override
    public ResponseEntity<String> updateStatus(Long id, Status status) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada"));

        property.setStatus(status);
        propertyRepository.save(property);

        return ResponseEntity.ok(property.getStatus().toString());
    }

    @Override
    public ResponseEntity<String> updateOutstanding(Long id, Boolean outstanding) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada"));

        property.setOutstanding(outstanding);
        propertyRepository.save(property);

        return ResponseEntity.ok("Se ha actualizado la prioridad de la propiedad.");
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getAll() {
        List<Property> properties = propertyRepository.findAll();

        if (properties.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<PropertyDTO> propertyDTOS = properties.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(propertyDTOS);
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getAllUsers() {
        List<Property> properties = propertyRepository.findByStatus(Status.valueOf("DISPONIBLE"));

        List<PropertyDTO> propertyDTOS = properties.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(propertyDTOS);
    }

    @Override
    public ResponseEntity<PropertyDTO> getById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Propiedad no encontrada"));

        viewService.createView(property, LocalDateTime.now());

        return ResponseEntity.ok(toDTO(property));
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> getByStatus(Status status) {
        List<Property> properties = propertyRepository.findByStatus(status);

        List<PropertyDTO> propertyDTOS = properties.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(propertyDTOS);
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> findBy(
            BigDecimal priceFrom, BigDecimal priceTo,
            float areaFrom, float areaTo,
            float coveredAreaFrom, float coveredAreaTo,
            List<Float> rooms, String operation, List<String> types,
            List<String> amenities, List<String> cities, List<String> neighborhoods, List<String> neighborhoodTypes,
            Boolean credit, Boolean financing,
            Currency currency) {

        Specification<Property> spec = Specification
                .where(PropertySpecification.hasPriceFrom(priceFrom))
                .and(PropertySpecification.hasPriceTo(priceTo))
                .and(PropertySpecification.hasAreaFrom(areaFrom))
                .and(PropertySpecification.hasAreaTo(areaTo))
                .and(PropertySpecification.hasCoveredAreaFrom(coveredAreaFrom))
                .and(PropertySpecification.hasCoveredAreaTo(coveredAreaTo))
                .and(PropertySpecification.hasRooms(rooms))
                .and(PropertySpecification.hasOperation(operation))
                .and(PropertySpecification.hasType(types))
                .and(PropertySpecification.hasAmenity(amenities))
                .and(PropertySpecification.hasCity(cities))
                .and(PropertySpecification.hasNeighborhood(neighborhoods))
                .and(PropertySpecification.hasNeighborhoodType(neighborhoodTypes))
                .and(PropertySpecification.hasCredit(credit))
                .and(PropertySpecification.hasFinancing(financing))
                .and(PropertySpecification.hasCurrency(currency));

        List<Property> properties = propertyRepository.findAll(spec);

        List<PropertyDTO> propertyDTOS = properties.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(propertyDTOS);
    }

    @Override
    public ResponseEntity<List<PropertyDTO>> findByTitleDescription(String value) {
        Specification<Property> specification = PropertySpecification.textSearch(value);

        List<Property> properties = propertyRepository.findAll(specification);

        List<PropertyDTO> propertyDTOS = properties.stream()
                .map(this::toDTO)
                .toList();

        return ResponseEntity.ok(propertyDTOS);
    }

    @Override
    public ResponseEntity<PropertySimpleDTO> getSimpleById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Propiedad no encontrada"));

        PropertySimpleDTO dto = new PropertySimpleDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setPrice(property.getPrice());
        dto.setDescription(property.getDescription());
        dto.setDate(property.getDate());
        dto.setMainImage(azureBlobStorage.getImageUrl(property.getMainImage()));
        dto.setStatus(property.getStatus().toString());
        dto.setOperation(property.getOperation().name());
        dto.setCurrency(property.getCurrency().name());
        dto.setNeighborhood(property.getNeighborhood().getName());
        dto.setType(property.getType().getName());

        return ResponseEntity.ok(dto);
    }

}
