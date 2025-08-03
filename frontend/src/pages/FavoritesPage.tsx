import { IconButton } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import { useNavigate } from 'react-router-dom';

import { BasePage } from './BasePage';
import { FavoritesPanel } from '../app/user/components/favorites/FavoritesPanel';

export default function FavoritesPage() {
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

      <BasePage maxWidth>
        <FavoritesPanel />
      </BasePage>
    </>
  );
}
