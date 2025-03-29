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
  },
  // New theme transition overlay
  themeTransitionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 9999,
    opacity: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transition: 'opacity 300ms ease',
  },
  themeTransitioning: {
    opacity: 0.15,
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
  const { currentTheme, currentThemeName, handleThemeChange, isTransitioning } = useTheme();
  
  return (
    <FluentProvider theme={currentTheme}>
      <ChatProvider>
        <ChatContent 
          currentTheme={currentTheme}
          currentThemeName={currentThemeName}
          handleThemeChange={handleThemeChange}
          isTransitioning={isTransitioning}
        />
      </ChatProvider>
    </FluentProvider>
  );
}

// Main content component that uses the chat context
const ChatContent = ({ currentTheme, currentThemeName, handleThemeChange, isTransitioning }) => {
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

  return (
    <div className={styles.root}>
      {/* Theme transition overlay */}
      <div className={`${styles.themeTransitionOverlay} ${isTransitioning ? styles.themeTransitioning : ''}`} />
      
      <ChatHeader 
        onClearChat={handleClearChat} 
        onOpenSettings={() => setIsAdminPanelOpen(true)}
        appTitle={APP_CONFIG.title}
        appVersion={APP_CONFIG.version}
      />
      
      <div className={styles.chatContent}>
        {!isConfigured && !configLoading && (
          <ErrorDisplay 
            message="Azure OpenAI is not configured. Please configure it in the settings menu."
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
      </div>
      
      <Footer 
        isConfigured={isConfigured}
        currentTheme={currentTheme}
        currentThemeName={currentThemeName}
        handleThemeChange={handleThemeChange}
        memorySettings={memorySettings}
        tokenUsage={tokenUsage}
        isTransitioning={isTransitioning}
      />
      
      <AdminPanel 
        open={isAdminPanelOpen} 
        onOpenChange={setIsAdminPanelOpen}
        onConfigSaved={() => refreshConfiguration()}
      />
    </div>
  );
};

export default App;