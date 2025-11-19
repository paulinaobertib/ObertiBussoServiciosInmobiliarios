package pi.ms_properties.service.impl;

import com.azure.storage.blob.*;
import com.azure.storage.blob.models.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.domain.Image;
import pi.ms_properties.domain.Property;
import pi.ms_properties.domain.Storage;
import pi.ms_properties.repository.IImageRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.service.interf.IAzureBlobStorage;
import pi.ms_properties.service.interf.IImageService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageService implements IImageService {

    private final IAzureBlobStorage azureBlobStorage;

    private final IImageRepository imageRepository;

    private final IPropertyRepository propertyRepository;

    private BlobContainerClient blobContainerClient;

    @Qualifier("images")
    public void setBlobContainerClient(BlobContainerClient blobContainerClient) {
        this.blobContainerClient = blobContainerClient;
    }

    // como lo guardamos con un nombre random a la imagen, necesito que guarde la extension del archivo
    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf("."));
    }

    private void saveImage(MultipartFile file, String uniqueFileName) throws IOException {
        Storage storage = new Storage();
        storage.setPath(uniqueFileName);
        storage.setFileName(file.getOriginalFilename());
        storage.setInputStream(file.getInputStream());
        storage.setSize(file.getSize());
        storage.setContentType(file.getContentType());

        azureBlobStorage.create(storage);
    }

    // cuando edite una propiedad, si quiero cargar imagenes, hago un llamado aca
    @Override
    public String uploadImageToProperty(MultipartFile file, Long propertyId, Boolean type) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("No se ha encontrado la propiedad"));

        String uniqueFileName = UUID.randomUUID() + getExtension(file.getOriginalFilename());

        try {
            saveImage(file, uniqueFileName);

            if (!type) {
                Image image = new Image();
                image.setUrl(uniqueFileName);
                image.setProperty(property);
                imageRepository.save(image);
            }

            return uniqueFileName;

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
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Imagen no encontrada"));

        String blobUrl = image.getUrl();
        String containerUrl = blobContainerClient.getBlobContainerUrl();
        String path = blobUrl.replace(containerUrl + "/", "");

        Storage storage = new Storage();
        storage.setPath(path);

        azureBlobStorage.delete(storage);
        imageRepository.delete(image);

        return ResponseEntity.ok("Imagen eliminada correctamente");
    }

    @Override
    public void deleteImageByName(String url) {
        Storage storage = new Storage();
        storage.setPath(url);
        azureBlobStorage.delete(storage);
    }

    @Override
    public ResponseEntity<List<Image>> getAllByPropertyId(Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Propiedad no encontrada"));

        List<Image> images = imageRepository.findAllByPropertyId(propertyId);

        for (Image image : images) {
            String blobPath = image.getUrl();
            String signedUrl = azureBlobStorage.getImageUrl(blobPath);
            image.setUrl(signedUrl);
        }

        return ResponseEntity.ok(images);
    }

    @Override
    public String uploadNoticeImage(MultipartFile file) {
        String uniqueFileName = UUID.randomUUID() + getExtension(file.getOriginalFilename());

        try {
            saveImage(file, uniqueFileName);

            return uniqueFileName;

        } catch (BlobStorageException e) {
            throw new RuntimeException("No se ha podido subir la imagen a Blob Storage", e);
        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        } catch (Exception e) {
            throw new RuntimeException("Ha habido un error inesperado", e);
        }
    }

    @Override
    public String getNoticeImageURL(String imageName) {
        return azureBlobStorage.getImageUrl(imageName);
    }
}