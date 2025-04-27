import { Button, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useCRUD } from '../context/CRUDContext';

interface ButtonGridProps {
    label: string;
    category: string;
}

const ButtonGrid = ({ label, category }: ButtonGridProps) => {
    const { setSelectedCategory } = useCRUD();

    const handleClick = () => {
        setSelectedCategory(category);
    };

    return (
        <Grid>
            <Button
                variant="outlined"
                onClick={handleClick}
                sx={{
                    maxWidth: '7rem',
                    aspectRatio: '1.3',
                    borderRadius: 4,
                    borderWidth: 2,
                    padding: 1,
                }}
            >
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                    {label}
                </Typography>
            </Button>
        </Grid>
    );
};

export default ButtonGrid;
