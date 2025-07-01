import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Autocomplete,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import { useChatSession } from "../hooks/useChatSession";
import { useAuthContext } from "../../user/context/AuthContext";
import { getPropertiesByText } from "../../property/services/property.service";
import { ChatSessionDTO } from "../types/chatSession";

interface Property {
  id: number;
  title: string;
}

interface ChatProps {
  initialPropertyId?: number;
  onClose?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ initialPropertyId, onClose }) => {
  const { info, isLogged } = useAuthContext();
  const { messages, sendMessage, loading } = useChatContext();
  const { startSessionGuest, startSessionUser, loading: sessionLoading} = useChatSession();

  // si hay una sesion previa, la cargo para que pueda seguir abierta cuando cambia de page
  const [sessionId, setSessionId] = useState<number | null> (
    Number(localStorage.getItem("chatSessionId")) || null
  );

  const [property, setProperty] = useState<Property | null>(null);

  // esto es para no pedir muchas veces los mismos datos si quieren consultar una propiedad diferente
  const [guestData, setGuestData] = useState(() => {
    const stored = localStorage.getItem("guestInfo");
    return stored ? JSON.parse(stored) : {
      firstName: "",
      lastName: "",
      email: "",
      phone: ""
    };
  });

  const [searchText, setSearchText] = useState("");

  // si tiene que buscar la propiedad por searchBar, le mostramos las opciones que tiene
  const [propertyOptions, setPropertyOptions] = useState<Property[]>([]);

  // cuando el usuario no esta loggeado, le pido los datos
  const [showForm, setShowForm] = useState(!isLogged);

  // pasos del chat
  const [step, setStep] = useState<"greeting" | "confirmProperty" | "searchProperty" | "chat">("greeting");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const optionLabels: Record<string, string> = {
    VER_PRECIO: "Ver precio",
    VER_HABITACIONES: "Ver habitaciones",
    VER_AREA: "Ver área",
    VER_UBICACION: "Ver ubicación",
    VER_CARACTERISTICAS: "Ver características",
    VER_OPERACION: "Ver operación",
    VER_CREDITO: "Ver crédito",
    VER_FINANCIACION: "Ver financiación",
    DERIVAR: "Derivar",
    CERRAR: "Cerrar chat",
  };

  // si la propiedad viene desde una card
  useEffect(() => {
    if (initialPropertyId) {
      setProperty({id: initialPropertyId, title: ""});
    }
  }, [initialPropertyId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleStart = async () => {
    try {
      let result;

      if (isLogged && info) {
        result = await startSessionUser(info.id, property!.id);
      } else {
        const dto: ChatSessionDTO = {
          ...guestData,
          propertyId: property!.id
        };
        result = await startSessionGuest(dto);
        localStorage.setItem("guestInfo", JSON.stringify(guestData));
        setShowForm(false);
      }

      setSessionId(result.id);
      localStorage.setItem("chatSessionId", result.id.toString());
      setStep("chat");
    } catch (err) {
      console.error(err);
    }
  };

  // si la propiedad no viene desde la card, o si no quiere consultar por la que esta en la card
  const handlePropertySearch = async (value: string) => {
    setSearchText(value);
    const result = await getPropertiesByText(searchText);
    setPropertyOptions(result);
  };

  const renderMessages = () => (
    <Box sx={{ p: 2, height: 300, overflowY: "auto", border: "1px solid #ccc", borderRadius: 1 }}>
      {messages.map((msg, i) => (
        <Typography key={i} align={msg.from === "user" ? "right" : "left"}>
          <strong>{msg.from === "user" ? "Tú" : "Sistema"}:</strong> {msg.content}
        </Typography>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );

    return (
      <Dialog open fullWidth maxWidth="sm">
        <DialogTitle>
          Chat
          <IconButton
            aria-label="close"
            onClick={() => onClose?.()}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>

          {step === "greeting" && (
            <Box>
              <Typography>Hola, bienvenido. Por favor ingresá tus datos de contacto para comenzar.</Typography>
              {showForm && (
                <Box mt={2}>
                  <TextField fullWidth label="Nombre" value={guestData.firstName} onChange={e => setGuestData({ ...guestData, firstName: e.target.value })} margin="dense" />
                  <TextField fullWidth label="Apellido" value={guestData.lastName} onChange={e => setGuestData({ ...guestData, lastName: e.target.value })} margin="dense" />
                  <TextField fullWidth label="Email" value={guestData.email} onChange={e => setGuestData({ ...guestData, email: e.target.value })} margin="dense" />
                  <TextField fullWidth label="Teléfono" value={guestData.phone} onChange={e => setGuestData({ ...guestData, phone: e.target.value })} margin="dense" />
                </Box>
              )}
              <Box mt={2}>
                {initialPropertyId ? (
                  <>
                    <Typography>¿Querés consultar sobre esta propiedad?</Typography>
                    <Button onClick={() => setStep("chat")} variant="contained" sx={{ mt: 1 }}>Sí</Button>
                    <Button onClick={() => setStep("searchProperty")} sx={{ mt: 1, ml: 1 }}>No, buscar otra</Button>
                  </>
                ) : (
                  <Button onClick={() => setStep("searchProperty")} variant="contained" sx={{ mt: 2 }}>
                    Buscar propiedad
                  </Button>
                )}
              </Box>
            </Box>
          )}

          {step === "searchProperty" && (
            <Box mt={2}>
              <Autocomplete
                fullWidth
                options={propertyOptions}
                getOptionLabel={(opt) => opt.title}
                onInputChange={(_, value) => handlePropertySearch(value)}
                onChange={(_, val) => setProperty(val)}
                renderInput={(params) => <TextField {...params} label="Buscar propiedad" />}
              />
              <Button
                onClick={() => setStep("chat")}
                disabled={!property}
                variant="contained"
                sx={{ mt: 2 }}
              >
                Confirmar propiedad
              </Button>
            </Box>
          )}

          {step === "chat" && (
          <>
            {renderMessages()}
            <Box mt={2} sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {[
                "VER_PRECIO",
                "VER_HABITACIONES",
                "VER_AREA",
                "VER_UBICACION",
                "VER_CARACTERISTICAS",
                "VER_OPERACION",
                "VER_CREDITO",
                "VER_FINANCIACION",
                "DERIVAR",
                "CERRAR",
              ].map((option) => (
                <Button
                  key={option}
                  variant="outlined"
                  onClick={async () => {
                    if (!property || !sessionId) return;
                    await sendMessage(option, property.id, sessionId);
                  }}
                >
                  {optionLabels[option]}
                </Button>
              ))}
            </Box>
          </>
        )}

        </DialogContent>

        {(sessionLoading || loading) && <CircularProgress sx={{ position: "absolute", top: 10, right: 10 }} />}

        <DialogActions>
          {step !== "chat" && (
            <Button onClick={handleStart} variant="contained" disabled={!property || (showForm && !guestData.firstName)}>
              Comenzar chat
            </Button>
          )}
        </DialogActions>
      </Dialog>
  );
}

