import { Box } from "@mui/material";
import { BasePage } from "./BasePage";
import { ProfileSection } from "../app/user/components/users/profile/ProfileSection";
import { FavoritesPanel } from "../app/user/components/favorites/FavoritesPanel";
import { InquiriesPanel } from "../app/property/components/inquiries/InquiriesPanel";
import { PanelManager } from "../app/shared/components/PanelManager";
import { AppointmentUserSection } from "../app/user/components/appointments/user/AppointmentUserSection";

export default function UserProfilePage() {
    const panels = [
        { key: "favorites", label: "MIS FAVORITOS", content: <FavoritesPanel /> },
        { key: "inquiries", label: "MIS CONSULTAS", content: <InquiriesPanel /> },
        { key: "appointment", label: "MIS TURNOS", content: <AppointmentUserSection /> },
    ];

    return (
        <BasePage>
            <ProfileSection />

            <Box
                sx={{
                    mt: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <PanelManager panels={panels} direction="row" />
            </Box>
        </BasePage>
    );
}
