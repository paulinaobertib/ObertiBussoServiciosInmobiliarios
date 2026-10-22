package pi.ms_users.controllerTest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import pi.ms_users.controller.ReceiptController;
import pi.ms_users.domain.*;
import pi.ms_users.dto.receipt.ReceiptDTO;
import pi.ms_users.dto.receipt.ReceiptGetDTO;
import pi.ms_users.dto.receipt.ReceiptItemDTO;
import pi.ms_users.security.ContractAccess;
import pi.ms_users.security.WebSecurityConfig;
import pi.ms_users.service.interf.IReceiptService;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReceiptController.class)
@Import({ReceiptControllerTest.Config.class, WebSecurityConfig.class})
class ReceiptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IReceiptService receiptService;

    @Autowired
    private ContractAccess contractAccess;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @TestConfiguration
    static class Config {
        @Bean
        public IReceiptService receiptService() {
            return Mockito.mock(IReceiptService.class);
        }

        @Bean(name = "contractAccess")
        public ContractAccess contractAccess() {
            return Mockito.mock(ContractAccess.class);
        }
    }

    @BeforeEach
    void reset() {
        Mockito.reset(receiptService, contractAccess);
    }

    private static ReceiptDTO validDTO() {
        ReceiptDTO dto = new ReceiptDTO();
        dto.setIssuer(ReceiptIssuer.CORREDOR);
        dto.setKind(ReceiptKind.RECIBO);
        dto.setConcept(ReceiptConcept.ALQUILER);
        dto.setCurrency(PaymentCurrency.ARS);
        dto.setPayerName("Marianela Pirani");
        dto.setItems(List.of(new ReceiptItemDTO("Alquiler", new BigDecimal("1000"))));
        return dto;
    }

    @Test
    @WithMockUser(roles = "admin")
    void adminCreatesReceipt() throws Exception {
        ReceiptGetDTO created = new ReceiptGetDTO();
        created.setNumber("LO-R-000001");
        when(receiptService.create(any())).thenReturn(ResponseEntity.ok(created));

        mockMvc.perform(post("/receipts/create").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.number").value("LO-R-000001"));
    }

    @Test
    @WithMockUser(roles = "admin")
    void invalidReceiptReturnsReadableMessage() throws Exception {
        when(receiptService.create(any())).thenThrow(new jakarta.ws.rs.BadRequestException("Falta el nombre de quien paga."));

        mockMvc.perform(post("/receipts/create").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO())))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Falta el nombre de quien paga.")));
    }

    @Test
    @WithMockUser(roles = "admin")
    void previewReturnsInlinePdf() throws Exception {
        when(receiptService.preview(any())).thenReturn("%PDF-1.7".getBytes());

        mockMvc.perform(post("/receipts/preview").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO())))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", containsString("inline")));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotCreateOrSearch() throws Exception {
        mockMvc.perform(post("/receipts/create").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validDTO())))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/receipts/search")).andExpect(status().isForbidden());
        mockMvc.perform(patch("/receipts/annul/1")).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantDownloadsOwnReceiptAsAttachment() throws Exception {
        when(contractAccess.canViewReceipt(3L)).thenReturn(true);
        when(receiptService.getPdf(3L)).thenReturn("%PDF-1.7".getBytes());
        when(receiptService.getFileName(3L)).thenReturn("Recibo-LO-R-000003.pdf");

        mockMvc.perform(get("/receipts/pdf/3"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", containsString("attachment")))
                .andExpect(header().string("Content-Disposition", containsString("Recibo-LO-R-000003.pdf")));
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantCannotDownloadSomeoneElsesReceipt() throws Exception {
        when(contractAccess.canViewReceipt(3L)).thenReturn(false);
        mockMvc.perform(get("/receipts/pdf/3")).andExpect(status().isForbidden());
        verify(receiptService, never()).getPdf(any());
    }

    @Test
    @WithMockUser(roles = "tenant")
    void tenantListsOwnReceiptsOnlyWithReceiptsAccess() throws Exception {
        when(contractAccess.canViewReceipts()).thenReturn(false);
        mockMvc.perform(get("/receipts/mine")).andExpect(status().isForbidden());

        when(contractAccess.canViewReceipts()).thenReturn(true);
        when(receiptService.getMine()).thenReturn(ResponseEntity.ok(List.of()));
        mockMvc.perform(get("/receipts/mine")).andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "admin")
    void adminAnnulsWithReason() throws Exception {
        ReceiptGetDTO dto = new ReceiptGetDTO();
        dto.setStatus(ReceiptStatus.ANULADO);
        when(receiptService.annul(5L, "Error de monto")).thenReturn(ResponseEntity.ok(dto));

        mockMvc.perform(patch("/receipts/annul/5").contentType(MediaType.APPLICATION_JSON).content("{\"reason\":\"Error de monto\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ANULADO"));
    }
}
