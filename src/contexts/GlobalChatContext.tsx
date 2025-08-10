'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Contact } from '../types/whatsapp';

interface GlobalChatContextType {
  isGlobalChatOpen: boolean;
  openGlobalChat: (contact?: Contact) => void;
  closeGlobalChat: () => void;
  currentGlobalContact: Contact | null;
}

export const GlobalChatContext = createContext<GlobalChatContextType | undefined>(undefined);

export function GlobalChatProvider({ children }: { children: ReactNode }) {
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [currentGlobalContact, setCurrentGlobalContact] = useState<Contact | null>(null);

  const openGlobalChat = (contact?: Contact) => {
    if (contact) {
      setCurrentGlobalContact(contact);
    }
    
    setIsGlobalChatOpen(true);
  };

  const closeGlobalChat = () => {
    setIsGlobalChatOpen(false);
    setCurrentGlobalContact(null);
  };

  return (
    <GlobalChatContext.Provider
      value={{
        isGlobalChatOpen,
        openGlobalChat,
        closeGlobalChat,
        currentGlobalContact,
      }}
    >
      {children}
    </GlobalChatContext.Provider>
  );
}

export function useGlobalChat() {
  const context = useContext(GlobalChatContext);
  if (context === undefined) {
    throw new Error('useGlobalChat must be used within a GlobalChatProvider');
  }
  return context;
}
