import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from 'react';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

type AlertColor = 'success' | 'error' | 'info' | 'warning';

interface AlertContextProps {
    showAlert: (msg: string, type?: AlertColor, title?: string) => void;
}

const AlertContext = createContext<AlertContextProps | null>(null);

export const useGlobalAlert = () => {
    const ctx = useContext(AlertContext);
    if (!ctx) throw new Error('useGlobalAlert debe usarse dentro de AlertProvider');
    return ctx;
};

export function AlertProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [title, setTitle] = useState<string>('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const showAlert = useCallback((msg: string, type: AlertColor = 'info', titleMsg?: string) => {
        setMessage(msg);
        setTitle(titleMsg ?? '');
        setSeverity(type);
        setOpen(true);
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}

            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity={severity}
                    variant="filled"
                    onClose={() => setOpen(false)}
                    sx={{ width: '100%' }}
                >
                    {title && <AlertTitle>{title}</AlertTitle>}
                    {message}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    );
}
