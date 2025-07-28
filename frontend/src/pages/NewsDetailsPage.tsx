import IconButton from '@mui/material/IconButton';
import { NoticeDetails } from '../app/user/components/notices/NoticeDetails';
import { BasePage } from './BasePage';
import { useNavigate } from 'react-router-dom';
import ReplyIcon from '@mui/icons-material/Reply';

export default function NewsDetailsPage() {
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
                <NoticeDetails />
            </BasePage>
        </>
    );
}
