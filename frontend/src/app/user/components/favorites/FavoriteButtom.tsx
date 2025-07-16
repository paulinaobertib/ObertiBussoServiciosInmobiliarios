// src/features/properties/components/FavoriteButton.tsx
import { MouseEvent } from 'react';
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '../../hooks/useFavorites';

interface Props {
    propertyId: number;
}

export const FavoriteButton = ({ propertyId }: Props) => {
    const { isFavorite, toggleFavorite, loading } = useFavorites();

    const handleClick = async (e: MouseEvent) => {
        e.stopPropagation();
        await toggleFavorite(propertyId);
    };

    const filled = isFavorite(propertyId);

    return (
        <IconButton
            onClick={handleClick}
            disabled={loading}
            sx={{
                position: 'absolute',
                top: 5,
                right: 5,
                zIndex: 10,
            }}
        >
            {filled
                ? <FavoriteIcon color="error" />
                : <FavoriteBorderIcon color="error" />}
        </IconButton>
    );
}
