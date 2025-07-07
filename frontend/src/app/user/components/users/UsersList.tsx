import type { User, Role } from "../../types/user";
import { UserItem } from "./UserItem";

interface UsersListProps {
  users: (User & { roles: Role[] })[];
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  onRoles: (u: User) => void;
}

export const UsersList = ({
  users,
  onEdit,
  onDelete,
  onRoles,
}: UsersListProps) => {
  return (
    <>
      {users.map((u) => (
        <UserItem
          key={u.id}
          user={u}
          onEdit={onEdit}
          onDelete={onDelete}
          onRoles={onRoles}
        />
      ))}
    </>
  );
};
