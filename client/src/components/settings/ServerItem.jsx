import React, { useState, useEffect } from 'react';
import { 
  Card, 
  makeStyles, 
  tokens, 
  Button, 
  Input, 
  Text,
  Dropdown,
  Option,
  Field,
  mergeClasses,
  Badge
} from '@fluentui/react-components';
import { EditRegular, DeleteRegular, CheckmarkCircleRegular, DismissCircleRegular, ArrowSyncRegular, QuestionCircleRegular, KeyRegular } from '@fluentui/react-icons';
import { useSettingsStyles } from './SettingsStyles';
import { useTheme } from '../../hooks/useTheme';
import { StyledSwitch } from './StyledSwitch';

const useStyles = makeStyles({
  serverCard: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    boxShadow: tokens.shadow4,
    transition: 'all 0.2s ease',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  serverHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: '1',
    overflow: 'hidden',
  },
  serverDetails: {
    overflow: 'hidden',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  serverName: {
    fontWeight: '600',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '14px',
  },
  serverUrl: {
    color: tokens.colorNeutralForeground3,
    fontSize: '12px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block', // Ensure it's a block element
    lineHeight: '1.2',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  editActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px',
  },
  statusIndicator: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    marginRight: '0',
    flexShrink: 0,
  },
  statusHealthy: {
    backgroundColor: tokens.colorPaletteGreenForeground1,
  },
  statusUnhealthy: {
    backgroundColor: tokens.colorPaletteRedForeground1,
  },
  statusUnknown: {
    backgroundColor: tokens.colorPaletteNeutralForeground3,
  },
  statusDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  serverStatusRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
  },
  authBadge: {
    fontSize: '10px',
  },
  authSection: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  fullWidth: {
    width: '100%',
  },
  infoRow: {
    display: 'flex', 
    alignItems: 'center',
    gap: '6px',
    flexShrink: 0, 
  }
});

/**
 * Get status indicator class based on health status
 * @param {string} health - Health status
 * @returns {string} CSS class for the status indicator
 */
const getStatusClass = (health) => {
  switch (health) {
    case 'healthy':
      return 'statusHealthy';
    case 'unhealthy':
      return 'statusUnhealthy';
    default:
      return 'statusUnknown';
  }
};

/**
 * Get status icon based on health status
 * @param {string} health - Health status
 * @returns {React.ReactNode} Icon component
 */
const getStatusIcon = (health) => {
  switch (health) {
    case 'healthy':
      return <CheckmarkCircleRegular />;
    case 'unhealthy':
      return <DismissCircleRegular />;
    default:
      return <QuestionCircleRegular />;
  }
};

/**
 * Component for displaying and editing an individual MCP server
 */
