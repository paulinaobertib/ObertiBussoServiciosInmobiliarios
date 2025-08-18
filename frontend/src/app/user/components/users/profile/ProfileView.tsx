import { Box, Avatar, Typography, Stack, IconButton, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import type { User } from '../../../types/user';

interface ViewProps {
  user: User;
  editMode: boolean;
  saving: boolean;
  onToggleEdit: () => void;
  onDeleteProfile?: () => void;
}

export function ProfileView({ user, editMode, saving, onToggleEdit, onDeleteProfile }: ViewProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      flexGrow={1}
      pr={{ md: 4, xs: 0 }}
      width="100%"
      p={3}
      sx={{ flex: '1 1 30%' }}

    >
      <Box position="relative">
        <Avatar
          sx={{ width: 120, height: 120, fontSize: '3rem', bgcolor: 'primary.main' }}
        >
          {user.firstName?.[0]?.toUpperCase()}
          {user.lastName?.[0]?.toUpperCase()}
        </Avatar>
        <IconButton
          disableRipple
          onClick={onToggleEdit}
          disabled={saving}
          aria-label={editMode ? "save" : "edit"}
          sx={{
            position: 'absolute',
            bottom: -4,
            right: -4,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          {editMode ? <SaveIcon /> : <EditIcon />}
        </IconButton>
      </Box>
      <Typography
        variant="h6"
        mt={2}
        fontWeight="bold"
        noWrap
        textAlign="center"
        width="100%"
      >
        {user.firstName} {user.lastName}
      </Typography>
      <Stack spacing={0.5} mt={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" noWrap>
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {user.phone}
        </Typography>
      </Stack>


      <Button
        variant="outlined"
        color="error"
        sx={{ mt: 3 }}
        onClick={onDeleteProfile}
      >
        Eliminar mi cuenta
      </Button>
    </Box>
  );
}
