import { FluentProvider, tokens } from '@fluentui/react-components';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChatMessages } from './components/chat/ChatMessages';
import { MessageInput } from './components/chat/MessageInput';
import { Footer } from './components/chat/Footer';
import { AdminPanel } from './components/AdminPanel';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useTheme } from './hooks/useTheme';
// Update the import to use our new context structure
import { ChatProvider } from './contexts/ChatContext';
import { MCPProvider } from './contexts/MCPContext';
import { useMessage } from './contexts/MessageContext';
import { useConfiguration } from './contexts/ConfigurationContext';
import { useUIState } from './contexts/UIStateContext';
import { useToken } from './contexts/TokenContext';
import { makeStyles } from '@fluentui/react-components';
import { Text } from '@fluentui/react-components';
import { useEffect, useState } from 'react';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    position: 'relative',
    overflow: 'hidden',
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    padding: '10px',
    textAlign: 'center',
  },
  chatContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  dimOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
    pointerEvents: 'none', // Allow clicks to pass through
  },
  autoInitBanner: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    padding: '8px 16px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 2,
    animation: 'fadeOut 1s ease-in-out 5s forwards',
    '@keyframes fadeOut': {
      '0%': { opacity: 1 },
      '100%': { opacity: 0, height: 0, padding: 0 }
    }
  }
});

// Configuration for app branding
const APP_CONFIG = {
  title: "Mitul's AI Chat",
  version: "0.7",
};

/**
 * Main App component that provides the theme and chat context
 */
function App() {
  const { currentTheme, currentThemeName, handleThemeChange } = useTheme();
  
  return (
    <FluentProvider theme={currentTheme}>
      <MCPProvider>
        <ChatProvider>
          <ChatContent 
            currentTheme={currentTheme}
            currentThemeName={currentThemeName}
            handleThemeChange={handleThemeChange}
          />
        </ChatProvider>
      </MCPProvider>
    </FluentProvider>
  );
}

// Main content component that uses our specialized contexts
const ChatContent = ({ currentTheme, currentThemeName, handleThemeChange }) => {
  const styles = useStyles();
  const [showAutoInitBanner, setShowAutoInitBanner] = useState(false);
  
  // Get message-related state and functions from MessageContext
  const { 
    messages, 
    input, 
    setInput, 
    error, 
    setError, 
    handleSend, 
    handleClearChat,
    isLoading,
    selectedImage,
    setSelectedImage,
    selectedVoice,
    setSelectedVoice,
    isInitializing
  } = useMessage();
  
  // Get configuration state from ConfigurationContext
  const {
    isConfigured,
    configLoading,
    refreshConfiguration,
    memorySettings,
    autoInitialized,
    useAiAgentService
  } = useConfiguration();
  
  // Get UI-related state from UIStateContext
  const {
    isAdminPanelOpen,
    setIsAdminPanelOpen
  } = useUIState();
  
  // Get token usage metrics from TokenContext
  const {
    tokenUsage
  } = useToken();

  // Show auto-initialization banner when connection is automatically established
  useEffect(() => {
    if (autoInitialized && isConfigured) {
      setShowAutoInitBanner(true);
      // Hide the banner after 6 seconds (animation takes 5s plus 1s buffer)
      const timer = setTimeout(() => {
        setShowAutoInitBanner(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [autoInitialized, isConfigured]);

  // Check if we should show any error/warning message
  const showWarningOrError = (!isConfigured && !configLoading) || error;

  return (
    <div className={styles.root}>
      <ChatHeader 
        onClearChat={handleClearChat} 
        onOpenSettings={() => setIsAdminPanelOpen(true)}
        appTitle={APP_CONFIG.title}
        appVersion={APP_CONFIG.version}
      />
      
      {showAutoInitBanner && (
        <div className={styles.autoInitBanner}>
          <Text>Configuration found and connection automatically initialized.</Text>
        </div>
      )}
      
      <div className={styles.chatContent}>
        {!isConfigured && !configLoading && (
          <ErrorDisplay 
            message="Not configured. Please configure it in the settings menu."
            type="warning"
            actionLabel="Open Settings"
            onAction={() => setIsAdminPanelOpen(true)}
          />
        )}
        
        <ChatMessages 
          messages={messages} 
          error={error} 
          isLoading={isLoading}
          isInitializing={isInitializing}
        />
        
        <MessageInput 
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          isConfigured={isConfigured}
          setError={setError}
          isLoading={isLoading}
        />
        
        {/* Add dimming overlay when there's a warning or error message */}
        {showWarningOrError && <div className={styles.dimOverlay} />}
      </div>
      
      <Footer 
        isConfigured={isConfigured}
        useAiAgentService={useAiAgentService}
        currentTheme={currentTheme}
        currentThemeName={currentThemeName}
        handleThemeChange={handleThemeChange}
        memorySettings={memorySettings}
        tokenUsage={tokenUsage}
      />
      
      <AdminPanel 
        open={isAdminPanelOpen} 
        onOpenChange={(e, data) => {
          // Handle both cases: when called from the Dialog (with e, data) and when called directly (with boolean)
          if (typeof e === 'boolean') {
            setIsAdminPanelOpen(e);
          } else if (data && typeof data.open === 'boolean') {
            setIsAdminPanelOpen(data.open);
          }
        }}
        onConfigSaved={refreshConfiguration}
      />
    </div>
  );
};

export default App;