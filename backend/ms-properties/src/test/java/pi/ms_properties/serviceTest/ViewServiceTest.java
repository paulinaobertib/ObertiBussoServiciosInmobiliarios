package pi.ms_properties.serviceTest;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import pi.ms_properties.domain.*;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.IViewRepository;
import pi.ms_properties.service.impl.ViewService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;


@ExtendWith(MockitoExtension.class)
class ViewServiceTest {

    @InjectMocks
    private ViewService viewService;

    @Mock
    private IViewRepository viewRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    private View makeView(String title, String typeName, String neighborhoodName,
                          NeighborhoodType neighborhoodType, LocalDateTime date, Operation operation, Float rooms) {
        View view = new View();
        view.setDate(date);

        Property property = new Property();
        property.setTitle(title);

        Type type = new Type();
        type.setName(typeName);
        property.setType(type);

        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setName(neighborhoodName);
        neighborhood.setType(neighborhoodType);
        property.setNeighborhood(neighborhood);

        property.setOperation(operation);
        property.setRooms(rooms);

        view.setProperty(property);
        return view;
    }

    @Test
    void createView_savesView() {
        Property property = new Property();
        LocalDateTime date = LocalDateTime.now();

        View savedView = new View();
        savedView.setDate(date);
        savedView.setProperty(property);

        when(viewRepository.save(any(View.class))).thenReturn(savedView);

        viewService.createView(property, date);

        ArgumentCaptor<View> captor = ArgumentCaptor.forClass(View.class);
        verify(viewRepository).save(captor.capture());
        View captured = captor.getValue();

        assertEquals(property, captured.getProperty());
        assertEquals(date, captured.getDate());
    }

    @Test
    void getViewsByProperty_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.SEMICERRADO, LocalDateTime.now(), Operation.ALQUILER, 2f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByProperty();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();
        assertEquals(2L, map.get("Casa Azul"));
        assertEquals(1L, map.get("Depto Verde"));
    }

    @Test
    void getViewsByPropertyType_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.ALQUILER, 2f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.ALQUILER, 2f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByPropertyType();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();
        assertEquals(1L, map.get("Casa"));
        assertEquals(2L, map.get("Departamento"));
    }

    @Test
    void getViewsByDay_returnsCounts() {
        LocalDateTime monday = LocalDateTime.of(2025, 5, 19, 10, 0); // lunes
        LocalDateTime tuesday = LocalDateTime.of(2025, 5, 20, 10, 0); // martes
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, monday, Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.CERRADO, tuesday, Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, monday, Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByDay();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("lunes"));
        assertEquals(1L, map.get("martes"));
    }

    @Test
    void getViewsByMonth_returnsCounts() {
        LocalDateTime may = LocalDateTime.of(2025, 5, 10, 10, 0);
        LocalDateTime june = LocalDateTime.of(2025, 6, 10, 10, 0);
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, may, Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.CERRADO, june, Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, may, Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByMonth();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("mayo"));
        assertEquals(1L, map.get("junio"));
    }

    @Test
    void getViewsByNeighborhood_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByNeighborhood();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("Barrio Norte"));
        assertEquals(1L, map.get("Palermo"));
    }

    @Test
    void getViewsByNeighborhoodType_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByNeighborhoodType();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("CERRADO"));
        assertEquals(1L, map.get("ABIERTO"));
    }

    @Test
    void getViewsByStatus_returnsCounts() {
        Property p1 = new Property();
        p1.setStatus(Status.DISPONIBLE);
        Property p2 = new Property();
        p2.setStatus(Status.VENDIDA);
        Property p3 = new Property();
        p3.setStatus(Status.DISPONIBLE);

        when(propertyRepository.findAll()).thenReturn(List.of(p1, p2, p3));

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByStatus();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("DISPONIBLE"));
        assertEquals(1L, map.get("VENDIDA"));
    }

    @Test
    void getViewsByStatusAndType_returnsCounts() {
        Type type1 = new Type();
        type1.setName("Casa");
        Type type2 = new Type();
        type2.setName("Departamento");

        Property p1 = new Property();
        p1.setStatus(Status.DISPONIBLE);
        p1.setType(type1);

        Property p2 = new Property();
        p2.setStatus(Status.DISPONIBLE);
        p2.setType(type2);

        Property p3 = new Property();
        p3.setStatus(Status.VENDIDA);
        p3.setType(type1);

        when(propertyRepository.findAll()).thenReturn(List.of(p1, p2, p3));

        ResponseEntity<Map<String, Map<String, Long>>> response = viewService.getViewsByStatusAndType();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Map<String, Long>> map = response.getBody();

        assertEquals(2, map.get("DISPONIBLE").values().stream().mapToLong(Long::longValue).sum());
        assertEquals(1, map.get("VENDIDA").values().stream().mapToLong(Long::longValue).sum());
        assertEquals(1L, map.get("DISPONIBLE").get("Casa"));
        assertEquals(1L, map.get("DISPONIBLE").get("Departamento"));
        assertEquals(1L, map.get("VENDIDA").get("Casa"));
    }

    @Test
    void getViewsByOperation_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByOperation();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("VENTA"));
        assertEquals(1L, map.get("ALQUILER"));
    }

    @Test
    void getViewsByRooms_returnsCounts() {
        List<View> views = List.of(
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.VENTA, 3f),
                makeView("Depto Verde", "Departamento", "Palermo", NeighborhoodType.CERRADO, LocalDateTime.now(), Operation.ALQUILER, 2f),
                makeView("Casa Azul", "Casa", "Barrio Norte", NeighborhoodType.ABIERTO, LocalDateTime.now(), Operation.VENTA, 3f)
        );
        when(viewRepository.findAll()).thenReturn(views);

        ResponseEntity<Map<Float, Long>> response = viewService.getViewsByRooms();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<Float, Long> map = response.getBody();

        assertEquals(2L, map.get(3f));
        assertEquals(1L, map.get(2f));
    }

    @Test
    void getViewsByAmenity_returnsCounts() {
        Amenity a1 = new Amenity();
        a1.setName("Piscina");
        Amenity a2 = new Amenity();
        a2.setName("Gimnasio");

        Property p1 = new Property();
        p1.setAmenities(Set.of(a1, a2));

        Property p2 = new Property();
        p2.setAmenities(Set.of(a1));

        View v1 = new View();
        v1.setProperty(p1);
        v1.setDate(LocalDateTime.now());

        View v2 = new View();
        v2.setProperty(p2);
        v2.setDate(LocalDateTime.now());

        when(viewRepository.findAll()).thenReturn(List.of(v1, v2));

        ResponseEntity<Map<String, Long>> response = viewService.getViewsByAmenity();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        Map<String, Long> map = response.getBody();

        assertEquals(2L, map.get("Piscina"));
        assertEquals(1L, map.get("Gimnasio"));
    }
}
