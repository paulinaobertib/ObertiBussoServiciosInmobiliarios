import Stack from "@mui/material/Stack";
import { MaintenanceData, MaintenanceItem } from "./MaintenanceItem";

// Props for the list component
export interface MaintenanceListProps {
    items: MaintenanceData[];
    onEditItem: (item: MaintenanceData) => void;
    onDeleteItem: (item: MaintenanceData) => void;
}

// Reusable list component that sorts by most recent
export const MaintenanceList = ({ items, onEditItem, onDeleteItem }: MaintenanceListProps) => {
    const sortedItems = [...items].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return (
        <Stack spacing={2}>
            {sortedItems.map(m => (
                <MaintenanceItem
                    key={`${m.date}-${m.title}`}
                    maintenance={m}
                    onEdit={() => onEditItem(m)}
                    onDelete={() => onDeleteItem(m)}
                />
            ))}
        </Stack>
    );
};
