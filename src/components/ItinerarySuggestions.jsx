import React, { useContext, useState } from 'react';
import { Lightbulb, CheckCircle, PlusCircle } from 'lucide-react';
import { TripContext } from '../App.jsx';
import SectionWrapper from './SectionWrapper.jsx';

const ItinerarySuggestions = () => {
    const {
        homeCountry, homeCity, countries, cities, startDate, endDate, overallDuration,
        starRating, travelStyle, hotelAmenities, topicsOfInterest,
        suggestedActivities, setSuggestedActivities,
        suggestedFoodLocations, setSuggestedFoodLocations,
        suggestedThemeParks, setSuggestedThemeParks,
        suggestedTouristSpots, setSuggestedTouristSpots,
        suggestedTours, setSuggestedTours,
        suggestedSportingEvents, setSuggestedSportingEvents,
        isGeneratingSuggestions, setIsGeneratingSuggestions,
        suggestionError, setSuggestionError,
        toggleSuggestionSelection,
        selectedSuggestedActivities, selectedSuggestedFoodLocations,
        selectedSuggestedThemeParks, selectedSuggestedTouristSpots,
        selectedSuggestedTours, selectedSuggestedSportingEvents,
    } = useContext(TripContext);

    const generateSuggestions = async () => {
        setIsGeneratingSuggestions(true);
        setSuggestionError('');
        setSuggestedActivities([]);
        setSuggestedFoodLocations([]);
        setSuggestedThemeParks([]);
        setSuggestedTouristSpots([]);
        setSuggestedTours([]);
        setSuggestedSportingEvents([]);

        // Clear previous selections for a fresh generation
        setSelectedSuggestedActivities([]);
        setSelectedSuggestedFoodLocations([]);
        setSelectedSuggestedThemeParks([]);
        setSelectedSuggestedTouristSpots([]);
        setSelectedSuggestedTours([]);
        setSelectedSuggestedSportingEvents([]);

        const tripDetails = {
            home: { country: homeCountry.name, city: homeCity },
            destinations: cities.length > 0 ? cities : countries.map(c => ({ name: c.name, duration: 0, starRating: '', topics: [] })),
            dates: { startDate: startDate?.toLocaleDateString(), endDate: endDate?.toLocaleDateString(), duration: overallDuration },
            preferences: { travelStyle, starRating, hotelAmenities, topicsOfInterest },
        };

        const prompt = `Generate comprehensive travel suggestions for a trip with the following details:
        Home Location: ${tripDetails.home.city}, ${tripDetails.home.country}
        Destinations: ${tripDetails.destinations.map(d => `${d.name} (${d.duration || 'N/A'} days, ${d.starRating ? d.starRating + ' Star, ' : ''}Topics: ${d.topics.join(', ') || 'None'})`).join('; ')}
        Dates: From ${tripDetails.dates.startDate} to ${tripDetails.dates.endDate} (${tripDetails.dates.duration} days total)
        Travel Style: ${tripDetails.preferences.travelStyle || 'Any'}
        Hotel Rating Preference: ${tripDetails.preferences.starRating || 'Any'}
        Selected Hotel Amenities: ${tripDetails.preferences.hotelAmenities.join(', ') || 'None'}
        Topics of Interest: ${tripDetails.preferences.topicsOfInterest.join(', ') || 'None'}

        Please provide suggestions categorized as follows, each with a brief description. Focus on unique and engaging ideas. If no specific topic of interest is provided, offer general popular suggestions.

        Output should be a JSON object with the following structure:
        {
          "activities": ["Activity 1: Description", "Activity 2: Description"],
          "foodLocations": ["Restaurant A: Cuisine type", "Cafe B: Specialty"],
          "themeParks": ["Theme Park X: Key rides", "Amusement Park Y: Family attractions"],
          "touristSpots": ["Landmark P: Historical significance", "Museum Q: Main exhibits"],
          "tours": ["City Walking Tour: Highlights", "Day Trip to Z: What to expect"],
          "sportingEvents": ["Local Game: Sport type", "Outdoor Adventure: Activity type"]
        }
        If a category is not applicable or no suggestions can be made, return an empty array for that category.`;

        try {
            const apiKey = ""; // Canvas will automatically provide this in runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    // No explicit responseSchema for flexible output, parse manually
                }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log("AI Response:", result);

            if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                try {
                    const parsedSuggestions = JSON.parse(text);
                    setSuggestedActivities(parsedSuggestions.activities || []);
                    setSuggestedFoodLocations(parsedSuggestions.foodLocations || []);
                    setSuggestedThemeParks(parsedSuggestions.themeParks || []);
                    setSuggestedTouristSpots(parsedSuggestions.touristSpots || []);
                    setSuggestedTours(parsedSuggestions.tours || []);
                    setSuggestedSportingEvents(parsedSuggestions.sportingEvents || []);
                } catch (jsonError) {
                    console.error("Error parsing AI response JSON:", jsonError);
                    setSuggestionError("Failed to parse AI suggestions. Please try again.");
                }
            } else {
                setSuggestionError("No suggestions received from AI. Please refine your preferences or try again.");
            }

        } catch (error) {
            console.error("Error fetching AI suggestions:", error);
            setSuggestionError("Error generating suggestions. Please check your network or try again later.");
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const renderSuggestions = (title, suggestions, selectedItems, toggleFunction) => (
        suggestions.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
                <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                            <input
                                type="checkbox"
                                id={`${title.replace(/\s/g, '')}-${index}`}
                                checked={selectedItems.includes(suggestion)}
                                onChange={() => toggleFunction(suggestion)}
                                className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`${title.replace(/\s/g, '')}-${index}`} className="ml-3 text-gray-700 text-sm cursor-pointer">
                                {suggestion}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        )
    );

    return (
        <SectionWrapper title="Itinerary Suggestions" icon={Lightbulb}>
            <p className="text-gray-700 mb-6">Let AI suggest activities, food spots, and attractions based on your preferences!</p>
            <div className="text-center mb-6">
                <button
                    onClick={generateSuggestions}
                    className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isGeneratingSuggestions || !homeCountry.name || !homeCity || (countries.length === 0 && cities.length === 0) || !startDate || !endDate || overallDuration < 1}
                >
                    {isGeneratingSuggestions ? (
                        <span className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" size={20} /> Generating Suggestions...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <PlusCircle size={20} className="mr-2" /> Generate Suggestions
                        </span>
                    )}
                </button>
                {suggestionError && <p className="text-red-500 text-sm mt-2">{suggestionError}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {renderSuggestions("Suggested Activities", suggestedActivities, selectedSuggestedActivities, toggleSuggestionSelection.bind(null, 'activities'))}
                {renderSuggestions("Suggested Food Locations", suggestedFoodLocations, selectedSuggestedFoodLocations, toggleSuggestionSelection.bind(null, 'foodLocations'))}
                {renderSuggestions("Suggested Theme Parks", suggestedThemeParks, selectedSuggestedThemeParks, toggleSuggestionSelection.bind(null, 'themeParks'))}
                {renderSuggestions("Suggested Tourist Spots", suggestedTouristSpots, selectedSuggestedTouristSpots, toggleSuggestionSelection.bind(null, 'touristSpots'))}
                {renderSuggestions("Suggested Tours", suggestedTours, selectedSuggestedTours, toggleSuggestionSelection.bind(null, 'tours'))}
                {renderSuggestions("Suggested Sporting Events", suggestedSportingEvents, selectedSuggestedSportingEvents, toggleSuggestionSelection.bind(null, 'sportingEvents'))}
            </div>

            {(suggestedActivities.length > 0 || suggestedFoodLocations.length > 0 || suggestedThemeParks.length > 0 || suggestedTouristSpots.length > 0 || suggestedTours.length > 0 || suggestedSportingEvents.length > 0) && (
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Selected Suggestions:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {selectedSuggestedActivities.length > 0 && <li>Activities: {selectedSuggestedActivities.join(', ')}</li>}
                        {selectedSuggestedFoodLocations.length > 0 && <li>Food: {selectedSuggestedFoodLocations.join(', ')}</li>}
                        {selectedSuggestedThemeParks.length > 0 && <li>Theme Parks: {selectedSuggestedThemeParks.join(', ')}</li>}
                        {selectedSuggestedTouristSpots.length > 0 && <li>Tourist Spots: {selectedSuggestedTouristSpots.join(', ')}</li>}
                        {selectedSuggestedTours.length > 0 && <li>Tours: {selectedSuggestedTours.join(', ')}</li>}
                        {selectedSuggestedSportingEvents.length > 0 && <li>Sporting Events: {selectedSuggestedSportingEvents.join(', ')}</li>}
                        {selectedSuggestedActivities.length === 0 && selectedSuggestedFoodLocations.length === 0 &&
                         selectedSuggestedThemeParks.length === 0 && selectedSuggestedTouristSpots.length === 0 &&
                         selectedSuggestedTours.length === 0 && selectedSuggestedSportingEvents.length === 0 &&
                         <li>None selected yet. Select items above to include them in your plan summary.</li>}
                    </ul>
                </div>
            )}
        </SectionWrapper>
    );
};

export default ItinerarySuggestions;
