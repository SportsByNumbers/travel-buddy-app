// src/components/InputField.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js'; // Import safeRender

const InputField = ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    error,
    min,
    max,
    step,
    options, // For select type
    required = false,
    className = '' // Added className prop for custom styling
}) => {
    const inputClasses = `mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 ${error ? 'border-red-500' : ''} ${className}`;

    const renderInput = () => {
        switch (type) {
            case 'text':
            case 'number':
            case 'email':
            case 'password':
            case 'date':
            case 'time':
            case 'datetime-local':
                return (
                    <input
                        id={id}
                        type={type}
                        value={safeRender(value)} // Apply safeRender to value
                        onChange={onChange}
                        placeholder={placeholder}
                        min={min}
                        max={max}
                        step={step}
                        className={inputClasses}
                        required={required}
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        id={id}
                        value={safeRender(value)} // Apply safeRender to value
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`${inputClasses} h-24`}
                        required={required}
                    ></textarea>
                );
            case 'select':
                return (
                    <select
                        id={id}
                        value={safeRender(value)} // Apply safeRender to value
                        onChange={onChange}
                        className={inputClasses}
                        required={required}
                    >
                        {/* Ensure options exist and are iterable */}
                        {options && Array.isArray(options) && options.map((option, index) => (
                            <option key={safeRender(option.value || index)} value={safeRender(option.value)}>
                                {safeRender(option.label)} {/* Apply safeRender to option.label */}
                            </option>
                        ))}
                    </select>
                );
            default:
                return (
                    <input
                        id={id}
                        type="text" // Default to text for unknown types
                        value={safeRender(value)} // Apply safeRender to value
                        onChange={onChange}
                        placeholder={placeholder}
                        className={inputClasses}
                        required={required}
                    />
                );
        }
    };

    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {renderInput()}
            {error && <p className="mt-1 text-sm text-red-600">{safeRender(error)}</p>}
        </div>
    );
};

export default InputField;
