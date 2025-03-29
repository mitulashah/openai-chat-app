import {
  Dialog,
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
  tokens,
  RadioGroup,
  Radio,
  Checkbox,
  Textarea,
  Tab,
  TabList,
  Divider
} from '@fluentui/react-components';
import { useState, useEffect } from 'react';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useAzureOpenAIConfig } from '../hooks/useAzureOpenAIConfig';
import { ErrorDisplay } from './ErrorDisplay';

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
  success: {
    color: 'green',
    fontSize: '14px',
  },
  valueDisplay: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  settingLabel: {
    fontWeight: '600',
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
    fontSize: '14px',
  },
  settingDescription: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    marginBottom: '8px',
  },
  settingContainer: {
    backgroundColor: tokens.colorNeutralBackground3,
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '12px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: tokens.colorBrandForeground1,
    marginBottom: '12px',
    marginTop: '8px',
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
  systemMessageInput: {
    marginTop: '8px',
  },
  // New styles for collapsible sections
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '8px 0',
    borderRadius: '4px',
    ...shorthands.padding('8px', '12px'),
    ...shorthands.margin('4px', '0'),
  },
  sectionHeaderTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: tokens.colorBrandForeground1,
    marginLeft: '8px',
  },
  sectionContent: {
    ...shorthands.padding('0', '0', '8px', '12px'),
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
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
  // Error and status styling unified with app-wide standards
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '10px 12px',
    borderRadius: '4px',
    backgroundColor: tokens.colorPaletteRedBackground1,
    color: tokens.colorPaletteRedForeground1,
    fontSize: '14px',
    marginTop: '10px',
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    padding: '10px 12px',
    borderRadius: '4px',
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
    fontSize: '14px',
    marginTop: '10px',
  }
});

/**
 * A reusable component for text input settings
 * @param {Object} props - Component props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Setting label
 * @param {string} props.description - Setting description
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} [props.isPassword=false] - Whether to use password input
 * @returns {JSX.Element}
 */
function TextSetting({ id, label, description, value, onChange, isPassword = false }) {
  const styles = useStyles();
  
  return (
    <div className={styles.settingContainer}>
      <div className={styles.inputGroup}>
        <Label htmlFor={id} className={styles.settingLabel}>{label}</Label>
        <Text className={styles.settingDescription}>{description}</Text>
        <Input
          id={id}
          type={isPassword ? "password" : "text"}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

/**
 * A reusable component for textarea input settings
 * @param {Object} props - Component props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Setting label
 * @param {string} props.description - Setting description
 * @param {string} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.rows=4] - Number of visible rows
 * @returns {JSX.Element}
 */
function TextAreaSetting({ id, label, description, value, onChange, rows = 4 }) {
  const styles = useStyles();
  
  return (
    <div className={styles.settingContainer}>
      <div className={styles.inputGroup}>
        <Label htmlFor={id} className={styles.settingLabel}>{label}</Label>
        <Text className={styles.settingDescription}>{description}</Text>
        <Textarea
          id={id}
          value={value}
          onChange={onChange}
          rows={rows}
          resize="vertical"
        />
      </div>
    </div>
  );
}

/**
 * A reusable component for slider settings
 * @param {Object} props - Component props
 * @param {string} props.id - Input field ID
 * @param {string} props.label - Setting label
 * @param {string} props.description - Setting description
 * @param {number} props.value - Current value
 * @param {Function} props.onChange - Change handler
 * @param {number} [props.min=0] - Minimum value
 * @param {number} [props.max=1] - Maximum value
 * @param {number} [props.step=0.1] - Step increment
 * @returns {JSX.Element}
 */
function SliderSetting({ id, label, description, value, onChange, min = 0, max = 1, step = 0.1 }) {
  const styles = useStyles();
  
  return (
    <div className={styles.settingContainer}>
      <div className={styles.sliderGroup}>
        <Label htmlFor={id} className={styles.settingLabel}>{label}</Label>
        <Text className={styles.settingDescription}>{description}</Text>
        <div className={styles.valueDisplay}>
          <Slider
            id={id}
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
          />
          <Text>{value}</Text>
        </div>
      </div>
    </div>
  );
}

/**
 * A component for section headings
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @returns {JSX.Element}
 */
function SectionHeading({ title }) {
  const styles = useStyles();
  return <Text className={styles.sectionTitle}>{title}</Text>;
}

/**
 * Status message component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @returns {JSX.Element}
 */
function StatusMessage({ error, success }) {
  if (error) {
    return <ErrorDisplay message={error} type="error" />;
  }
  
  if (success) {
    return <ErrorDisplay message={success} type="success" />;
  }
  
  return null;
}

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
  const { 
    config, 
    setConfigValue,
    error,
    success,
    saveConfig,
    isLoading
  } = useAzureOpenAIConfig({ onConfigSaved, onOpenChange });
  
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