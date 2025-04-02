// filepath: d:\code\openai-chat-app\client\src\contexts\UIStateContext.jsx
import React, { createContext, useContext, useState } from 'react';

const UIStateContext = createContext();

export const useUIState = () => useContext(UIStateContext);

export const UIStateProvider = ({ children }) => {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  
  const value = {
    isAdminPanelOpen,
    setIsAdminPanelOpen
  };

  return (
    <UIStateContext.Provider value={value}>
      {children}
    </UIStateContext.Provider>
  );
};