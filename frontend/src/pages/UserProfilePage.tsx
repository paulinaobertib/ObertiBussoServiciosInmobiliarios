import { Box } from "@mui/material";
import { BasePage } from "./BasePage";
import { ProfileSection } from "../app/user/components/users/ProfileSection";
import { FavoritesPanel } from "../app/user/components/FavoritesPanel";
import { InquiriesPanel } from "../app/property/components/inquiries/InquiriesPanel";
import { AppointmentUser } from "../app/user/components/appointments/AppointmentUser";
import { PanelManager } from "../app/shared/components/PanelManager";

export default function UserProfilePage() {
    const panels = [
        { key: "favorites", label: "MIS FAVORITOS", content: <FavoritesPanel /> },
        { key: "inquiries", label: "MIS CONSULTAS", content: <InquiriesPanel /> },
        { key: "appointment", label: "MIS TURNOS", content: <AppointmentUser /> },
    ];

    return (
        <BasePage>
            <ProfileSection />

            <Box sx={{ mt: 2, flexGrow: 1, overflow: "auto" }}>
                <PanelManager panels={panels} direction="row" />
            </Box>
        </BasePage>
    );
}
