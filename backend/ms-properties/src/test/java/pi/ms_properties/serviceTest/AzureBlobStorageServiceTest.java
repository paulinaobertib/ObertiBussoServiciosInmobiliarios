package pi.ms_properties.serviceTest;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.Storage;
import pi.ms_properties.service.impl.AzureBlobStorage;

import java.io.ByteArrayInputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AzureBlobStorageServiceTest {

    @InjectMocks
    private AzureBlobStorage azureBlobStorage;

    @Mock
    private BlobContainerClient blobContainerClient;

    @Mock
    private BlobClient blobClient;

    // caso de exito

    @Test
    void create_success() {
        Storage storage = new Storage();
        storage.setPath("folder/image.png");
        storage.setContentType("image/png");
        storage.setSize(123L);
        storage.setInputStream(new ByteArrayInputStream(new byte[0]));

        when(blobContainerClient.getBlobClient("folder/image.png")).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(false);
        when(blobClient.getBlobUrl()).thenReturn("https://storageimages.blob.core.windows.net/images/folder/image.png");

        String url = azureBlobStorage.create(storage);

        assertEquals("https://storageimages.blob.core.windows.net/images/folder/image.png", url);
        verify(blobClient).upload(any(), eq(123L), eq(false));
        verify(blobClient).setHttpHeaders(any(BlobHttpHeaders.class));
    }

    @Test
    void delete_success() {
        Storage storage = new Storage();
        storage.setPath("borrar.png");

        when(blobContainerClient.getBlobClient("borrar.png")).thenReturn(blobClient);

        azureBlobStorage.delete(storage);

        verify(blobClient).delete();
    }

    @Test
    void getImageUrl_success() {
        String imageName = "foto.png";
        String url = azureBlobStorage.getImageUrl(imageName);

        assertEquals("https://storageimages.blob.core.windows.net/images/foto.png", url);
    }

    // casos de error

    @Test
    void create_alreadyExists_throwsException() {
        Storage storage = new Storage();
        storage.setPath("duplicate.png");
        storage.setInputStream(new ByteArrayInputStream(new byte[0]));

        when(blobContainerClient.getBlobClient("duplicate.png")).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(true);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> azureBlobStorage.create(storage));
        assertTrue(ex.getMessage().contains("Error al cargar la imagen"));
    }

    @Test
    void create_runtimeException() {
        Storage storage = new Storage();
        storage.setPath("error.png");
        storage.setContentType("image/png");
        storage.setSize(1L);
        storage.setInputStream(new ByteArrayInputStream(new byte[0]));

        when(blobContainerClient.getBlobClient("error.png")).thenReturn(blobClient);
        when(blobClient.exists()).thenReturn(false);
        doThrow(new RuntimeException("Falla en upload")).when(blobClient).upload(any(), eq(1L), eq(false));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> azureBlobStorage.create(storage));
        assertTrue(ex.getMessage().contains("Error al cargar la imagen"));
    }

    @Test
    void delete_blobNotFound_logsMessage() {
        Storage storage = new Storage();
        storage.setPath("noexiste.png");

        BlobStorageException exception = mock(BlobStorageException.class);
        when(exception.getStatusCode()).thenReturn(404);

        when(blobContainerClient.getBlobClient("noexiste.png")).thenReturn(blobClient);
        doThrow(exception).when(blobClient).delete();

        assertDoesNotThrow(() -> azureBlobStorage.delete(storage));
   }

    @Test
    void delete_runtimeException() {
        Storage storage = new Storage();
        storage.setPath("error.png");

        BlobStorageException exception = mock(BlobStorageException.class);
        when(exception.getStatusCode()).thenReturn(500);

        when(blobContainerClient.getBlobClient("error.png")).thenReturn(blobClient);
        doThrow(exception).when(blobClient).delete();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> azureBlobStorage.delete(storage));
        assertTrue(ex.getMessage().contains("Error al eliminar el blob"));
    }

}


