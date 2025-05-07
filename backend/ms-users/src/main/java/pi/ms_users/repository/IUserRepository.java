package pi.ms_users.repository;

import pi.ms_users.domain.User;

import java.util.List;

public interface IUserRepository {
    public User findById(String id);

    public List<User> findByFirstName(String name);

    public User updatePhone(String id, String phone);
}
