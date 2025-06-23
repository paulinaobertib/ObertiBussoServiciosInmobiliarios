package pi.ms_properties.repository.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pi.ms_properties.configuration.feign.FeignInterceptor;
import pi.ms_properties.dto.feign.*;

import java.util.List;
import java.util.Optional;

@FeignClient(name = "ms-users", url = "http://localhost:8081", configuration = FeignInterceptor.class)
public interface FeignUserRepository {

    @RequestMapping(method = RequestMethod.POST, value = "/notifications/create/property")
    ResponseEntity<String> createProperty(@RequestBody NotificationDTO notificationDTO, @RequestParam Long propertyId);

    @RequestMapping(method = RequestMethod.POST, value = "/notifications/create/interestProperty")
    ResponseEntity<String> createPropertyInterest(@RequestParam("userId") String userId, @RequestParam("type") NotificationType type, @RequestParam("propertyId") Long propertyId);

    @RequestMapping(method = RequestMethod.GET, value = "/user/getById/{id}")
    ResponseEntity<Optional<UserDTO>> findById(@PathVariable String id);

    @RequestMapping(method = RequestMethod.GET, value = "/user/exist/{id}")
    Boolean exist(@PathVariable String id);

    @RequestMapping(method = RequestMethod.GET, value = "/contracts/property/{propertyId}")
    ResponseEntity<List<ContractDTO>> getContractsByPropertyId(@PathVariable Long propertyId);

    @RequestMapping(method = RequestMethod.GET, value = "/favorites/user/{userId}")
    List<FavoriteDTO> getByUserIdInternal(@PathVariable String userId);

    @RequestMapping(method = RequestMethod.GET, value = "/favorites/internal/allUser")
    List<String> getAllUsers();
}
