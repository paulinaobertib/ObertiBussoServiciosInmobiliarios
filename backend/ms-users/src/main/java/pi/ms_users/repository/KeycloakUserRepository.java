package pi.ms_users.repository;

import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.User;

import java.util.*;
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
    public Optional<User> findById(String id) {
        UserRepresentation userRepresentation = keycloak.realm(realm).users().get(id).toRepresentation();
        return Optional.of(toUser(userRepresentation));
    }

    @Override
    public List<User> findAll() {
        return keycloak.realm(realm).users()
                .list()
                .stream()
                .map(this::toUser)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUserById(String id) {
        keycloak.realm(realm).users().delete(id);
    }

    @Override
    public User updateUser(User user) {
        UsersResource usersResource = keycloak.realm(realm).users();
        UserRepresentation userRepresentation = usersResource.get(user.getId()).toRepresentation();
        userRepresentation.setFirstName(user.getFirstName());
        userRepresentation.setLastName(user.getLastName());
        userRepresentation.setEmail(user.getMail());
        userRepresentation.setUsername(user.getUsername());

        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("phone", List.of(user.getPhone()));
        userRepresentation.setAttributes(attributes);

        usersResource.get(user.getId()).update(userRepresentation);
        return user;
    }

    @Override
    public List<String> getUserRoles(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();
        List<RoleRepresentation> userRoles = usersResource.get(userId).roles().realmLevel().listAll();
        return userRoles.stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> addRoleToUser(String id, String role) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(id);
        RoleMappingResource roleMappingResource = userResource.roles();
        RoleRepresentation roleRepresentation = realmResource.roles().get(role).toRepresentation();
        roleMappingResource.realmLevel().add(Collections.singletonList(roleRepresentation));
        List<RoleRepresentation> roleRepresentations = userResource.roles().realmLevel().listAll();
        return roleRepresentations.stream()
                .map(RoleRepresentation::getName)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRoleToUser(String id, String role) {
        RealmResource realmResource = keycloak.realm(realm);
        UserResource userResource = realmResource.users().get(id);
        RoleMappingResource roleMappingResource = userResource.roles();
        RoleRepresentation roleRepresentation = realmResource.roles().get(role).toRepresentation();
        roleMappingResource.realmLevel().remove(Collections.singletonList(roleRepresentation));
    }
}
