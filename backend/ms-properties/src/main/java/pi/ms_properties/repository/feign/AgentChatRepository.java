package pi.ms_properties.repository.feign;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pi.ms_properties.dto.feign.AgentChatDTO;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class AgentChatRepository {

    private final FeignUserRepository userRepository;

    public List<AgentChatDTO> getAgents() {
        return userRepository.getUsersEnabled();
    }
}
