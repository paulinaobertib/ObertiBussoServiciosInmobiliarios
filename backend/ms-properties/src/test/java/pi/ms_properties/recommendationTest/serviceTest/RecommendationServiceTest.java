package pi.ms_properties.recommendationTest.serviceTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.feign.FavoriteDTO;
import pi.ms_properties.dto.feign.NotificationType;
import pi.ms_properties.recommendation.recommender.CollaborativeRecommender;
import pi.ms_properties.recommendation.recommender.ContentBasedRecommender;
import pi.ms_properties.recommendation.service.RecommendationService;
import pi.ms_properties.repository.feign.FavoriteRepository;
import pi.ms_properties.repository.feign.NotificationRepository;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecommendationServiceTest {

    @Mock
    private ContentBasedRecommender contentRecommender;

    @Mock
    private CollaborativeRecommender collaborativeRecommender;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private FavoriteRepository favoriteRepository;

    @InjectMocks
    private RecommendationService recommendationService;

    private Property newProperty;

    @BeforeEach
    void setUp() {
        newProperty = new Property();
        newProperty.setId(100L);
    }

    @Test
    void evaluateNewProperty_shouldNotifyUsersWithScoreAboveThreshold() {
        List<String> userIds = List.of("user1", "user2", "user3");
        when(favoriteRepository.findAllUserIds()).thenReturn(userIds);

        List<FavoriteDTO> favsUser1 = List.of(new FavoriteDTO(10L, "user1", 100L));
        List<FavoriteDTO> favsUser2 = List.of(new FavoriteDTO(20L, "user2", 100L));
        List<FavoriteDTO> favsUser3 = List.of();

        when(favoriteRepository.getFavorites("user1")).thenReturn(favsUser1);
        when(favoriteRepository.getFavorites("user2")).thenReturn(favsUser2);
        when(favoriteRepository.getFavorites("user3")).thenReturn(favsUser3);

        when(contentRecommender.calculate(newProperty, favsUser1)).thenReturn(0.8);
        when(collaborativeRecommender.predictInterest("user1", newProperty.getId())).thenReturn(0.6);

        when(contentRecommender.calculate(newProperty, favsUser2)).thenReturn(0.5);
        when(collaborativeRecommender.predictInterest("user2", newProperty.getId())).thenReturn(0.4);

        when(collaborativeRecommender.predictInterest("user3", newProperty.getId())).thenReturn(0.0);

        recommendationService.evaluateNewProperty(newProperty);

        verify(notificationRepository).createPropertyInterest("user1", NotificationType.PROPIEDADINTERES, newProperty.getId());
        verify(notificationRepository, never()).createPropertyInterest(eq("user2"), any(), any());
        verify(notificationRepository, never()).createPropertyInterest(eq("user3"), any(), any());
    }

    @Test
    void evaluateNewProperty_shouldNotNotifySameUserTwice() {
        List<String> userIds = List.of("user1", "user1");
        when(favoriteRepository.findAllUserIds()).thenReturn(userIds);

        List<FavoriteDTO> favs = List.of(new FavoriteDTO(10L, "user1", 100L));

        when(favoriteRepository.getFavorites("user1")).thenReturn(favs);
        when(contentRecommender.calculate(newProperty, favs)).thenReturn(0.8);
        when(collaborativeRecommender.predictInterest("user1", newProperty.getId())).thenReturn(0.8);

        recommendationService.evaluateNewProperty(newProperty);

        verify(notificationRepository, times(1))
                .createPropertyInterest("user1", NotificationType.PROPIEDADINTERES, newProperty.getId());
    }

    // casos de error

    @Test
    void evaluateNewProperty_shouldThrow_whenFavoriteRepositoryFails() {
        when(favoriteRepository.findAllUserIds())
                .thenThrow(new RuntimeException("DB error"));

        assertThrows(RuntimeException.class, () -> recommendationService.evaluateNewProperty(newProperty));

        verify(favoriteRepository).findAllUserIds();
        verifyNoInteractions(contentRecommender, collaborativeRecommender, notificationRepository);
    }

    @Test
    void evaluateNewProperty_shouldThrow_whenContentRecommenderFails() {
        List<String> userIds = List.of("user1");
        when(favoriteRepository.findAllUserIds()).thenReturn(userIds);

        List<FavoriteDTO> favs = List.of(new FavoriteDTO(10L, "user1", 100L));
        when(favoriteRepository.getFavorites("user1")).thenReturn(favs);

        when(contentRecommender.calculate(newProperty, favs))
                .thenThrow(new RuntimeException("Content Recommender error"));

        assertThrows(RuntimeException.class, () -> recommendationService.evaluateNewProperty(newProperty));

        verify(favoriteRepository).findAllUserIds();
        verify(favoriteRepository).getFavorites("user1");
        verify(contentRecommender).calculate(newProperty, favs);
        verifyNoInteractions(collaborativeRecommender, notificationRepository);
    }

    @Test
    void evaluateNewProperty_shouldThrow_whenCollaborativeRecommenderFails() {
        List<String> userIds = List.of("user1");
        when(favoriteRepository.findAllUserIds()).thenReturn(userIds);

        List<FavoriteDTO> favs = List.of(new FavoriteDTO(10L, "user1", 100L));
        when(favoriteRepository.getFavorites("user1")).thenReturn(favs);

        when(contentRecommender.calculate(newProperty, favs)).thenReturn(0.8);
        when(collaborativeRecommender.predictInterest("user1", newProperty.getId()))
                .thenThrow(new RuntimeException("Collaborative Recommender error"));

        assertThrows(RuntimeException.class, () -> recommendationService.evaluateNewProperty(newProperty));

        verify(favoriteRepository).findAllUserIds();
        verify(favoriteRepository).getFavorites("user1");
        verify(contentRecommender).calculate(newProperty, favs);
        verify(collaborativeRecommender).predictInterest("user1", newProperty.getId());
        verifyNoInteractions(notificationRepository);
    }

    @Test
    void evaluateNewProperty_shouldThrow_whenNotificationRepositoryFails() {
        List<String> userIds = List.of("user1");
        when(favoriteRepository.findAllUserIds()).thenReturn(userIds);

        List<FavoriteDTO> favs = List.of(new FavoriteDTO(10L, "user1", 100L));
        when(favoriteRepository.getFavorites("user1")).thenReturn(favs);

        when(contentRecommender.calculate(newProperty, favs)).thenReturn(0.8);
        when(collaborativeRecommender.predictInterest("user1", newProperty.getId())).thenReturn(0.8);

        doThrow(new RuntimeException("Notification error"))
                .when(notificationRepository).createPropertyInterest("user1", NotificationType.PROPIEDADINTERES, newProperty.getId());

        assertThrows(RuntimeException.class, () -> recommendationService.evaluateNewProperty(newProperty));

        verify(favoriteRepository).findAllUserIds();
        verify(favoriteRepository).getFavorites("user1");
        verify(contentRecommender).calculate(newProperty, favs);
        verify(collaborativeRecommender).predictInterest("user1", newProperty.getId());
        verify(notificationRepository).createPropertyInterest("user1", NotificationType.PROPIEDADINTERES, newProperty.getId());
    }
}
