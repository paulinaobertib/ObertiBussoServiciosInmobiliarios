import { Card, Box, Chip, CardContent, Typography, useTheme, Checkbox, } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import FavoriteButton from '../../user/components/FavoriteButtom';
import { Property } from '../types/property';

export interface PropertyCardProps {
  property: Property;
  selectionMode?: boolean;
  isSelected?: (id: number) => boolean;
  toggleSelection?: (id: number) => void;
  onClick?: () => void;
}

export default function PropertyCard({
  property,
  selectionMode = false,
  isSelected = () => false,
  toggleSelection = () => { },
  onClick = () => { },
}: PropertyCardProps) {
  const theme = useTheme();
  const src =
    typeof property.mainImage === 'string'
      ? property.mainImage
      : URL.createObjectURL(property.mainImage);

  // handler con logging
  const handleSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    e.stopPropagation();
    console.log('🔲 handleSelect called', {
      id: property.id,
      newChecked: checked,
      previouslySelected: isSelected(property.id),
    });
    toggleSelection(property.id);
  };


  return (
    <Card
      onClick={() => {
        if (!selectionMode) {
          onClick();
        }
      }}
      sx={{
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        boxShadow: 2,
        cursor: selectionMode ? 'default' : 'pointer',
        transition: 'transform 0.2s, background-color 0.1s',
        '&:hover': {
          transform: 'scale(1.01)',
          backgroundColor: theme.palette.action.hover,
        },
      }}
    >
      <FavoriteButton propertyId={property.id} />

      <Box
        component="div"
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      />

      <Chip
        label={property.status || 'Sin Estado'}
        size="small"
        sx={{
          position: 'absolute',
          top: 12,
          left: 12,
          zIndex: 5,
          fontWeight: 600,
          fontSize: { xs: '0.75rem' },
          boxShadow: 3,
          bgcolor: 'white',
          pointerEvents: 'none',
        }}
      />

      <CardContent
        sx={{
          position: 'relative',
          textAlign: 'center',
          backgroundColor: theme.palette.quaternary.main,
        }}
      >
        {selectionMode && (
          <Checkbox
            checked={isSelected(property.id)}
            onChange={handleSelect}
            disableRipple
            icon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  border: `2px solid ${theme.palette.primary.main}`,
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                }}
              />
            }
            checkedIcon={
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1,
                  border: `2px solid ${theme.palette.primary.main}`,
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                }}
              >
                <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
              </Box>
            }
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              width: 20,
              height: 20,
              p: 0,
              minWidth: 0,
              minHeight: 0,
              zIndex: 10,
              '&:hover': { backgroundColor: 'transparent' },
            }}
            inputProps={{ 'aria-label': 'Seleccionar propiedad' }}
          />
        )}

        <Typography variant="h6" noWrap sx={{ mb: 0.5 }}>
          {property.title}
        </Typography>
        <Typography color="text.primary">
          {property.showPrice
            ? `${property.currency} $${property.price}`
            : 'Consultar precio'}
        </Typography>
      </CardContent>
    </Card>
  );
}
