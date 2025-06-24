package pi.ms_properties.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_properties.controller.OwnerController;
import pi.ms_properties.domain.Owner;
import pi.ms_properties.dto.feign.ContractDTO;
import pi.ms_properties.security.WebSecurityConfig;
import pi.ms_properties.service.impl.OwnerService;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OwnerController.class)
@Import({OwnerControllerTest.Config.class, WebSecurityConfig.class})
class OwnerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OwnerService ownerService;

    private Owner validOwner;

    @TestConfiguration
    static class Config {
        @Bean
        public OwnerService ownerService() {
            return Mockito.mock(OwnerService.class);
        }
    }

    @BeforeEach
    void setUp() {
        validOwner = new Owner();
        validOwner.setId(1L);
        validOwner.setFirstName("Juan");
        validOwner.setLastName("Pérez");
        validOwner.setEmail("juan.perez@email.com");
        validOwner.setPhone("3511234567");
    }

    // casos de exito

    @Test
    @WithMockUser(roles = "admin")
    void createOwner_success() throws Exception {
        Mockito.when(ownerService.createOwner(any()))
                .thenReturn(ResponseEntity.ok("Propietario creado correctamente"));

        mockMvc.perform(post("/owner/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validOwner)))
                .andExpect(status().isOk())
                .andExpect(content().string("Propietario creado correctamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteOwner_success() throws Exception {
        Mockito.when(ownerService.deleteOwner(1L))
                .thenReturn(ResponseEntity.ok("Propietario eliminado correctamente"));

        mockMvc.perform(delete("/owner/delete/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Propietario eliminado correctamente"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateOwner_success() throws Exception {
        Mockito.when(ownerService.updateOwner(any()))
                .thenReturn(ResponseEntity.ok(validOwner));

        mockMvc.perform(put("/owner/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(validOwner)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Juan"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getByPropertyId_success() throws Exception {
        Mockito.when(ownerService.getByPropertyId(1L))
                .thenReturn(ResponseEntity.ok(validOwner));

        mockMvc.perform(get("/owner/getByProperty/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mail").value("juan.perez@email.com"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getAll_success() throws Exception {
        Mockito.when(ownerService.getAll())
                .thenReturn(ResponseEntity.ok(List.of(validOwner)));

        mockMvc.perform(get("/owner/getAll"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getById_success() throws Exception {
        Mockito.when(ownerService.getById(1L))
                .thenReturn(ResponseEntity.ok(validOwner));

        mockMvc.perform(get("/owner/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Juan"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void searchOwners_success() throws Exception {
        Mockito.when(ownerService.findBy("juan"))
                .thenReturn(ResponseEntity.ok(List.of(validOwner)));

        mockMvc.perform(get("/owner/search").param("search", "juan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser(roles = "admin")
    void getContracts_success() throws Exception {
        Long ownerId = 1L;
        List<ContractDTO> contracts = List.of(new ContractDTO());
        ResponseEntity<List<ContractDTO>> responseEntity = ResponseEntity.ok(contracts);

        Mockito.when(ownerService.findContracts(ownerId)).thenReturn(responseEntity);

        mockMvc.perform(get("/owner/getContracts/{id}", ownerId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(contracts.size()));
    }

    // casos de error

    @Test
    @WithMockUser(roles = "admin")
    void getById_notFound_returnsNotFound() throws Exception {
        Mockito.when(ownerService.getById(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).build());

        mockMvc.perform(get("/owner/getById/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "admin")
    void deleteOwner_notFound_returnsNotFound() throws Exception {
        Mockito.when(ownerService.deleteOwner(99L))
                .thenReturn(ResponseEntity.status(HttpStatus.NOT_FOUND).body("Propietario no encontrado"));

        mockMvc.perform(delete("/owner/delete/99"))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Propietario no encontrado"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void updateOwner_invalid_returnsBadRequest() throws Exception {
        Owner invalid = new Owner();
        invalid.setId(1L);

        Mockito.when(ownerService.updateOwner(any()))
                .thenReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST).build());

        mockMvc.perform(put("/owner/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(invalid)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "admin")
    void getContracts_ownerNotFound() throws Exception {
        Long ownerId = 999L;

        Mockito.when(ownerService.findContracts(ownerId))
                .thenThrow(new EntityNotFoundException("No se ha encontrado al propietario con ID: " + ownerId));

        mockMvc.perform(get("/owner/getContracts/{id}", ownerId))
                .andExpect(status().isNotFound())
                .andExpect(content().string("No se ha encontrado al propietario con ID: " + ownerId));
    }
}
