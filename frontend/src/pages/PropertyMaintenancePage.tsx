import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MaintenanceForm } from "../app/property/components/forms/MaintenanceForm";
import { MaintenanceSection } from "../app/property/components/maintenances/MaintenanceSection";
import { Info, ModalItem } from "../app/property/components/ModalItem";
import { usePropertiesContext } from "../app/property/context/PropertiesContext";
import { BasePage } from "./BasePage";

export default function PropertyMaintenancePage() {
    const { id: idParam } = useParams();
    const navigate = useNavigate();
    const propertyId = Number(idParam ?? 0);
    const [modal, setModal] = useState<Info | null>(null);

    const {
        maintenancesList,
        loading,
        pickedItem,
        pickItem,
        refreshMaintenances,
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

    const openAddModal = () =>
        setModal({
            title: 'Agregar Mantenimiento',
            Component: MaintenanceForm,
            componentProps: {
                action: 'add',
                onDone: () => {
                    setModal(null);
                    refreshMaintenances();
                },
            },
        });

    const openEditModal = (item: any) =>
        setModal({
            title: 'Editar Mantenimiento',
            Component: MaintenanceForm,
            componentProps: {
                action: 'edit',
                item,
                onDone: () => {
                    setModal(null);
                    refreshMaintenances();
                },
            },
        });

    const openDeleteModal = (item: any) =>
        setModal({
            title: 'Eliminar Mantenimiento',
            Component: MaintenanceForm,
            componentProps: {
                action: 'delete',
                item,
                onDone: () => {
                    setModal(null);
                    refreshMaintenances();
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

            <MaintenanceSection
                loading={loading}
                items={maintenancesList}
                onAdd={openAddModal}
                onEditItem={openEditModal}
                onDeleteItem={openDeleteModal}
            />

            <ModalItem
                info={modal}
                close={async () => {
                    setModal(null);
                    await refreshMaintenances();
                }}
            />
        </BasePage>
    );
}
