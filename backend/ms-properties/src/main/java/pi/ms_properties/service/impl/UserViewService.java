package pi.ms_properties.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_properties.domain.UserView;
import pi.ms_properties.repository.IUserViewRepository;
import pi.ms_properties.service.interf.IUserViewService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserViewService implements IUserViewService {

    private final IUserViewRepository userViewRepository;

    @Override
    public void create(UserView userView) {
        userViewRepository.save(userView);
    }

    @Override
    public List<UserView> getAll() {
        return userViewRepository.findAll();
    }

    @Override
    public List<UserView> getByUserId(String userId) {
        return userViewRepository.findByUserId(userId);
    }
}
