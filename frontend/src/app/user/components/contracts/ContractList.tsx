// src/app/shared/components/ContractsList.tsx
import React from "react";
import type { Contract } from "../../../user/types/contract";
import { ContractItem } from "./ContractItem";

interface ContractsListProps {
  contracts: Contract[];
  onEdit: (c: Contract) => void;
  onDelete: (c: Contract) => void;

  /** Selección de filas */
  isSelected?: (id: number) => boolean;
  toggleSelect?: (id: number) => void;
}

export const ContractsList: React.FC<ContractsListProps> = ({
  contracts,
  onEdit,
  onDelete,
  isSelected,
  toggleSelect,
}) => (
  <>
    {contracts.map((c) => (
      <ContractItem
        key={c.id}
        contract={c}
        onEdit={onEdit}
        onDelete={onDelete}
        isSelected={isSelected}
        toggleSelect={toggleSelect}
      />
    ))}
  </>
);
