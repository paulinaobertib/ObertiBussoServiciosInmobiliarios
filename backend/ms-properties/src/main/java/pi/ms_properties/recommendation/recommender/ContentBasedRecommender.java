package pi.ms_properties.recommendation.recommender;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pi.ms_properties.domain.Neighborhood;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.feign.FavoriteDTO;
import pi.ms_properties.recommendation.utils.GeoUtils;
import pi.ms_properties.repository.INeighborhoodRepository;
import pi.ms_properties.repository.IPropertyRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ContentBasedRecommender {

    private final IPropertyRepository propertyRepository;

    private final INeighborhoodRepository neighborhoodRepository;

    public double calculate(Property nueva, List<FavoriteDTO> favs) {
        Neighborhood nuevaN = neighborhoodRepository.findById(nueva.getNeighborhood().getId()).orElse(null);
        if (nuevaN == null) return 0.0;

        double best = 0.0;

        for (FavoriteDTO f : favs) {
            Property fav = propertyRepository.findById(f.getPropertyId()).orElse(null);
            if (fav == null) continue;

            Neighborhood favN = neighborhoodRepository.findById(fav.getNeighborhood().getId()).orElse(null);
            if (favN == null) continue;

            double score = 0;

            double distance = GeoUtils.haversine(
                    nuevaN.getLatitude(), nuevaN.getLongitude(),
                    favN.getLatitude(), favN.getLongitude()
            );

            if (distance <= 15.0) {
                score += 0.5;
            }

            if (Objects.equals(fav.getType().getId(), nueva.getType().getId()) &&
                    fav.getOperation().equals(nueva.getOperation())) {
                score += 0.2;
            }

            BigDecimal p = fav.getPrice(), np = nueva.getPrice();

            BigDecimal lowerBound = p.multiply(BigDecimal.valueOf(0.8));
            BigDecimal upperBound = p.multiply(BigDecimal.valueOf(1.2));

            if (np.compareTo(lowerBound) >= 0 && np.compareTo(upperBound) <= 0) {
                score += 0.3;
            }

            best = Math.max(best, score);
        }

        return best;
    }
}
