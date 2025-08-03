import { Box, IconButton } from "@mui/material";
import { BasePage } from "./BasePage";
import { useNavigate } from "react-router-dom";
import ReplyIcon from '@mui/icons-material/Reply';

export default function PoliciesPage() {
    const navigate = useNavigate();

    return (
        <>
            <IconButton
                size="small"
                onClick={() => navigate(-1)}
                sx={{ position: 'absolute', top: 64, left: 8, zIndex: 1300 }}
            >
                <ReplyIcon />
            </IconButton>
            <BasePage maxWidth={false}>
                <Box sx={{ p: 2 }}>
                    Aca lo unico que va a haber son las politicas de privacidad

                </Box>
            </BasePage>
        </>
    );
}
