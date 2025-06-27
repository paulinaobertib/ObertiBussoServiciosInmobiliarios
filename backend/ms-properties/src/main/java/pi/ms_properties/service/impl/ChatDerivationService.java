package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.ChatDerivation;
import pi.ms_properties.repository.IChatDerivationRepository;
import pi.ms_properties.service.interf.IAgentAssignService;
import pi.ms_properties.service.interf.IChatDerivationService;

@Service
@RequiredArgsConstructor
public class ChatDerivationService implements IChatDerivationService {

    private final IChatDerivationRepository chatDerivationRepository;

    private final IAgentAssignService agentAssignService;

    @Override
    public void create(ChatDerivation chatDerivation) {
        agentAssignService.create(chatDerivation.getAgentId());
        chatDerivationRepository.save(chatDerivation);
    }
}
