import { Text } from '@fluentui/react-components';
import { useSettingsStyles } from './SettingsStyles';

/**
 * A component for section headings
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @returns {JSX.Element}
 */
export function SectionHeading({ title }) {
  const styles = useSettingsStyles();
  return <Text className={styles.sectionTitle}>{title}</Text>;
}