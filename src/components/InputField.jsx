import React from 'react';

const InputField = ({ id, label, type = 'text', value, onChange, placeholder, min, max, error, options = [] }) => {
    const inputClasses = `mt-1 block w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`;
    const labelClasses = `block text-sm font-medium text-gray-700 ${!label.includes('(Optional)') ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`;

    return (
        <div className="mb-4">
            {label && <label htmlFor={id} className={labelClasses}>{label}</label>}
            {type === 'select' ? (
                <select
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    className={inputClasses}
                    required={!label.includes('(Optional)')}
                >
                    {options.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    min={min}
                    max={max}
                    className={inputClasses}
                    required={!label.includes('(Optional)')}
                />
            )}
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;
