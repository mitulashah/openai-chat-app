import React, { useState } from 'react';
import { 
  Button, 
  Input, 
  Label, 
  makeStyles,
  Dropdown,
  Option,
  Field
} from '@fluentui/react-components';
import { KeyRegular } from '@fluentui/react-icons';
import { SectionHeading } from './SectionHeading';
import { useSettingsStyles } from './SettingsStyles';

const useStyles = makeStyles({
  fullWidth: {
    width: '100%',
  },
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  authSection: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid var(--colorNeutralStroke2)',
  }
});

/**
 * Component for adding a new MCP server
 */
export const AddServerForm = ({ onAddServer }) => {
  const styles = useStyles();
  const settingsStyles = useSettingsStyles();
  
  const [newServerUrl, setNewServerUrl] = useState('');
  const [newServerName, setNewServerName] = useState('');
  const [authType, setAuthType] = useState('none');
  const [authConfig, setAuthConfig] = useState({});
  
  const handleAddServer = () => {
    // Return early if fields are empty
    if (!newServerName || !newServerUrl) return;
    
    // Call the provided callback with the new server data including auth info
    const success = onAddServer(newServerName, newServerUrl, authType, authConfig);
    
    // Clear the form if successful
    if (success) {
      setNewServerName('');
      setNewServerUrl('');
      setAuthType('none');
      setAuthConfig({});
    }
  };

  const handleAuthConfigChange = (key, value) => {
    setAuthConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Render different auth configuration UI based on auth type
  const renderAuthConfig = () => {
    switch (authType) {
      case 'apiKey':
        return (
          <>
            <Field label="API Key" required>
              <Input
                type="password"
                value={authConfig.apiKey || ''}
                onChange={(e) => handleAuthConfigChange('apiKey', e.target.value)}
                contentAfter={<KeyRegular />}
              />
            </Field>
            <Field label="Header Name">
              <Input
                value={authConfig.headerName || 'Authorization'}
                onChange={(e) => handleAuthConfigChange('headerName', e.target.value)}
              />
            </Field>
          </>
        );
        
      case 'basic':
        return (
          <>
            <Field label="Username" required>
              <Input
                value={authConfig.username || ''}
                onChange={(e) => handleAuthConfigChange('username', e.target.value)}
              />
            </Field>
            <Field label="Password" required>
              <Input
                type="password"
                value={authConfig.password || ''}
                onChange={(e) => handleAuthConfigChange('password', e.target.value)}
              />
            </Field>
          </>
        );
        
      case 'bearer':
        return (
          <Field label="Token" required>
            <Input
              type="password"
              value={authConfig.token || ''}
              onChange={(e) => handleAuthConfigChange('token', e.target.value)}
              contentAfter={<KeyRegular />}
            />
          </Field>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className={styles.formContainer}>
      <SectionHeading title="Add New MCP Server" />
      
      <div className={settingsStyles.inputGroup}>
        <Label htmlFor="server-name">Server Name</Label>
        <Input 
          id="server-name"
          value={newServerName}
          onChange={(e) => setNewServerName(e.target.value)}
          placeholder="Enter server name"
          className={styles.fullWidth}
        />
      </div>
      
      <div className={settingsStyles.inputGroup}>
        <Label htmlFor="server-url">Server URL</Label>
        <Input 
          id="server-url"
          value={newServerUrl}
          onChange={(e) => setNewServerUrl(e.target.value)}
          placeholder="https://mcp-server.example.com"
          className={styles.fullWidth}
        />
      </div>
      
      <div className={styles.authSection}>
        <Field label="Authentication">
          <Dropdown 
            value={authType === 'none' ? 'No Authentication' : 
                  authType === 'apiKey' ? 'API Key' :
                  authType === 'basic' ? 'Basic Auth' : 'Bearer Token'}
            onOptionSelect={(_, data) => {
              const newAuthType = data.optionValue === 'No Authentication' ? 'none' : 
                              data.optionValue === 'API Key' ? 'apiKey' :
                              data.optionValue === 'Basic Auth' ? 'basic' : 'bearer';
              setAuthType(newAuthType);
            }}
          >
            <Option value="No Authentication">No Authentication</Option>
            <Option value="API Key">API Key</Option>
            <Option value="Basic Auth">Basic Auth</Option>
            <Option value="Bearer Token">Bearer Token</Option>
          </Dropdown>
        </Field>
        
        {renderAuthConfig()}
      </div>
      
      <Button appearance="primary" onClick={handleAddServer}>
        Add Server
      </Button>
    </div>
  );
};