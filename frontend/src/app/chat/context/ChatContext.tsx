import { createContext, useContext, ReactNode } from "react";
import { useChat } from "../hooks/useChat";

const ChatContext = createContext<ReturnType<typeof useChat> | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const chat = useChat();

    return (
        <ChatContext.Provider value={chat}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext debe usarse dentro de un ChatProvider");
  }
  return context;
};