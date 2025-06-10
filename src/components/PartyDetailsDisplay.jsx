// src/components/PartyDetailsDisplay.jsx
import React from 'react';
import { XCircle } from 'lucide-react'; // XCircle is used for the remove button

const PartyDetailsDisplay = ({ party, handlePartyChange, removeParty, isRemovable }) => {
    // EXTREME DEFENSIVE CHECK:
    // If party is not a valid object, or its id is not a primitive, render an error message.
    if (!party || typeof party !== 'object' || party === null ||
        (typeof party.id !== 'string' && typeof party.id !== 'number')) {
        console.error("PartyDetailsDisplay received invalid party data:", party);
        return (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
                <p>Error: Invalid party data received. Cannot display.</p>
                {/* Potentially display raw data for debugging, but be careful with objects */}
                {/* <pre>{JSON.stringify(party)}</pre> */}
            </div>
        );
    }

    // Safely extract primitive values, defaulting if they are missing or non-primitive
    const id = String(party.id);
    const name = String(party.name || 'Unnamed Group'); // Default name
    const adults = Number(party.adults) || 0; // Ensure it's a number
    const children = Number(party.children) || 0; // Ensure it's a number

    return (
        <div key={id} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {/* Group Name Input */}
                <div>
                    <label htmlFor={`party-name-${id}`} className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                        id={`party-name-${id}`}
                        type="text"
                        value={name} // Use the safely extracted 'name'
                        onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                        placeholder={`e.g., Family A`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Adults Input */}
                <div>
                    <label htmlFor={`party-adults-${id}`} className="block text-sm font-medium text-gray-700 mb-1">Adults ({name})</label>
                    <input
                        id={`party-adults-${id}`}
                        type="number"
                        value={adults} // Use the safely extracted 'adults'
                        onChange={(e) => handlePartyChange(party.id, 'adults', parseInt(e.target.value) || 0)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Children Input */}
                <div>
                    <label htmlFor={`party-children-${id}`} className="block text-sm font-medium text-gray-700 mb-1">Children ({name})</label>
                    <input
                        id={`party-children-${id}`}
                        type="number"
                        value={children} // Use the safely extracted 'children'
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
