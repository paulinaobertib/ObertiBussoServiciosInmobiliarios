package pi.ms_properties.repository.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.configuration.feign.FeignInterceptor;
import pi.ms_properties.dto.feign.NotificationDTO;

@FeignClient(name = "ms-users", url = "http://localhost:8081", configuration = FeignInterceptor.class)
public interface FeignNotificationRepository {

    @RequestMapping(method = RequestMethod.POST, value = "/notifications/create/property")
    ResponseEntity<String> createProperty(@RequestBody NotificationDTO notificationDTO, @RequestParam Long propertyId);
}
