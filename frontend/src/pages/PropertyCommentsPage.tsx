import { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { BasePage } from './BasePage';
import { ModalItem, Info } from '../app/property/components/ModalItem';
import { CommentForm } from '../app/property/components/forms/CommentForm';
import { usePropertiesContext } from '../app/property/context/PropertiesContext';
import { CommentSection } from '../app/property/components/comments/CommentSection';

export default function PropertyMaintenancePage() {
    const { id } = useParams<{ id: string }>();
    const propertyId = Number(id);
    const navigate = useNavigate();
    const [modal, setModal] = useState<Info | null>(null);

    const {
        commentsList,
        loading,
        pickedItem,
        pickItem,
        refreshComments,
    } = usePropertiesContext();

    useEffect(() => {
        if (!propertyId) {
            navigate('/');
            return;
        }
        if (
            pickedItem?.type !== 'property' ||
            pickedItem.value?.id !== propertyId
        ) {
            pickItem('property', { id: propertyId } as any);
        }
    }, [propertyId, pickedItem, pickItem, navigate]);

    const openAdd = () =>
        setModal({
            title: 'Agregar Comentario',
            Component: CommentForm,
            componentProps: {
                action: 'add',
                onDone: () => {
                    setModal(null);
                    refreshComments();
                },
            },
        });

    const openEdit = (c: any) =>
        setModal({
            title: 'Editar Comentario',
            Component: CommentForm,
            componentProps: {
                action: 'edit',
                item: c,
                onDone: () => {
                    setModal(null);
                    refreshComments();
                },
            },
        });

    const openDelete = (c: any) =>
        setModal({
            title: 'Eliminar Comentario',
            Component: CommentForm,
            componentProps: {
                action: 'delete',
                item: c,
                onDone: () => {
                    setModal(null);
                    refreshComments();
                },
            },
        });

    return (
        <BasePage>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2, mb: -2 }}>
                <Button variant="contained" onClick={() => navigate(-1)}>
                    VOLVER
                </Button>
            </Box>

            <CommentSection
                loading={loading}
                items={commentsList}
                onAdd={openAdd}
                onEditItem={openEdit}
                onDeleteItem={openDelete}
            />

            <ModalItem
                info={modal}
                close={async () => {
                    setModal(null);
                    await refreshComments();
                }}
            />
        </BasePage>
    );
};
