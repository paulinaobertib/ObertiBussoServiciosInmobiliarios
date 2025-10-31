import { MouseEvent } from 'react';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavoritesContext } from '../../context/FavoritesContext';

interface Props {
    propertyId: number;
}

export const FavoriteButton = ({ propertyId }: Props) => {
    const { isFavorite, toggleFavorite, loading, isToggling } = useFavoritesContext();

    const handleClick = async (e: MouseEvent) => {
        e.stopPropagation();
        await toggleFavorite(propertyId);
    };

    const filled = isFavorite(propertyId);

    return (
        <IconButton
            data-testid={`favorite-button-${propertyId}`}
            onClick={handleClick}
            disabled={loading || isToggling(propertyId)}
            sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                zIndex: 10,
            }}
        >
            {filled ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="error" />}
        </IconButton>
    );
}
