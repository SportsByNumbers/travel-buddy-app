// src/components/ItinerarySuggestions.jsx

import React, { useContext } from 'react';
import { TripContext } from '../App.js'; // Ensure correct path to App.js
import { Loader } from 'lucide-react'; // Add this import for the Loader component

const ItinerarySuggestions = () => {
    const {
        isGeneratingSuggestions,
        // ... (keep any other context values you were already destructuring and using)
    } = useContext(TripContext);

    // ... rest of your existing ItinerarySuggestions.jsx code
    // Ensure you are actually using `isGeneratingSuggestions` in your JSX,
    // and if you need the other `suggested...` or `setSelectedSuggested...` variables,
    // make sure to uncomment them and use them in your component's logic or JSX.

    return (
        <section className="mt-8 p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Itinerary Suggestions</h2>
            {isGeneratingSuggestions && (
                <div className="text-center py-4 flex items-center justify-center">
                    <Loader className="animate-spin text-indigo-600 mr-2" size={24} />
                    <p className="text-indigo-700">Generating personalized suggestions...</p>
                </div>
            )}
            {/* ... rest of your component's JSX */}
        </section>
    );
};

export default ItinerarySuggestions;
