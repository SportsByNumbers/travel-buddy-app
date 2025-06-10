// src/components/PartyDetailsDisplay.jsx
import React from 'react';
// import { XCircle } from 'lucide-react'; // No need to import if not used in this test

const PartyDetailsDisplay = ({ party, handlePartyChange, removeParty, isRemovable }) => {
    // Basic validation
    if (!party || typeof party !== 'object' || party === null) {
        return <p className="text-red-500">Invalid party data.</p>;
    }

    return (
        // TEST 1: ABSOLUTE MINIMUM. ONLY THE OUTER DIV WITH KEY.
        // If the error persists here, the problem is incredibly fundamental:
        // either party.id is not a primitive, or there's a React environment issue.
        <div key={String(party.id)} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* NO CONTENT HERE FOR THE TEST */}
            {/* No p tag, no inputs, no button */}
        </div>
    );
};

export default PartyDetailsDisplay;
