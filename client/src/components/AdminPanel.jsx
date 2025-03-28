import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Input,
  Label,
  Text,
  makeStyles,
  shorthands,
  Slider,
} from '@fluentui/react-components';
import { useState, useEffect } from 'react';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  sliderGroup: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('8px'),
  },
  error: {
    color: 'red',
    fontSize: '14px',
  },
  valueDisplay: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
});

const STORAGE_KEY = 'azure-openai-config';

/**
 * AdminPanel component for configuring Azure OpenAI settings
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Callback for dialog open state changes
 */
export function AdminPanel({ open, onOpenChange }) {
  const styles = useStyles();
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: '',
    deploymentName: '',
    temperature: 0.7,
    topP: 1,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  /**
   * Fetches configuration from both localStorage and server
   * Merges them to ensure we have the latest settings
   */
  const fetchConfig = async () => {
    try {
      // Try to load from localStorage first
      const savedConfig = localStorage.getItem(STORAGE_KEY);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      }

      // Then fetch from server to ensure we have the latest
      const response = await fetch('/api/config');
      const data = await response.json();
      
      // Merge server config with local storage, preserving local values if they exist
      setConfig(prev => ({
        ...data,
        apiKey: prev.apiKey || data.apiKey,
        endpoint: prev.endpoint || data.endpoint,
        deploymentName: prev.deploymentName || data.deploymentName,
        temperature: prev.temperature || data.temperature,
        topP: prev.topP || data.topP,
      }));
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Failed to load configuration');
    }
  };

  /**
   * Saves the current configuration to both localStorage and server
   */
  const saveConfig = async () => {
    try {
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      // Save to server
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error('Failed to save configuration');
      }

      setSuccess('Configuration saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving config:', error);
      setError('Failed to save configuration');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface>
        <DialogTitle>Settings</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div className={styles.form}>
              {/* Azure OpenAI Configuration */}
              <div className={styles.inputGroup}>
                <Label htmlFor="apiKey">Azure OpenAI API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="endpoint">Azure OpenAI Endpoint</Label>
                <Input
                  id="endpoint"
                  value={config.endpoint}
                  onChange={(e) => setConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                />
              </div>

              <div className={styles.inputGroup}>
                <Label htmlFor="deploymentName">Deployment Name</Label>
                <Input
                  id="deploymentName"
                  value={config.deploymentName}
                  onChange={(e) => setConfig(prev => ({ ...prev, deploymentName: e.target.value }))}
                />
              </div>

              {/* Model Parameters */}
              <div className={styles.sliderGroup}>
                <Label htmlFor="temperature">Temperature</Label>
                <div className={styles.valueDisplay}>
                  <Slider
                    id="temperature"
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.temperature}
                    onChange={(e, data) => setConfig(prev => ({ ...prev, temperature: data.value }))}
                  />
                  <Text>{config.temperature}</Text>
                </div>
              </div>

              <div className={styles.sliderGroup}>
                <Label htmlFor="topP">Top P</Label>
                <div className={styles.valueDisplay}>
                  <Slider
                    id="topP"
                    min={0}
                    max={1}
                    step={0.1}
                    value={config.topP}
                    onChange={(e, data) => setConfig(prev => ({ ...prev, topP: data.value }))}
                  />
                  <Text>{config.topP}</Text>
                </div>
              </div>

              {/* Status Messages */}
              {error && <Text className={styles.error}>{error}</Text>}
              {success && <Text style={{ color: 'green' }}>{success}</Text>}
            </div>
          </DialogContent>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={saveConfig}>
            Save
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
} 