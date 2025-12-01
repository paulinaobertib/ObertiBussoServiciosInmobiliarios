import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Autocomplete,
  IconButton,
  InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import RemoveIcon from "@mui/icons-material/RemoveRounded";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import Popper, { PopperProps } from "@mui/material/Popper";
import { keyframes } from "@emotion/react";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useChatContext } from "../context/ChatContext";
import { useChatSession } from "../hooks/useChatSession";
import { useAuthContext } from "../../user/context/AuthContext";
import { getPropertiesByText } from "../../property/services/property.service";
import { ChatSessionDTO } from "../types/chatSession";
import { usePropertiesContext } from "../../property/context/PropertiesContext";
import { useBackButtonClose } from "../../shared/hooks/useBackButtonClose";

const FINAL_SYSTEM_MESSAGES = [
  "La conversación ha finalizado. Gracias por contactarnos.",
  "Tu consulta ha sido derivada a un asesor. Pronto te atenderán.",
];

const isFinalSystemMessage = (content?: string) => (content ? FINAL_SYSTEM_MESSAGES.includes(content) : false);

const DERIVATION_REDIRECT_DELAY = 3000;

const CHAT_FONT_SIZES = {
  heading: { xs: "0.95rem", sm: "0.85rem" },
  body: { xs: "0.9rem", sm: "0.8rem" },
  label: { xs: "0.8rem", sm: "0.7rem" },
  button: { xs: "0.9rem", sm: "0.8rem" },
};

