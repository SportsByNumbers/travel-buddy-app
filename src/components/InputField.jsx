// components/InputField.jsx
import React from 'react';

// Assuming props like 'value', 'options', 'selectedItems' are passed
function InputField({ label, value, type = 'text', error, options, selectedItems }) { // Add selectedItems prop with default []
    // Line 5 might be here or just before this line
    const isSelected = selectedItems.includes(value); // THIS LINE IS LIKELY CAUSING THE ERROR IF selectedItems is undefined

    const inputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${isSelected ? 'bg-indigo-100 border-indigo-500' : ''}
    `;

    return (
        <div className="mb-4">
            <label htmlFor={label} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                type={type}
                id={label}
                name={label}
                value={value}
                // ... other props
                className={inputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default InputField;
