import { Button } from '@mui/material';
import { usePropertyCrud } from '../context/PropertyCrudContext';

interface Props {
  category: 'amenity' | 'owner' | 'type' | 'neighborhood';
  label: string;
}

export default function CategoryButton({ category, label }: Props) {
  const { pickCategory, category: current } = usePropertyCrud();
  const active = current === category;

  return (
    <Button
      variant={active ? 'contained' : 'outlined'}
      onClick={() => pickCategory(active ? null : category)}
      sx={{ textTransform: 'none', minWidth: 110 }}
    >
      {label}
    </Button>
  );
}
