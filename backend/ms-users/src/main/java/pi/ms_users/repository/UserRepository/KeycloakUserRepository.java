package pi.ms_users.repository.UserRepository;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.RoleMappingResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.ClientRepresentation;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import pi.ms_users.domain.User;

import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class KeycloakUserRepository implements IUserRepository {

    private final Keycloak keycloak;

    @Value("${pi.keycloak.realm}")
    private String realm;

    @Value("${pi.keycloak.clientId}")
    private String clientId;

    private User toUser(UserRepresentation userRepresentation) {
        Map<String, List<String>> attributes = userRepresentation.getAttributes();
        String phone = null;
        if (attributes != null && attributes.get("phone") != null && !attributes.get("phone").isEmpty()) {
            phone = attributes.get("phone").getFirst();
        }
        return new User(userRepresentation.getId(), userRepresentation.getUsername(), userRepresentation.getEmail(), userRepresentation.getFirstName(), userRepresentation.getLastName(), phone);
    }

    private String generateUniqueUsername(String baseUsername) {
        String username = baseUsername;
        int counter = 1;

        while (!keycloak.realm(realm)
                .users()
                .search(username, true)
                .isEmpty()) {
            username = baseUsername + counter;
            counter++;
        }

        return username;
    }

    @Override
    public Response createUser(String name, String lastName, String email, String phone) {
        UserRepresentation user = new UserRepresentation();
        String baseUsername = (name + lastName).toLowerCase().replaceAll("\\s+", "");
        String username = generateUniqueUsername(baseUsername);
        user.setUsername(username);
        user.setEmail(email);
        user.setFirstName(name);
        user.setLastName(lastName);
        user.setEnabled(true);

        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("phone", List.of(phone));
        user.setAttributes(attributes);

        user.setRequiredActions(List.of("UPDATE_PASSWORD"));

        Response response = null;

        try {
            response = keycloak.realm(realm).users().create(user);
            int status = response.getStatus();

            if (status == 201) {
                String userId = response.getLocation().getPath().replaceAll(".*/([^/]+)$", "$1");

                CredentialRepresentation passwordCred = new CredentialRepresentation();
                passwordCred.setTemporary(true);
                passwordCred.setType(CredentialRepresentation.PASSWORD);
                String generatedPassword = PasswordGenerator.generateRandomPassword();
                passwordCred.setValue(generatedPassword);

                keycloak.realm(realm)
                        .users()
                        .get(userId)
                        .resetPassword(passwordCred);

                System.out.println("Usuario creado con éxito: " + username);

                List<ClientRepresentation> clients = keycloak.realm(realm).clients().findByClientId(clientId);
                if (!clients.isEmpty()) {
                    String clientUuid = clients.getFirst().getId();
                    if (clients.isEmpty()) {
                        return Response.status(Response.Status.NOT_FOUND).build();
                    }

                    RoleRepresentation userRole = keycloak.realm(realm)
                            .clients()
                            .get(clientUuid)
                            .roles()
                            .get("user")
                            .toRepresentation();

                    RoleRepresentation tenantRole = keycloak.realm(realm)
                            .clients()
                            .get(clientUuid)
                            .roles()
                            .get("tenant")
                            .toRepresentation();

                    keycloak.realm(realm)
                            .users()
                            .get(userId)
                            .roles()
                            .clientLevel(clientUuid)
                            .add(List.of(userRole, tenantRole));

                    return Response.status(Response.Status.CREATED).build();
                } else {
                    return Response.status(Response.Status.NOT_FOUND).build();
                }
            } else {
                return Response.status(status).build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error al crear usuario: " + e.getMessage())
                    .build();
        }
    }

    @Override
    public Optional<User> findById(String id) {
        UserRepresentation userRepresentation = keycloak.realm(realm).users().get(id).toRepresentation();
        return Optional.of(toUser(userRepresentation));
    }

    @Override
    public List<User> findByRoleTenant() {
        ClientRepresentation client = keycloak.realm(realm)
                .clients()
                .findByClientId(clientId)
                .getFirst();

        String clientUuid = client.getId();

        List<UserRepresentation> usersWithRole = keycloak.realm(realm)
                .clients()
                .get(clientUuid)
                .roles()
                .get("tenant")
                .getUserMembers();

        return usersWithRole.stream()
                .map(this::toUser)
                .collect(Collectors.toList());
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

        userRepresentation.setEmail(user.getMail());
        userRepresentation.setFirstName(user.getFirstName());
        userRepresentation.setLastName(user.getLastName());

        Map<String, List<String>> attributes = userRepresentation.getAttributes();
        if (attributes == null) {
            attributes = new HashMap<>();
        }
        attributes.put("phone", Collections.singletonList(user.getPhone()));
        userRepresentation.setAttributes(attributes);

        usersResource.get(user.getId()).update(userRepresentation);

        user.setMail(userRepresentation.getEmail());
        return user;
    }

    @Override
    public List<String> getUserRoles(String userId) {
        RealmResource realmResource = keycloak.realm(realm);
        UsersResource usersResource = realmResource.users();

        List<RoleRepresentation> realmRoles = usersResource.get(userId).roles().realmLevel().listAll();

       ClientRepresentation client = realmResource.clients()
                .findByClientId(clientId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + clientId));

        List<RoleRepresentation> clientRoles = usersResource
                .get(userId)
                .roles()
                .clientLevel(client.getId())
                .listAll();

        List<String> allRoles = new ArrayList<>();
        allRoles.addAll(realmRoles.stream().map(RoleRepresentation::getName).collect(Collectors.toList()));
        allRoles.addAll(clientRoles.stream().map(RoleRepresentation::getName).collect(Collectors.toList()));

        return allRoles;
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

    @Override
    public Boolean exist(String id) {
        try {
            UserRepresentation userRepresentation = keycloak.realm(realm).users().get(id).toRepresentation();
            return true;
        } catch (NotFoundException e) {
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Error al verificar la existencia del usuario en Keycloak: " + e.getMessage(), e);
        }
    }
}
