// components/InputField.jsx
import React from 'react';

// Assuming props like 'value', 'options', 'selectedItems' are passed
// It's good practice to provide a default empty array for array props
// that might be undefined or null from the parent.
function InputField({ label, value, type = 'text', error, options, selectedItems = [] }) { // Explicitly set default to []

    // Ensure selectedItems is an array before using .includes()
    // This is the key change to prevent the error.
    const isSelected = Array.isArray(selectedItems) && selectedItems.includes(value);

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
            {/*
                Based on your App.js, it seems you might be using this InputField for various purposes.
                If 'options' are for a datalist with <input type="text" list="options">, you'd add:
                <input
                    type={type}
                    id={label}
                    name={label}
                    value={value}
                    // ... other props like onChange, etc.
                    className={inputClasses}
                    list={options ? `${label}-options` : undefined} // Only add list if options exist
                />
                {options && (
                    <datalist id={`${label}-options`}>
                        {options.map((option, index) => (
                            <option key={index} value={option} />
                        ))}
                    </datalist>
                )}
                If this is a simple text input or part of a larger component that uses a different input type,
                the current <input> is fine.
            */}
            <input
                type={type}
                id={label}
                name={label}
                value={value}
                // Add any necessary onChange, onBlur, etc. props if this is a controlled component
                // For example: onChange={(e) => handleChange(e.target.value)}
                className={inputClasses}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default InputField;
