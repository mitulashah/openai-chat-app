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
  Divider,
  Switch
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
  },
  inactiveService: {
    opacity: 0.7,
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
        <DialogTitle>Model Settings</DialogTitle>
        <DialogBody>
          <DialogContent>
            <div className={styles.form}>
              <div className={styles.tabContainer}>
                <TabList selectedValue={selectedTab} onTabSelect={onTabSelect}>
                  <Tab id="azure-openai-tab" value="azure-openai">Azure OpenAI</Tab>
                  <Tab id="ai-agent-tab" value="ai-agent">AI Agent Service</Tab>
                  <Tab id="model-params-tab" value="model-params">Model Parameters</Tab>
                  <Tab id="memory-tab" value="memory">Conversation Memory</Tab>
                </TabList>
                
                <Divider />
                
                {/* Azure OpenAI Configuration */}
                {selectedTab === "azure-openai" && (
                  <div className={styles.tabContent}>
                    <div className={config.useAiAgentService ? styles.inactiveService : ''}>
                      <TextSetting
                        id="apiKey"
                        label="API Key"
                        description="Your Azure OpenAI API key for authentication"
                        value={config.apiKey}
                        onChange={handleInputChange('apiKey')}
                        isPassword={true}
                        disabled={config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="endpoint"
                        label="Endpoint URL"
                        description="Your Azure OpenAI service endpoint (e.g., https://your-resource.openai.azure.com)"
                        value={config.endpoint}
                        onChange={handleInputChange('endpoint')}
                        disabled={config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="deploymentName"
                        label="Deployment Name"
                        description="The name of your model deployment in Azure OpenAI"
                        value={config.deploymentName}
                        onChange={handleInputChange('deploymentName')}
                        disabled={config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="apiVersion"
                        label="API Version"
                        description="The Azure OpenAI API version to use (e.g., 2023-05-15)"
                        value={config.apiVersion}
                        onChange={handleInputChange('apiVersion')}
                        disabled={config.useAiAgentService}
                      />
                    </div>
                    
                    {config.useAiAgentService && (
                      <div className={styles.settingContainer}>
                        <Text>
                          Azure OpenAI is currently inactive. Activate it by selecting "Azure OpenAI" as the service type.
                        </Text>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Azure AI Agent Configuration */}
                {selectedTab === "ai-agent" && (
                  <div className={styles.tabContent}>
                    <div className={!config.useAiAgentService ? styles.inactiveService : ''}>
                      <TextSetting
                        id="agentApiKey"
                        label="API Key"
                        description="Your Azure AI Projects API key for authentication"
                        value={config.apiKey}
                        onChange={handleInputChange('apiKey')}
                        isPassword={true}
                        disabled={!config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="aiAgentEndpoint"
                        label="AI Agent Endpoint"
                        description="Your Azure AI Agent service endpoint URL"
                        value={config.aiAgentEndpoint}
                        onChange={handleInputChange('aiAgentEndpoint')}
                        disabled={!config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="aiAgentProjectName"
                        label="Project Name"
                        description="The name of your Azure AI Foundry project"
                        value={config.aiAgentProjectName}
                        onChange={handleInputChange('aiAgentProjectName')}
                        disabled={!config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="aiAgentId"
                        label="Agent ID"
                        description="The unique identifier of your AI agent (usually starts with 'asst_')"
                        value={config.aiAgentId}
                        onChange={handleInputChange('aiAgentId')}
                        disabled={!config.useAiAgentService}
                      />
                      
                      <TextSetting
                        id="aiAgentName"
                        label="Agent Name (Optional)"
                        description="Optional display name for reference only"
                        value={config.aiAgentName}
                        onChange={handleInputChange('aiAgentName')}
                        disabled={!config.useAiAgentService}
                      />
                    </div>
                    
                    {!config.useAiAgentService && (
                      <div className={styles.settingContainer}>
                        <Text>
                          Azure AI Agent Service is currently inactive. Activate it by selecting "Azure AI Agent Service" as the service type.
                        </Text>
                      </div>
                    )}
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
        <DialogActions style={{ 
          padding: '16px 0', // Removed horizontal padding, kept vertical padding
          display: 'flex', 
          width: '100%', 
          maxWidth: '650px' 
        }}>
          {/* Left-aligned toggle switch */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: tokens.colorNeutralBackground3, 
            borderRadius: '6px',
            height: '40px',
            padding: '0 16px',
            marginLeft: 0,
            marginRight: 'auto'  /* Push everything else to the right */
          }}>
            <Text weight="semibold">Azure OpenAI</Text>
            <Switch 
              checked={config.useAiAgentService}
              onChange={(e, data) => setConfigValue('useAiAgentService', data.checked)}
            />
            <Text weight="semibold">AI Agent Service</Text>
          </div>
          
          {/* Right-aligned buttons */}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <Button appearance="secondary" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={saveConfig} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}