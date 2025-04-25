package pi.ms_properties.service.impl;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;

import com.azure.storage.blob.models.BlobHttpHeaders;
import com.azure.storage.blob.models.BlobStorageException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.Storage;
import pi.ms_properties.service.interf.IAzureBlobStorage;

// hacemos el servicio de blob
// el servicio de image se va a comunicar con este
// guarda la logica para interacturar con blob
@Service
@RequiredArgsConstructor
public class AzureBlobStorage implements IAzureBlobStorage {

    private final BlobContainerClient blobContainerClient;

    @Override
    public String create(Storage storage) {
        String path = storage.getPath();
        BlobClient blobClient = blobContainerClient.getBlobClient(path);
        try {
            if (blobClient.exists()) {
                throw new RuntimeException("Ya existe el nombre de la imagen");
            }
            BlobHttpHeaders headers = new BlobHttpHeaders();
            headers.setContentType(storage.getContentType());
            blobClient.upload(storage.getInputStream(), storage.getSize(), false);
            blobClient.setHttpHeaders(headers);
            // tenemos la url publica de blob
            return blobClient.getBlobUrl();
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar la imagen: ", e);
        }
    }

    @Override
    public void delete(Storage storage) {
        String path = storage.getPath();
        BlobClient client = blobContainerClient.getBlobClient(path);

        try {
            client.delete();
        } catch (BlobStorageException e) {
            if (e.getStatusCode() == 404) {
                System.out.println("El blob no existe: " + path);
            } else {
                throw new RuntimeException("Error al eliminar el blob", e);
            }
        }
    }
}