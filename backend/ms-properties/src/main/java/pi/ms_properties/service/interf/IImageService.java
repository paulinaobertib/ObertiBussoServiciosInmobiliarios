package pi.ms_properties.service.interf;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Image;

import java.util.List;

public interface IImageService {
    String uploadImageToProperty(MultipartFile file, Long propertyId, Boolean type);

    ResponseEntity<String> deleteImage(Long id);

    ResponseEntity<List<Image>> getAllByPropertyId(Long propertyId);
}
