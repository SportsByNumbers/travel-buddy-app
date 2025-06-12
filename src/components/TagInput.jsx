// src/components/TagInput.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react'; // Assuming you use X icon for removing tags
import { safeRender } from '../utils/safeRender.js'; // Ensure safeRender is imported

const TagInput = ({
    label,
    inputRef,
    inputValue,
    onInputChange,
    onInputBlur,
    onAdd,
    suggestions,
    onSelectSuggestion,
    items, // This will be the array of selected countries/tags
    onRemove,
    placeholder,
    error,
    showFlags = false, // New prop to control flag display
    required = false,
    className = ''
}) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
                if (onInputBlur) onInputBlur(); // Call original onInputBlur if provided
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onInputBlur]);

    const handleFocus = () => {
        if (suggestions && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            onAdd();
            setShowSuggestions(false); // Hide suggestions after adding
        }
    };

    return (
        <div className={`mb-4 relative ${className}`} ref={wrapperRef}>
            <label htmlFor={label.replace(/\s/g, '-').toLowerCase()} className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className={`flex items-center border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus-within:ring-indigo-500 focus-within:border-indigo-500 p-2`}>
                <div className="flex flex-wrap gap-2 mr-2">
                    {items.map((item, index) => (
                        <span
                            // Ensure key is always a string or number. Prioritize unique IDs.
                            key={safeRender(item.id || item.name || index)}
                            className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium"
                        >
                            {showFlags && item.flag && (
                                <img
                                    src={safeRender(item.flag)}
                                    alt={safeRender(`${item.name} flag`)}
                                    className="w-5 h-3.5 mr-2 rounded-sm"
                                />
                            )}
                            {safeRender(item.name)}
                            <button
                                type="button"
                                onClick={() => onRemove(item)}
                                className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                <input
                    id={label.replace(/\s/g, '-').toLowerCase()}
                    ref={inputRef}
                    type="text"
                    value={safeRender(inputValue)}
                    onChange={onInputChange}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow min-w-0 p-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 text-sm"
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{safeRender(error)}</p>}

            {showSuggestions && suggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={safeRender(suggestion.id || suggestion.name || index)}
                            className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-800 text-sm"
                            onClick={() => { onSelectSuggestion(suggestion); setShowSuggestions(false); }}
                        >
                            {showFlags && suggestion.flag && (
                                <img
                                    src={safeRender(suggestion.flag)}
                                    alt={safeRender(`${suggestion.name} flag`)}
                                    className="w-5 h-3.5 mr-3 rounded-sm"
                                />
                            )}
                            {safeRender(suggestion.name)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default TagInput;
