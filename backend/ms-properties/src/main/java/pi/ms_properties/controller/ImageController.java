package pi.ms_properties.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Image;
import pi.ms_properties.service.impl.ImageService;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/image")
public class ImageController {

    private final ImageService imageService;

    @PreAuthorize("hasRole('admin')")
    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file, @RequestParam("propertyId") Long propertyId) throws IOException {
        imageService.uploadImageToProperty(file, propertyId, false);
        return ResponseEntity.status(HttpStatus.CREATED).body("Se ha creado la imagen correctamente ");
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        return imageService.deleteImage(id);
    }

    @GetMapping("/getByProperty/{id}")
    public ResponseEntity<List<Image>> getByPropertyId(@PathVariable Long id) {
        return imageService.getAllByPropertyId(id);
    }
}
