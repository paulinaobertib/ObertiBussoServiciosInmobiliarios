package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
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
import pi.ms_properties.security.SecurityUtils;
import pi.ms_properties.specification.PropertySpecification;
import pi.ms_properties.wasi.WasiApiClient;
import pi.ms_properties.wasi.WasiApiProperties;
import pi.ms_properties.wasi.WasiJsonUtil;
import pi.ms_properties.wasi.WasiMapper;
import pi.ms_properties.wasi.WasiPropertySyncService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

    private final WasiPropertySyncService wasiPropertySyncService;

    private final WasiApiClient wasiApiClient;

    private final WasiMapper wasiMapper;

    private final WasiApiProperties wasiApiProperties;

    private Property SaveProperty(PropertyUpdateDTO propertyDTO) {
        // Jackson no puede convertir enums vacíos (""): los enums se setean explícitamente más abajo,
        // así que neutralizamos los strings en blanco antes de convertir para no romper con 400.
        if (propertyDTO.getPropertyCondition() != null && propertyDTO.getPropertyCondition().isBlank()) {
            propertyDTO.setPropertyCondition(null);
        }
        if (propertyDTO.getRentsType() != null && propertyDTO.getRentsType().isBlank()) {
            propertyDTO.setRentsType(null);
        }
        Property property = mapper.convertValue(propertyDTO, Property.class);

        property.setStatus(Status.fromString(propertyDTO.getStatus()));
        property.setOperation(Operation.fromString(propertyDTO.getOperation()));
        property.setCurrency(Currency.fromString(propertyDTO.getCurrency()));

        property.setGarages(propertyDTO.getGarages());
        property.setFloor(propertyDTO.getFloor());
        property.setVideo(propertyDTO.getVideo());
        property.setZipCode(propertyDTO.getZipCode());
        property.setPrivateArea(propertyDTO.getPrivateArea());
        property.setNetworkShare(propertyDTO.getNetworkShare() != null ? propertyDTO.getNetworkShare() : Boolean.FALSE);
        if (propertyDTO.getPropertyCondition() != null && !propertyDTO.getPropertyCondition().isBlank()) {
            try {
                property.setPropertyCondition(PropertyCondition.valueOf(propertyDTO.getPropertyCondition().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                property.setPropertyCondition(null);
            }
        } else {
            property.setPropertyCondition(null);
        }
        if (propertyDTO.getRentsType() != null && !propertyDTO.getRentsType().isBlank()) {
            try {
                property.setRentsType(RentsType.valueOf(propertyDTO.getRentsType().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                property.setRentsType(null);
            }
        } else {
            property.setRentsType(null);
        }

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
        response.setLatitude(property.getLatitude());
        response.setLongitude(property.getLongitude());
        response.setRooms(property.getRooms());
        response.setBathrooms(property.getBathrooms());
        response.setBedrooms(property.getBedrooms());
        response.setArea(property.getArea());
        response.setCoveredArea(property.getCoveredArea());
        response.setPrice(property.getPrice());
        response.setShowPrice(property.getShowPrice());
        response.setExpenses(property.getExpenses());
        response.setShowExpenses(property.getShowExpenses());
        response.setCredit(property.getCredit());
        response.setFinancing(property.getFinancing());
        response.setOutstanding(property.getOutstanding());
        response.setDescription(property.getDescription());
        response.setVideo(property.getVideo());
        response.setZipCode(property.getZipCode());
        response.setDate(property.getDate());
        response.setMainImage(azureBlobStorage.getImageUrl(property.getMainImage()));

        NeighborhoodDTO neighborhoodDTO = mapper.convertValue(property.getNeighborhood(), NeighborhoodDTO.class);

        response.setNeighborhood(neighborhoodDTO);
        response.setType(property.getType());
        response.setAmenities(property.getAmenities());
        if (property.getImages() != null) {
            Set<Image> imgs = property.getImages().stream().map(img -> {
                Image i = new Image();
                i.setId(img.getId());
                i.setUrl(azureBlobStorage.getImageUrl(img.getUrl()));
                i.setProperty(img.getProperty());
                return i;
            }).collect(Collectors.toSet());
            response.setImages(imgs);
        } else {
            response.setImages(Set.of());
        }
        response.setStatus(property.getStatus().toString());
        response.setOperation(property.getOperation().toString());
        response.setCurrency(property.getCurrency().toString());
        response.setGarages(property.getGarages());
        response.setFloor(property.getFloor());
        response.setPrivateArea(property.getPrivateArea());
        if (property.getPropertyCondition() != null) {
            response.setPropertyCondition(property.getPropertyCondition().name());
        }
        if (property.getRentsType() != null) {
            response.setRentsType(property.getRentsType().name());
        }
        response.setNetworkShare(property.getNetworkShare());

        return response;
    }

    @Override
    public PropertyDTO mapToDto(Property property) {
        return toDTO(property);
    }

    @Override
    public ResponseEntity<String> createProperty(PropertySaveDTO propertyDTO) {
        PropertyUpdateDTO propertyUpdateDTO = mapper.convertValue(propertyDTO, PropertyUpdateDTO.class);
        Property property = SaveProperty(propertyUpdateDTO);
        property.setDate(LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));

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

        try {
            wasiPropertySyncService.syncAfterLocalCreate(propertyDTO, property.getId());
        } catch (Exception ignored) {
            // best-effort
        }

        if (notificationFailed && recommendationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero fallaron la notificación y la recomendación.");
        } else if (notificationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero falló la notificación.");
        } else if (recommendationFailed) {
            return ResponseEntity.status(HttpStatus.MULTI_STATUS).body("La propiedad se guardó correctamente, pero falló el servicio de recomendación.");
        }
        return ResponseEntity.ok("La propiedad se ha guardado correctamente.");
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
        updated.setInquiries(current.getInquiries());
        updated.setComments(current.getComments());
        updated.setMaintenances(current.getMaintenances());
        propertyRepository.save(updated);

        try {
            wasiPropertySyncService.syncAfterLocalUpdate(id, propertyDTO);
        } catch (Exception e) {
            // best-effort
        }

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

        viewService.createView(property, LocalDateTime.now(ZoneId.of("America/Argentina/Buenos_Aires")));

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
            Currency currency, Status status,
            Integer garagesMin, String condition, Boolean forTransfer, String source) {
        if (status != null && !SecurityUtils.isAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los administradores puede filtrar por estado.");
        }

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
                .and(PropertySpecification.hasCurrency(currency))
                .and(PropertySpecification.hasStatus(status))
                .and(PropertySpecification.hasGaragesMin(garagesMin))
                .and(PropertySpecification.hasPropertyConditionFilter(condition));

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

    @Override
    public ResponseEntity<List<PropertySimpleDTO>> getPropertiesByIAResult(List<Map<String, Object>> iaResult) {
        if (iaResult == null || iaResult.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<Long> idsOrdered = iaResult.stream()
                .map(m -> Long.valueOf(m.get("id").toString()))
                .toList();

        List<Long> localIds = idsOrdered.stream()
                .filter(id -> id < WasiMapper.SYNTHETIC_ID_BASE)
                .toList();

        List<Property> properties = propertyRepository.findAllById(localIds);

        Map<Long, PropertySimpleDTO> dtoMap = properties.stream()
                .collect(Collectors.toMap(
                        Property::getId,
                        this::toSimpleDTO
                ));

        List<PropertySimpleDTO> ordered = new ArrayList<>();
        for (Long id : idsOrdered) {
            if (id == null) {
                continue;
            }
            if (id >= WasiMapper.SYNTHETIC_ID_BASE) {
                if (!wasiApiProperties.isConfigured()) {
                    continue;
                }
                try {
                    int wid = (int) (id - WasiMapper.SYNTHETIC_ID_BASE);
                    JsonNode root = wasiApiClient.getProperty(wid, true);
                    if (root == null || !WasiJsonUtil.isSuccess(root)) {
                        continue;
                    }
                    JsonNode prop = root;
                    if (!prop.has("id_property")) {
                        var it = root.elements();
                        while (it.hasNext()) {
                            JsonNode x = it.next();
                            if (x != null && x.isObject() && x.has("id_property")) {
                                prop = x;
                                break;
                            }
                        }
                    }
                    PropertyDTO dto = wasiMapper.fromWasiProperty(prop, false);
                    ordered.add(toSimpleFromWasiDto(dto));
                } catch (Exception ignored) {
                    // skip
                }
            } else {
                PropertySimpleDTO s = dtoMap.get(id);
                if (s != null) {
                    ordered.add(s);
                }
            }
        }

        return ResponseEntity.ok(ordered);
    }

    private PropertySimpleDTO toSimpleFromWasiDto(PropertyDTO p) {
        PropertySimpleDTO dto = new PropertySimpleDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setPrice(p.getPrice());
        dto.setDescription(p.getDescription());
        dto.setDate(p.getDate());
        dto.setMainImage(p.getMainImage());
        dto.setStatus(p.getStatus());
        dto.setOperation(p.getOperation());
        dto.setCurrency(p.getCurrency());
        dto.setNeighborhood(p.getNeighborhood() != null ? p.getNeighborhood().getName() : "");
        dto.setType(p.getType() != null ? p.getType().getName() : "");
        return dto;
    }

    private PropertySimpleDTO toSimpleDTO(Property property) {
        PropertySimpleDTO dto = new PropertySimpleDTO();
        dto.setId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setPrice(property.getPrice());
        dto.setDescription(property.getDescription());
        dto.setDate(property.getDate());
        dto.setStatus(property.getStatus().name());
        dto.setOperation(property.getOperation().name());
        dto.setCurrency(property.getCurrency().name());
        dto.setNeighborhood(property.getNeighborhood().getName());
        dto.setType(property.getType().getName());
        dto.setMainImage(azureBlobStorage.getImageUrl(property.getMainImage()));
        return dto;
    }
}