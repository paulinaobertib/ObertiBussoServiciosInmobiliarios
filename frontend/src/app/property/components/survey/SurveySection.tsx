import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { getAllSurveys } from '../../services/survey.service'; // Ajusta el path si es necesario
import { SurveysList } from './SurveyList';

interface Survey {
    score: number;
    comment: string;
}

export const SurveysSection = () => {
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getAllSurveys()
            .then((data) => setSurveys(data))
            .catch(() => setError('No se pudieron cargar las encuestas'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="200px"
            >
                <CircularProgress size={40} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error" align="center">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Encuestas</Typography>
            <SurveysList surveys={surveys} />
        </Box>
    );
};