const typingPulse = keyframes`
  0% { opacity: 0.2; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 0.2; transform: translateY(0); }
`;

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
  const { messages, sendMessage, addSystemMessage, addUserMessage, clearMessages, isTyping } = useChatContext();
  const { startSessionGuest, startSessionUser } = useChatSession();
  const derivingRef = useRef(false);

  // mostrar las opciones del chat
  const [showOptions, setShowOptions] = useState(false);

  // si hay una sesion previa, la cargo para que pueda seguir abierta cuando cambia de page
  const [sessionId, setSessionId] = useState<number | null>(Number(localStorage.getItem("chatSessionId")) || null);

  const [property, setProperty] = useState<Property | null>(null);

  // esto es para no pedir muchas veces los mismos datos si quieren consultar una propiedad diferente
  const [guestData, setGuestData] = useState(() => {
    const stored = localStorage.getItem("guestInfo");
    return stored
      ? JSON.parse(stored)
      : {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
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
  const [changingProperty, setChangingProperty] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [inputValue, setInputValue] = useState("");

  // si tiene que buscar la propiedad por searchBar, le mostramos las opciones que tiene
  const [propertyOptions, setPropertyOptions] = useState<Property[]>([]);
  const [optionsTyping, setOptionsTyping] = useState(false);
  const [, setSuppressHeaderSpinner] = useState(false);

  const availableProperties = useMemo(() => {
    const list = propertiesList ?? [];
    return list.filter((p: any) => {
      const status = String(p?.status ?? "").toLowerCase();
      return status === "" || status === "disponible";
    });
  }, [propertiesList]);

  // cuando el usuario no esta loggeado, le pido los datos
  const [showForm, setShowForm] = useState(!isLogged);

  // pasos del chat
  const [step, setStep] = useState<"greeting" | "confirmProperty" | "searchProperty" | "chat">("greeting");

  const [showWelcome, setShowWelcome] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const optionsTimerRef = useRef<number | null>(null);

  const optionLabels: Record<string, string> = {
    VER_PRECIO: "¿Cuál es el precio?",
    VER_HABITACIONES: "¿Cuántos ambientes tiene?",
    VER_AREA: "¿Qué superficie tiene?",
    VER_UBICACION: "¿Dónde está ubicado?",
    VER_CARACTERISTICAS: "¿Qué características ofrece?",
    VER_OPERACION: "¿Está disponible para venta o alquiler?",
    VER_CREDITO: "¿Acepta crédito?",
    VER_FINANCIACION: "¿Ofrecen financiación?",
    DERIVAR: "Quiero hablar con un asesor",
    CERRAR: "Finalizar chat",
  };

  const clearOptionsTimer = useCallback(() => {
    if (optionsTimerRef.current) {
      window.clearTimeout(optionsTimerRef.current);
      optionsTimerRef.current = null;
    }
  }, []);

  const scheduleOptionsReveal = useCallback(() => {
    clearOptionsTimer();
    setOptionsTyping(true);
    setShowOptions(false);
    optionsTimerRef.current = window.setTimeout(() => {
      setOptionsTyping(false);
      setShowOptions(true);
      optionsTimerRef.current = null;
    }, 3000);
  }, [clearOptionsTimer]);

  // si la propiedad viene desde una card
  useEffect(() => {
    if (initialPropertyId) {
      const found = propertiesList?.find((p) => p.id === initialPropertyId);
      if (found) {
        setProperty(found);
      } else {
        setProperty({ id: initialPropertyId, title: "" });
      }
    }
  }, [initialPropertyId, propertiesList]);

  useEffect(() => {
    if (step === "searchProperty" && !searchText) {
      setPropertyOptions(availableProperties);
    }
  }, [step, searchText, availableProperties]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isTyping && step === "chat") {
      clearOptionsTimer();
      setOptionsTyping(true);
      setShowOptions(false);
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else if (!isTyping && step === "chat" && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === "system" && !isFinalSystemMessage(lastMsg.content)) {
        scheduleOptionsReveal();
      } else {
        setOptionsTyping(false);
      }
    }
  }, [isTyping, step, messages, scheduleOptionsReveal, clearOptionsTimer]);

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
      if (optionsTimerRef.current) {
        window.clearTimeout(optionsTimerRef.current);
        optionsTimerRef.current = null;
      }
      if (!showWelcome) setShowOptions(false);
      return;
    }

    if (messages.length === 0) return;

    setShowWelcome(false);

    const lastMsg = messages[messages.length - 1];
    if (lastMsg.from !== "system" || isFinalSystemMessage(lastMsg.content)) {
      setShowOptions(false);
      setOptionsTyping(false);
    }

    return () => {
      if (optionsTimerRef.current) {
        window.clearTimeout(optionsTimerRef.current);
        optionsTimerRef.current = null;
      }
    };
  }, [step, messages, property, sessionId, showWelcome]);

  const closeChatUI = useCallback(() => {
    setCollapsed(true);
    setChatActive(false);
    setOptionsTyping(false);
    setShowOptions(false);
    setSuppressHeaderSpinner(true);
    clearMessages();
    if (onClose) onClose();
  }, [clearMessages, onClose]);

  const sendCloseMessage = useCallback(async () => {
    const lastMsg = messages[messages.length - 1];
    if (!sessionId || !property || !lastMsg || isFinalSystemMessage(lastMsg.content)) {
      return;
    }

    try {
      await sendMessage("CERRAR", property.id, sessionId);
    } catch (err) {
      console.error("Error al enviar mensaje de cierre:", err);
    }
  }, [messages, property, sendMessage, sessionId]);

  const handleStart = async () => {
    try {
      // Validar solo si el formulario está visible y no es usuario logueado
      if (showForm && !guestDataComplete) {
        return;
      }

      let result;

      if (isLogged && info) {
        result = await startSessionUser(info.id, property!.id);
      } else {
        const dto: ChatSessionDTO = {
          ...guestData,
          propertyId: property!.id,
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
    const query = value.trim();
    if (!query) {
      setPropertyOptions(availableProperties);
      return;
    }

    try {
      const result = await getPropertiesByText(query);
      const filtered = result.filter((p: { status?: string }) => {
        const status = String(p?.status ?? "").toLowerCase();
        return status === "" || status === "disponible";
      });
      setPropertyOptions(filtered);
    } catch (error) {
      console.error("Error buscando propiedades:", error);
      setPropertyOptions(availableProperties);
    }
  };

  const handleChangeProperty = async () => {
    setChangingProperty(true);
    setSuppressHeaderSpinner(true);
    clearOptionsTimer();
    setShowOptions(false);
    try {
      if (chatActive && sessionId && property) {
        await sendMessage("CERRAR", property.id, sessionId, { silent: true });
        setChatActive(false);
      }
    } catch (error) {
      console.error("Error al cerrar sesión anterior:", error);
    }
    clearMessages();
    setSessionId(null);
    setProperty(null);
    setStep("searchProperty");
    setShowWelcome(true);
    setChatActive(true);
    setChangingProperty(false);
  };

  const handleClose = useCallback(() => {
    closeChatUI();
    void sendCloseMessage();
  }, [closeChatUI, sendCloseMessage]);
  const closeWithBack = useBackButtonClose(!collapsed, handleClose);

  const renderContent = (content: string) => {
    return optionLabels[content] || content;
  };

  const handleTextInput = async (input: string) => {
    const trimmed = input.trim();
    const index = Number(trimmed) - 1;
    const optionKeys = Object.keys(optionLabels);

    if (!property || !sessionId) return;

    setInputValue("");

    const isInteger = /^\d+$/.test(trimmed);

    if (isInteger) {
      if (optionKeys[index]) {
        setShowOptions(false);
        const selected = optionKeys[index];
        if (selected === "CERRAR") {
          setSuppressHeaderSpinner(true);
          await sendMessage(selected, property.id, sessionId, { userDisplay: optionLabels[selected] });
          setChatActive(false);
          setTimeout(() => {
            closeChatUI();
            setSuppressHeaderSpinner(false);
          }, 2000);
          return;
        }
        await sendMessage(selected, property.id, sessionId, { userDisplay: optionLabels[selected] });
        if (optionKeys[index] === "DERIVAR") {
          derivingRef.current = true;
          setChatActive(false);
        } else {
          scheduleOptionsReveal();
        }
      } else {
        addUserMessage(trimmed);
        addSystemMessage("Opción inválida. Por favor seleccioná un número de la lista.");
        setShowOptions(true);
      }
    } else {
      addUserMessage(trimmed);
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
    if (!derivingRef.current || messages.length === 0) return;

    const lastSystemMsg = messages.filter(msg => msg.from === "system").pop();
    if (!lastSystemMsg || !lastSystemMsg.content) return;

    const phoneMatch = lastSystemMsg.content.match(/\+?\d{10,15}/);
    if (!phoneMatch) {
      return;
    }

    const phone = phoneMatch[0];
    const msgText = encodeURIComponent(`Hola, quiero consultar por la propiedad ${property?.title ?? ""}`);
    const url = `https://wa.me/${phone.replace("+", "")}?text=${msgText}`;

    const timer = window.setTimeout(() => {
      window.location.href = url;
      closeChatUI();
      derivingRef.current = false;
    }, DERIVATION_REDIRECT_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [messages, property, closeChatUI]);

  const renderMessages = () => (
    <Box
      sx={{
        p: 1,
        flex: "1 0 400px",
        overflowY: "auto",
        borderRadius: 1,
        backgroundColor: "#fff",
      }}
    >
      {showWelcome && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: "90%", sm: "70%" },
              bgcolor: "#FED7AA",
              color: "#000",
              px: 2,
              py: 1,
              borderRadius: 2,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: CHAT_FONT_SIZES.label }}>
              Sistema
            </Typography>
            <Typography sx={{ fontSize: CHAT_FONT_SIZES.body }}>¡Bienvenido! ¿Cómo puedo ayudarte?</Typography>
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
                maxWidth: { xs: "90%", sm: "70%" },
                bgcolor: color,
                color: textColor,
                px: 2,
                py: 1,
                borderRadius: 2,
                borderTopLeftRadius: isUser ? 8 : 0,
                borderTopRightRadius: isUser ? 0 : 8,
              }}
            >
              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: CHAT_FONT_SIZES.label }}>
                {isUser ? "Tú" : "Sistema"}
              </Typography>
              <Typography sx={{ fontSize: CHAT_FONT_SIZES.body, lineHeight: 1.4 }}>
                {renderContent(msg.content)}
              </Typography>
            </Box>
          </Box>
        );
      })}

      {(isTyping || optionsTyping) && step === "chat" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              maxWidth: { xs: "90%", sm: "70%" },
              bgcolor: "#FED7AA",
              color: "#000",
              px: 2,
              py: 1,
              borderRadius: 2,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: CHAT_FONT_SIZES.label }}>
              Sistema
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, mt: 0.75, alignItems: "center" }}>
              {[0, 0.2, 0.4].map((delay) => (
                <Box
                  key={delay}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#000",
                    animation: `${typingPulse} 1.2s infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

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
              maxWidth: { xs: "90%", sm: "70%" },
              bgcolor: "#FED7AA",
              color: "#000",
              px: 2,
              py: 1,
              borderRadius: 2,
              borderTopRightRadius: 8,
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: CHAT_FONT_SIZES.label }}>
              Sistema
            </Typography>
            <Typography sx={{ mt: 1, fontSize: CHAT_FONT_SIZES.body }}>
              Por favor, seleccioná una de las siguientes opciones escribiendo el número correspondiente:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 1, mb: 0 }}>
              {Object.values(optionLabels).map((label, idx) => (
                <li key={idx}>
                  <Typography sx={{ fontSize: CHAT_FONT_SIZES.body }}>{`${idx + 1}. ${label}`}</Typography>
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
        bottom: { xs: 0, sm: 20 },
        left: { xs: 0, sm: "auto" },
        right: { xs: 0, sm: 20 },
        width: { xs: "100%", sm: 380 },
        maxWidth: { xs: "100%", sm: "calc(100vw - 40px)" },
        maxHeight: {
          xs: collapsed ? "auto" : "80vh",
          sm: collapsed ? "auto" : "80vh",
        },
        boxShadow: { xs: "0 -8px 24px rgba(0,0,0,0.15)", sm: 6 },
        borderRadius: { xs: "16px 16px 0 0", sm: 3 },
        border: "1px solid #ccc",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        zIndex: 1400,
        backgroundColor: "#fff",
        transition: "max-height 0.2s ease",
      }}
    >
      <Box
        sx={{
          px: { xs: 1.25, sm: 1.5 },
          py: { xs: 0.9, sm: 0.85 },
          minHeight: property ? 60 : 40,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          bgcolor: "#EB7333",
          color: "#fff",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, my: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: CHAT_FONT_SIZES.heading, lineHeight: 1 }}>
            Asistente Virtual
          </Typography>
          {property && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.75,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: CHAT_FONT_SIZES.label,
                  opacity: 0.85,
                  py: 0.25,
                  flex: 1,
                  minWidth: 0,
                  wordBreak: "break-word",
                }}
              >
                Propiedad consultada: {property.title || `#${property.id}`}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            aria-label={collapsed ? "Restaurar chat" : "Minimizar chat"}
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              color: "#fff",
            }}
          >
            {collapsed ? <KeyboardArrowUpIcon fontSize="small" /> : <RemoveIcon fontSize="small" />}
          </IconButton>

          <IconButton
            size="small"
            aria-label="Cerrar chat"
            onClick={closeWithBack}
            sx={{
              color: "#fff",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {!collapsed && (
        <>
          {changingProperty ? (
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  px: { xs: 1.25, sm: 1.5 },
                  py: { xs: 1.25, sm: 1.5 },
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  "&::-webkit-scrollbar": { width: "8px" },
                  "&::-webkit-scrollbar-track": { backgroundColor: "#f1f1f1" },
                  "&::-webkit-scrollbar-thumb": { backgroundColor: "#FED7AA" },
                }}
              >
                {step === "greeting" && (
                  <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                    <Box>
                      <Typography sx={{ fontSize: CHAT_FONT_SIZES.body }}>
                        Hola, soy tu asistente virtual. Será un placer ayudarte.
                      </Typography>

                      {showForm && (
                        <Box mt={2}>
                          <Typography sx={{ fontSize: CHAT_FONT_SIZES.body }}>
                            Por favor, ingresá tus datos de contacto para continuar:
                          </Typography>
                          <TextField
                            fullWidth
                            label="Nombre"
                            value={guestData.firstName}
                            onChange={(e) => setGuestData({ ...guestData, firstName: e.target.value })}
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            fullWidth
                            label="Apellido"
                            value={guestData.lastName}
                            onChange={(e) => setGuestData({ ...guestData, lastName: e.target.value })}
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            fullWidth
                            label="Email"
                            value={guestData.email}
                            onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                            margin="dense"
                            error={guestData.email.trim() !== "" && !emailOK}
                            helperText={guestData.email.trim() !== "" && !emailOK ? "Ingresá un email válido" : ""}
                            size="small"
                          />
                          <TextField
                            fullWidth
                            label="Teléfono"
                            value={guestData.phone}
                            onChange={(e) => setGuestData({ ...guestData, phone: e.target.value })}
                            margin="dense"
                            size="small"
                          />
                        </Box>
                      )}
                    </Box>

                    <Box mt="auto" pt={2} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {initialPropertyId ? (
                        <>
                          <Typography sx={{ fontSize: CHAT_FONT_SIZES.body }}>
                            ¿Querés consultar sobre esta propiedad?
                          </Typography>
                          <Button
                            fullWidth
                            onClick={handleStart}
                            variant="contained"
                            sx={{ mt: 1, fontSize: CHAT_FONT_SIZES.button }}
                          >
                            Sí
                          </Button>
                          <Button
                            fullWidth
                            onClick={() => setStep("searchProperty")}
                            variant="outlined"
                            sx={{ fontSize: CHAT_FONT_SIZES.button }}
                          >
                            No, buscar otra
                          </Button>
                        </>
                      ) : (
                        <Button
                          fullWidth
                          onClick={() => setStep("searchProperty")}
                          disabled={showForm && !guestDataComplete}
                          variant="contained"
                          sx={{ fontSize: CHAT_FONT_SIZES.button }}
                        >
                          Buscar propiedad para consultar
                        </Button>
                      )}
                    </Box>
                  </Box>
                )}

                {step === "searchProperty" && (
                  <Box mt={0.5}>
                    <Autocomplete
                      fullWidth
                      options={propertyOptions}
                      getOptionLabel={(opt) => opt.title}
                      onInputChange={(_, value) => handlePropertySearch(value)}
                      onChange={(_, val) => setProperty(val)}
                      renderInput={(params) => <TextField {...params} label="Buscar propiedad" size="small" />}
                      noOptionsText={searchText ? "No se encontraron propiedades" : "Escribí para buscar propiedades"}
                      slots={{ popper: ChatAutocompletePopper }}
                      openOnFocus
                      selectOnFocus
                      clearOnBlur={false}
                      includeInputInList
                      ListboxProps={{
                        style: {
                          maxHeight: 280,
                          overflowY: "auto",
                          fontSize: CHAT_FONT_SIZES.body.sm,
                        },
                      }}
                    />
                    <Button
                      fullWidth
                      onClick={handleStart}
                      disabled={!property || (showForm && !guestDataComplete)}
                      variant="contained"
                      sx={{ mt: 2, fontSize: CHAT_FONT_SIZES.button }}
                    >
                      Confirmar propiedad
                    </Button>
                  </Box>
                )}

                {step === "chat" && (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="secondary"
                      onClick={handleChangeProperty}
                      disabled={changingProperty}
                      sx={{ mb: 1, fontSize: CHAT_FONT_SIZES.button }}
                    >
                      Consultar por otra propiedad
                    </Button>
                    {renderMessages()}
                  </>
                )}
              </Box>

              {step === "chat" && chatActive && (
                <Box sx={{ px: { xs: 1.25, sm: 1.5 }, pb: 1.5, pt: 0.5, borderTop: "1px solid #eee" }}>
                  <TextField
                    type="tel"
                    fullWidth
                    placeholder="Escribí el número de una opción"
                    value={inputValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,2}$/.test(value)) {
                        setInputValue(value);
                      }
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        await sendCurrentInput();
                      }
                    }}
                    size="small"
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      style: { fontSize: CHAT_FONT_SIZES.body.xs },
                    }}
                    InputProps={{
                      sx: {
                        height: 40,
                        "& .MuiInputBase-input": {
                          py: 0.5,
                        },
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={sendCurrentInput} disabled={!inputValue.trim()}>
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};
const ChatAutocompletePopper = (props: PopperProps) => (
  <Popper {...props} style={{ ...props.style, zIndex: 2000 }} placement={props.placement ?? "bottom"} />
);
