import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { EmptyState } from '../../../shared/components/EmptyState';
import { getAllSurveys } from '../../services/survey.service';
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
            <Box>
                <EmptyState title="No pudimos cargar las valoraciones." tone="error" />
            </Box>
        );
    }

    return (
        <SurveysList surveys={surveys} />
    );
};
