import React from 'react';
import { Info } from 'lucide-react'; // Example Icon for info tooltips - now explicitly used

const InputField = ({ label, id, value, onChange, type = 'text', placeholder = '', error = '', required = false, min, max, icon: Icon, children }) => {
    const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const requiredLabelClass = "block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <div>
            <label htmlFor={id} className={required ? requiredLabelClass : labelClass}>
                {label}
                {Icon && <Icon className="inline-block ml-1 text-gray-500 cursor-help" size={16} title={label} />} {/* Info icon used here */}
            </label>
            {type === 'select' ? (
                <select
                    id={id}
                    value={value}
                    onChange={onChange}
                    className={`${inputClass} w-full ${error ? 'border-red-500' : ''}`}
                >
                    {children}
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
                    className={`${inputClass} w-full ${error ? 'border-red-500' : ''}`}
                />
            )}
            {error && <p className={errorClass}>{error}</p>}
        </div>
    );
};

export default InputField;
