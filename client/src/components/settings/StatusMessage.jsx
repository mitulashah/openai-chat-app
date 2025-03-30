import { ErrorDisplay } from '../ErrorDisplay';

/**
 * Status message component
 * @param {Object} props - Component props
 * @param {string} props.error - Error message
 * @param {string} props.success - Success message
 * @returns {JSX.Element}
 */
export function StatusMessage({ error, success }) {
  if (error) {
    return <ErrorDisplay message={error} type="error" />;
  }
  
  if (success) {
    return <ErrorDisplay message={success} type="success" />;
  }
  
  return null;
}