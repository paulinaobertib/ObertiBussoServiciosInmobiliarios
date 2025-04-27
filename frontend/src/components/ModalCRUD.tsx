import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import OwnerForm from './OwnerForm';
import { useCRUD } from '../context/CRUDContext'; // ⚡ Importamos el Context

const formsMap: any = {
  propietario: OwnerForm,
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
        {FormComponent ? (
          <FormComponent item={item} action={action} onClose={onClose} />
        ) : (
          <div>No hay formulario para esta categoría</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ModalCRUD;