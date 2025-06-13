// src/components/CheckboxGroup.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js'; // Ensure safeRender is imported

const CheckboxGroup = ({ label, options, selected, onChange, columns = 1 }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className={`grid grid-cols-${columns} gap-2`}>
                {options && Array.isArray(options) && options.map((option, index) => {
                    // Normalize option to a string value for comparison if it's an object {value, label}
                    const optionValue = typeof option === 'object' && option !== null && option.value !== undefined ? option.value : option;
                    const optionLabel = typeof option === 'object' && option !== null && option.label !== undefined ? option.label : option;

                    const isSelected = selected.includes(optionValue); // Compare by the actual value

                    return (
                        <label key={safeRender(optionValue || index)} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                value={safeRender(optionValue)}
                                checked={isSelected}
                                onChange={() => onChange(optionValue)} // Changed to pass optionValue directly for consistency
                                className="form-checkbox h-4 w-4 text-indigo-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">{safeRender(optionLabel)}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckboxGroup;
