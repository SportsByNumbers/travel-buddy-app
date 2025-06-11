// src/components/CheckboxGroup.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js'; // Import safeRender

const CheckboxGroup = ({ label, options, selected, onChange, columns = 1 }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className={`grid grid-cols-${columns} gap-2`}>
                {options.map((option) => {
                    const isSelected = selected.includes(option);
                    const optionValue = typeof option === 'object' && option !== null && option.value !== undefined ? option.value : option;
                    const optionLabel = typeof option === 'object' && option !== null && option.label !== undefined ? option.label : option;

                    return (
                        <label key={safeRender(optionValue)} className="inline-flex items-center">
                            <input
                                type="checkbox"
                                value={safeRender(optionValue)}
                                checked={isSelected}
                                onChange={() => onChange(option)}
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
