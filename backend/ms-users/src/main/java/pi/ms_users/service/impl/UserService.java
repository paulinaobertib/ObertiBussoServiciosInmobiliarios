package pi.ms_users.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pi.ms_users.domain.User;
import pi.ms_users.repository.IUserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final IUserRepository userRepository;

    public User findById(String id) {
        return userRepository.findById(id);
    }

    public List<User> findByFirstName(String name) {
        return userRepository.findByFirstName(name);
    }

    public User updatePhone(String id, String phone) {
        return userRepository.updatePhone(id, phone);
    }
}
