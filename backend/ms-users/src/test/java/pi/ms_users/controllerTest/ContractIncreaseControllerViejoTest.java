/*package pi.ms_users.controllerTest;

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
import pi.ms_users.controller.ContractIncreaseControllerViejo;
import pi.ms_users.domain.PaymentCurrency;
import pi.ms_users.dto.ContractIncreaseDTO;
import pi.ms_users.dto.ContractIncreaseDTOContractGet;
import pi.ms_users.security.WebSecurityConfig;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractIncreaseControllerViejo.class)
@Import({ContractIncreaseControllerViejoTest.Config.class, WebSecurityConfig.class})
class ContractIncreaseControllerViejoTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractIncreaseServiceViejo contractIncreaseService;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractIncreaseServiceViejo contractIncreaseService() {
            return Mockito.mock(IContractIncreaseServiceViejo.class);
        }
    }

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    // casos de exito

    @Test
    void create_shouldReturnOk() throws Exception {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setCurrency(PaymentCurrency.USD);
        dto.setDate(LocalDateTime.now());
        dto.setContractId(123L);

        when(contractIncreaseService.create(any(ContractIncreaseDTO.class)))
                .thenReturn(ResponseEntity.ok("Created"));

        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Created"));
    }

    @Test
    void delete_shouldReturnOk() throws Exception {
        when(contractIncreaseService.delete(1L))
                .thenReturn(ResponseEntity.ok("Deleted"));

        mockMvc.perform(delete("/contractIncreases/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(content().string("Deleted"));
    }

    @Test
    void getById_shouldReturnOk() throws Exception {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setCurrency(ContractIncreaseCurrency.USD);
        dto.setDate(LocalDateTime.now());
        dto.setContractId(123L);

        when(contractIncreaseService.getById(1L))
                .thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(get("/contractIncreases/getById/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.amount").value(1000));
    }

    @Test
    void getByContract_shouldReturnOk() throws Exception {
        ContractIncreaseDTOContractGet dto = new ContractIncreaseDTOContractGet();
        dto.setId(1L);
        dto.setAmount(BigDecimal.valueOf(1000));
        dto.setCurrency(ContractIncreaseCurrency.USD);
        dto.setDate(LocalDateTime.now());

        when(contractIncreaseService.getByContract(123L))
                .thenReturn(ResponseEntity.ok(List.of(dto)));

        mockMvc.perform(get("/contractIncreases/contract/123")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].amount").value(1000));
    }

    // casos de error

    @Test
    void create_shouldReturnForbidden_ifNotAdmin() throws Exception {
        ContractIncreaseDTO dto = new ContractIncreaseDTO();
        dto.setId(1L);

        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto))
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void delete_shouldReturnForbidden_ifNotAdmin() throws Exception {
        mockMvc.perform(delete("/contractIncreases/delete/1")
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_user"))))
                .andExpect(status().isForbidden());
    }

    @Test
    void create_shouldReturnBadRequest_whenInvalidBody() throws Exception {
        mockMvc.perform(post("/contractIncreases/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("") // cuerpo vacío
                        .with(jwt().authorities(new SimpleGrantedAuthority("ROLE_admin"))))
                .andExpect(status().isBadRequest());
    }
}
*/