// Import React and ReactDOM for rendering
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the main App component
import App from './App';

// Import global styles
import './index.css';

/**
 * Create the root React element and render the App component
 * Wrapped in StrictMode for additional development checks
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 