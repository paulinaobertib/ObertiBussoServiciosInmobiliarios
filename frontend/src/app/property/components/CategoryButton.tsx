import { Button } from '@mui/material';
import { usePropertyCrud } from '../context/PropertyCrudContext';
import { translate } from '../utils/translate';

interface Props {
  category: 'amenity' | 'owner' | 'type' | 'neighborhood';
}

export default function CategoryButton({ category }: Props) {
  const { pickCategory, category: current } = usePropertyCrud();
  const active = current === category;

  return (
    <Button
      variant={active ? 'contained' : 'outlined'}
      onClick={() => pickCategory(active ? null : category)}
      sx={{ textTransform: 'none', minWidth: 110 }}
    >
      {translate(category)}
    </Button>
  );
}
