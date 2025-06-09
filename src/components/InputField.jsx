// components/InputField.jsx
import React from 'react';

function InputField({
    label,
    value,
    type = 'text',
    error,
    options, // Expected for type="select" or datalist
    selectedItems = [], // For checkbox/tag-like behavior where 'value' might be in a list
    onChange, // Add onChange prop for controlled components
    min, // Add min prop for number inputs
    max, // Add max prop for number inputs
    placeholder, // Add placeholder prop
    required = false, // Add required prop
    className = '', // Allow external classes
    ...rest // Capture any other props like onBlur, etc.
}) {
    const isSelected = Array.isArray(selectedItems) && selectedItems.includes(value);

    const inputClasses = `
        block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${isSelected ? 'bg-indigo-100 border-indigo-500' : ''}
        ${className} // Apply external classes
    `.trim();

    const commonProps = {
        id: label, // Using label as ID might be problematic if labels are not unique
        name: label,
        value: value,
        onChange: onChange,
        className: inputClasses,
        required: required,
        placeholder: placeholder,
        ...rest // Spread rest of the props
    };

    let inputElement;

    switch (type) {
        case 'select':
            inputElement = (
                <select {...commonProps}>
                    {/* Render options, ensuring they are valid */}
                    {options && options.map((option, index) => (
                        <option
                            key={option.value || index} // Use value for key if available, otherwise index
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'number':
            inputElement = (
                <input
                    type="number"
                    min={min}
                    max={max}
                    {...commonProps}
                />
            );
            break;
        case 'date':
            inputElement = (
                <input
                    type="date"
                    {...commonProps}
                />
            );
            break;
        case 'text':
        default:
            inputElement = (
                <input
                    type={type} // Can be 'text', 'email', 'password', etc.
                    {...commonProps}
                />
            );
            break;
    }

    return (
        <div className="mb-4">
            <label htmlFor={label} className="block text-sm font-medium text-gray-700">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {inputElement}
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
}

export default InputField;
