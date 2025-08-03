package pi.ms_properties;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.azure.storage.blob.BlobContainerClient;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import static org.mockito.Mockito.mock;

@SpringBootTest
@ActiveProfiles("test")
class MsPropertiesApplicationTests {

	@Test
	void contextLoads() {
	}

    @TestConfiguration
    static class TestAzureBlobConfig {
        @Bean
        public BlobContainerClient blobContainerClient() {
            return mock(BlobContainerClient.class);
        }
    }
}
