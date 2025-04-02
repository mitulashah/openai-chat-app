// filepath: d:\code\openai-chat-app\client\src\contexts\TokenContext.jsx
import React, { createContext, useContext } from 'react';
import { useTokenUsage } from '../hooks/useTokenUsage';

const TokenContext = createContext();

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const { tokenUsage, updateTokenUsage, resetCurrentTokenUsage } = useTokenUsage();
  
  const value = {
    tokenUsage,
    updateTokenUsage,
    resetCurrentTokenUsage
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};