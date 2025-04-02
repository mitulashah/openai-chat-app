import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  DialogActions,
  Button,
  Label,
  Text,
  makeStyles,
  shorthands,
  tokens,
  RadioGroup,
  Radio,
  Checkbox,
  Tab,
  TabList,
  Divider
} from '@fluentui/react-components';
import { useState } from 'react';
import { useAzureOpenAIConfig } from '../hooks/useAzureOpenAIConfig';
// Replace useChat with useConfiguration
import { useConfiguration } from '../contexts/ConfigurationContext';
import { TextSetting } from './settings/TextSetting';
import { TextAreaSetting } from './settings/TextAreaSetting';
import { SliderSetting } from './settings/SliderSetting';
import { SectionHeading } from './settings/SectionHeading';
import { StatusMessage } from './settings/StatusMessage';

const useStyles = makeStyles({
  form: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('16px'),
  },
  // New styles for tab layout and wider dialog
  wideSurface: {
    width: '700px',
    maxWidth: '90vw',
  },
  tabContent: {
    padding: '16px 0',
    height: '450px', /* Increased fixed height for consistent dialog size */
    overflowY: 'auto', /* Make content scrollable if it exceeds the height */
  },
  tabContainer: {
    marginTop: '10px',
  },
  radioGroup: {
    ...shorthands.gap('4px'),
    marginBottom: '8px',
  },
  checkboxWrapper: {
    marginTop: '8px',
  },
  conditionalSection: {
    marginTop: '8px',
    paddingLeft: '8px',
    borderLeft: `2px solid ${tokens.colorNeutralStroke1}`,
  },
  settingContainer: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  }
});

/**
 * AdminPanel component for configuring Azure OpenAI settings
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onOpenChange - Callback for dialog open state changes
 * @param {Function} props.onConfigSaved - Callback for when configuration is successfully saved
 * @returns {JSX.Element}
 */
