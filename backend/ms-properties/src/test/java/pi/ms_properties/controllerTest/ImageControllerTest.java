package pi.ms_properties.controllerTest;

import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.ImageController;
import pi.ms_properties.domain.Image;
import pi.ms_properties.service.impl.ImageService;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImageController.class)
@RequiredArgsConstructor
class ImageControllerTest {

    private final MockMvc mockMvc;

    @Mock
    private ImageService imageService;

    private MockMultipartFile mockFile;

    @BeforeEach
    void setup() {
        mockFile = new MockMultipartFile(
                "file", "test.jpg", MediaType.IMAGE_JPEG_VALUE, "dummy image".getBytes()
        );
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void uploadImage_success() throws Exception {
        Mockito.when(imageService.uploadImageToProperty(any(), eq(1L), eq(false)))
                .thenReturn("http://example.com/test.jpg");

        mockMvc.perform(multipart("/image/upload")
                        .file(mockFile)
                        .param("propertyId", "1"))
                .andExpect(status().isCreated())
                .andExpect(content().string("http://example.com/test.jpg"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteImage_success() throws Exception {
        Mockito.when(imageService.deleteImage(1L)).thenReturn(ResponseEntity.ok("Imagen eliminada"));

        mockMvc.perform(delete("/image/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Imagen eliminada"));
    }

    @Test
    void getByPropertyId_success() throws Exception {
        Image image = new Image(1L, "https://example.com/test.jpg", null);
        List<Image> images = Collections.singletonList(image);
        Mockito.when(imageService.getAllByPropertyId(1L)).thenReturn(ResponseEntity.ok(images));

        mockMvc.perform(get("/image/getByProperty/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].url").value("http://example.com/test.jpg"));
    }

    // casos de error

    @Test
    void uploadImage_unauthorized() throws Exception {
        mockMvc.perform(multipart("/image/upload")
                        .file(mockFile)
                        .param("propertyId", "1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void uploadImage_missingFile() throws Exception {
        mockMvc.perform(multipart("/image/upload")
                        .param("propertyId", "1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "admin")
    void uploadImage_ioException() throws Exception {
        Mockito.when(imageService.uploadImageToProperty(any(), eq(1L), eq(false)))
                .thenThrow(new IOException("Error al subir"));

        mockMvc.perform(multipart("/image/upload")
                        .file(mockFile)
                        .param("propertyId", "1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getByPropertyId_emptyList() throws Exception {
        Mockito.when(imageService.getAllByPropertyId(999L)).thenReturn(ResponseEntity.ok(Collections.emptyList()));

        mockMvc.perform(get("/image/getByProperty/999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }

    @Test
    void deleteImage_unauthorized() throws Exception {
        mockMvc.perform(delete("/image/delete/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteImage_notFound() throws Exception {
        Mockito.when(imageService.deleteImage(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(delete("/image/delete/999"))
                .andExpect(status().isNotFound());
    }
}
