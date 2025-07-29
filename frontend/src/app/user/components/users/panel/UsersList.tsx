// src/app/shared/components/UsersList.tsx
import React from 'react';
import type { User, Role } from '../../../types/user';
import { UserItem } from './UserItem';

interface UsersListProps {
  users: (User & { roles: Role[] })[];
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  onRoles: (u: User) => void;

  /** Lógica de selección */
  isSelected?: (id: string) => boolean;
  toggleSelect?: (id: string) => void;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  onEdit,
  onDelete,
  onRoles,
  isSelected,
  toggleSelect,
}) => (
  <>
    {users.map((u) => (
      <UserItem
        key={u.id}
        user={u}
        onEdit={onEdit}
        onDelete={onDelete}
        onRoles={onRoles}
        isSelected={isSelected}
        toggleSelect={toggleSelect}
      />
    ))}
  </>
);
