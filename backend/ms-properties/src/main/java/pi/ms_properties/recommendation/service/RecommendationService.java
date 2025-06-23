package pi.ms_properties.recommendation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.feign.FavoriteDTO;
import pi.ms_properties.dto.feign.NotificationType;
import pi.ms_properties.recommendation.recommender.CollaborativeRecommender;
import pi.ms_properties.recommendation.recommender.ContentBasedRecommender;
import pi.ms_properties.repository.feign.FavoriteRepository;
import pi.ms_properties.repository.feign.NotificationRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ContentBasedRecommender contentRecommender;
    private final CollaborativeRecommender collaborativeRecommender;
    private final NotificationRepository notificationRepository;
    private final FavoriteRepository favoriteRepository;

    public void evaluateNewProperty(Property newProperty) {
        List<String> userIds = favoriteRepository.findAllUserIds();
        Set<String> notifiedUsers = new HashSet<>();

        for (String userId : userIds) {
            if (!notifiedUsers.contains(userId)) {
                List<FavoriteDTO> favs = favoriteRepository.getFavorites(userId);

                double contentScore = contentRecommender.calculate(newProperty, favs);
                double mlScore = collaborativeRecommender.predictInterest(userId, newProperty.getId());

                double contentWeight = 0.6;
                double collaborativeWeight = 0.4;

                double finalScore = contentScore * contentWeight + mlScore * collaborativeWeight;

                if (finalScore >= 0.7) {
                    notificationRepository.createPropertyInterest(userId, NotificationType.PROPIEDADINTERES, newProperty.getId());
                    notifiedUsers.add(userId);
                }
            }
        }
    }
}

