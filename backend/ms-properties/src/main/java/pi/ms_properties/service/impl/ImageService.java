package pi.ms_properties.service.impl;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Image;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Storage;
import pi.ms_properties.repository.ImageRepository;
import pi.ms_properties.repository.PropertyRepository;
import pi.ms_properties.service.interf.IAzureBlobStorage;
import pi.ms_properties.service.interf.IImageService;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ImageService implements IImageService {

    private final IAzureBlobStorage azureBlobStorage;

    private final ImageRepository imageRepository;

    private final PropertyRepository propertyRepository;

    private final BlobContainerClient blobContainerClient;

    // cuando edite una propiedad, si quiero cargar imagenes, hago un llamado aca
    @Override
    public String uploadImageToProperty(MultipartFile file, Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado la propiedad"));

        String path = file.getOriginalFilename();

        try {
            Storage storage = new Storage();
            storage.setPath(path);
            storage.setFileName(file.getOriginalFilename());
            storage.setInputStream(file.getInputStream());
            storage.setSize(file.getSize());
            storage.setContentType(file.getContentType());

            String blobPath = azureBlobStorage.create(storage);

            Image image = new Image();
            image.setUrl(blobPath);
            image.setProperty(property);
            imageRepository.save(image);

            return blobPath;

        } catch (BlobStorageException e) {
            throw new RuntimeException("No se ha podido subir la imagen a Blob Storage", e);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        } catch (Exception e) {
            throw new RuntimeException("Ha habido un error inesperado", e);
        }
    }

    @Override
    public ResponseEntity<String> deleteImage(Long id) {
        Optional<Image> imageOptional = imageRepository.findById(id);

        if (imageOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Imagen no encontrada");
        }

        Image image = imageOptional.get();

        String blobUrl = image.getUrl();
        String containerUrl = blobContainerClient.getBlobContainerUrl();
        // tenemos que tomar de la url solo el nombre de la imagen, sacando el path al contenedor
        String path = blobUrl.replace(containerUrl + "/", "");
        Storage storage = new Storage();
        storage.setPath(path);

        try {
            azureBlobStorage.delete(storage);
            imageRepository.delete(image);
            return ResponseEntity.ok("Imagen eliminada correctamente");
        } catch (BlobStorageException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar la imagen del blob storage");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado al eliminar la imagen");
        }
    }


    @Override
    public ResponseEntity<List<Image>> getAllByPropertyId(Long propertyId) {
        try {
            Optional<Property> property = propertyRepository.findById(propertyId);
            if (property.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            List<Image> images = imageRepository.findAllByPropertyId(propertyId);
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}

// falta el delete, getByPropertyId

