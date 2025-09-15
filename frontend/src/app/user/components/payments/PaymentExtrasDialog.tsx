import { PaymentDialog } from "./PaymentDialogBase";
import type { Contract } from "../../types/contract";
import { PaymentConcept } from "../../types/payment";

interface Props {
  open: boolean;
  contract: Contract | null;
  contractUtilityId?: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PaymentExtrasDialog({ open, contract, contractUtilityId, onClose, onSaved }: Props) {
  return (
    <PaymentDialog
      open={open}
      contract={contract}
      onClose={onClose}
      onSaved={onSaved}
      fixedConcept={PaymentConcept.EXTRA}
      presetUtilityId={contractUtilityId ?? undefined}
    />
  );
}
