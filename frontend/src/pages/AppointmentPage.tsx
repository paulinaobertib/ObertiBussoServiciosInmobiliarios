
import ReplyIcon from "@mui/icons-material/Reply";

import BasePage from "./BasePage";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function AppointmentPage() {
    const navigate = useNavigate();

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: "absolute", top: 64, left: 8, zIndex: 3000 }}
            >
                <ReplyIcon />
            </IconButton>

            <BasePage maxWidth={false}>

            </BasePage>
        </>
    );
}
