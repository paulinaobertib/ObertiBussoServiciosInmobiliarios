package pi.ms_properties.service.impl;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

@Service
public class AzureBlobPropertiesStorage {

    private final BlobContainerClient blobContainerClient;

    public AzureBlobPropertiesStorage(@Qualifier("property") BlobContainerClient blobContainerClient) {
        this.blobContainerClient = blobContainerClient;
    }

    public void uploadPropertyJson(Long id, String json) {
        String path = "property_" + id + ".json";

        BlobClient blobClient = blobContainerClient.getBlobClient(path);

        System.out.println(path);

        blobClient.upload(
                new ByteArrayInputStream(json.getBytes(StandardCharsets.UTF_8)),
                json.getBytes(StandardCharsets.UTF_8).length,
                true
        );
    }

    public void deletePropertyJson(Long id) {
        String path = "property_" + id + ".json";

        BlobClient blobClient = blobContainerClient.getBlobClient(path);

        if (blobClient.exists()) {
            blobClient.delete();
        }
    }

    public String getPropertyUrl(Long id) {
        return blobContainerClient
                .getBlobClient("property_" + id + ".json")
                .getBlobUrl();
    }
}
