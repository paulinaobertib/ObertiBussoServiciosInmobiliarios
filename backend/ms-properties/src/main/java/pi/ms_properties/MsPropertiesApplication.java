package pi.ms_properties;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MsPropertiesApplication {

	public static void main(String[] args) {
		SpringApplication.run(MsPropertiesApplication.class, args);
	}

}
