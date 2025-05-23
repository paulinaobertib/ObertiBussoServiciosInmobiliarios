package pi.ms_properties.serviceTest;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.models.BlobStorageException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Image;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Storage;
import pi.ms_properties.repository.IImageRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.impl.ImageService;
import pi.ms_properties.service.interf.IAzureBlobStorage;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @InjectMocks
    private ImageService imageService;

    @Mock
    private IAzureBlobStorage azureBlobStorage;

    @Mock
    private IImageRepository imageRepository;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private BlobContainerClient blobContainerClient;

    @Mock
    private MultipartFile multipartFile;

    @Mock
    private Property mockProperty;

    @Captor
    private ArgumentCaptor<Image> imageCaptor;

    @Test
    void uploadImageToProperty_success_withImageSave() throws Exception {
        Long propertyId = 1L;
        String originalFilename = "imagen.jpg";
        String contentType = "image/jpeg";
        byte[] content = "fake-image-content".getBytes();
        InputStream inputStream = new ByteArrayInputStream(content);

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(mockProperty));
        when(multipartFile.getOriginalFilename()).thenReturn(originalFilename);
        when(multipartFile.getInputStream()).thenReturn(inputStream);
        when(multipartFile.getSize()).thenReturn((long) content.length);
        when(multipartFile.getContentType()).thenReturn(contentType);

        String result = imageService.uploadImageToProperty(multipartFile, propertyId, false);

        assertNotNull(result);
        verify(azureBlobStorage).create(any(Storage.class));
        verify(imageRepository).save(imageCaptor.capture());

        Image savedImage = imageCaptor.getValue();
        assertEquals(mockProperty, savedImage.getProperty());
        assertTrue(savedImage.getUrl().endsWith(".jpg"));
    }

    @Test
    void uploadImageToProperty_success_withoutImageSave() throws Exception {
        Long propertyId = 1L;
        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(mockProperty));
        when(multipartFile.getOriginalFilename()).thenReturn("img.png");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("x".getBytes()));
        when(multipartFile.getSize()).thenReturn(1L);
        when(multipartFile.getContentType()).thenReturn("image/png");

        String result = imageService.uploadImageToProperty(multipartFile, propertyId, true);

        assertNotNull(result);
        verify(azureBlobStorage).create(any(Storage.class));
        verify(imageRepository, never()).save(any());
    }

    @Test
    void uploadImageToProperty_shouldThrow_whenPropertyNotFound() {
        Long propertyId = 999L;
        when(propertyRepository.findById(propertyId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> imageService.uploadImageToProperty(multipartFile, propertyId, false));

        assertEquals("No se ha encontrado la propiedad", ex.getMessage());
    }

    @Test
    void uploadImageToProperty_shouldThrow_whenBlobFails() throws Exception {
        when(propertyRepository.findById(any())).thenReturn(Optional.of(mockProperty));
        when(multipartFile.getOriginalFilename()).thenReturn("archivo.png");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("data".getBytes()));
        when(multipartFile.getSize()).thenReturn(4L);
        when(multipartFile.getContentType()).thenReturn("image/png");

        BlobStorageException mockException = mock(BlobStorageException.class);
        doThrow(mockException).when(azureBlobStorage).create(any());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> imageService.uploadImageToProperty(multipartFile, 1L, false));

        assertTrue(ex.getMessage().contains("No se ha podido subir la imagen"));
    }

    @Test
    void deleteImage_success() {
        Long imageId = 5L;
        Image image = new Image();
        image.setUrl("image-path.jpg");

        when(imageRepository.findById(imageId)).thenReturn(Optional.of(image));
        when(blobContainerClient.getBlobContainerUrl()).thenReturn("https://blob.core.windows.net/container");

        ResponseEntity<String> response = imageService.deleteImage(imageId);

        verify(azureBlobStorage).delete(any(Storage.class));
        verify(imageRepository).delete(image);
        assertEquals(HttpStatus.OK, ((response).getStatusCode()));
        assertEquals("Imagen eliminada correctamente", response.getBody());
    }

    @Test
    void deleteImage_notFound() {
        when(imageRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<String> response = imageService.deleteImage(123L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Imagen no encontrada", response.getBody());
    }
}

