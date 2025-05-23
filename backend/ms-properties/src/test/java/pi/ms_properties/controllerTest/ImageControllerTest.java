package pi.ms_properties.controllerTest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.ImageController;
import pi.ms_properties.domain.Image;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.ImageService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ImageController.class)
@Import({ImageControllerTest.Config.class, WebSecurityConfig.class})
class ImageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ImageService imageService;

    private MockMultipartFile mockFile;

    @TestConfiguration
    static class Config {
        @Bean
        public ImageService imageService() {
            return Mockito.mock(ImageService.class);
        }
    }

    @BeforeEach
    void setup() {
        mockFile = new MockMultipartFile(
                "file",
                "test-image.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void uploadImage_success() throws Exception {
        Mockito.when(imageService.uploadImageToProperty(any(), eq(1L), eq(false)))
                .thenReturn("https://example.com/test.jpg");

        mockMvc.perform(multipart("/image/upload")
                        .file(mockFile)
                        .param("propertyId", "1"))
                .andExpect(status().isCreated())
                .andExpect(content().string("https://example.com/test.jpg"));
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
                .andExpect(jsonPath("$[0].url").value("https://example.com/test.jpg"));
    }

    // casos de error

    @Test
    void uploadImage_unauthorized() throws Exception {
        mockMvc.perform(multipart("/image/upload")
                        .file(mockFile)
                        .param("propertyId", "1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void uploadImage_missingFile() throws Exception {
        mockMvc.perform(multipart("/image/upload")
                        .param("propertyId", "1"))
                .andExpect(status().isBadRequest());
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
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteImage_notFound() throws Exception {
        Mockito.when(imageService.deleteImage(999L)).thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(delete("/image/delete/999"))
                .andExpect(status().isNotFound());
    }
}
