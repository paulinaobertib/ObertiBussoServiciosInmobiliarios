package pi.ms_properties.recommendationTest.recommenderTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.Operation;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Type;
import pi.ms_properties.dto.feign.FavoriteDTO;
import pi.ms_properties.recommendation.recommender.ContentBasedRecommender;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.repository.IPropertyRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentBasedRecommenderTest {

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private INeighborhoodRepository neighborhoodRepository;

    @InjectMocks
    private ContentBasedRecommender contentBasedRecommender;

    private Neighborhood neighborhoodNueva;
    private Neighborhood neighborhoodFav;
    private Property nueva;
    private Property favProperty;
    private Type type1;
    private Type type2;

    @BeforeEach
    void setUp() {
        neighborhoodNueva = new Neighborhood();
        neighborhoodNueva.setId(1L);
        neighborhoodNueva.setLatitude(-34.6);
        neighborhoodNueva.setLongitude(-58.4);

        neighborhoodFav = new Neighborhood();
        neighborhoodFav.setId(2L);
        neighborhoodFav.setLatitude(-34.61);
        neighborhoodFav.setLongitude(-58.41);

        type1 = new Type();
        type1.setId(1L);

        type2 = new Type();
        type2.setId(2L);

        nueva = new Property();
        nueva.setNeighborhood(neighborhoodNueva);
        nueva.setType(type1);
        nueva.setOperation(Operation.VENTA);
        nueva.setPrice(BigDecimal.valueOf(150000.0));

        favProperty = new Property();
        favProperty.setNeighborhood(neighborhoodFav);
        favProperty.setType(type1);
        favProperty.setOperation(Operation.VENTA);
        favProperty.setPrice(BigDecimal.valueOf(90));
    }

    private FavoriteDTO createFavoriteDTO(Long propertyId) {
        FavoriteDTO dto = new FavoriteDTO();
        dto.setPropertyId(propertyId);
        return dto;
    }

    // casos de exito

    @Test
    void calculate_shouldReturnCorrectScore_whenAllDataExists() {
        List<FavoriteDTO> favs = List.of(createFavoriteDTO(10L));

        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhoodNueva));
        when(propertyRepository.findById(10L)).thenReturn(Optional.of(favProperty));
        when(neighborhoodRepository.findById(2L)).thenReturn(Optional.of(neighborhoodFav));

        double result = contentBasedRecommender.calculate(nueva, favs);

        assertEquals(0.7, result, 0.0001);

        verify(neighborhoodRepository).findById(1L);
        verify(propertyRepository).findById(10L);
        verify(neighborhoodRepository).findById(2L);
    }

    // casos de error

    @Test
    void calculate_shouldReturnZero_whenNeighborhoodNuevaNotFound() {
        List<FavoriteDTO> favs = List.of(createFavoriteDTO(10L));

        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.empty());

        double result = contentBasedRecommender.calculate(nueva, favs);

        assertEquals(0.0, result);

        verify(neighborhoodRepository).findById(1L);
        verifyNoInteractions(propertyRepository);
    }

    @Test
    void calculate_shouldSkipFavorite_whenPropertyNotFound() {
        List<FavoriteDTO> favs = List.of(createFavoriteDTO(10L));

        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhoodNueva));
        when(propertyRepository.findById(10L)).thenReturn(Optional.empty());

        double result = contentBasedRecommender.calculate(nueva, favs);

        assertEquals(0.0, result);

        verify(neighborhoodRepository).findById(1L);
        verify(propertyRepository).findById(10L);
        verify(neighborhoodRepository, never()).findById(2L);
    }

    @Test
    void calculate_shouldSkipFavorite_whenNeighborhoodFavNotFound() {
        List<FavoriteDTO> favs = List.of(createFavoriteDTO(10L));

        when(neighborhoodRepository.findById(1L)).thenReturn(Optional.of(neighborhoodNueva));
        when(propertyRepository.findById(10L)).thenReturn(Optional.of(favProperty));
        when(neighborhoodRepository.findById(2L)).thenReturn(Optional.empty());

        double result = contentBasedRecommender.calculate(nueva, favs);

        assertEquals(0.0, result);

        verify(neighborhoodRepository).findById(1L);
        verify(propertyRepository).findById(10L);
        verify(neighborhoodRepository).findById(2L);
    }
}
