package pi.ms_users.repository.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_users.configuration.feign.FeignInterceptor;
import pi.ms_users.dto.feign.PropertyDTO;
import pi.ms_users.dto.feign.Status;

@FeignClient(name = "ms-property", url = "${property.service.url}", configuration = FeignInterceptor.class)
public interface FeignPropertyRepository {

    @RequestMapping(method = RequestMethod.GET, value = "/property/getSimple/{id}")
    ResponseEntity<PropertyDTO> getSimpleById(@PathVariable Long id);

    @RequestMapping(method = RequestMethod.PUT, value = "/property/status/{id}")
    ResponseEntity<String> updateStatus(@PathVariable Long id, @RequestParam Status status);

    @RequestMapping(method = RequestMethod.POST, value = "/image/notice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<String> uploadNoticeImage(@RequestPart("file") MultipartFile file);

    @RequestMapping(method = RequestMethod.GET, value = "/image/notice/getImage")
    ResponseEntity<String> getNoticeImage(@RequestParam("imageName")String imageName);
}
