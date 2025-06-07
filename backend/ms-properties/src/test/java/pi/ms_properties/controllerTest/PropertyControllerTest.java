package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.controller.PropertyController;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.PropertyService;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PropertyController.class)
@Import({PropertyControllerTest.Config.class, WebSecurityConfig.class})
class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyController propertyController;

    @Autowired
    private ObjectMapper objectMapper;

    @TestConfiguration
    static class Config {
        @Bean
        public PropertyService propertyService() {
            return Mockito.mock(PropertyService.class);
        }
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void testCreateProperty() {
        PropertySaveDTO dto = new PropertySaveDTO();
        MultipartFile mainImage = new MockMultipartFile("main", new byte[]{});
        List<MultipartFile> images = List.of(new MockMultipartFile("img1", new byte[]{}));
        ResponseEntity<String> expected = new ResponseEntity<>("Created", HttpStatus.CREATED);

        when(propertyService.createProperty(any())).thenReturn(expected);

        ResponseEntity<String> response = propertyController.createProperty(dto, mainImage, images);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Created", response.getBody());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testDeleteProperty() {
        when(propertyService.deleteProperty(1L)).thenReturn(ResponseEntity.ok("Deleted"));
        ResponseEntity<String> response = propertyController.deleteProperty(1L);
        assertEquals("Deleted", response.getBody());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testUpdateProperty() {
        PropertyUpdateDTO dto = new PropertyUpdateDTO();
        MultipartFile mainImage = new MockMultipartFile("main", new byte[]{});
        PropertyDTO updated = new PropertyDTO();
        when(propertyService.updateProperty(eq(1L), any())).thenReturn(ResponseEntity.ok(updated));

        ResponseEntity<PropertyDTO> response = propertyController.updateProperty(1L, dto, mainImage);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testUpdatePropertyStatus() {
        when(propertyService.updateStatus(1L, Status.DISPONIBLE)).thenReturn(ResponseEntity.ok("Status updated"));
        ResponseEntity<String> response = propertyController.updatePropertyStatus(1L, Status.DISPONIBLE);
        assertEquals("Status updated", response.getBody());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAll() {
        List<PropertyDTO> list = new ArrayList<>();
        when(propertyService.getAll()).thenReturn(ResponseEntity.ok(list));
        ResponseEntity<List<PropertyDTO>> response = propertyController.getAll();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetAllUsers() {
        List<PropertyDTO> list = new ArrayList<>();
        when(propertyService.getAllUsers()).thenReturn(ResponseEntity.ok(list));
        ResponseEntity<List<PropertyDTO>> response = propertyController.getAllUsers();
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testGetById() {
        PropertyDTO dto = new PropertyDTO();
        when(propertyService.getById(1L)).thenReturn(ResponseEntity.ok(dto));
        ResponseEntity<PropertyDTO> response = propertyController.getById(1L);
        assertNotNull(response.getBody());
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetByStatus() {
        when(propertyService.getByStatus(Status.DISPONIBLE)).thenReturn(ResponseEntity.ok(List.of()));
        ResponseEntity<List<PropertyDTO>> response = propertyController.getByStatus(Status.DISPONIBLE);
        assertNotNull(response.getBody());
    }

    @Test
    void testSearchProperties() {
        when(propertyService.findBy(anyFloat(), anyFloat(), anyFloat(), anyFloat(), anyFloat(), anyFloat(), anyFloat(), anyString(), anyString(), anyList(), anyString(), anyString(), anyString(), any(), any()))
                .thenReturn(ResponseEntity.ok(List.of(new PropertyDTO())));

        ResponseEntity<List<PropertyDTO>> response = propertyController.searchProperties(
                0, 100000, 0, 300, 0, 200, 3, "venta", "casa",
                List.of("pileta"), "cordoba", "centro", "urbano", true, false);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testSearchBy() {
        when(propertyService.findByTitleDescription("pileta"))
                .thenReturn(ResponseEntity.ok(List.of(new PropertyDTO())));
        ResponseEntity<List<PropertyDTO>> response = propertyController.searchBy("pileta");
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetSimpleById() {
        PropertySimpleDTO dto = new PropertySimpleDTO();
        when(propertyService.getSimpleById(1L)).thenReturn(ResponseEntity.ok(dto));
        ResponseEntity<PropertySimpleDTO> response = propertyController.getSimpleById(1L);
        assertNotNull(response.getBody());
    }

    // casos de error

    @Test
    @WithMockUser(roles = "admin")
    void createProperty_shouldReturnBadRequest_whenMainImageMissing() throws Exception {
        PropertySaveDTO dto = new PropertySaveDTO();
        MockMultipartFile data = new MockMultipartFile("data", "", "application/json", objectMapper.writeValueAsBytes(dto));

        mockMvc.perform(multipart("/property/create")
                        .file(data))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateProperty_shouldReturnBadRequest_whenNoData() throws Exception {
        MockMultipartFile data = new MockMultipartFile("data", "", "application/json", "".getBytes());

        mockMvc.perform(multipart("/property/update/1")
                        .file(data)
                        .with(request -> {
                            request.setMethod("PUT");
                            return request;
                        }))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "admin")
    void updatePropertyStatus_shouldReturnBadRequest_whenStatusMissing() throws Exception {
        mockMvc.perform(put("/property/status/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getSimpleById_shouldReturnInternalServerError_whenServiceThrows() throws Exception {
        when(propertyService.getSimpleById(999L))
                .thenReturn(ResponseEntity.internalServerError().build());

        mockMvc.perform(get("/property/getSimple/999"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void createProperty_shouldReturnUnauthorized_whenNoUser() throws Exception {
        mockMvc.perform(multipart("/property/create"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "user")
    void deleteProperty_shouldReturnForbidden_whenUserIsNotAdmin() throws Exception {
        mockMvc.perform(delete("/property/delete/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "user")
    void getByStatus_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/property/getByStatus").param("status", "DISPONIBLE"))
                .andExpect(status().isForbidden());
    }
}
