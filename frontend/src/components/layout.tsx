import { Box } from '@mui/material';

const Layout = () => {
    return (
        <Box sx={{ display: 'flex', height: { xs: 'auto', md: '95vh' }, flexDirection: { xs: 'column', md: 'row' } }}>

            {/* Lado Izquierdo */}
            <Box sx={{ width: { xs: '100%', md: '35%' }, borderRight: '2px solid black', display: 'flex', flexDirection: 'column', padding: 2 }} >
                <Box sx={{ height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    Box Superior
                </Box>

                <Box sx={{ height: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    Box Inferior
                </Box>
            </Box>

            {/* Lado Derecho */}
            <Box
                sx={{
                    width: { md: '65%' },
                    p: 2,
                    border: '1px solid black',
                }}
            >
                {/* Contenido del lado derecho */}
                Box Derecho
            </Box>

        </Box>
    );
};

export default Layout;
