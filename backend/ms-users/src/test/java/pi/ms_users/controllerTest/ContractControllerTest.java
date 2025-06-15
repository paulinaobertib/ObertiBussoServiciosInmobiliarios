package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.ContractController;
import pi.ms_users.domain.ContractStatus;
import pi.ms_users.domain.ContractType;
import pi.ms_users.dto.ContractDTO;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractController.class)
@Import({ContractControllerTest.Config.class, WebSecurityConfig.class})
class ContractControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractService contractService;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @TestConfiguration
    static class Config {
        @Bean
        public IContractService contractService() {
            return Mockito.mock(IContractService.class);
        }
    }

    private ContractDTO buildSampleContract() {
        ContractDTO dto = new ContractDTO();
        dto.setId(1L);
        dto.setUserId("user123");
        dto.setPropertyId(10L);
        dto.setContractType(ContractType.VIVIENDA);
        dto.setStartDate(LocalDateTime.now());
        dto.setEndDate(LocalDateTime.now().plusMonths(6));
        dto.setContractStatus(ContractStatus.ACTIVO);
        dto.setIncrease(10.5f);
        dto.setIncreaseFrequency(3L);
        dto.setContractIncrease(new ArrayList<>());
        return dto;
    }

    // casos de exito

    @Test
    void createContract_shouldReturnOk() throws Exception {
        ContractDTO dto = buildSampleContract();

        when(contractService.create(any(), any(), any()))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contracts/create")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .param("amount", "1000.00")
                        .param("currency", "USD")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void updateContract_shouldReturnOk() throws Exception {
        ContractDTO dto = buildSampleContract();

        when(contractService.update(any()))
                .thenReturn(ResponseEntity.ok("Updated"));

        mockMvc.perform(put("/contracts/update")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(content().string("Updated"));
    }

    @Test
    void updateContractStatus_shouldReturnOk() throws Exception {
        when(contractService.updateStatus(1L))
                .thenReturn(ResponseEntity.ok("Status updated"));

        mockMvc.perform(patch("/contracts/updateStatus/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Status updated"));
    }

    @Test
    void deleteContract_shouldReturnOk() throws Exception {
        when(contractService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contracts/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getContractById_shouldReturnOk() throws Exception {
        ContractDTO dto = buildSampleContract();

        when(contractService.getById(1L))
                .thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(get("/contracts/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void getAll_shouldReturnOk() throws Exception {
        when(contractService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract(), buildSampleContract())));

        mockMvc.perform(get("/contracts/getAll")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getContractsByUserId_shouldReturnOk() throws Exception {
        when(contractService.getByUserId("user123"))
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract())));

        mockMvc.perform(get("/contracts/user/user123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getContractsByPropertyId_shouldReturnOk() throws Exception {
        when(contractService.getByPropertyId(10L))
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract())));

        mockMvc.perform(get("/contracts/property/10")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    @Test
    void getContractsByType_shouldReturnOk() throws Exception {
        when(contractService.getByType(ContractType.TEMPORAL))
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract())));

        mockMvc.perform(get("/contracts/type")
                        .param("type", "TEMPORAL")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    @Test
    void getContractsByStatus_shouldReturnOk() throws Exception {
        when(contractService.getByStatus(ContractStatus.ACTIVO))
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract())));

        mockMvc.perform(get("/contracts/status")
                        .param("status", "ACTIVO")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    @Test
    void getContractsByDateRange_shouldReturnOk() throws Exception {
        LocalDateTime start = LocalDateTime.now().minusDays(10);
        LocalDateTime end = LocalDateTime.now();

        when(contractService.getByDateBetween(start, end))
                .thenReturn(ResponseEntity.ok(List.of(buildSampleContract())));

        mockMvc.perform(get("/contracts/dateRange")
                        .param("start", start.toString())
                        .param("end", end.toString())
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk());
    }

    // casos de error

    @Test
    void createContract_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(post("/contracts/create")
                        .param("amount", "1000.00")
                        .param("currency", "USD")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(buildSampleContract()))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getAll_shouldReturnForbidden_whenNotAdmin() throws Exception {
        mockMvc.perform(get("/contracts/getAll")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getContractById_shouldReturnNotFound() throws Exception {
        when(contractService.getById(999L))
                .thenReturn(ResponseEntity.notFound().build());

        mockMvc.perform(get("/contracts/getById/999")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isNotFound());
    }

    @Test
    void createContract_shouldReturnBadRequest_whenMissingBody() throws Exception {
        mockMvc.perform(post("/contracts/create")
                        .param("amount", "1000.00")
                        .param("currency", "USD")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isBadRequest());
    }
}