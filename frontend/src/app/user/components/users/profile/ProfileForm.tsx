import { Grid, TextField } from '@mui/material';
import type { User } from '../../../types/user';

interface Props {
    form: User;
    editMode: boolean;
    onChange: (field: keyof User, value: string) => void;
}

export const ProfileForm = ({ form, editMode, onChange }: Props) => (
    <Grid container spacing={2} flexGrow={1}>
        {(['userName', 'firstName', 'lastName', 'email', 'phone'] as (keyof User)[]).map(field => (
            <Grid size={{ xs: 12, sm: field === 'userName' ? 12 : 6 }} key={field}>
                <TextField
                    label={field}
                    value={form[field] || ''}
                    onChange={e => onChange(field, e.target.value)}
                    fullWidth size="small"
                    disabled={!editMode || field === 'userName'}  // aquí la condición
                />
            </Grid>
        ))}
    </Grid>
);