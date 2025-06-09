// components/InputField.jsx
import React from 'react';

function InputField({ label, value, type = 'text', error, options, selectedItems = [], ...props }) { // Added ...props to pass through
    // Ensure selectedItems is an array, and check if 'value' is a primitive
    // The previous error was likely because a non-primitive 'value' (e.g., an object)
    // was passed to selectedItems.includes(value).
    // Now, we explicitly check if 'value' is a primitive before using it in includes().
    const isSelected = Array.isArray(selectedItems) &&
                       (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') &&
                       selectedItems.includes(value);

    const inputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${isSelected ? 'bg-indigo-100 border-indigo-500' : ''}
    `;

    // Render logic based on type
    let renderInput;
    if (type === 'select') {
        renderInput = (
            <select
                id={label}
                name={label}
                value={value}
                className={inputClasses}
                {...props} // Pass through any other props like onChange
            >
                {options && options.map((option, index) => (
                    <option key={option.value || index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    } else {
        renderInput = (
            <input
                type={type}
                id={label}
                name={label}
                value={value}
                className={inputClasses}
                {...props} // Pass through any other props like onChange, min, placeholder, etc.
            />
        );
    }

    return (
        <div className="mb-4">
            <label htmlFor={label} className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            {renderInput}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default InputField;
