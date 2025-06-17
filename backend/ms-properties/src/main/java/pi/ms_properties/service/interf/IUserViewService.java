package pi.ms_properties.service.interf;

import pi.ms_properties.domain.UserView;

import java.util.List;

public interface IUserViewService {
    void create(UserView userView);
    List<UserView> getAll();
    List<UserView> getByUserId(String userId);
}
