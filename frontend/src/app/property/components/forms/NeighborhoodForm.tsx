import { TextField, Grid, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { Neighborhood, NeighborhoodCreate, NeighborhoodType } from '../../types/neighborhood';
import { postNeighborhood, putNeighborhood, deleteNeighborhood } from '../../services/neighborhood.service';
import { usePropertiesContext } from '../../context/PropertiesContext';
import { LoadingButton } from '@mui/lab';
import { useCategories } from '../../hooks/useCategories';

interface Props {
    action: 'add' | 'edit' | 'delete';
    item?: Neighborhood;
    onDone: () => void;
}

export const NeighborhoodForm = ({ action, item, onDone }: Props) => {
    const { refreshNeighborhoods } = usePropertiesContext();
    const { form, setForm, invalid, run, loading } = useCategories(
        {
            id: item?.id ?? 0,
            name: item?.name ?? '',
            city: item?.city ?? '',
            type: item?.type ?? '',
        },
        action,
        async payload => {
            if (action === 'add')
                return postNeighborhood(payload as NeighborhoodCreate);
            if (action === 'edit')
                return putNeighborhood(payload as Neighborhood);
            if (action === 'delete' && item) return deleteNeighborhood(item);
        },
        refreshNeighborhoods,
        onDone
    );

    return (
        <>
            {loading && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    width="100%"
                    height="100%"
                    zIndex={theme => theme.zIndex.modal + 1000}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                </Box>
            )}

            <Grid container spacing={2} mb={2} >
                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={form.name}
                        disabled={action === 'delete'}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                    />
                </Grid>

                <Grid size={6}>
                    <TextField
                        fullWidth
                        label="Ciudad"
                        value={form.city}
                        disabled={action === 'delete'}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                    />
                </Grid>
                <Grid size={12}>
                    <FormControl fullWidth>
                        <InputLabel id="neighborhood-type-label">Tipo</InputLabel>
                        <Select
                            labelId="neighborhood-type-label"  // <-- agregar este
                            id="neighborhood-type"             // <-- agregar este
                            disabled={action === 'delete'}
                            value={form.type}
                            label="Tipo"
                            onChange={e => setForm({ ...form, type: e.target.value as NeighborhoodType, })
                            }
                        >
                            <MenuItem value={NeighborhoodType.CERRADO}>Cerrado</MenuItem>
                            <MenuItem value={NeighborhoodType.SEMICERRADO}>Semi cerrado</MenuItem>
                            <MenuItem value={NeighborhoodType.ABIERTO}>Abierto</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>


            <Box textAlign="right">
                <LoadingButton
                    onClick={() => run()}
                    loading={loading}
                    disabled={invalid || loading}
                    variant="contained"
                    color={action === 'delete' ? 'error' : 'primary'}
                >
                    {action === 'delete' ? 'Eliminar' : 'Confirmar'}
                </LoadingButton>
            </Box>
        </>
    );
}

