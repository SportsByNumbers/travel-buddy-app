import React from 'react';

const CheckboxGroup = ({ label, options, selected, onChange, columns = 2 }) => {
    const labelClass = "block text-sm font-medium text-gray-700 mb-2";
    const baseClass = "inline-flex items-center cursor-pointer bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out";
    const gridColsClass = `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${columns} gap-3`;

    return (
        <div>
            <label className={labelClass}>{label}:</label>
            <div className={gridColsClass}>
                {options.map((item, index) => (
                    <label key={index} className={baseClass}>
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                            checked={selected.includes(item)}
                            onChange={() => onChange(item)}
                        />
                        <span className="ml-2 text-gray-800 text-sm font-medium">{item}</span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default CheckboxGroup;
