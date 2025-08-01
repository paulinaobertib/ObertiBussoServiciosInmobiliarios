package pi.ms_properties.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.ChatSession;
import pi.ms_properties.domain.Property;
import pi.ms_properties.dto.ChatSessionDTO;
import pi.ms_properties.dto.ChatSessionGetDTO;
import pi.ms_properties.dto.feign.UserDTO;
import pi.ms_properties.repository.IChatSessionRepository;
import pi.ms_properties.repository.IPropertyRepository;
import pi.ms_properties.repository.feign.UserRepository;
import pi.ms_properties.service.interf.IChatSessionService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatSessionService implements IChatSessionService {

    private final IChatSessionRepository chatSessionRepository;

    private final UserRepository userRepository;

    private final IPropertyRepository propertyRepository;

    private final ObjectMapper objectMapper;

    private ChatSessionGetDTO mapToDTO(ChatSession chatSession) {
        ChatSessionGetDTO dto = new ChatSessionGetDTO();
        dto.setId(chatSession.getId());
        dto.setUserId(chatSession.getUserId());
        dto.setPhone(chatSession.getPhone());
        dto.setEmail(chatSession.getEmail());
        dto.setFirstName(chatSession.getFirstName());
        dto.setLastName(chatSession.getLastName());
        dto.setPropertyId(chatSession.getProperty().getId());
        dto.setDate(chatSession.getDate());
        dto.setDateClose(chatSession.getDateClose());
        return dto;
    }

    @Override
    public Long createFromUser(String userId, Long propertyId) {
        if (!userRepository.exist(userId)) {
            throw new RuntimeException("No se ha encontrado al usuario con ID: " + userId);
        }

        UserDTO userDTO = userRepository.findById(userId);

        ChatSession chatSession = new ChatSession();
        chatSession.setUserId(userId);
        chatSession.setEmail(userDTO.getEmail());
        chatSession.setFirstName(userDTO.getFirstName());
        chatSession.setLastName(userDTO.getLastName());
        chatSession.setPhone(userDTO.getPhone());
        chatSession.setDate(LocalDateTime.now());
        chatSession.setDerived(Boolean.FALSE);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad con ID: " + propertyId));

        chatSession.setProperty(property);

        ChatSession chatSessionCreated = chatSessionRepository.save(chatSession);

        return chatSessionCreated.getId();
    }

    @Override
    public Long createWithoutUser(ChatSessionDTO dto) {
        if (dto.getFirstName() == null || dto.getEmail() == null || dto.getPhone() == null || dto.getLastName() == null) {
            throw new IllegalArgumentException("Faltan datos obligatorios para crear la sesión sin usuario.");
        }

        ChatSession chatSession = objectMapper.convertValue(dto, ChatSession.class);
        chatSession.setDate(LocalDateTime.now());
        chatSession.setDerived(Boolean.FALSE);

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la propiedad con ID: " + dto.getPropertyId()));

        chatSession.setProperty(property);

        ChatSession chatSessionCreated = chatSessionRepository.save(chatSession);

        return chatSessionCreated.getId();
    }

    @Override
    public ChatSessionGetDTO getById(Long id) {
        ChatSession session = chatSessionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No se ha encontrado la sesion del chat"));
        return mapToDTO(session);
    }

    @Override
    public List<ChatSessionGetDTO> getAll() {
        return chatSessionRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
}
