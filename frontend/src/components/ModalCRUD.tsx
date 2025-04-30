import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import OwnerForm from './OwnerForm';
import AmenityForm from './AmenityForm';
import TypeForm from './TypeForm';
import NeighborhoodForm from './NeighborhoodForm';
import { useCRUD } from '../context/CRUDContext';
import { translateCategory } from '../utils/translateCategory';

const formsMap: any = {
  owner: OwnerForm,
  amenity: AmenityForm,
  type: TypeForm,
  neighborhood: NeighborhoodForm,
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
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: { borderRadius: 3, p: 2 },
      }}
    >
      {/* Encabezado con título + botón de cerrar */}
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          color: '#EF6C00',
          mb: 1,
        }}
      >
        {action} {selectedCategory ? translateCategory(selectedCategory) : ''}

      </DialogTitle>

      {/* Contenido del Form */}
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
