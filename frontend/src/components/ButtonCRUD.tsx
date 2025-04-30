import { Button, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useCRUD } from '../context/CRUDContext';

interface ButtonGridProps {
    label: string;
    category: string;
}

const ButtonGrid = ({ label, category }: ButtonGridProps) => {
    const { setSelectedCategoryName } = useCRUD();

    const handleClick = () => {
        setSelectedCategoryName(category);
    };

    return (
        <Grid>
            <Button
                variant="outlined"
                onClick={handleClick}
                sx={{
                    maxWidth: '7rem',
                    aspectRatio: '2',
                    borderRadius: 4,
                    borderWidth: 2,
                    padding: 1,
                }}
            >
                <Typography variant="body2"
                    sx={{
                        fontSize: { xs: '0.7rem', md: '0.7rem' },  // Tamaño de letra adaptativo
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        lineHeight: 1.2,
                        fontWeight: 'bold'
                    }}
                >
                    {label}
                </Typography>
            </Button>
        </Grid>
    );
};

export default ButtonGrid;
