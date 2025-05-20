import { Button } from '@mui/material';
import { usePropertyCrud } from '../context/PropertiesContext';
import { translate } from '../utils/translate';

type BtnCat = 'amenity' | 'owner' | 'type' | 'neighborhood' | 'property';

export default function CategoryButton({ category }: { category: BtnCat }) {
  const { pickItem, currentCategory } = usePropertyCrud();

  const active = currentCategory === category;

  return (
    <Button
      variant={active ? 'contained' : 'outlined'}
      onClick={() => pickItem('category', active ? null : category)}
      sx={{ textTransform: 'none', minWidth: 110 }}
    >
      {translate(category)}
    </Button>
  );
}