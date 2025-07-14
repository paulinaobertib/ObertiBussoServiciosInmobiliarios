package pi.ms_users.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.MultipartFile;

@Repository
@RequiredArgsConstructor
public class ImageRepository {

    private final FeignPropertyRepository feignPropertyRepository;

    public String uploadImage(MultipartFile file) {
        return  feignPropertyRepository.uploadNoticeImage(file).getBody();
    }

    public String imageURL(String imageName) {
        return feignPropertyRepository.getNoticeImage(imageName).getBody();
    }
}
