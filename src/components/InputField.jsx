// components/InputField.jsx
import React from 'react';

function InputField({ label, value, type = 'text', error, options, selectedItems = [], ...props }) {
    // Ensure selectedItems is an array, and check if 'value' is a primitive.
    // This prevents errors if 'value' is unexpectedly an object (e.g., a full party object).
    const isSelected = Array.isArray(selectedItems) &&
                       (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') &&
                       selectedItems.includes(value);

    const inputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${isSelected ? 'bg-indigo-100 border-indigo-500' : ''}
    `;

    let renderInput;
    if (type === 'select') {
        // Render a <select> element if type is 'select'
        renderInput = (
            <select
                id={label}
                name={label}
                value={value}
                className={inputClasses}
                {...props} // Pass through any other props like onChange
            >
                {/* Ensure options is an array before mapping */}
                {options && Array.isArray(options) && options.map((option, index) => (
                    <option key={option.value || index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    } else {
        // Render a standard <input> element for other types
        renderInput = (
            <input
                type={type}
                id={label}
                name={label}
                value={value}
                className={inputClasses}
                {...props} // Pass through any other props like onChange, min, placeholder, required etc.
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
