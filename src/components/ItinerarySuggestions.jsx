// src/components/ItinerarySuggestions.jsx (Example - integrate these changes into your existing file)

import React, { useContext } from 'react';
import { TripContext } from '../App.js'; // Ensure correct path to App.js
import { Loader } from 'lucide-react'; // Add this import for the Loader component

const ItinerarySuggestions = () => {
    const {
        suggestedActivities,
        setSuggestedActivities,
        isGeneratingSuggestions,
        suggestionError,
        // ... (keep any other context values you were already destructuring)

        // Add these setSelected... functions to your useContext destructuring:
        setSelectedSuggestedActivities,
        setSelectedSuggestedFoodLocations,
        setSelectedSuggestedThemeParks,
        setSelectedSuggestedTouristSpots,
        setSelectedSuggestedTours,
        setSelectedSuggestedSportingEvents
    } = useContext(TripContext);

    // ... rest of your existing ItinerarySuggestions.jsx code

    return (
        // ... your existing JSX, where Loader is used, it should now be defined.
        // Example:
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
