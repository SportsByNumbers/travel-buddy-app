import React from 'react';

const CheckboxGroup = ({ label, options, selected, onChange, columns = 1 }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
            <div className={`grid grid-cols-${columns} gap-2`}>
                {options.map((option) => (
                    <div key={option} className="flex items-center">
                        <input
                            type="checkbox"
                            id={option}
                            name={option}
                            checked={selected.includes(option)}
                            onChange={() => onChange(option)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={option} className="ml-2 text-sm text-gray-900">
                            {option}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CheckboxGroup;
