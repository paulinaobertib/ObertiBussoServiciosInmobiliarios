package pi.ms_users.controllerTest;

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
import pi.ms_users.controller.ContractDocumentController;
import pi.ms_users.domain.ContractDocument;
import pi.ms_users.dto.contractpdf.ContractExtractionDTO;
import pi.ms_users.security.ContractAccess;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IContractPdfService;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ContractDocumentController.class)
@Import({ContractDocumentControllerTest.Config.class, WebSecurityConfig.class})
class ContractDocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IContractPdfService contractPdfService;

    @Autowired
    private ContractAccess contractAccess;

    @TestConfiguration
    static class Config {
        @Bean
        public IContractPdfService contractPdfService() {
            return Mockito.mock(IContractPdfService.class);
        }

        @Bean(name = "contractAccess")
        public ContractAccess contractAccess() {
            return Mockito.mock(ContractAccess.class);
        }
    }

    @BeforeEach
    void reset() {
        Mockito.reset(contractPdfService, contractAccess);
    }

    private final MockMultipartFile pdf = new MockMultipartFile("file", "contrato.pdf", "application/pdf", "%PDF-1.7".getBytes());

    @Test
    @WithMockUser(roles = "admin")
    void adminExtractsFromPdf() throws Exception {
        ContractExtractionDTO dto = new ContractExtractionDTO();
        dto.setSource("TEXT");
        when(contractPdfService.extract(any())).thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(multipart("/contracts/extractFromPdf").file(pdf))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.source").value("TEXT"));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotExtractOrUpload() throws Exception {
        mockMvc.perform(multipart("/contracts/extractFromPdf").file(pdf)).andExpect(status().isForbidden());
        mockMvc.perform(multipart("/contracts/4/document").file(pdf)).andExpect(status().isForbidden());
        verifyNoInteractions(contractPdfService);
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantDownloadsOwnContractPdf() throws Exception {
        when(contractAccess.canViewContract(4L)).thenReturn(true);
        ContractDocument doc = new ContractDocument(1L, 4L, "contrato.pdf", "application/pdf", 8L, "%PDF-1.7".getBytes(), LocalDateTime.now());
        when(contractPdfService.getDocument(4L)).thenReturn(doc);

        mockMvc.perform(get("/contracts/4/document"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", containsString("contrato.pdf")));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotDownloadOthersContractPdf() throws Exception {
        when(contractAccess.canViewContract(4L)).thenReturn(false);
        mockMvc.perform(get("/contracts/4/document")).andExpect(status().isForbidden());
        mockMvc.perform(get("/contracts/4/extraFields")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "admin")
    void adminReplacesExtraFields() throws Exception {
        when(contractPdfService.replaceExtraFields(eq(4L), any())).thenReturn(ResponseEntity.ok(java.util.List.of()));
        mockMvc.perform(put("/contracts/4/extraFields").contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"label\":\"Día de pago\",\"value\":\"1 al 10\"}]"))
                .andExpect(status().isOk());
    }
}
