import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import OwnerForm from './OwnerForm';
import AmenityForm from './AmenityForm';
import { useCRUD } from '../context/CRUDContext'; // ⚡ Importamos el Context

const formsMap: any = {
  owner: OwnerForm,
  amenity: AmenityForm
};

interface ModalCRUDProps {
  open: boolean;
  onClose: () => void;
  action: string | null;
  item: any;
}

const ModalCRUD = ({ open, onClose, action, item }: ModalCRUDProps) => {
  const { selectedCategory } = useCRUD();

  const FormComponent = formsMap[selectedCategory];

  return (
    <Dialog open={open} fullWidth maxWidth="sm" onClose={() => null}>
      <DialogTitle>{action} {selectedCategory}</DialogTitle>
      <DialogContent dividers>
        {open && FormComponent ? (
          <FormComponent item={item} action={action} onClose={onClose} />
        ) : (
          null
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalCRUD;