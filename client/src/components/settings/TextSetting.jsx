import { Input, Label, Text } from '@fluentui/react-components';
import { useSettingsStyles } from './SettingsStyles';

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
export function TextSetting({ id, label, description, value, onChange, isPassword = false }) {
  const styles = useSettingsStyles();
  
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