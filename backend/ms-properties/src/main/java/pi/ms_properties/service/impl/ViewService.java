package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pi.ms_properties.domain.Amenity;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.View;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IViewRepository;
import pi.ms_properties.service.interf.IViewService;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ViewService implements IViewService {

    private final IViewRepository viewRepository;
    private final IPropertyRepository propertyRepository;

    @Override
    public void createView(Property property, LocalDateTime date) {
        View view = new View();
        view.setDate(date);
        view.setProperty(property);
        viewRepository.save(view);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByProperty() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getTitle(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByPropertyType() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getType().getName(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByDay() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getDate().getDayOfWeek()
                                .getDisplayName(TextStyle.FULL, Locale.forLanguageTag("es")),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByMonth() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getDate().getMonth()
                                .getDisplayName(TextStyle.FULL, Locale.forLanguageTag("es")),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByNeighborhood() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getNeighborhood().getName(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByNeighborhoodType() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getNeighborhood().getType().toString(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByStatus() {
        List<Property> properties = propertyRepository.findAll();

        Map<String, Long> result = properties.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getStatus().name(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Map<String, Long>>> getViewsByStatusAndType() {
        List<Property> properties = propertyRepository.findAll();

        Map<String, Map<String, Long>> result = properties.stream()
                .collect(Collectors.groupingBy(
                        property -> property.getStatus().name(),
                        Collectors.groupingBy(
                                property -> property.getType().getName(),
                                Collectors.counting()
                        )
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<String, Long>> getViewsByOperation() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getOperation().toString(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    public ResponseEntity<Map<Float, Long>> getViewsByRooms() {
        List<View> views = viewRepository.findAll();

        Map<Float, Long> result = views.stream()
                .collect(Collectors.groupingBy(
                        v -> v.getProperty().getRooms(),
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }

    @Override
    @Transactional
    public ResponseEntity<Map<String, Long>> getViewsByAmenity() {
        List<View> views = viewRepository.findAll();

        Map<String, Long> result = views.stream()
                .flatMap(view -> view.getProperty().getAmenities().stream())
                .collect(Collectors.groupingBy(
                        Amenity::getName,
                        Collectors.counting()
                ));

        return ResponseEntity.ok(result);
    }
}