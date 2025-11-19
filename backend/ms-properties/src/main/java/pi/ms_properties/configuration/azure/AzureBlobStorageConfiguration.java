package pi.ms_properties.configuration.azure;

import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Profile("!test")
@Configuration
public class AzureBlobStorageConfiguration {

    @Value("${azure.blob-storage.container-name}")
    private String containerName;

    @Value("${azure.blob-storage.connection-string}")
    private String connectionString;

    @Value("${azure.blob-storage.property-ai}")
    private String propertyAI;

    // para interacturar con blob y gestionar contenedores
    @Bean
    public BlobServiceClient getBlobServiceClient() {
        return new BlobServiceClientBuilder()
                .connectionString(connectionString)
                .buildClient();
    }

    @Bean(name = "images")
    public BlobContainerClient imagesContainerClient(BlobServiceClient client) {
        return client.getBlobContainerClient(containerName);
    }

    @Bean(name = "property")
    public BlobContainerClient propertyJsonContainerClient(BlobServiceClient client) {
        return client.getBlobContainerClient(propertyAI);
    }
}

