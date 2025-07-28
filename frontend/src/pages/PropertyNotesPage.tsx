import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, CircularProgress, Card } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';

import BasePage from './BasePage';
import { CommentSection } from '../app/property/components/comments/CommentSection';
import { MaintenanceSection } from '../app/property/components/maintenances/MaintenanceSection';
import { usePropertyNotes } from '../app/property/hooks/usePropertyNotes';

export const PropertyNotesPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const propertyId = Number(id);

    const { property, comments, maintenances, loading, refreshComments, refreshMaintenances } = usePropertyNotes(propertyId);

    const [activeTab, setActiveTab] =
        useState<'comments' | 'maintenances'>('comments');

    if (loading) {
        return (
            <BasePage>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                    <CircularProgress />
                </Box>
            </BasePage>
        );
    }

    if (!property) {
        return (
            <BasePage>
                <Typography variant="h6" color="text.secondary" sx={{ p: 3 }}>
                    Propiedad no encontrada.
                </Typography>
            </BasePage>
        );
    }

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage>
                {/* — Header — */}
                <Card variant='elevation'
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        p: 2,
                        my: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {property.title} - {property.street} {property.number}
                        </Typography>
                    </Box>
                </Card>

                {/* — Tabs — */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Button
                        variant={activeTab === 'comments' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('comments')}>
                        Comentarios ({comments.length})
                    </Button>
                    <Button
                        variant={activeTab === 'maintenances' ? 'contained' : 'outlined'}
                        onClick={() => setActiveTab('maintenances')}>
                        Mantenimientos ({maintenances.length})
                    </Button>
                </Box>

                {/* — Sections — */}
                {activeTab === 'comments' ? (
                    <CommentSection
                        propertyId={propertyId}            // <― PASAMOS propertyId
                        loading={false}
                        items={comments}
                        refresh={refreshComments}
                    />
                ) : (
                    <MaintenanceSection
                        propertyId={propertyId}            // <― PASAMOS propertyId
                        loading={false}
                        items={maintenances}
                        refresh={refreshMaintenances}
                    />
                )}
            </BasePage>
        </>
    );
};
