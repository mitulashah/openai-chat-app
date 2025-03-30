import React from 'react';
import { 
  Dialog, 
  DialogTrigger, 
  DialogSurface, 
  DialogTitle, 
  DialogContent,
  DialogBody,
  DialogActions,
  Button,
  makeStyles,
  tokens,
  Input,
  Switch,
  Label,
  Text
} from '@fluentui/react-components';
import { SectionHeading } from './SectionHeading';
import { TextSetting } from './TextSetting';
import { useSettingsStyles } from './SettingsStyles';
import { EditRegular, CheckmarkRegular, DismissRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px 0',
  },
  fullWidth: {
    width: '100%',
  },
  description: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '16px',
  },
  serverItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    borderRadius: '4px',
    backgroundColor: tokens.colorNeutralBackground3,
    marginBottom: '12px',
  },
  serverHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  },
  editActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
  }
});

export const MCPConfigModal = ({ isOpen, onClose }) => {
  const styles = useStyles();
  const settingsStyles = useSettingsStyles();
  
  // Sample state for MCP configuration
  const [servers, setServers] = React.useState([
    { id: 1, name: 'Default MCP Server', url: 'https://mcp-server.example.com', enabled: true }
  ]);
  const [newServerUrl, setNewServerUrl] = React.useState('');
  const [newServerName, setNewServerName] = React.useState('');
  const [editingServer, setEditingServer] = React.useState(null);
  const [editName, setEditName] = React.useState('');
  const [editUrl, setEditUrl] = React.useState('');
  
  const handleAddServer = () => {
    if (newServerUrl && newServerName) {
      setServers([
        ...servers,
        { 
          id: Date.now(), 
          name: newServerName, 
          url: newServerUrl, 
          enabled: true 
        }
      ]);
      setNewServerUrl('');
      setNewServerName('');
    }
  };
  
  const handleToggleServer = (id) => {
    setServers(servers.map(server => 
      server.id === id ? { ...server, enabled: !server.enabled } : server
    ));
  };
  
  const handleRemoveServer = (id) => {
    setServers(servers.filter(server => server.id !== id));
  };

  const handleEditServer = (server) => {
    setEditingServer(server.id);
    setEditName(server.name);
    setEditUrl(server.url);
  };

  const handleSaveEdit = (id) => {
    setServers(servers.map(server => 
      server.id === id ? { ...server, name: editName, url: editUrl } : server
    ));
    setEditingServer(null);
  };

  const handleCancelEdit = () => {
    setEditingServer(null);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(e, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh' }}>
        <DialogTitle>Model Context Protocol (MCP) Configuration</DialogTitle>
        <DialogBody>
          <div className={styles.modalContent}>
            <Text className={styles.description}>
              Configure Model Context Protocol (MCP) servers to enhance your chat experience by providing additional context to your conversations.
            </Text>
            
            <SectionHeading title="MCP Servers" />
            
            {servers.map(server => (
              <div key={server.id} className={styles.serverItem}>
                {editingServer === server.id ? (
                  // Edit mode
                  <>
                    <div className={settingsStyles.inputGroup}>
                      <Label htmlFor={`edit-name-${server.id}`}>Server Name</Label>
                      <Input 
                        id={`edit-name-${server.id}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={styles.fullWidth}
                      />
                    </div>
                    <div className={settingsStyles.inputGroup}>
                      <Label htmlFor={`edit-url-${server.id}`}>Server URL</Label>
                      <Input 
                        id={`edit-url-${server.id}`}
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className={styles.fullWidth}
                      />
                    </div>
                    <div className={styles.editActions}>
                      <Button 
                        appearance="primary" 
                        icon={<CheckmarkRegular />}
                        onClick={() => handleSaveEdit(server.id)}
                      >
                        Save
                      </Button>
                      <Button 
                        appearance="secondary" 
                        icon={<DismissRegular />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  // View mode
                  <>
                    <div className={styles.serverHeader}>
                      <Text weight="semibold">{server.name}</Text>
                      <Switch 
                        checked={server.enabled}
                        onChange={() => handleToggleServer(server.id)}
                        label="Enabled"
                      />
                    </div>
                    <Text>{server.url}</Text>
                    <div className={styles.buttonContainer}>
                      <Button 
                        appearance="subtle" 
                        icon={<EditRegular />}
                        onClick={() => handleEditServer(server)}
                      >
                        Edit
                      </Button>
                      <Button 
                        appearance="subtle" 
                        onClick={() => handleRemoveServer(server.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            
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
            
            <Button appearance="primary" onClick={handleAddServer}>
              Add Server
            </Button>
          </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="primary" onClick={onClose}>
            Save
          </Button>
          <Button appearance="secondary" onClick={onClose}>
            Cancel
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};