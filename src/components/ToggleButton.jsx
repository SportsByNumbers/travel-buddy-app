import React from 'react';

const ToggleButton = ({ item, isSelected, onToggle }) => {
    const suggestionTagClass = (selected) =>
        `px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition duration-200 ease-in-out ${
            selected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;
    return (
        <span
            className={suggestionTagClass(isSelected)}
            onClick={onToggle}
        >
            {item}
        </span>
    );
};

export default ToggleButton;
