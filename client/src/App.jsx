import { FluentProvider, tokens } from '@fluentui/react-components';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChatMessages } from './components/chat/ChatMessages';
import { MessageInput } from './components/chat/MessageInput';
import { Footer } from './components/chat/Footer';
import { AdminPanel } from './components/AdminPanel';
import { ErrorDisplay } from './components/ErrorDisplay';
import { useTheme } from './hooks/useTheme';
import { ChatProvider, useChat } from './contexts/ChatContext';
import { makeStyles } from '@fluentui/react-components';
import { Text } from '@fluentui/react-components';

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
      <ChatProvider>
        <ChatContent 
          currentTheme={currentTheme}
          currentThemeName={currentThemeName}
          handleThemeChange={handleThemeChange}
        />
      </ChatProvider>
    </FluentProvider>
  );
}

// Main content component that uses the chat context
const ChatContent = ({ currentTheme, currentThemeName, handleThemeChange }) => {
  const styles = useStyles();
  const { 
    messages, 
    input, 
    setInput, 
    error, 
    setError, 
    isConfigured, 
    refreshConfiguration,
    selectedImage,
    setSelectedImage,
    selectedVoice,
    setSelectedVoice,
    isAdminPanelOpen, 
    setIsAdminPanelOpen, 
    handleSend, 
    handleClearChat,
    isLoading,
    configLoading,
    memorySettings,
    tokenUsage,
    isInitializing
  } = useChat();

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