import React from 'react';
import { Switch, useId } from '@fluentui/react-components';
import { useTheme } from '../../hooks/useTheme';
import './StyledSwitchStyles.css';

/**
 * A styled version of the Fluent UI Switch component that adapts to the current theme
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - 'primary', 'success', or 'danger'
 * @param {boolean} [props.checked] - Whether the switch is checked
 * @param {function} [props.onChange] - Change event handler
 * @param {Object} [props.label] - Label configuration
 * @param {string} [props.size] - Size of the switch ('small', 'medium', 'large')
 * @returns {JSX.Element} Styled Switch component
 */
export const StyledSwitch = ({ 
  variant = 'primary', 
  checked, 
  onChange,
  label,
  size,
  ...rest
}) => {
  const { currentThemeName } = useTheme();
  const switchId = useId('styled-switch');
  
  // Determine CSS class based on theme and variant
  const isNord = currentThemeName.includes('Nord');
  const themeClass = isNord ? 'nord' : 'dracula';
  const colorClass = variant === 'primary' ? 'primary' : 
                    variant === 'success' ? 'success' : 
                    variant === 'danger' ? 'danger' : 'primary';
  
  return (
    <Switch
      id={switchId}
      checked={checked}
      onChange={onChange}
      label={label}
      size={size}
      className={`styled-switch ${themeClass} ${colorClass} force-background-override`}
      {...rest}
      style={{
        '--fui-Switch__track--background': checked 
          ? (variant === 'success' 
              ? (isNord ? '#A3BE8C' : '#50FA7B') 
              : variant === 'danger'
                ? (isNord ? '#BF616A' : '#FF5555')
                : (isNord ? '#81A1C1' : '#BD93F9'))
          : 'rgba(128, 128, 128, 0.7)',
      }}
    />
  );
};