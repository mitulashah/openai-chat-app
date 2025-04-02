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
  Text,
  Spinner,
  Tab,
  TabList,
  Badge
} from '@fluentui/react-components';
import { SectionHeading } from './SectionHeading';
import { ServerItem } from './ServerItem';
import { AddServerForm } from './AddServerForm';
import { useMCP } from '../../contexts/MCPContext';
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
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: '4px',
  },
  tabContent: {
    marginTop: '16px',
  },
  capabilitiesTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
    fontSize: '14px',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '8px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  tableCell: {
    padding: '8px 12px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  successBadge: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  errorBadge: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
  },
  capabilityBadge: {
    marginRight: '4px',
    marginBottom: '4px',
  }
});

export const MCPConfigModal = ({ isOpen, onClose }) => {
  const styles = useStyles();
  const [status, setStatus] = useState({ message: '', type: '' });
  const [selectedTab, setSelectedTab] = useState('servers');
  const [serverCapabilities, setServerCapabilities] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Use the MCP context hook instead of the direct client hook
  const { 
    servers, 
    addServer, 
    toggleServer, 
    removeServer, 
    updateServer,
    checkHealth,
    getCapabilities,
    initializeAllClients,
    isInitialized,
    isProcessing
  } = useMCP();
  
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
    setLoading(true);
    
    try {
      const healthResults = await checkHealth();
      if (healthResults.length > 0) {
        const serverResult = healthResults.find(result => parseInt(result.id) === serverId);
        if (serverResult) {
          if (serverResult.success) {
            setStatus({ 
              message: `Server ${serverResult.name} is healthy!`, 
              type: 'success' 
            });
          } else {
            setStatus({ 
              message: `Server ${serverResult.name} is unhealthy: ${serverResult.error?.message || 'unknown error'}`, 
              type: 'error' 
            });
          }
        }
      }
    } catch (error) {
      setStatus({ message: `Health check failed: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  // Check health of all servers
  const handleCheckAllServersHealth = async () => {
    if (servers.length === 0) {
      setStatus({ message: 'No servers to check.', type: 'info' });
      return;
    }
    
    setStatus({ message: 'Checking all servers health...', type: 'info' });
    setLoading(true);
    
    try {
      const healthResults = await checkHealth();
      const healthyCount = healthResults.filter(result => result.success).length;
      
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
    } finally {
      setLoading(false);
    }
  };

  // Get capabilities from all servers
  const handleGetCapabilities = async () => {
    if (servers.length === 0) {
      setStatus({ message: 'No servers to check for capabilities.', type: 'info' });
      return;
    }
    
    setLoading(true);
    setStatus({ message: 'Fetching server capabilities...', type: 'info' });
    
    try {
      // Make sure clients are initialized first
      await initializeAllClients();
      const capabilities = await getCapabilities();
      
      setServerCapabilities(capabilities);
      
      const successCount = capabilities.filter(result => result.success).length;
      
      if (successCount === capabilities.length) {
        setStatus({ 
          message: `Retrieved capabilities from all ${capabilities.length} servers.`, 
          type: 'success' 
        });
      } else {
        setStatus({ 
          message: `Retrieved capabilities from ${successCount} of ${capabilities.length} servers.`, 
          type: 'warning' 
        });
      }
    } catch (error) {
      setStatus({ message: `Failed to get capabilities: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
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

  // Load capabilities when the modal opens and when servers change
  useEffect(() => {
    if (isOpen && servers.length > 0 && !serverCapabilities) {
      handleGetCapabilities();
    }
  }, [isOpen, servers, serverCapabilities]);
  
  // Clear status message when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStatus({ message: '', type: '' });
      stopEditing();
    }
  }, [isOpen]);

  // Render capability badges
  const renderCapabilityBadges = (capabilities) => {
    if (!capabilities) return null;
    
    const badges = [];
    
    if (capabilities.resources) {
      badges.push(
        <Badge 
          key="resources"
          appearance="filled" 
          color="informative" 
          className={styles.capabilityBadge}
        >
          Resources
        </Badge>
      );
    }
    
    if (capabilities.prompts) {
      badges.push(
        <Badge 
          key="prompts"
          appearance="filled" 
          color="success" 
          className={styles.capabilityBadge}
        >
          Prompts
        </Badge>
      );
    }
    
    if (capabilities.tools) {
      badges.push(
        <Badge 
          key="tools"
          appearance="filled" 
          color="warning" 
          className={styles.capabilityBadge}
        >
          Tools
        </Badge>
      );
    }
    
    if (badges.length === 0) {
      badges.push(
        <Badge 
          key="none"
          appearance="outline" 
          className={styles.capabilityBadge}
        >
          No capabilities
        </Badge>
      );
    }
    
    return badges;
  };
  
  // Show global loading state from the context along with local loading state
  const isLoadingIndicator = loading || isProcessing;
  
  // Helper to render empty state message
  const renderEmptyState = (message) => (
    <div style={{ textAlign: 'center', padding: '20px', color: tokens.colorNeutralForeground2 }}>
      <Text>{message}</Text>
    </div>
  );
  
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

            {isLoadingIndicator && (
              <div className={styles.loadingContainer}>
                <Spinner size="tiny" />
                <Text>Loading MCP server information...</Text>
              </div>
            )}
            
            <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)}>
              <Tab value="servers">Servers</Tab>
              <Tab value="capabilities">Capabilities</Tab>
            </TabList>
            
            <div className={styles.tabContent}>
              {selectedTab === 'servers' && (
                <>
                  <SectionHeading title="MCP Servers" />
                  
                  <div className={styles.serverList}>
                    {servers.length > 0 ? (
                      servers.map(server => (
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
                      ))
                    ) : (
                      renderEmptyState("No MCP servers configured. Add a server below to get started.")
                    )}
                  </div>
                  
                  <AddServerForm onAddServer={addServer} />
                </>
              )}
              
              {selectedTab === 'capabilities' && (
                <>
                  <SectionHeading title="Server Capabilities" />
                  {servers.length === 0 ? (
                    renderEmptyState("Add an MCP server first to check capabilities.")
                  ) : serverCapabilities ? (
                    <table className={styles.capabilitiesTable}>
                      <thead>
                        <tr>
                          <th className={styles.tableHeader}>Server</th>
                          <th className={styles.tableHeader}>Status</th>
                          <th className={styles.tableHeader}>Capabilities</th>
                        </tr>
                      </thead>
                      <tbody>
                        {serverCapabilities.map(server => (
                          <tr key={server.id}>
                            <td className={styles.tableCell}>{server.name}</td>
                            <td className={styles.tableCell}>
                              {server.success ? (
                                <Badge appearance="filled" className={styles.successBadge}>Connected</Badge>
                              ) : (
                                <Badge appearance="filled" className={styles.errorBadge}>Error</Badge>
                              )}
                            </td>
                            <td className={styles.tableCell}>
                              {server.success ? (
                                renderCapabilityBadges(server.data)
                              ) : (
                                <Text>{server.error?.message || server.error}</Text>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <Text>No capability information available. Click "Refresh Capabilities" to load.</Text>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogBody>
        <DialogActions>
          {selectedTab === 'servers' ? (
            <Button 
              appearance="secondary" 
              onClick={handleCheckAllServersHealth}
              disabled={isLoadingIndicator || servers.length === 0}
            >
              Check All Servers Health
            </Button>
          ) : (
            <Button 
              appearance="secondary" 
              onClick={handleGetCapabilities}
              disabled={isLoadingIndicator || servers.length === 0}
            >
              Refresh Capabilities
            </Button>
          )}
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