import { FluentProvider, tokens } from '@fluentui/react-components';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChatMessages } from './components/chat/ChatMessages';
import { MessageInput } from './components/chat/MessageInput';
import { Footer } from './components/chat/Footer';
import { AdminPanel } from './components/AdminPanel';
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
    tokenUsage
  } = useChat();

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
          <Text className={styles.error}>
            Azure OpenAI is not configured. Please configure it in the settings menu.
          </Text>
        )}
        
        <ChatMessages 
          messages={messages} 
          error={error} 
          isLoading={isLoading}
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
        onClearChat={handleClearChat}
        memorySettings={memorySettings}
        tokenUsage={tokenUsage}
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