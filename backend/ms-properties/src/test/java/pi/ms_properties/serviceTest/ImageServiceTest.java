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
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
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

    // casos de exito

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
    void deleteImageByName_success() {
        String imageUrl = "image-path.jpg";
        Storage expectedStorage = new Storage();
        expectedStorage.setPath(imageUrl);

        assertDoesNotThrow(() -> imageService.deleteImageByName(imageUrl));
        verify(azureBlobStorage).delete(argThat(storage -> storage.getPath().equals(imageUrl)));
    }

    @Test
    void getAllByPropertyId_success() {
        Long propertyId = 1L;
        Image image1 = new Image();
        image1.setUrl("image1.jpg");
        Image image2 = new Image();
        image2.setUrl("image2.jpg");
        List<Image> images = List.of(image1, image2);

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(mockProperty));
        when(imageRepository.findAllByPropertyId(propertyId)).thenReturn(images);
        when(azureBlobStorage.getImageUrl(anyString())).thenAnswer(invocation -> {
            String path = invocation.getArgument(0);
            return "https://storage/" + path;
        });

        ResponseEntity<List<Image>> response = imageService.getAllByPropertyId(propertyId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        assertTrue(response.getBody().getFirst().getUrl().startsWith("https://storage/"));
        verify(azureBlobStorage, times(2)).getImageUrl(anyString());
    }

    // casos de error

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
    void deleteImage_notFound() {
        when(imageRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseEntity<String> response = imageService.deleteImage(123L);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Imagen no encontrada", response.getBody());
    }

    @Test
    void deleteImageByName_blobStorageException_simulation() {
        String imageUrl = "image-path.jpg";

        doThrow(new RuntimeException("simulated blob error")).when(azureBlobStorage).delete(any(Storage.class));

        assertDoesNotThrow(() -> imageService.deleteImageByName(imageUrl));
        verify(azureBlobStorage).delete(any(Storage.class));
    }

    @Test
    void deleteImageByName_unexpectedException() {
        String imageUrl = "image-path.jpg";
        doThrow(new RuntimeException("Unexpected")).when(azureBlobStorage).delete(any(Storage.class));

        assertDoesNotThrow(() -> imageService.deleteImageByName(imageUrl));
        verify(azureBlobStorage).delete(any(Storage.class));
    }

    @Test
    void getAllByPropertyId_propertyNotFound() {
        Long propertyId = 1L;
        when(propertyRepository.findById(propertyId)).thenReturn(Optional.empty());

        ResponseEntity<List<Image>> response = imageService.getAllByPropertyId(propertyId);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        verify(imageRepository, never()).findAllByPropertyId(anyLong());
    }

    @Test
    void getAllByPropertyId_exceptionThrown() {
        Long propertyId = 1L;
        when(propertyRepository.findById(propertyId)).thenThrow(new RuntimeException("Database error"));

        ResponseEntity<List<Image>> response = imageService.getAllByPropertyId(propertyId);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void uploadImageToProperty_shouldThrowRuntimeException_whenBlobStorageException() throws IOException {
        Long propertyId = 1L;
        Property property = new Property();

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(property));
        when(multipartFile.getOriginalFilename()).thenReturn("foto.jpg");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream(new byte[0]));

        doThrow(new BlobStorageException("Error blob", null, null))
                .when(azureBlobStorage).create(any(Storage.class));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            imageService.uploadImageToProperty(multipartFile, propertyId, false);
        });

        assertTrue(ex.getMessage().contains("No se ha podido subir la imagen"));
    }

    @Test
    void uploadImageToProperty_shouldThrowRuntimeException_whenIOException() throws IOException {
        Long propertyId = 1L;
        Property property = new Property();

        when(propertyRepository.findById(propertyId)).thenReturn(Optional.of(property));
        when(multipartFile.getOriginalFilename()).thenReturn("foto.jpg");
        when(multipartFile.getInputStream()).thenThrow(new IOException("Error de lectura"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            imageService.uploadImageToProperty(multipartFile, propertyId, false);
        });

        assertTrue(ex.getMessage().contains("Error al leer el archivo"));
    }

    @Test
    void deleteImage_shouldReturnInternalServerError_whenBlobStorageException() {
        Image image = new Image();
        image.setUrl("container/foto.jpg");

        when(imageRepository.findById(1L)).thenReturn(Optional.of(image));
        when(blobContainerClient.getBlobContainerUrl()).thenReturn("container");
        doThrow(new BlobStorageException("Error blob", null, null))
                .when(azureBlobStorage).delete(any(Storage.class));

        ResponseEntity<String> response = imageService.deleteImage(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("Error al eliminar la imagen del blob storage"));
    }

    @Test
    void deleteImage_shouldReturnInternalServerError_whenUnexpectedException() {
        Image image = new Image();
        image.setUrl("container/foto.jpg");

        when(imageRepository.findById(1L)).thenReturn(Optional.of(image));
        when(blobContainerClient.getBlobContainerUrl()).thenReturn("container");
        doThrow(new RuntimeException("Error inesperado"))
                .when(azureBlobStorage).delete(any(Storage.class));

        ResponseEntity<String> response = imageService.deleteImage(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertTrue(response.getBody().contains("Error inesperado"));
    }

    @Test
    void getAllByPropertyId_shouldReturnInternalServerError_whenException() {
        when(propertyRepository.findById(1L)).thenThrow(new RuntimeException("Error inesperado"));

        ResponseEntity<List<Image>> response = imageService.getAllByPropertyId(1L);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }
}

