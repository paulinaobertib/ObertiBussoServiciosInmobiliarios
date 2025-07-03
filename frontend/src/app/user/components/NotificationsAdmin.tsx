import { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { getAllNotifications } from '../services/notification.service';
import { NotificationType } from '../types/notification';

interface Notification {
    id: number;
    userId: string;
    type: NotificationType;
    date: string;
}

interface SummaryRow {
    key: string;
    date: string;
    type: NotificationType;
    count: number;
}

export default function AdminNotificationsSummary() {
    const [summary, setSummary] = useState<SummaryRow[]>([]);

    useEffect(() => {
        getAllNotifications().then((resp) => {
            const data: Notification[] = resp.data;
            // 1. Reducir a un map { key: count }
            const map = data.reduce<Record<string, number>>((acc, n) => {
                // convierte fecha a Día-Mes-Año
                const day = new Date(n.date).toLocaleDateString();
                const key = `${day}|${n.type}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});
            // 2. Pasar a array de filas
            const rows: SummaryRow[] = Object.entries(map).map(([key, count]) => {
                const [date, type] = key.split('|') as [string, NotificationType];
                return { key, date, type, count };
            });
            setSummary(rows);
        });
    }, []);

    return (
        <Box p={2}>
            <Typography variant="h6" gutterBottom>
                Resumen de envíos de notificaciones
            </Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell align="right">Cantidad de envíos</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {summary.map((row) => (
                        <TableRow key={row.key}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>
                                {row.type === 'PROPIEDADNUEVA'
                                    ? 'Nueva propiedad'
                                    : 'Interés en propiedad'}
                            </TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
}
