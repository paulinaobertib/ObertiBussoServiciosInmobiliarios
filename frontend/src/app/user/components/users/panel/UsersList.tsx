// src/app/shared/components/UsersList.tsx
import React from 'react';
import type { User, Role } from '../../../types/user';
import { UserItem } from './UserItem';

interface UsersListProps {
  users: (User & { roles: Role[] })[];
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
  onRoles: (u: User) => void;
  isSelected?: (id: string) => boolean;
  toggleSelect?: (id: string) => void;
  showActions?: boolean;
}

export const UsersList: React.FC<UsersListProps> = ({
  users,
  onEdit,
  onDelete,
  onRoles,
  isSelected,
  toggleSelect,
  showActions = true,
}) => (
  <>
    {users.map((u) => (
      <UserItem
        key={u.id}
        user={u}
        onEdit={showActions ? onEdit : undefined}
        onDelete={showActions ? onDelete : undefined}
        onRoles={showActions ? onRoles : undefined}
        isSelected={isSelected}
        toggleSelect={toggleSelect}
      />
    ))}
  </>
);
