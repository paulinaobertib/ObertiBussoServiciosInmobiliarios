package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.GuarantorController;
import pi.ms_users.dto.ContractGuarantorGetDTO;
import pi.ms_users.dto.GuarantorDTO;
import pi.ms_users.dto.GuarantorGetDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IGuarantorService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(GuarantorController.class)
@Import({GuarantorControllerTest.Config.class, WebSecurityConfig.class})
class GuarantorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IGuarantorService guarantorService;

    @TestConfiguration
    static class Config {
        @Bean
        public IGuarantorService guarantorService() {
            return Mockito.mock(IGuarantorService.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper();

    private GuarantorDTO getSampleDTO() {
        GuarantorDTO dto = new GuarantorDTO();
        dto.setId(1L);
        dto.setName("Juan Pérez");
        dto.setPhone("123456");
        dto.setEmail("juan@test.com");
        return dto;
    }

    private GuarantorGetDTO getSampleGetDTO() {
        GuarantorGetDTO dto = new GuarantorGetDTO();
        dto.setId(1L);
        dto.setName("Juan Pérez");
        dto.setPhone("123456");
        dto.setEmail("juan@test.com");
        dto.setContractGetDTOS(List.of());
        return dto;
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createGuarantor_shouldReturnOk() throws Exception {
        when(guarantorService.create(any(GuarantorDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/guarantors/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateGuarantor_shouldReturnOk() throws Exception {
        when(guarantorService.update(any(GuarantorDTO.class)))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/guarantors/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteGuarantor_shouldReturnOk() throws Exception {
        when(guarantorService.delete(1L)).thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/guarantors/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnOk() throws Exception {
        when(guarantorService.getById(1L)).thenReturn(ResponseEntity.ok(getSampleGetDTO()));

        mockMvc.perform(get("/guarantors/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("juan@test.com"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getAll_shouldReturnOk() throws Exception {
        when(guarantorService.getAll()).thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/guarantors/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByContract_shouldReturnOk() throws Exception {
        when(guarantorService.getByContract(100L)).thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/guarantors/getByContract/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getContractsByGuarantor_shouldReturnOk() throws Exception {
        ContractGuarantorGetDTO contract = new ContractGuarantorGetDTO();
        contract.setId(200L);
        when(guarantorService.getContractsByGuarantor(1L))
                .thenReturn(ResponseEntity.ok(List.of(contract)));

        mockMvc.perform(get("/guarantors/getContracts/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByEmail_shouldReturnOk() throws Exception {
        when(guarantorService.getByEmail("juan@test.com")).thenReturn(ResponseEntity.ok(getSampleGetDTO()));

        mockMvc.perform(get("/guarantors/getByEmail")
                        .param("email", "juan@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("juan@test.com"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getByPhone_shouldReturnOk() throws Exception {
        when(guarantorService.getByPhone("123456")).thenReturn(ResponseEntity.ok(getSampleGetDTO()));

        mockMvc.perform(get("/guarantors/getByPhone")
                        .param("phone", "123456"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.phone").value("123456"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void searchGuarantors_shouldReturnOk() throws Exception {
        when(guarantorService.search("Juan")).thenReturn(ResponseEntity.ok(List.of(getSampleGetDTO())));

        mockMvc.perform(get("/guarantors/search")
                        .param("q", "Juan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void addGuarantorToContract_shouldReturnOk() throws Exception {
        when(guarantorService.addGuarantorToContract(1L, 100L))
                .thenReturn(ResponseEntity.ok("Vinculado"));

        mockMvc.perform(post("/guarantors/addContracts/1/100"))
                .andExpect(status().isOk())
                .andExpect(content().string("Vinculado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void removeGuarantorFromContract_shouldReturnOk() throws Exception {
        when(guarantorService.removeGuarantorFromContract(1L, 100L))
                .thenReturn(ResponseEntity.ok("Desvinculado"));

        mockMvc.perform(delete("/guarantors/removeContracts/1/100"))
                .andExpect(status().isOk())
                .andExpect(content().string("Desvinculado"));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "tenant")
    void createGuarantor_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/guarantors/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(getSampleDTO())))
                .andExpect(status().isForbidden());
    }

    @Test
    void getById_shouldReturnUnauthorized_whenNoAuth() throws Exception {
        mockMvc.perform(get("/guarantors/getById/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "admin")
    void createGuarantor_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/guarantors/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(""))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void getById_shouldReturnNotFound_whenServiceThrows() throws Exception {
        when(guarantorService.getById(999L))
                .thenThrow(new EntityNotFoundException("No se encontró"));

        mockMvc.perform(get("/guarantors/getById/999"))
                .andExpect(status().isNotFound());
    }
}
