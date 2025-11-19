package pi.ms_properties.dto;

import java.util.List;

public record PropertyAIDTO(
        Long id,
        Float area,
        Float bathrooms,
        Float bedrooms,
        Float covered_area,
        Boolean credit,
        String currency,
        String date,
        String description,
        Double expenses,
        Boolean financing,
        String number,
        Double latitude,
        Double longitude,
        String operation,
        Boolean outstanding,
        Double price,
        Float rooms,
        Boolean show_price,
        String status,
        String street,
        String title,
        Neighborhood neighborhood,
        Long owner_id,
        Type type,
        List<String> amenities
) {

    public record Neighborhood(
            Long id,
            String name,
            String city,
            Double latitude,
            Double longitude,
            String type
    ) {}

    public record Type(
            Long id,
            String name,
            Boolean has_bathrooms,
            Boolean has_bedrooms,
            Boolean has_covered_area,
            Boolean has_rooms
    ) {}
}