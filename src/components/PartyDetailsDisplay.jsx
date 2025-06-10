// src/components/PartyDetailsDisplay.jsx
import React from 'react';
// import { XCircle } from 'lucide-react'; // Comment out XCircle as it's not used in this test

const PartyDetailsDisplay = ({ party, handlePartyChange, removeParty, isRemovable }) => {
    // Basic validation, should not cause the error
    if (!party || typeof party !== 'object' || party === null) {
        return <p className="text-red-500">Invalid party data.</p>;
    }

    return (
        // KEY: This div uses party.id for the key. This is usually safe.
        // The error indicates 'object with keys {id, name, adults, children}' is the issue,
        // suggesting the *content* of the div, not necessarily the key itself.
        <div key={party.id} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* TEST 1: Absolute minimum rendering inside the loop */}
            {/* Display only primitive values for debugging */}
            <p>Party Debug - ID: {String(party.id)} Name: {String(party.name || 'N/A')}</p>
            {/* Ensure any value displayed is explicitly converted to string for safety */}


            {/* Comment out the entire input div for this test */}
            {/* <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <div>
                    <label htmlFor={`party-name-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                        id={`party-name-${party.id}`}
                        type="text"
                        value={party.name || ''}
                        onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                        placeholder={`e.g., Family A`}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor={`party-adults-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Adults ({party.name})</label>
                    <input
                        id={`party-adults-${party.id}`}
                        type="number"
                        value={party.adults || 0}
                        onChange={(e) => handlePartyChange(party.id, 'adults', parseInt(e.target.value) || 0)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label htmlFor={`party-children-${party.id}`} className="block text-sm font-medium text-gray-700 mb-1">Children ({party.name})</label>
                    <input
                        id={`party-children-${party.id}`}
                        type="number"
                        value={party.children || 0}
                        onChange={(e) => handlePartyChange(party.id, 'children', parseInt(e.target.value) || 0)}
                        min="0"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div> */}

            {/* Comment out the remove button for this test */}
            {/* {isRemovable && (
                <button
                    onClick={() => removeParty(party.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                    title="Remove group"
                >
                    <XCircle size={20} />
                </button>
            )} */}
        </div>
    );
};

export default PartyDetailsDisplay;
