import React, { useState } from 'react';
import { PlusCircle, XCircle } from 'lucide-react';

const TagInput = ({
    label,
    inputRef,
    inputValue,
    onInputChange,
    onInputBlur,
    onAdd,
    suggestions = [],
    onSelectSuggestion,
    items = [],
    onRemove,
    placeholder,
    error,
    showFlags = false,
    required = false
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleBlur = (e) => {
        setIsFocused(false);
        // Delay onInputBlur to allow click on suggestions
        setTimeout(() => {
            onInputBlur(e);
        }, 100);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAdd();
        }
    };

    const showSuggestions = isFocused && suggestions.length > 0 && inputValue.length > 0;

    return (
        <div className="mb-4">
            {label && (
                <label htmlFor={label.replace(/\s+/g, '')} className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-[\'*\'] after:ml-0.5 after:text-red-500' : ''}`}>
                    {label}
                </label>
            )}
            <div className={`flex items-center border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500`}>
                <input
                    ref={inputRef}
                    type="text"
                    id={label.replace(/\s+/g, '')}
                    value={inputValue}
                    onChange={onInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="block w-full px-3 py-2 bg-white rounded-l-md focus:outline-none sm:text-sm"
                />
                <button
                    type="button"
                    onClick={onAdd}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                >
                    <PlusCircle size={20} />
                </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {showSuggestions && (
                <ul className="absolute z-10 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onMouseDown={() => onSelectSuggestion(suggestion)} // Use onMouseDown to trigger before onBlur
                            className="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 text-sm"
                        >
                            {showFlags && suggestion.flag && (
                                <img src={suggestion.flag} alt={`${suggestion.name} flag`} className="w-5 h-3.5 mr-2 rounded-[2px] border border-gray-200" />
                            )}
                            {suggestion.name}
                        </li>
                    ))}
                </ul>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <span key={item.name || index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full flex items-center text-sm font-medium shadow-sm">
                        {showFlags && item.flag && (
                            <img src={item.flag} alt={`${item.name} flag`} className="w-5 h-3.5 mr-2 rounded-[2px] border border-indigo-300" />
                        )}
                        {item.name}
                        <button
                            type="button"
                            onClick={() => onRemove(item)}
                            className="ml-2 p-1 rounded-full text-indigo-600 hover:bg-indigo-200 transition-colors duration-150"
                        >
                            <XCircle size={14} />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TagInput;
