import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogSurface, 
  DialogTitle, 
  DialogBody,
  DialogActions,
  Button,
  makeStyles,
  tokens,
  Text
} from '@fluentui/react-components';
import { SectionHeading } from './SectionHeading';
import { ServerItem } from './ServerItem';
import { AddServerForm } from './AddServerForm';
import { useMCPClient } from '../../hooks/useMCPClient';
import { StatusMessage } from './StatusMessage';

const useStyles = makeStyles({
  modalContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px 0',
  },
  description: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '16px',
  },
  serverList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px',
  },
  statusMessage: {
    marginTop: '12px',
  }
});

export const MCPConfigModal = ({ isOpen, onClose }) => {
  const styles = useStyles();
  const [status, setStatus] = useState({ message: '', type: '' });
  
  // Use our custom hook to manage MCP client and servers
  const { 
    servers, 
    addServer, 
    toggleServer, 
    removeServer, 
    updateServer,
    checkMCPHealth,
  } = useMCPClient();
  
  const [editingServer, setEditingServer] = useState(null);
  
  // Start editing a server
  const startEditing = (id) => {
    setEditingServer(id);
  };
  
  // Stop editing servers
  const stopEditing = () => {
    setEditingServer(null);
  };
  
  // Check health of a specific server
  const handleCheckServerHealth = async (serverId) => {
    setStatus({ message: 'Checking server health...', type: 'info' });
    
    try {
      const healthResults = await checkMCPHealth();
      if (healthResults.length > 0) {
        const serverResult = healthResults.find(result => parseInt(result.id) === serverId);
        if (serverResult) {
          if (serverResult.status === 'healthy') {
            setStatus({ 
              message: `Server ${serverResult.name} is healthy!`, 
              type: 'success' 
            });
          } else {
            setStatus({ 
              message: `Server ${serverResult.name} is unhealthy: ${serverResult.error || 'unknown error'}`, 
              type: 'error' 
            });
          }
        }
      }
    } catch (error) {
      setStatus({ message: `Health check failed: ${error.message}`, type: 'error' });
    }
  };
  
  // Check health of all servers
  const handleCheckAllServersHealth = async () => {
    setStatus({ message: 'Checking all servers health...', type: 'info' });
    
    try {
      const healthResults = await checkMCPHealth();
      const healthyCount = healthResults.filter(result => result.status === 'healthy').length;
      
      if (healthyCount === healthResults.length) {
        setStatus({ 
          message: `All ${healthResults.length} servers are healthy!`, 
          type: 'success' 
        });
      } else {
        setStatus({ 
          message: `${healthyCount} of ${healthResults.length} servers are healthy.`, 
          type: 'warning' 
        });
      }
    } catch (error) {
      setStatus({ message: `Health check failed: ${error.message}`, type: 'error' });
    }
  };
  
  // Handler for the save button
  const handleSave = () => {
    // In a real implementation, you might want to persist changes to a backend
    setStatus({ message: 'Configuration saved successfully!', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1000);
  };
  
  // Clear status message when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus({ message: '', type: '' });
      stopEditing();
    }
  }, [isOpen]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(e, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh' }}>
        <DialogTitle>Model Context Protocol (MCP) Configuration</DialogTitle>
        <DialogBody>
          <div className={styles.modalContent}>
            <Text className={styles.description}>
              Configure Model Context Protocol (MCP) servers to enhance your chat experience by providing additional context to your conversations.
            </Text>
            
            {status.message && (
              <div className={styles.statusMessage}>
                <StatusMessage message={status.message} type={status.type} />
              </div>
            )}
            
            <SectionHeading title="MCP Servers" />
            
            <div className={styles.serverList}>
              {servers.map(server => (
                <ServerItem
                  key={server.id}
                  server={server}
                  isEditing={editingServer === server.id}
                  onToggle={toggleServer}
                  onRemove={removeServer}
                  onEdit={startEditing}
                  onSave={updateServer}
                  onCancelEdit={stopEditing}
                  onCheckHealth={handleCheckServerHealth}
                />
              ))}
            </div>
            
            <AddServerForm onAddServer={addServer} />
          </div>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={handleCheckAllServersHealth}>
            Check All Servers Health
          </Button>
          <Button appearance="primary" onClick={handleSave}>
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