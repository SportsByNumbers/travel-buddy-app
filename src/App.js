import React from 'react';
import './index.css'; // Keep this import for styling
// You might also need to import countriesData if it's used in App.js directly outside of functions
// import { countriesData } from './mockApi'; // Uncomment this if you still get errors about countriesData


function App() {
  // Very minimal states to keep the component a React component
  const [message, setMessage] = React.useState("Hello from Travel Planner App!");
  const [count, setCount] = React.useState(0);

  // No complex functions, no AI calls, no large JSX sections
  const handleClick = () => {
    setCount(prevCount => prevCount + 1);
    setMessage(`Count: ${count + 1}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          Travel Planner App (Testing Build)
        </h1>
        <p className="text-gray-700 mb-4">{message}</p>
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Click Me
        </button>
        <p className="text-sm text-gray-500 mt-4">
            This is a minimal version for debugging purposes.
        </p>
      </div>
    </div>
  );
}

export default App;
