package pi.ms_users.repository;

import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class KeycloakUserRepository implements IUserRepository{

    private final Keycloak keycloak;

    @Value("${pi.keycloak.realm}")
    private String realm;

    private User toUser(UserRepresentation userRepresentation) {
        return new User(userRepresentation.getId(), userRepresentation.getUsername(), userRepresentation.getEmail(), userRepresentation.getFirstName(), userRepresentation.getLastName(), userRepresentation.getAttributes().get("phone").getFirst());
    }

    @Override
    public User findById(String id) {
        UserRepresentation userRepresentation = keycloak.realm(realm).users().get(id).toRepresentation();
        return toUser(userRepresentation);
    }

    @Override
    public List<User> findByFirstName(String name) {
        List<UserRepresentation> userRepresentations = keycloak.realm(realm).users().search(name);
        return userRepresentations.stream().map(this::toUser).collect(Collectors.toList());
    }

    @Override
    public User updatePhone(String id, String phone) {
        UserResource userResource = keycloak.realm(realm).users().get(id);
        UserRepresentation userRepresentation = userResource.toRepresentation();
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("phone", List.of(phone));
        userRepresentation.setAttributes(attributes);
        userResource.update(userRepresentation);
        return toUser(userRepresentation);
    }
}
