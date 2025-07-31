import IconButton from '@mui/material/IconButton';
import { BasePage } from './BasePage';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';
import NoticesSection from '../app/user/components/notices/NoticesSection';
import { useNotices } from '../app/user/hooks/useNotices';
import Box from '@mui/material/Box';
import { CircularProgress } from '@mui/material';

export default function NewsPage() {
    const navigate = useNavigate();
    const { loading } = useNotices();

    /* ───────────── loading global ───────────── */
    if (loading) {
        return (
            <BasePage>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    p={3}                 >
                    <CircularProgress size={36} />
                </Box>
            </BasePage >
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
                <NoticesSection />
            </BasePage>
        </>
    );
}