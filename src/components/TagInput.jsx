import React from 'react';

const TagInput = ({ label, inputRef, inputValue, onInputChange, onInputBlur, onAdd, suggestions, onSelectSuggestion, items, onRemove, placeholder, error, showFlags = false }) => {
    const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
    const buttonClass = "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md";
    const removeButtonClass = "ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition duration-200 ease-in-out";
    const tagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";
    const flagTagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";
    const suggestionListClass = "absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1";
    const suggestionItemClass = "p-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-800";
    const errorClass = "text-red-500 text-xs mt-1";
    const requiredLabelClass = "block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500";


    return (
        <div className="relative">
            <label htmlFor={label.replace(/\s/g, '')} className={requiredLabelClass}>{label}:</label>
            <div className="flex items-center">
                <input
                    type="text"
                    id={label.replace(/\s/g, '')}
                    ref={inputRef}
                    value={inputValue}
                    onChange={onInputChange}
                    onBlur={onInputBlur}
                    placeholder={placeholder}
                    className={`${inputClass} w-full ${error ? 'border-red-500' : ''}`}
                />
                <button type="button" onClick={onAdd} className={`${buttonClass} ml-3`}>Add</button>
            </div>
            {error && <p className={errorClass}>{error}</p>}
            {suggestions && suggestions.length > 0 && (
                <ul className={suggestionListClass}>
                    {suggestions.map((item) => (
                        <li
                            key={item.name}
                            onMouseDown={() => onSelectSuggestion(item)} // Use onMouseDown to prevent blur from closing before click
                            className={suggestionItemClass}
                        >
                            {showFlags && item.flag && <img src={item.flag} alt="" className="w-6 h-4 mr-2 rounded-sm" />}
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
                {items.map((item) => (
                    <span key={item.name || item} className={showFlags ? flagTagClass : tagClass}>
                        {showFlags && item.flag && <img src={item.flag} alt={`${item.name} flag`} className="w-6 h-4 mr-2 rounded-sm" />}
                        {item.name || item}
                        <button type="button" onClick={() => onRemove(item)} className={removeButtonClass}>&times;</button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagInput;
