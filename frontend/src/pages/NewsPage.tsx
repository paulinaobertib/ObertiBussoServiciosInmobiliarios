import IconButton from '@mui/material/IconButton';
import { BasePage } from './BasePage';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';
import NoticesSection from '../app/user/components/notices/NoticesSection';

export default function NewsPage() {
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
            <BasePage>
                <NoticesSection />
            </BasePage>
        </>
    );
}