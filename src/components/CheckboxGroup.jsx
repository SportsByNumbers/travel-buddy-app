// src/components/CheckboxGroup.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js'; // Import safeRender

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
                        <label key={safeRender(optionValue || index)} className="inline-flex items-center"> {/* Use safeRender for key */}
                            <input
                                type="checkbox"
                                value={safeRender(optionValue)} // Apply safeRender to value
                                checked={isSelected}
                                onChange={() => onChange(option)} // Pass original option object or value back depending on hook
                                className="form-checkbox h-4 w-4 text-indigo-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">{safeRender(optionLabel)}</span> {/* Apply safeRender */}
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default CheckboxGroup;
