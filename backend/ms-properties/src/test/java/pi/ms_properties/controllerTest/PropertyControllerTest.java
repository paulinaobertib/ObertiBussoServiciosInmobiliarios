package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;
import pi.ms_properties.controller.PropertyController;
import pi.ms_properties.domain.Currency;
import pi.ms_properties.domain.Status;
import pi.ms_properties.dto.PropertyDTO;
import pi.ms_properties.dto.PropertySaveDTO;
import pi.ms_properties.dto.PropertySimpleDTO;
import pi.ms_properties.dto.PropertyUpdateDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.PropertyMergeService;
import pi.ms_properties.service.impl.PropertyService;
import pi.ms_properties.wasi.WasiPdfService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PropertyController.class)
@Import({PropertyControllerTest.Config.class, WebSecurityConfig.class})
class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PropertyMergeService propertyMergeService;

    @Autowired
    private WasiPdfService wasiPdfService;

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

        @Bean
        public PropertyMergeService propertyMergeService() {
            return Mockito.mock(PropertyMergeService.class);
        }

        @Bean
        public WasiPdfService wasiPdfService() {
            return Mockito.mock(WasiPdfService.class);
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
    void testUpdatePropertyOutstanding() throws Exception {
        Long propertyId = 1L;
        Boolean outstanding = true;

        when(propertyService.updateOutstanding(propertyId, outstanding))
                .thenReturn(ResponseEntity.ok("Se ha actualizado la prioridad de la propiedad."));

        mockMvc.perform(put("/property/outstanding/{id}", propertyId)
                        .param("outstanding", outstanding.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("Se ha actualizado la prioridad de la propiedad."));
    }

    @Test
    @WithMockUser(roles = "admin")
    void testGetAll() {
        List<PropertyDTO> list = new ArrayList<>();
        when(propertyMergeService.getAllMerged()).thenReturn(list);
        ResponseEntity<List<PropertyDTO>> response = propertyController.getAll();
        assertEquals(204, response.getStatusCode().value());
    }

    @Test
    void testGetAllUsers() {
        List<PropertyDTO> list = new ArrayList<>();
        when(propertyMergeService.getAvailableMerged()).thenReturn(list);
        ResponseEntity<List<PropertyDTO>> response = propertyController.getAllUsers();
        assertEquals(200, response.getStatusCode().value());
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
        when(propertyMergeService.searchMerged(any(BigDecimal.class), any(BigDecimal.class), anyFloat(), anyFloat(), anyFloat(), anyFloat(), anyList(), anyString(), anyList(), anyList(), anyList(), anyList(), anyList(), anyBoolean(), anyBoolean(), any(Currency.class), any(), any(), any(), any(), any()))
                .thenReturn(List.of(new PropertyDTO()));
        ResponseEntity<List<PropertyDTO>> response = propertyController.searchProperties(BigDecimal.valueOf(0), BigDecimal.valueOf(100000), 0, 300, 0, 200, List.of(3f), "venta", List.of("casa"), List.of("pileta"), List.of("cordoba"), List.of("centro"), List.of("urbano"), true, false, Currency.ARS, null, null, null, null, null);
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testSearchBy() {
        when(propertyMergeService.textSearchMerged("pileta"))
                .thenReturn(List.of(new PropertyDTO()));
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

    @Test
    void testUpdatePropertyStatusEspera() {
        when(propertyService.updateStatus(1L, Status.ESPERA))
                .thenReturn(ResponseEntity.ok("Status set to ESPERA"));

        ResponseEntity<String> response = propertyController.updatePropertyStatusEspera(1L);

        assertEquals("Status set to ESPERA", response.getBody());
    }

    @Test
    void testGetAllUsers_endpoint() throws Exception {
        when(propertyMergeService.getAvailableMerged()).thenReturn(List.of());

        mockMvc.perform(get("/property/get"))
                .andExpect(status().isOk());
    }

    @Test
    void testSearchProperties_withDefaults() throws Exception {
        when(propertyMergeService.searchMerged(any(), any(), anyFloat(), anyFloat(), anyFloat(), anyFloat(),
                anyList(), anyString(), anyList(), anyList(), anyList(), anyList(), anyList(),
                any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/property/search"))
                .andExpect(status().isOk());
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

    @Test
    @WithMockUser(roles = "user")
    void testUpdatePropertyOutstanding_forbidden() throws Exception {
        Long propertyId = 1L;

        mockMvc.perform(put("/property/outstanding/{id}", propertyId)
                        .param("outstanding", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    // ---------- visibilidad (mostrar/ocultar al público) ----------

    @Test
    @WithMockUser(roles = "admin")
    void testUpdatePropertyVisibility() throws Exception {
        when(propertyMergeService.setVisibility(1L, false))
                .thenReturn(ResponseEntity.ok("La propiedad se ocultó de la página (el admin la sigue viendo)."));

        mockMvc.perform(put("/property/visibility/{id}", 1L)
                        .param("visible", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().string("La propiedad se ocultó de la página (el admin la sigue viendo)."));
    }

    @Test
    @WithMockUser(roles = "user")
    void testUpdatePropertyVisibility_forbidden() throws Exception {
        mockMvc.perform(put("/property/visibility/{id}", 1L)
                        .param("visible", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_hiddenProperty_returnsNotFound_forNonAdmin() {
        when(propertyMergeService.isHidden(5L)).thenReturn(true);

        ResponseEntity<PropertyDTO> response = propertyController.getById(5L);

        assertEquals(404, response.getStatusCode().value());
        verify(propertyService, never()).getById(5L);
    }

    @Test
    void getSimpleById_hiddenProperty_returnsNotFound_forNonAdmin() {
        when(propertyMergeService.isHidden(5L)).thenReturn(true);

        ResponseEntity<PropertySimpleDTO> response = propertyController.getSimpleById(5L);

        assertEquals(404, response.getStatusCode().value());
        verify(propertyService, never()).getSimpleById(5L);
    }
}
