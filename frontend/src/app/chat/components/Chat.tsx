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
  const { messages, sendMessage, loading, clearMessages } = useChatContext();
  const { startSessionGuest, startSessionUser, loading: sessionLoading} = useChatSession();
  
  // mostrar las opciones del chat
  const [showOptions, setShowOptions] = useState(false);

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
    VER_PRECIO: "¿Cuál es el precio?",
    VER_HABITACIONES: "¿Cuántas habitaciones tiene?",
    VER_AREA: "¿Qué superficie tiene?",
    VER_UBICACION: "¿Dónde está ubicado?",
    VER_CARACTERISTICAS: "¿Qué características ofrece?",
    VER_OPERACION: "¿Está disponible para venta o alquiler?",
    VER_CREDITO: "¿Acepta crédito?",
    VER_FINANCIACION: "¿Ofrecen financiación?",
    DERIVAR: "Quiero hablar con un asesor",
    CERRAR: "Finalizar chat",
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

  // que muestre las opciones despues de cada respuesta del sistema
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
    if (lastMsg.from === "system" && (lastMsg.content === "La conversación ha finalizado. Gracias por contactarnos." || lastMsg.content === "Tu consulta ha sido derivada a un asesor. Pronto te atenderán.")) {
        setShowOptions(false);
      } else if (lastMsg.from === "system") {
        setShowOptions(true);
      }
      
    }
  }, [messages]);

  const handleStart = async () => {
    try {
      let result;

      if (isLogged && info) {
        result = await startSessionUser(info.id, property!.id);
        console.log("ACA  ", result)
      } else {
        const dto: ChatSessionDTO = {
          ...guestData,
          propertyId: property!.id
        };
        result = await startSessionGuest(dto);
        console.log("ACA  ", result)
        localStorage.setItem("guestInfo", JSON.stringify(guestData));
        setShowForm(false);
      }

      setSessionId(result.id);
      if (result != null) {
        setSessionId(result);
        localStorage.setItem("chatSessionId", result.toString());
      } else {
        console.error("Error: result.id es undefined o null", result);
      }
      setShowOptions(true);
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

  const handleClose = async () => {
    const lastMsg = messages[messages.length - 1];
    if (sessionId && property && lastMsg.content != "La conversación ha finalizado. Gracias por contactarnos." && lastMsg.content != "Tu consulta ha sido derivada a un asesor. Pronto te atenderán.") {
      try {
        await sendMessage("CERRAR", property.id, sessionId);
      } catch (err) {
        console.error("Error al enviar mensaje de cierre:", err);
      }
    }

    clearMessages();
    if (onClose) onClose();
  };

  const renderContent = (content: string) => {
    return optionLabels[content] || content;
  };

  const renderMessages = () => (
    <Box
      sx={{
        p: 2,
        height: 300,
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: 1,
        backgroundColor: "#fff",
      }}
    >
      {messages.map((msg, i) => {
        const isUser = msg.from === "user";
        const color = isUser ? "#EB7333" : "#FED7AA";
        const textColor = isUser ? "#fff" : "#000";

        return (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Box
              sx={{
                maxWidth: "70%",
                bgcolor: color,
                color: textColor,
                px: 2,
                py: 1,
                borderRadius: 2,
                borderTopLeftRadius: isUser ? 8 : 0,
                borderTopRightRadius: isUser ? 0 : 8,
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {isUser ? "Tú" : "Sistema"}
              </Typography>
              <Typography>{renderContent(msg.content)}</Typography>
            </Box>
          </Box>
        );
      })}

      {showOptions && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: "70%",
              bgcolor: "#FED7AA",
              color: "#000",
              px: 2,
              py: 1,
              borderRadius: 2,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="body2" fontWeight="bold">Sistema</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {Object.keys(optionLabels).map((option) => (
                <Button
                  key={option}
                  variant="outlined"
                  size="small"
                  onClick={async () => {
                    if (!property || !sessionId) return;
                    setShowOptions(false);
                    await sendMessage(option, property.id, sessionId);
                  }}
                >
                  {optionLabels[option]}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Box>
  );

    return (
      <Dialog open fullWidth maxWidth="sm">
        <DialogTitle>
          Chat
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>

          {step === "greeting" && (
            <Box>
              <Typography>Hola, bienvenido.</Typography>
              {showForm && (
                <Box mt={2}>
                  <Typography>Hola, bienvenido. Por favor ingresá tus datos de contacto para comenzar.</Typography>
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
                    <Button onClick={handleStart} variant="contained" sx={{ mt: 1 }}>Sí</Button>
                    <Button onClick={() => setStep("searchProperty")} sx={{ mt: 1, ml: 1 }}>No, buscar otra</Button>
                  </>
                ) : (
                  <Button onClick={() => setStep("searchProperty")} variant="contained" sx={{ mt: 2 }}>
                    Buscar propiedad para consultar
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
                noOptionsText={searchText ? "No se encontraron propiedades" : "Escribí para buscar propiedades"}
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

