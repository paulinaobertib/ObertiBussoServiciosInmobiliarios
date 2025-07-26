// src/app/property/components/maintenances/MaintenanceList.tsx
import { Stack } from '@mui/material';
import { MaintenanceItem } from './MaintenanceItem';
import { Maintenance } from '../../types/maintenance';

export interface MaintenanceListProps {
    items: Maintenance[];
    onEditItem: (item: Maintenance) => void;
    onDeleteItem: (item: Maintenance) => void;
}

export const MaintenanceList = ({
    items,
    onEditItem,
    onDeleteItem,
}: MaintenanceListProps) => {
    const sorted = items
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Stack direction="column" gap={2} >
            {sorted.map(m => (
                <MaintenanceItem
                    key={m.id}
                    maintenance={m}
                    onEdit={() => onEditItem(m)}
                    onDelete={() => onDeleteItem(m)}
                />
            ))}
        </Stack>
    );
};