export const ServerItem = ({ 
  server, 
  isEditing, 
  onToggle, 
  onRemove, 
  onEdit, 
  onSave, 
  onCancelEdit,
  onCheckHealth
}) => {
  const styles = useStyles();
  const settingsStyles = useSettingsStyles();
  const { currentThemeName } = useTheme();
  
  const [editName, setEditName] = useState(server.name);
  const [editUrl, setEditUrl] = useState(server.url);
  const [authType, setAuthType] = useState(server.authType || 'none');
  const [authConfig, setAuthConfig] = useState(server.authConfig || {});
  
  // Determine the switch color based on theme
  const getSwitchColor = () => {
    // Check if using Nord theme
    const isNord = currentThemeName.includes('Nord');
    
    // Return the appropriate green color based on theme
    return isNord ? '#A3BE8C' : '#50FA7B';
  };
  
  // Reset form values when server or editing state changes
  useEffect(() => {
    if (isEditing) {
      setEditName(server.name);
      setEditUrl(server.url);
      setAuthType(server.authType || 'none');
      setAuthConfig(server.authConfig || {});
    }
  }, [isEditing, server]);
  
  const handleAuthConfigChange = (field, value) => {
    setAuthConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    onSave(server.id, {
      name: editName,
      url: editUrl,
      authType,
      authConfig
    });
    onCancelEdit();
  };
  
  // Render different authentication configuration based on selected type
  const renderAuthConfig = () => {
    switch (authType) {
      case 'apiKey':
        return (
          <div className={styles.authSection}>
            <Field label="API Key" required>
              <Input
                type="password"
                value={authConfig.apiKey || ''}
                onChange={(e) => handleAuthConfigChange('apiKey', e.target.value)}
              />
            </Field>
            <Field label="Header Name">
              <Input
                value={authConfig.headerName || 'Authorization'}
                onChange={(e) => handleAuthConfigChange('headerName', e.target.value)}
              />
            </Field>
          </div>
        );
        
      case 'basic':
        return (
          <div className={styles.authSection}>
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
          </div>
        );
        
      case 'bearer':
        return (
          <div className={styles.authSection}>
            <Field label="Bearer Token" required>
              <Input
                type="password"
                value={authConfig.token || ''}
                onChange={(e) => handleAuthConfigChange('token', e.target.value)}
              />
            </Field>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Get appropriate auth badge color
  const getAuthBadgeAppearance = () => {
    switch (authType) {
      case 'apiKey': 
        return 'brand';
      case 'basic': 
        return 'success';
      case 'bearer': 
        return 'severe';
      default:
        return 'neutral';
    }
  };

  return (
    <Card className={styles.serverCard}>
      {!isEditing ? (
        <>
          <div className={styles.serverHeader}>
            <div className={styles.serverInfo}>
              <div 
                className={mergeClasses(
                  styles.statusIndicator, 
                  styles[getStatusClass(server.health)]
                )} 
                title={server.health === 'healthy' ? 'Healthy' : 
                      server.health === 'unhealthy' ? 'Unhealthy' : 'Status Unknown'}
              />
              <div className={styles.serverDetails}>
                <Text className={styles.serverName}>{server.name}</Text>
                <Text className={styles.serverUrl}>{server.url}</Text>
              </div>
            </div>
            
            <div className={styles.actions}>
              <Button 
                icon={<ArrowSyncRegular />} 
                appearance="subtle"
                aria-label="Check health"
                title="Check health"
                onClick={() => onCheckHealth(server.id)}
                size="small"
              />
              <StyledSwitch 
                checked={server.enabled} 
                onChange={() => onToggle(server.id)}
                label={{ hidden: true }}
                size="small"
                variant="success"
              />
              <Button 
                icon={<EditRegular />} 
                appearance="subtle"
                aria-label="Edit"
                onClick={() => onEdit(server.id)}
                size="small"
              />
              <Button 
                icon={<DeleteRegular />} 
                appearance="subtle"
                aria-label="Remove"
                onClick={() => onRemove(server.id)}
                size="small"
              />
            </div>
          </div>
          
          <div className={styles.serverStatusRow}>
            <div className={styles.statusDisplay}>
              {getStatusIcon(server.health)} 
              <span style={{ marginLeft: '2px' }}>
                {server.health === 'healthy' ? 'Healthy' : 
                server.health === 'unhealthy' ? 'Unhealthy' : 'Status Unknown'}
              </span>
            </div>
            
            {server.authType && server.authType !== 'none' && (
              <div className={styles.infoRow}>
                <KeyRegular fontSize={12} />
                <Badge 
                  appearance={getAuthBadgeAppearance()} 
                  className={styles.authBadge} 
                  size="small"
                >
                  {server.authType === 'apiKey' ? 'API Key' : 
                   server.authType === 'basic' ? 'Basic Auth' : 
                   server.authType === 'bearer' ? 'Bearer Token' : 'None'}
                </Badge>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className={styles.editForm}>
          <Field label="Server Name" required>
            <Input 
              value={editName} 
              onChange={(e) => setEditName(e.target.value)}
              className={styles.fullWidth}
              size="small"
            />
          </Field>
          
          <Field label="Server URL" required>
            <Input 
              value={editUrl} 
              onChange={(e) => setEditUrl(e.target.value)}
              placeholder="https://mcp-server.example.com"
              className={styles.fullWidth}
              size="small"
            />
          </Field>
          
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
              size="small"
            >
              <Option value="No Authentication">No Authentication</Option>
              <Option value="API Key">API Key</Option>
              <Option value="Basic Auth">Basic Auth</Option>
              <Option value="Bearer Token">Bearer Token</Option>
            </Dropdown>
          </Field>
          
          {renderAuthConfig()}
          
          <div className={styles.editActions}>
            <Button appearance="secondary" onClick={onCancelEdit} size="small">
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleSave} size="small">
              Save
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};