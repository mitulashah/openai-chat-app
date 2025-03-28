import { useState, useEffect, useRef } from 'react';
import {
  FluentProvider,
  Button,
  Input,
  Text,
  makeStyles,
  shorthands,
  tokens,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuButton,
} from '@fluentui/react-components';
import { 
  ChatRegular, 
  SendRegular,
  NavigationRegular,
  SettingsRegular,
  ImageRegular,
} from '@fluentui/react-icons';
import { AdminPanel } from './components/AdminPanel';
import { themes } from './theme';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  chatContainer: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    padding: '20px',
    ...shorthands.gap('10px'),
  },
  messageContainer: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    padding: '10px',
    borderRadius: '8px',
    ...shorthands.gap('5px'),
  },
  messageContent: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  messageImage: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    objectFit: 'contain',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colorNeutralBackground3,
  },
  inputContainer: {
    display: 'flex',
    padding: '20px',
    ...shorthands.gap('10px'),
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    alignItems: 'center',
  },
  input: {
    flexGrow: 1,
  },
  error: {
    color: tokens.colorPaletteRedForeground1,
    padding: '10px',
    textAlign: 'center',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('20px'),
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('20px'),
  },
  themeSelector: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  themePreview: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  statusText: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statusDotConfigured: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  statusDotUnconfigured: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  imagePreview: {
    maxWidth: '100px',
    maxHeight: '100px',
    borderRadius: '4px',
    objectFit: 'contain',
    marginTop: '8px',
  },
});

const THEME_STORAGE_KEY = 'app-theme';

/**
 * Main App component that handles the chat interface and theme management
 */
function App() {
  console.log('App component rendering');
  const styles = useStyles();
  // State management for messages, input, admin panel, and configuration
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(themes.light);
  const [currentThemeName, setCurrentThemeName] = useState('light');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Effect hook to check configuration and load theme on component mount
  useEffect(() => {
    console.log('App useEffect running');
    checkConfiguration();
    loadTheme();
  }, []);

  /**
   * Loads the saved theme preference from localStorage
   * Falls back to light theme if no preference is saved
   */
  const loadTheme = () => {
    console.log('Loading theme');
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme && themes[savedTheme]) {
      console.log('Setting theme:', savedTheme);
      setCurrentTheme(themes[savedTheme]);
      setCurrentThemeName(savedTheme);
    } else {
      console.log('Using default light theme');
      setCurrentTheme(themes.light);
      setCurrentThemeName('light');
    }
  };

  /**
   * Checks if Azure OpenAI is configured by calling the health endpoint
   * Updates the configuration state based on the response
   */
  const checkConfiguration = async () => {
    try {
      console.log('Checking configuration');
      const response = await fetch('/api/health');
      const data = await response.json();
      console.log('Configuration status:', data);
      setIsConfigured(data.configured);
    } catch (error) {
      console.error('Error checking configuration:', error);
    }
  };

  /**
   * Handles image file selection
   */
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedImage(file);
      setError('');
    }
  };

  /**
   * Handles sending a new message to the chat
   * Adds the message to the UI immediately and then sends it to the server
   */
  const handleSend = async () => {
    if (!input.trim() && !selectedImage) return;

    // Create FormData for multipart/form-data
    const formData = new FormData();
    formData.append('message', input);
    if (selectedImage) {
      formData.append('image', selectedImage);
    }

    // Create and add user message to the chat
    const userMessage = {
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setError('');

    try {
      // Send message to the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add AI response to the chat
      const aiMessage = {
        text: data.message,
        sender: 'ai',
        timestamp: data.timestamp,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
    }
  };

  /**
   * Handles theme changes from the admin panel
   * Updates the current theme and saves the preference
   */
  const handleThemeChange = (e, data) => {
    const newThemeName = data.value;
    console.log('Theme changing to:', newThemeName);
    setCurrentTheme(themes[newThemeName]);
    setCurrentThemeName(newThemeName);
    localStorage.setItem(THEME_STORAGE_KEY, newThemeName);
  };

  console.log('Rendering App with theme:', currentTheme);

  // Render the main application UI
  return (
    <FluentProvider theme={currentTheme}>
      <div className={styles.root}>
        {/* Header with menu and title */}
        <div className={styles.header}>
          <Menu>
            <MenuTrigger>
              <MenuButton icon={<NavigationRegular />}>Menu</MenuButton>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<SettingsRegular />} onClick={() => setIsAdminPanelOpen(true)}>
                  Settings
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <Text size={500} weight="semibold">AI Chat</Text>
        </div>

        {/* Configuration warning */}
        {!isConfigured && (
          <Text className={styles.error}>
            Azure OpenAI is not configured. Please configure it in the settings menu.
          </Text>
        )}

        {/* Chat messages container */}
        <div className={styles.chatContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.messageContainer} ${
                message.sender === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageContent}>
                {message.text && <Text>{message.text}</Text>}
                {message.image && (
                  <img 
                    src={message.image} 
                    alt="Attached" 
                    className={styles.messageImage}
                  />
                )}
                <Text size={200} style={{ opacity: 0.7 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Text>
              </div>
            </div>
          ))}
          {error && <Text className={styles.error}>{error}</Text>}
        </div>

        {/* Message input area */}
        <div className={styles.inputContainer}>
          <Input
            className={styles.input}
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={!isConfigured}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          <Button
            appearance="secondary"
            icon={<ImageRegular />}
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConfigured}
          />
          {selectedImage && (
            <div style={{ position: 'relative' }}>
              <img 
                src={URL.createObjectURL(selectedImage)} 
                alt="Preview" 
                className={styles.imagePreview}
              />
              <Button
                appearance="subtle"
                onClick={() => setSelectedImage(null)}
                style={{ 
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  padding: '2px',
                  minWidth: '24px',
                  height: '24px',
                }}
              >
                ×
              </Button>
            </div>
          )}
          <Button
            appearance="primary"
            icon={<SendRegular />}
            onClick={handleSend}
            disabled={!isConfigured}
          >
            Send
          </Button>
        </div>

        {/* Footer with status and theme selector */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            <div className={styles.statusText}>
              <div className={`${styles.statusDot} ${isConfigured ? styles.statusDotConfigured : styles.statusDotUnconfigured}`} />
              <Text size={200}>
                {isConfigured ? 'Azure OpenAI Configured' : 'Azure OpenAI Not Configured'}
              </Text>
            </div>
          </div>
          <div className={styles.footerRight}>
            <div className={styles.themeSelector}>
              <Text size={200}>Theme:</Text>
              <Menu>
                <MenuTrigger>
                  <MenuButton>
                    {currentThemeName === 'light' ? 'Light Dracula' : 'Dark Dracula'}
                  </MenuButton>
                </MenuTrigger>
                <MenuPopover>
                  <MenuList>
                    <MenuItem onClick={() => handleThemeChange(null, { value: 'light' })}>
                      Light Dracula
                    </MenuItem>
                    <MenuItem onClick={() => handleThemeChange(null, { value: 'dark' })}>
                      Dark Dracula
                    </MenuItem>
                  </MenuList>
                </MenuPopover>
              </Menu>
              <div 
                className={styles.themePreview}
                style={{ backgroundColor: currentTheme.colorNeutralBackground1 }}
              />
            </div>
          </div>
        </div>

        {/* Admin panel for configuration */}
        <AdminPanel 
          open={isAdminPanelOpen} 
          onOpenChange={setIsAdminPanelOpen}
        />
      </div>
    </FluentProvider>
  );
}

export default App; 