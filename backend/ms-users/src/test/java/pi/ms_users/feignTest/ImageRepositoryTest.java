package pi.ms_users.feignTest;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.repository.feign.FeignPropertyRepository;
import pi.ms_users.repository.feign.ImageRepository;

@ExtendWith(MockitoExtension.class)
class ImageRepositoryTest {

    @Mock
    private FeignPropertyRepository feignPropertyRepository;

    @InjectMocks
    private ImageRepository imageRepository;

    // casos de exito

    @Test
    void uploadImage_shouldReturnImageName() {
        MultipartFile mockFile = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "dummy-content".getBytes()
        );

        String expectedImageName = "image123.jpg";
        ResponseEntity<String> responseEntity = ResponseEntity.ok(expectedImageName);

        when(feignPropertyRepository.uploadNoticeImage(mockFile)).thenReturn(responseEntity);

        String result = imageRepository.uploadImage(mockFile);

        assertEquals(expectedImageName, result);
        verify(feignPropertyRepository).uploadNoticeImage(mockFile);
    }

    @Test
    void imageURL_shouldReturnFullURL() {
        String imageName = "image123.jpg";
        String expectedUrl = "https://storage.blob.com/images/image123.jpg";

        when(feignPropertyRepository.getNoticeImage(imageName))
                .thenReturn(ResponseEntity.ok(expectedUrl));

        String result = imageRepository.imageURL(imageName);

        assertEquals(expectedUrl, result);
        verify(feignPropertyRepository).getNoticeImage(imageName);
    }
}
