import React from 'react';
import { ConfigurationProvider } from './ConfigurationContext';
import { UIStateProvider } from './UIStateContext';
import { TokenProvider } from './TokenContext';
import { MessageProvider } from './MessageContext';

// The root provider that composes all our specialized contexts
export const ChatProvider = ({ children }) => {
  return (
    <ConfigurationProvider>
      <TokenProvider>
        <UIStateProvider>
          <MessageProvider>
            {children}
          </MessageProvider>
        </UIStateProvider>
      </TokenProvider>
    </ConfigurationProvider>
  );
};