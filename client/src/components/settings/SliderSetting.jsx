import { Label, Slider, Text } from '@fluentui/react-components';
import { useSettingsStyles } from './SettingsStyles';

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
export function SliderSetting({ id, label, description, value, onChange, min = 0, max = 1, step = 0.1 }) {
  const styles = useSettingsStyles();
  
  return (
    <div className={styles.settingContainer}>
      <div className={styles.sliderGroup}>
        <div className={styles.labelContainer}>
          <Label htmlFor={id} className={styles.settingLabel}>{label}</Label>
          <Text className={styles.settingDescription}>{description}</Text>
        </div>
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