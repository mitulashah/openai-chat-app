import { Label, Text, Textarea } from '@fluentui/react-components';
import { useSettingsStyles } from './SettingsStyles';

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
export function TextAreaSetting({ id, label, description, value, onChange, rows = 4 }) {
  const styles = useSettingsStyles();
  
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