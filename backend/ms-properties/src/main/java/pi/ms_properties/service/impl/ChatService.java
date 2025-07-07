package pi.ms_properties.service.impl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.*;
import pi.ms_properties.dto.feign.AgentChatDTO;
import pi.ms_properties.repository.IAgentAssignmentRepository;
import pi.ms_properties.repository.IChatSessionRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.AgentChatRepository;
import pi.ms_properties.service.interf.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService implements IChatService {

    private final IPropertyRepository propertyRepository;

    private final IChatDerivationService chatDerivationService;

    private final IChatSessionRepository chatSessionRepository;

    private final IChatMessageService chatMessageService;

    private final AgentChatRepository agentChatRepository;

    private final IAgentAssignService agentAssignService;

    private final IAgentAssignmentRepository agentAssigmentRepository;

    private final IEmailService emailService;

    public String responseToUserMessage(ChatOption chatOption, Long propertyId, Long sessionId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad."));

        ChatSession chatSession = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la sesion."));

        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setChatOption(chatOption);
        chatMessage.setChatSession(chatSession);
        chatMessageService.create(chatMessage);

        switch (chatOption) {
            case VER_PRECIO:
                if (property.getShowPrice()) {
                    if (property.getExpenses() != null && property.getExpenses().compareTo(BigDecimal.ZERO) > 0) {
                        return "El precio de la propiedad es " + property.getPrice() + " " + property.getCurrency() +
                                ". Las expensas se encuentran en " + property.getExpenses() + " pesos.";
                    } else {
                        return "El precio de la propiedad es " + property.getPrice() + " " + property.getCurrency() + ".";
                    }
                } else {
                    return "Para conocer el precio de esta propiedad, por favor comuníquese con uno de nuestros asesores.";
                }

            case VER_AREA:
                if (property.getCoveredArea() != null && property.getCoveredArea() > 0) {
                    return "La superficie total es de " + property.getArea() + " m². La superficie cubierta es de " + property.getCoveredArea() + " m².";
                } else {
                    return "La superficie total es de " + property.getArea() + " m².";
                }

            case VER_HABITACIONES:
                String rooms = formattedNumber(property.getRooms());
                String bedrooms = formattedNumber(property.getBedrooms());
                String bathrooms = formattedNumber(property.getBathrooms());

                if (property.getBedrooms() > 1 && property.getBathrooms() > 1) {
                    return "La propiedad posee " + rooms + " ambientes, incluyendo " + bedrooms + " dormitorios y " + bathrooms + " baños.";
                } else if (property.getBedrooms() > 1 && property.getBathrooms() == 1) {
                    return "La propiedad posee " + rooms + " ambientes, incluyendo " + bedrooms + " dormitorios y un baño.";
                } else if (property.getBedrooms() == 1 && property.getBathrooms() == 1) {
                    return "La propiedad posee " + rooms + " ambientes, incluyendo un dormitorio y un baño.";
                } else if (property.getBedrooms() == 1 && property.getBathrooms() > 1) {
                    return "La propiedad posee " + rooms + " ambientes, incluyendo un dormitorio y " + bathrooms + " baños.";
                } else {
                    return "No hay información registrada sobre habitaciones en esta propiedad.";
                }

            case VER_OPERACION:
                return "La propiedad se encuentra disponible para su " + property.getOperation().toString().toLowerCase();

            case VER_UBICACION:
                return "La propiedad se encuentra en " + property.getNeighborhood().getCity() +
                        ", en el barrio " + property.getNeighborhood().getName() +
                        ", de tipo " + property.getNeighborhood().getType().toString().toLowerCase() + ".";

            case VER_FINANCIACION:
                if (property.getFinancing()) {
                    return "Esta propiedad ofrece posibilidad de financiación.";
                } else {
                    return "Esta propiedad no ofrece financiación.";
                }

            case VER_CREDITO:
                if (property.getCredit()) {
                    return "Esta propiedad es apta para crédito hipotecario.";
                } else {
                    return "Esta propiedad no es apta para crédito hipotecario.";
                }

            case VER_CARACTERISTICAS:
                if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
                    String amenitiesList = property.getAmenities()
                            .stream()
                            .map(Amenity::getName)
                            .collect(Collectors.joining(", "));
                    return "Esta propiedad cuenta con las siguientes características: " + amenitiesList + ".";
                } else {
                    return "Esta propiedad no tiene características adicionales registradas.";
                }


            case DERIVAR:
                String phone = deriveToPartner(chatSession);
                return "Tu consulta ha sido derivada a un asesor. Pronto te atenderán desde este celular " + phone + ".";

            case CERRAR:
                closeRequest(chatSession);
                return "La conversación ha finalizado. Gracias por contactarnos.";

            default:
                return "No tengo información para esa consulta.";
        }
    }

    private String deriveToPartner(ChatSession chatSession) {
        List<AgentChatDTO> agentChatDTOS = agentChatRepository.getAgents();
        if (agentChatDTOS.isEmpty()) {
            throw new RuntimeException("No hay agentes habilitados.");
        }

        String lastAssigned = agentAssigmentRepository.getLast();

        List<AgentChatDTO> free = agentChatDTOS.stream()
                .filter(a -> !a.getUserId().equals(lastAssigned))
                .toList();

        if (free.isEmpty()) {
            free = agentChatDTOS;
        }

        Random random = new Random();
        AgentChatDTO next = free.get(random.nextInt(free.size()));

        ChatDerivation chatDerivation = new ChatDerivation();
        chatDerivation.setChatSession(chatSession);
        chatDerivation.setAgentId(next.getUserId());
        chatDerivationService.create(chatDerivation);

        chatSession.setDerived(Boolean.TRUE);
        chatSession.setDateClose(LocalDateTime.now());
        chatSessionRepository.save(chatSession);

        agentAssignService.create(next.getUserId());

        emailService.sendChatSummaryEmail(chatSession, Boolean.TRUE, next.getName());

        return next.getPhone();
    }

    private void closeRequest(ChatSession chatSession) {
        chatSession.setDerived(Boolean.FALSE);
        chatSession.setDateClose(LocalDateTime.now());
        chatSessionRepository.save(chatSession);
        emailService.sendChatSummaryEmail(chatSession, false, null);
    }

    private String formattedNumber(double number) {
        if (number % 1 == 0) {
            return String.valueOf((int) number);
        } else {
            return String.valueOf(number).replace('.', ',');
        }
    }
}