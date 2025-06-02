// src/index.js (or src/main.jsx if you're using Vite, etc.)

import React from 'react'; // Imports the React library
import ReactDOM from 'react-dom/client'; // Imports the client-specific ReactDOM for React 18+
import App from './App'; // Imports your main application component
import './index.css'; // IMPORTANT: This line imports your main CSS file (where Tailwind is injected)

// Gets the DOM element with the ID 'root' from your public/index.html file.
// This is where your entire React application will be mounted and rendered.
const rootElement = document.getElementById('root');

// Creates a React root. This is the new way to render React apps in React 18+.
const root = ReactDOM.createRoot(rootElement);

// Renders your React application into the root element.
// <React.StrictMode> is a tool for highlighting potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App /> {/* Your main App component is rendered here */}
  </React.StrictMode>
);
