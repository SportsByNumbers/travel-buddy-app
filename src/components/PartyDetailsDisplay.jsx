// src/components/PartyDetailsDisplay.jsx
import React from 'react';

const PartyDetailsDisplay = ({ party, handlePartyChange, removeParty, isRemovable }) => {
    // This component will use simple input fields and direct text display
    // to avoid any potential complexities with the generic InputField component
    // that might be causing the "object as child" error.

    if (!party || typeof party !== 'object' || party === null) {
        return <p className="text-red-500">Invalid party data.</p>;
    }

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* Group Name Input */}
                <div>
                    <label htmlFor={`party-name-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                        id={`party-name-${party.id}`}
                        type="text"
                        value={party.name || ''} // Ensure default empty string for null/undefined
                        onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                        placeholder={`e.g., Family A`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Adults Input */}
                <div>
                    <label htmlFor={`party-adults-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Adults ({party.name})</label>
                    <input
                        id={`party-adults-${party.id}`}
                        type="number"
                        value={party.adults || 0} // Ensure default 0 for null/undefined
                        onChange={(e) => handlePartyChange(party.id, 'adults', parseInt(e.target.value) || 0)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Children Input */}
                <div>
                    <label htmlFor={`party-children-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Children ({party.name})</label>
                    <input
                        id={`party-children-${party.id}`}
                        type="number"
                        value={party.children || 0} // Ensure default 0 for null/undefined
                        onChange={(e) => handlePartyChange(party.id, 'children', parseInt(e.target.value) || 0)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>
            {isRemovable && (
                <button
                    onClick={() => removeParty(party.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                    title="Remove group"
                >
                    <XCircle size={20} />
                </button>
            )}
        </div>
    );
};

export default PartyDetailsDisplay;
