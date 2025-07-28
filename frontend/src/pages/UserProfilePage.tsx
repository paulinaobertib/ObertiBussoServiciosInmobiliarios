import { Box, IconButton } from "@mui/material";
import { BasePage } from "./BasePage";
import { ProfileSection } from "../app/user/components/users/profile/ProfileSection";
import { FavoritesPanel } from "../app/user/components/favorites/FavoritesPanel";
import { InquiriesSection } from "../app/property/components/inquiries/InquiriesSection";
import { PanelManager } from "../app/shared/components/PanelManager";
import { AppointmentUserSection } from "../app/user/components/appointments/user/AppointmentUserSection";
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from "react-router-dom";

export default function UserProfilePage() {
    const navigate = useNavigate();
    const panels = [
        { key: "favorites", label: "MIS FAVORITOS", content: <FavoritesPanel /> },
        { key: "inquiries", label: "MIS CONSULTAS", content: <InquiriesSection /> },
        { key: "appointment", label: "MIS TURNOS", content: <AppointmentUserSection /> },
    ];

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
        </>
    );
}
