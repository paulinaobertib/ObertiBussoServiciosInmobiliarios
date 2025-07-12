package pi.ms_properties.serviceTest;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import pi.ms_properties.domain.*;
import pi.ms_properties.dto.feign.AgentChatDTO;
import pi.ms_properties.repository.IAgentAssignmentRepository;
import pi.ms_properties.repository.IChatSessionRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.AgentChatRepository;
import pi.ms_properties.service.impl.ChatService;
import pi.ms_properties.service.interf.IAgentAssignService;
import pi.ms_properties.service.interf.IChatDerivationService;
import pi.ms_properties.service.interf.IChatMessageService;
import pi.ms_properties.service.interf.IEmailService;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @InjectMocks
    private ChatService chatService;

    @Mock
    private IPropertyRepository propertyRepository;

    @Mock
    private IChatDerivationService chatDerivationService;

    @Mock
    private IChatSessionRepository chatSessionRepository;

    @Mock
    private IChatMessageService chatMessageService;

    @Mock
    private AgentChatRepository agentChatRepository;

    @Mock
    private IAgentAssignService agentAssignService;

    @Mock
    private IAgentAssignmentRepository agentAssigmentRepository;

    @Mock
    private IEmailService emailService;

    private Property property;
    private ChatSession chatSession;

    @BeforeEach
    void setUp() {
        property = new Property();
        property.setId(1L);
        property.setShowPrice(true);
        property.setPrice(BigDecimal.valueOf(100000));
        property.setCurrency(Currency.USD);
        property.setExpenses(BigDecimal.valueOf(5000));
        property.setArea(100.0F);
        property.setCoveredArea(80.0F);
        property.setBedrooms(2F);
        property.setBathrooms(1F);
        property.setRooms(4F);
        property.setFinancing(true);
        property.setCredit(false);

        Neighborhood neighborhood = new Neighborhood();
        neighborhood.setCity("CiudadX");
        neighborhood.setName("BarrioY");
        neighborhood.setType(NeighborhoodType.ABIERTO);
        property.setNeighborhood(neighborhood);

        Amenity amenity = new Amenity();
        amenity.setName("Pileta");
        property.setAmenities(Set.of(amenity));

        chatSession = new ChatSession();
        chatSession.setId(1L);
    }

    // casos de exito

    @Test
    void testResponseToUserMessage_VerPrecio_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L);

        assertTrue(response.contains("El precio de la propiedad es"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerArea_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_AREA, 1L, 1L);

        assertTrue(response.contains("La superficie total es de"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerHabitaciones_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);

        assertTrue(response.contains("La propiedad posee"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerOperacion_Success() {
        property.setOperation(Operation.VENTA);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_OPERACION, 1L, 1L);

        assertTrue(response.contains("La propiedad se encuentra disponible para su"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerUbicacion_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_UBICACION, 1L, 1L);

        assertTrue(response.contains("La propiedad se encuentra en"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerFinanciacion_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_FINANCIACION, 1L, 1L);

        assertTrue(response.contains("posibilidad de financiación"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerCredito_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_CREDITO, 1L, 1L);

        assertTrue(response.contains("no es apta para crédito hipotecario"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerCaracteristicas_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_CARACTERISTICAS, 1L, 1L);

        assertTrue(response.contains("características"));
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_Derivar_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        AgentChatDTO agent = new AgentChatDTO();
        agent.setUserId("agent1");
        agent.setName("Agente 1");

        when(agentChatRepository.getAgents()).thenReturn(List.of(agent));
        when(agentAssigmentRepository.getLast()).thenReturn(null);

        String response = chatService.responseToUserMessage(ChatOption.DERIVAR, 1L, 1L);

        assertTrue(response.contains("Tu consulta ha sido derivada"));
        verify(chatDerivationService).create(any(ChatDerivation.class));
        verify(agentAssignService).create("agent1");
        verify(emailService).sendChatSummaryEmail(eq(chatSession), eq(true), eq("Agente 1"));
    }

    @Test
    void testResponseToUserMessage_Cerrar_Success() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.CERRAR, 1L, 1L);

        assertTrue(response.contains("La conversación ha finalizado"));
        verify(emailService).sendChatSummaryEmail(eq(chatSession), eq(false), isNull());
    }

    @Test
    void testResponseToUserMessage_VerPrecio_ShowPriceFalse() {
        property.setShowPrice(false);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L);

        assertEquals("Para conocer el precio de esta propiedad, por favor comuníquese con uno de nuestros asesores.", response);
        verify(chatMessageService).create(any(ChatMessage.class));
    }

    @Test
    void testResponseToUserMessage_VerPrecio_ExpensesZeroOrNull() {
        property.setShowPrice(true);

        property.setExpenses(null);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));
        String response1 = chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L);
        assertTrue(response1.contains("El precio de la propiedad es"));

        property.setExpenses(BigDecimal.ZERO);
        String response2 = chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L);
        assertTrue(response2.contains("El precio de la propiedad es"));
    }

    @Test
    void testResponseToUserMessage_VerArea_CoveredAreaNullOrZero() {
        property.setCoveredArea(null);
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));
        String response = chatService.responseToUserMessage(ChatOption.VER_AREA, 1L, 1L);
        assertTrue(response.contains("La superficie total es de"));

        property.setCoveredArea(0f);
        response = chatService.responseToUserMessage(ChatOption.VER_AREA, 1L, 1L);
        assertTrue(response.contains("La superficie total es de"));
    }

    @Test
    void testResponseToUserMessage_VerHabitaciones_VariousCases() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        property.setBedrooms(2f);
        property.setBathrooms(2f);
        String response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);
        assertTrue(response.contains("incluyendo 2 dormitorios y 2 baños."));

        property.setBedrooms(3f);
        property.setBathrooms(1f);
        response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);
        assertTrue(response.contains("incluyendo 3 dormitorios y un baño."));

        property.setBedrooms(1f);
        property.setBathrooms(1f);
        response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);
        assertTrue(response.contains("incluyendo un dormitorio y un baño."));

        property.setBedrooms(1f);
        property.setBathrooms(2f);
        response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);
        assertTrue(response.contains("incluyendo un dormitorio y 2 baños."));

        property.setBedrooms(0f);
        property.setBathrooms(0f);
        response = chatService.responseToUserMessage(ChatOption.VER_HABITACIONES, 1L, 1L);
        assertTrue(response.contains("No hay información registrada sobre habitaciones"));
    }

    @Test
    void testResponseToUserMessage_VerFinanciacion_False() {
        property.setFinancing(false);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_FINANCIACION, 1L, 1L);
        assertEquals("Esta propiedad no ofrece financiación.", response);
    }

    @Test
    void testResponseToUserMessage_VerCredito_True() {
        property.setCredit(true);

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_CREDITO, 1L, 1L);
        assertEquals("Esta propiedad es apta para crédito hipotecario.", response);
    }

    @Test
    void testResponseToUserMessage_VerCaracteristicas_EmptyAmenities() {
        property.setAmenities(Collections.emptySet());

        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));

        String response = chatService.responseToUserMessage(ChatOption.VER_CARACTERISTICAS, 1L, 1L);
        assertEquals("Esta propiedad no tiene características adicionales registradas.", response);
    }

    @Test
    void testResponseToUserMessage_Derivar_NoAgents_Throws() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));
        when(agentChatRepository.getAgents()).thenReturn(Collections.emptyList());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            chatService.responseToUserMessage(ChatOption.DERIVAR, 1L, 1L));

        assertEquals("No hay agentes habilitados.", exception.getMessage());

        verify(agentAssignService, never()).create(anyString());
    }

    // casos de error

    @Test
    void testResponseToUserMessage_PropiedadNoEncontrada() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L)
        );

        assertEquals("No se ha encontrado la propiedad.", exception.getMessage());
    }

    @Test
    void testResponseToUserMessage_SesionNoEncontrada() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class, () ->
                chatService.responseToUserMessage(ChatOption.VER_PRECIO, 1L, 1L)
        );

        assertEquals("No se ha encontrado la sesion.", exception.getMessage());
    }

    @Test
    void testDerivar_NoAgentesDisponibles() {
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(property));
        when(chatSessionRepository.findById(1L)).thenReturn(Optional.of(chatSession));
        when(agentChatRepository.getAgents()).thenReturn(List.of());

        RuntimeException exception = assertThrows(RuntimeException.class, () ->
                chatService.responseToUserMessage(ChatOption.DERIVAR, 1L, 1L)
        );

        assertEquals("No hay agentes habilitados.", exception.getMessage());
    }
}