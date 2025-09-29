import { useState, FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Box, Rating, TextField, Button, Typography } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useSurvey } from "../../hooks/useSurvey";
import { SurveyDTO } from "../../types/survey";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";
import { useTheme } from '@mui/material/styles';

const labels: { [key: number]: string } = {
    1: "Insatisfecho",
    2: "Regular",
    3: "Satisfecho",
    4: "Destacado",
    5: "Perfecto",
};

function getLabelText(value: number): string {
    return `${value} Estrella${value !== 1 ? "s" : ""}, ${labels[value]}`;
}

export const Survey = () => {
    const { postSurvey, loading } = useSurvey();
    const { inquiryId } = useParams<{ inquiryId: string }>();
    const { token } = useParams<{ token: string }>();
    const [score, setScore] = useState<number>(5);
    const [hover, setHover] = useState<number>(-1);
    const [comment, setComment] = useState<string>("");
    const navigate = useNavigate();

    const theme = useTheme();
    const primaryColor = theme.palette.primary.main;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inquiryId) return;

        const dto: Omit<SurveyDTO, "id"> = {
            score,
            comment,
            inquiryId: Number(inquiryId),
        };

        try {
            await postSurvey(dto, token!);
            Swal.fire({
                title: '¡Muchas gracias!',
                text: 'Agradecemos el tiempo que te tomaste para calificar nuestro servicio. Tu opinión nos ayuda a mejorar.',
                icon: 'success',
                confirmButtonText: 'Finalizar',
                confirmButtonColor: primaryColor,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                navigate("/", { replace: true });
            });
        } catch (err: any) {
            Swal.fire({
                title: '¡Lo sentimos!',
                text: err?.response?.data || 'Ocurrió un error al enviar la encuesta.',
                icon: 'error',
                confirmButtonText: 'Finalizar',
                confirmButtonColor: primaryColor,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then(() => {
                navigate("/", { replace: true });
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="h5" gutterBottom align="center" sx={{ width: "100%", mt: { xs: "8%", sm: "6%", md: "4%", lg: "2%" }, mb: { xs: "6%", sm: "4%", md: "2%", lg: "1%" } }}>
                ¿Cómo calificarías tu nivel de satisfacción con nuestro servicio?
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", width: "100%", mb: "0.5%" }}>
                <Rating
                    name="hover-feedback"
                    value={score}
                    precision={1}
                    getLabelText={getLabelText}
                    onChange={(_event, newScore) => {
                        if (newScore !== null) setScore(newScore);
                    }}
                    onChangeActive={(_event, newHover) => {
                        setHover(newHover ?? -1);
                    }}
                    icon={<StarIcon sx={{ fontSize: 50 }} />}
                    emptyIcon={<StarIcon style={{ fontSize: 50, opacity: 0.55 }} fontSize="inherit" />}
                    sx={{ fontSize: 50 }}
                />
            </Box>

            <Box sx={{ width: "100%", textAlign: "center", mb: "2%" }}>
                <Typography variant="caption" color="text.secondary">
                    {labels[hover !== -1 ? hover : score]}
                </Typography>
            </Box>

            <TextField
                fullWidth={false}
                label="Comentario (Opcional)"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                margin="normal"
                style={{ width: "80%", marginBottom: "1%" }}
            />

            <Button type="submit" variant="contained" disabled={loading} sx={{ mt: { xs: "5%", sm: "2%" }, width: "auto", alignSelf: "center", mb: { xs: "8%", sm: "2%" } }}>
                {loading ? "Enviando..." : "Enviar"}
            </Button>
        </form>
    );
};