export function AdminPanel({ open, onOpenChange, onConfigSaved }) {
  const styles = useStyles();
  // Get the updateMemorySettings function from ConfigurationContext instead of ChatContext
  const { updateMemorySettings } = useConfiguration();
  
  const { 
    config, 
    setConfigValue,
    error,
    success,
    saveConfig,
    isLoading
  } = useAzureOpenAIConfig({ 
    onConfigSaved: (savedConfig) => {
      // First, update the memory settings in the ConfigurationContext
      if (updateMemorySettings) {
        updateMemorySettings({
          memoryMode: savedConfig.memoryMode,
          memoryLimit: savedConfig.memoryLimit,
          includeSystemMessage: savedConfig.includeSystemMessage,
          systemMessage: savedConfig.systemMessage
        });
      }
      
      // Then call the original onConfigSaved callback
      if (onConfigSaved) {
        onConfigSaved(savedConfig);
      }
    }, 
    onOpenChange 
  });
  
  // Add tab state to keep track of current selected tab
  const [selectedTab, setSelectedTab] = useState("azure-openai");
  
  // Handle tab change events
  const onTabSelect = (event, data) => {
    setSelectedTab(data.value);
  };

  // Handle input changes
  const handleInputChange = (field) => (e) => {
    setConfigValue(field, e.target.value);
  };

  // Handle slider changes
  const handleSliderChange = (field) => (e, data) => {
    setConfigValue(field, data.value);
  };

  // Handle memory mode changes
  const handleMemoryModeChange = (e, data) => {
    setConfigValue('memoryMode', data.value);
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field) => (e, data) => {
    setConfigValue(field, data.checked);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface className={styles.wideSurface}>
        <DialogTitle>Settings</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div className={styles.form}>
              <div className={styles.tabContainer}>
                <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                  <Tab id="azure-openai-tab" value="azure-openai">Azure OpenAI</Tab>
                  <Tab id="model-params-tab" value="model-params">Model Parameters</Tab>
                  <Tab id="memory-tab" value="memory">Conversation Memory</Tab>
                </TabList>
                
                <Divider />
                
                {/* Azure OpenAI Configuration */}
                {selectedTab === "azure-openai" && (
                  <div className={styles.tabContent}>
                    <TextSetting
                      id="apiKey"
                      label="API Key"
                      description="Your Azure OpenAI API key for authentication"
                      value={config.apiKey}
                      onChange={handleInputChange('apiKey')}
                      isPassword={true}
                    />
                    
                    <TextSetting
                      id="endpoint"
                      label="Endpoint URL"
                      description="Your Azure OpenAI service endpoint (e.g., https://your-resource.openai.azure.com)"
                      value={config.endpoint}
                      onChange={handleInputChange('endpoint')}
                    />
                    
                    <TextSetting
                      id="deploymentName"
                      label="Deployment Name"
                      description="The name of your model deployment in Azure OpenAI"
                      value={config.deploymentName}
                      onChange={handleInputChange('deploymentName')}
                    />
                    
                    <TextSetting
                      id="apiVersion"
                      label="API Version"
                      description="The Azure OpenAI API version to use (e.g., 2023-05-15)"
                      value={config.apiVersion}
                      onChange={handleInputChange('apiVersion')}
                    />
                  </div>
                )}
                
                {/* Model Parameters */}
                {selectedTab === "model-params" && (
                  <div className={styles.tabContent}>
                    <SliderSetting
                      id="temperature"
                      label="Temperature"
                      description="Controls randomness: Lower values are more deterministic (0.0-1.0)"
                      value={config.temperature}
                      onChange={handleSliderChange('temperature')}
                    />
                    
                    <SliderSetting
                      id="topP"
                      label="Top P"
                      description="Controls diversity via nucleus sampling (0.0-1.0)"
                      value={config.topP}
                      onChange={handleSliderChange('topP')}
                    />
                    
                    <SliderSetting
                      id="maxTokens"
                      label="Max Tokens"
                      description="Maximum number of tokens to generate in the response (1-4000)"
                      value={config.maxTokens}
                      onChange={handleSliderChange('maxTokens')}
                      min={1}
                      max={4000}
                      step={1}
                    />
                  </div>
                )}
                
                {/* Conversation Memory */}
                {selectedTab === "memory" && (
                  <div className={styles.tabContent}>
                    <div className={styles.settingContainer}>
                      <Label className={styles.settingLabel}>Memory Mode</Label>
                      <Text className={styles.settingDescription}>
                        Control how much conversation history is sent to the model
                      </Text>
                      

                      <RadioGroup 
                        className={styles.radioGroup}
                        value={config.memoryMode}
                        onChange={handleMemoryModeChange}
                      >
                        <Radio value="none" label="No Memory" />
                        <Radio value="limited" label="Limited Memory" />
                        <Radio value="full" label="Full Memory" />
                      </RadioGroup>

                      {config.memoryMode === 'limited' && (
                        <div className={styles.conditionalSection}>
                          <SliderSetting
                            id="memoryLimit"
                            label="Message Limit"
                            description="Number of previous messages to include in context (1-20)"
                            value={config.memoryLimit}
                            onChange={handleSliderChange('memoryLimit')}
                            min={1}
                            max={20}
                            step={1}
                          />
                        </div>
                      )}

                      <div className={styles.checkboxWrapper}>
                        <Checkbox 
                          label="Include System Message" 
                          checked={config.includeSystemMessage}
                          onChange={handleCheckboxChange('includeSystemMessage')}
                        />
                      </div>

                      {config.includeSystemMessage && (
                        <div className={styles.conditionalSection}>
                          <TextAreaSetting
                            id="systemMessage"
                            label="System Message"
                            description="Custom instructions that define the assistant's behavior"
                            value={config.systemMessage}
                            onChange={handleInputChange('systemMessage')}
                            rows={3}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <StatusMessage error={error} success={success} />
            </div>
          </DialogContent>
        </DialogBody>
        <DialogActions>
          <Button appearance="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={saveConfig} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}