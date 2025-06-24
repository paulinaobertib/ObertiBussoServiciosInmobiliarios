import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import AmenityForm from "./forms/AmenityForm";
import OwnerForm from "./forms/OwnerForm";
import TypeForm from "./forms/TypeForm";
import NeighborhoodForm from "./forms/NeighborhoodForm";
import StatusForm from "./forms/StatusForm";
import PropertyForm from "./forms/PropertyForm";
import MaintenanceForm from "./forms/MaintenanceForm";
import CommentForm from "./forms/CommentForm";
import { translate } from "../utils/translate";

const registry = {
    amenity: AmenityForm,
    owner: OwnerForm,
    type: TypeForm,
    neighborhood: NeighborhoodForm,
    status: StatusForm,
    property: PropertyForm,
    maintenance: MaintenanceForm,
    comment: CommentForm,
} as const;
type FormKey = keyof typeof registry;

type RawAction = "add" | "edit" | "delete" | "edit-status";
type SimpleAction = Exclude<RawAction, "edit-status">;

const labels: Record<SimpleAction, string> = {
    add: "Crear",
    edit: "Editar",
    delete: "Eliminar",
};

export interface Info {
    action: RawAction;
    formKey?: FormKey;
    item?: any;
}

export interface ModalItemProps {
    info: Info | null;
    close: () => void;
}

export default function ModalItem({ info, close }: ModalItemProps) {
    if (!info) return null;

    const theme = useTheme();
    const action: SimpleAction =
        info.action === "edit-status" ? "edit" : info.action;
    const formKey: FormKey =
        info.action === "edit-status"
            ? "status"
            : (info.formKey ?? "property") as FormKey;

    const Form = registry[formKey];
    const title = `${labels[action]} ${translate(formKey)}`;

    return (
        <Dialog
            data-testid="modal"
            open
            fullWidth
            maxWidth="sm"
            onClose={(_, reason) => {
                if (reason !== "backdropClick") close();
            }}
            PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "bold",
                    fontSize: "1.25rem",
                    color: theme.palette.primary.main,
                    mb: 1,
                }}
            >
                {title}
                <IconButton
                    onClick={close}
                    sx={{ color: theme.palette.primary.main}}
                    aria-label="cerrar modal"
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Form action={action} item={info.item} onDone={close} />
            </DialogContent>
        </Dialog>
    );
}
