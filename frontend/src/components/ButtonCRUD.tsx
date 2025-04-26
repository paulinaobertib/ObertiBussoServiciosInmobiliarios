import { Button, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';

interface ButtonGridProps {
    label: string;
    category: string;
    onClick: (category: string) => void;
}

const ButtonGrid = ({ label, category, onClick }: ButtonGridProps) => {
    return (
        <Grid>
            <Button
                variant="outlined"
                onClick={() => onClick(category)}
                sx={{ maxWidth: '100px', aspectRatio: '1', borderRadius: 4, borderWidth: 2, padding: 1, }} >
                <Typography variant="body2"> {label} </Typography>
            </Button>
        </Grid>
    );
};

export default ButtonGrid;