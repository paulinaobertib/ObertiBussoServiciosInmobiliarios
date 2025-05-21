package pi.ms_users.repository.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import pi.ms_users.configuration.feign.FeignInterceptor;
import pi.ms_users.domain.feign.Property;

@FeignClient(name = "ms-property", url = "http://localhost:8083", configuration = FeignInterceptor.class)
public interface FeignPropertyRepository {

    @RequestMapping(method = RequestMethod.GET, value = "/property/getSimple/{id}")
    ResponseEntity<Property> getSimpleById(@PathVariable Long id);
}
