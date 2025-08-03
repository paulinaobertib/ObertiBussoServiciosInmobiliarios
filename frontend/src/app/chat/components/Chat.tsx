import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
  IconButton,
  InputAdornment
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from "@mui/icons-material/Send";
import RemoveIcon from "@mui/icons-material/RemoveRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { useEffect, useState, useRef } from "react";
import { useChatContext } from "../context/ChatContext";
import { useChatSession } from "../hooks/useChatSession";
import { useAuthContext } from "../../user/context/AuthContext";
import { getPropertiesByText } from "../../property/services/property.service";
import { ChatSessionDTO } from "../types/chatSession";
import { usePropertiesContext } from "../../property/context/PropertiesContext";

interface Property {
  id: number;
  title: string;
}

interface ChatProps {
  initialPropertyId?: number;
  onClose?: () => void;
}

export const Chat: React.FC<ChatProps> = ({ initialPropertyId, onClose }) => {
  // mostrar el chat
  const [collapsed, setCollapsed] = useState(false);

  const { propertiesList } = usePropertiesContext();

  const { info, isLogged } = useAuthContext();
  const { messages, sendMessage, loading, addSystemMessage, addUserMessage, clearMessages } = useChatContext();
  const { startSessionGuest, startSessionUser, loading: sessionLoading } = useChatSession();
  const derivingRef = useRef(false);

  // mostrar las opciones del chat
  const [showOptions, setShowOptions] = useState(false);

  // si hay una sesion previa, la cargo para que pueda seguir abierta cuando cambia de page
  const [sessionId, setSessionId] = useState<number | null>(
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

  const emailOK = /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(guestData.email);
  const guestDataComplete =
    guestData.firstName.trim() &&
    guestData.lastName.trim() &&
    guestData.phone.trim() &&
    guestData.email.trim() &&
    emailOK;

  const [chatActive, setChatActive] = useState(true);

  const [searchText, setSearchText] = useState("");

  const [inputValue, setInputValue] = useState("");

  // si tiene que buscar la propiedad por searchBar, le mostramos las opciones que tiene
  const [propertyOptions, setPropertyOptions] = useState<Property[]>([]);

  // cuando el usuario no esta loggeado, le pido los datos
  const [showForm, setShowForm] = useState(!isLogged);

  // pasos del chat
  const [step, setStep] = useState<"greeting" | "confirmProperty" | "searchProperty" | "chat">("greeting");

  const [showWelcome, setShowWelcome] = useState(true);

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
      const found = propertiesList?.find(p => p.id === initialPropertyId);
      if (found) {
        setProperty(found);
      } else {
        setProperty({ id: initialPropertyId, title: "" });
      }
    }
  }, [initialPropertyId, propertiesList]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowWelcome(false);
    }
  }, [messages]);

  useEffect(() => {
    if (step === "chat" && showWelcome && !showOptions) {
      const timer = setTimeout(() => {
        setShowOptions(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [step, showWelcome, showOptions]);

  // que muestre las opciones despues de cada respuesta del sistema
  useEffect(() => {
    if (step !== "chat" || !property || !sessionId) {
      if (!showWelcome) setShowOptions(false);
      return;
    }

    if (messages.length === 0) return;

    setShowWelcome(false);

    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg.from === "system" &&
      lastMsg.content !== "La conversación ha finalizado. Gracias por contactarnos." &&
      lastMsg.content !== "Tu consulta ha sido derivada a un asesor. Pronto te atenderán."
    ) {
      setShowOptions(true);
    } else {
      setShowOptions(false);
    }
  }, [step, messages, property, sessionId]);

  const handleStart = async () => {
    try {
      if (showForm && !guestDataComplete) return;
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
      if (result != null) {
        setSessionId(result);
        localStorage.setItem("chatSessionId", result.toString());
      } else {
        console.error("Error: result.id es undefined o null", result);
      }
      setStep("chat");
      setShowWelcome(true);
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

  const handleChangeProperty = async () => {
    try {
      if (chatActive && sessionId && property) {
        await sendMessage("CERRAR", property.id, sessionId);
        setChatActive(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión anterior:", error);
    }
    clearMessages();
    setSessionId(null);
    setProperty(null);
    setStep("searchProperty");
    setShowOptions(true);
    setShowWelcome(true);
    setChatActive(true);
  };

  const handleClose = async () => {
    const lastMsg = messages[messages.length - 1];
    if (sessionId && property && lastMsg.content != "La conversación ha finalizado. Gracias por contactarnos." && lastMsg.content != "Tu consulta ha sido derivada a un asesor. Pronto te atenderán.") {
      try {
        await sendMessage("CERRAR", property.id, sessionId);
        setCollapsed(true);
        setChatActive(false);
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

  const handleTextInput = async (input: string) => {
    const trimmed = input.trim();
    const index = Number(input.trim()) - 1;
    const keys = Object.keys(optionLabels);

    if (!property || !sessionId) return;

    addUserMessage(trimmed);

    const isInteger = /^\d+$/.test(trimmed);

    if (isInteger) {
      if (keys[index]) {
        setShowOptions(false);
        await sendMessage(keys[index], property.id, sessionId);
        if (keys[index] === "CERRAR") {
          setChatActive(false);
        }
        if (keys[index] === "DERIVAR") {
          derivingRef.current = true;
          setTimeout(() => {
            setCollapsed(true);
            setChatActive(false);
            clearMessages();
            if (onClose) onClose();
          }, 1000);
        }
      } else {
        addSystemMessage("Opción inválida. Por favor seleccioná un número de la lista.");
        setShowOptions(true);
      }
    } else {
      addSystemMessage("Entrada inválida. Por favor escribí solo el número de una opción.");
      setShowOptions(true);
    }
  };

  const sendCurrentInput = async () => {
    if (!inputValue.trim()) return;
    await handleTextInput(inputValue.trim());
    setInputValue("");
  };

  useEffect(() => {
    if (derivingRef.current && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];

      if (!lastMsg || !lastMsg.content) return;

      const phoneMatch = lastMsg.content.match(/\+?\d{10,15}/);
      if (phoneMatch) {
        const phone = phoneMatch[0];
        const msgText = encodeURIComponent(`Hola, quiero consultar por la propiedad ${property?.title}`);
        const url = `https://wa.me/${phone.replace("+", "")}?text=${msgText}`;
        window.open(url, "_blank");
        setChatActive(false);
      }

      derivingRef.current = false;
    }
  }, [messages]);

  const renderMessages = () => (
    <Box
      sx={{
        p: 2,
        flexGrow: 1,
        overrlowY: "auto",
        border: "1px solid #ccc",
        borderRadius: 1,
        backgroundColor: "#fff",
        minHeight: 0,
      }}
    >
      {showWelcome && (
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
            <Typography>¡Bienvenido! ¿Cómo puedo ayudarte?</Typography>
          </Box>
        </Box>
      )}

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

      {showOptions && chatActive && (
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
            <Typography sx={{ mt: 1 }}>
              Por favor, seleccioná una de las siguientes opciones escribiendo el número correspondiente:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1 }}>
              {Object.values(optionLabels).map((label, idx) => (
                <li key={idx}>
                  <Typography>{`${idx + 1}. ${label}`}</Typography>
                </li>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <div ref={messagesEndRef} />
    </Box>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 380,
        maxHeight: collapsed ? "auto" : "80vh",
        boxShadow: 6,
        borderRadius: 3,
        border: "1px solid #ccc",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1500,
        backgroundColor: "#fff",
        transition: "max-height 0.2s ease"
      }}
    >

      <Box sx={{ p: 2, borderBottom: "1px solid #eee", position: "relative", bgcolor: "#EB7333", color: "#fff" }}>
        <Typography variant="h6" fontWeight="bold">Asistente Virtual</Typography>

        <IconButton
          aria-label={collapsed ? "Restaurar chat" : "Minimizar chat"}
          onClick={() => setCollapsed(!collapsed)}
          sx={{ position: "absolute", right: 48, top: 8, color: "#fff" }}
        >
          {collapsed ? <KeyboardArrowUpIcon /> : <RemoveIcon />}
        </IconButton>

        <IconButton
          aria-label="Cerrar chat"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8, color: "#fff" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

        {!collapsed && (
          <>
            <Box sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", '&::-webkit-scrollbar': {width: '8px', }, '&::-webkit-scrollbar-track': { backgroundColor: '#f1f1f1'}, '&::-webkit-scrollbar-thumb': { backgroundColor: '#FED7AA' }}}>
              {step === "greeting" && (
                <Box>
                  <Typography>Hola, soy tu asistente virtual. Será un placer ayudarte.</Typography>

                  {showForm && (
                    <Box mt={2}>
                      <Typography>Por favor, ingresá tus datos de contacto para continuar:</Typography>
                      <TextField fullWidth label="Nombre" value={guestData.firstName} onChange={e => setGuestData({ ...guestData, firstName: e.target.value })} margin="dense" />
                      <TextField fullWidth label="Apellido" value={guestData.lastName} onChange={e => setGuestData({ ...guestData, lastName: e.target.value })} margin="dense" />
                      <TextField
                        fullWidth
                        label="Email"
                        value={guestData.email}
                        onChange={e => setGuestData({ ...guestData, email: e.target.value })}
                        margin="dense"
                        error={showForm && !emailOK}
                        helperText={showForm && !emailOK ? "Ingresá un email válido" : ""}
                      />
                      <TextField fullWidth label="Teléfono" value={guestData.phone} onChange={e => setGuestData({ ...guestData, phone: e.target.value })} margin="dense" />
                    </Box>
                  )}

                {showForm && (
                  <Box mt={2}>
                    <Typography>Por favor, ingresá tus datos de contacto para continuar:</Typography>
                    <TextField fullWidth label="Nombre" value={guestData.firstName} onChange={e => setGuestData({ ...guestData, firstName: e.target.value })} margin="dense" />
                    <TextField fullWidth label="Apellido" value={guestData.lastName} onChange={e => setGuestData({ ...guestData, lastName: e.target.value })} margin="dense" />
                    <TextField
                      fullWidth
                      label="Email"
                      value={guestData.email}
                      onChange={e => setGuestData({ ...guestData, email: e.target.value })}
                      margin="dense"
                      error={showForm && !emailOK}
                      helperText={showForm && !emailOK ? "Ingresá un email válido" : ""}
                    />
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
                    <Button
                      onClick={() => setStep("searchProperty")}
                      disabled={showForm && !guestDataComplete}
                      variant="contained"
                      sx={{ mt: 2 }}
                    >
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
                  onClick={handleStart}
                  disabled={!property || (showForm && !guestDataComplete)}
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Confirmar propiedad
                </Button>
              </Box>
            )}

            {step === "chat" && (
              <>
                {property && (
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "bold", color: "#EB7333", textAlign: "center" }}
                  >
                    Propiedad en consulta: {property?.title || `#${property?.id}`}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleChangeProperty}
                  sx={{ mb: 1 }}
                >
                  Consultar por otra propiedad
                </Button>
                {renderMessages()}
              </>
            )}
          </Box>

          {step === "chat" && chatActive && (
            <Box sx={{ px: 2, pb: 2, pt: 0, borderTop: "1px solid #eee" }}>
              <TextField
                fullWidth
                placeholder="Escribí el número de una opción"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    await sendCurrentInput();
                  }
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={sendCurrentInput}
                        disabled={!inputValue.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}
        </>
      )}

      {(sessionLoading || loading) && (
        <CircularProgress sx={{ position: "absolute", top: 10, right: 10 }} />
      )}
    </Box>
  );
}