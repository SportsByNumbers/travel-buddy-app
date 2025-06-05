import React, { useContext } from 'react';
import { Compass, Loader } from 'lucide-react';
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import ToggleButton from './ToggleButton';
import { fetchAI } from '../services/apiService';

const ItinerarySuggestions = () => {
    const { countries, cities, homeCountry, homeCity, startDate, endDate, topicsOfInterest,
            isGeneratingSuggestions, setIsGeneratingSuggestions, suggestionError, setSuggestionError,
            suggestedActivities, setSuggestedActivities, selectedSuggestedActivities,
            suggestedFoodLocations, setSuggestedFoodLocations, selectedSuggestedFoodLocations,
            suggestedThemeParks, setSuggestedThemeParks, selectedSuggestedThemeParks,
            suggestedTouristSpots, setSuggestedTouristSpots, selectedSuggestedTouristSpots,
            suggestedTours, setSuggestedTours, selectedSuggestedTours,
            suggestedSportingEvents, setSuggestedSportingEvents, selectedSuggestedSportingEvents,
            toggleSuggestionSelection,
            // ADDED: Destructure the individual setSelected functions from context
            setSelectedSuggestedActivities,
            setSelectedSuggestedFoodLocations,
            setSelectedSuggestedThemeParks,
            setSelectedSuggestedTouristSpots,
            setSelectedSuggestedTours,
            setSelectedSuggestedSportingEvents
    } = useContext(TripContext);

    const buttonClass = "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md";

    const generateSuggestions = async () => {
        if (countries.length === 0 && cities.length === 0) {
            setSuggestionError("Please select at least one country or city to get suggestions.");
            return;
        }

        setIsGeneratingSuggestions(true);
        setSuggestionError('');

        // Clear previous AI-generated suggestions
        setSuggestedActivities([]);
        setSuggestedFoodLocations([]);
        setSuggestedThemeParks([]);
        setSuggestedTouristSpots([]);
        setSuggestedTours([]);
        setSuggestedSportingEvents([]);

        // Clear previous user selections for these suggestions
        // Now that these are destructured from context, you can directly use them.
        setSelectedSuggestedActivities([]);
        setSelectedSuggestedFoodLocations([]);
        setSelectedSuggestedThemeParks([]);
        setSelectedSuggestedTouristSpots([]);
        setSelectedSuggestedTours([]);
        setSelectedSuggestedSportingEvents([]);


        const destinationPromptCountries = countries.length > 0 ? `countries: ${countries.map(c => c.name).join(', ')}` : '';
        const destinationPromptCities = cities.length > 0 ? `cities: ${cities.map(c => `${c.name} (${c.duration} days, ${c.starRating || 'any'} star)`).join(', ')}` : '';

        let fullDestinationPrompt = '';
        if (destinationPromptCountries && destinationPromptCities) {
            fullDestinationPrompt = `in the ${destinationPromptCountries} and ${destinationPromptCities}`;
        } else if (destinationPromptCountries) {
            fullDestinationPrompt = `in the ${destinationPromptCountries}`;
        } else if (destinationPromptCities) {
            fullDestinationPrompt = `in the ${destinationPromptCities}`;
        }

        const topicsPrompt = topicsOfInterest.length > 0
            ? `with overall trip topics such as: ${topicsOfInterest.join(', ')}`
            : '';

        const homeLocationContext = (homeCountry.name && homeCity)
            ? `suitable for a trip from ${homeCity}, ${homeCountry.name}`
            : homeCountry.name
                ? `suitable for a trip from ${homeCountry.name}`
                : '';

        const dateContext = (startDate && endDate)
            ? `between ${startDate.toDateString()} and ${endDate.toDateString()}`
            ? `between ${startDate.toDateString()} and ${endDate.toDateString()}`
            : 'at any time of year';

        const prompt = `Suggest 5-7 popular activities, 5-7 popular food locations (e.g., specific restaurants, food markets), 2-3 popular theme parks, 5-7 popular tourist spots, 3-5 popular tours, and 3-5 popular sporting events ${fullDestinationPrompt} ${homeLocationContext} ${dateContext} ${topicsPrompt}. Consider varied hotel star ratings and specific city durations if provided. Provide the response as a JSON object with keys: "activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents". Each key's value should be an array of strings.`;

        const suggestionSchema = {
            type: "OBJECT",
            properties: {
                "activities": { "type": "ARRAY", "items": { "type": "STRING" } },
                "foodLocations": { "type": "ARRAY", "items": { "type": "STRING" } },
                "themeParks": { "type": "ARRAY", "items": { "type": "STRING" } },
                "touristSpots": { "type": "ARRAY", "items": { "type": "STRING" } },
                "tours": { "type": "ARRAY", "items": { "type": "STRING" } },
                "sportingEvents": { "type": "ARRAY", "items": { "type": "STRING" } }
            }
        };

        try {
            const parsedJson = await fetchAI(prompt, suggestionSchema);

            setSuggestedActivities(parsedJson.activities || []);
            setSuggestedFoodLocations(parsedJson.foodLocations || []);
            setSuggestedThemeParks(parsedJson.themeParks || []);
            setSuggestedTouristSpots(parsedJson.touristSpots || []);
            setSuggestedTours(parsedJson.tours || []);
            setSuggestedSportingEvents(parsedJson.sportingEvents || []);

        } catch (error) {
            console.error("Error generating suggestions:", error);
            setSuggestionError(error.message || "An error occurred while generating suggestions.");
        } finally {
            setIsGeneratingSuggestions(false);
        }
    };

    const SuggestionCategory = ({ title, items, selectedItems, toggleHandler, isLoading }) => (
        items.length > 0 && ( // Only render category if there are items
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-indigo-700 mb-3">{title}:</h3>
                <div className="flex flex-wrap gap-2">
                    {isLoading ? (
                        <div className="flex items-center text-gray-500">
                            <Loader className="animate-spin mr-2" size={16} /> Loading {title.toLowerCase()}...
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <ToggleButton
                                key={index}
                                item={item}
                                isSelected={selectedItems.includes(item)}
                                onToggle={() => toggleHandler(item)}
                            />
                        ))
                    )}
                </div>
            </div>
        )
    );

    return (
        <SectionWrapper title="Itinerary Suggestions" icon={Compass}>
            <p className="text-sm text-gray-600 mb-6">
                Generate AI-powered suggestions for your itinerary. Click on suggestions to add them to your plan.
            </p>
            <div className="text-center mb-6">
                <button
                    onClick={generateSuggestions}
                    className={buttonClass}
                    disabled={isGeneratingSuggestions || (countries.length === 0 && cities.length === 0)}
                >
                    {isGeneratingSuggestions ? (
                        <span className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" size={20} /> Generating Suggestions...
                        </span>
                    ) : (
                        'Generate Itinerary Suggestions'
                    )}
                </button>
                {suggestionError && <p className="text-red-500 text-sm mt-2">{suggestionError}</p>}
            </div>

            <SuggestionCategory title="Activities" items={suggestedActivities} selectedItems={selectedSuggestedActivities} toggleHandler={(item) => toggleSuggestionSelection('activities', item)} isLoading={isGeneratingSuggestions} />
            <SuggestionCategory title="Sporting Events" items={suggestedSportingEvents} selectedItems={selectedSuggestedSportingEvents} toggleHandler={(item) => toggleSuggestionSelection('sportingEvents', item)} isLoading={isGeneratingSuggestions} />
            <SuggestionCategory title="Food Locations" items={suggestedFoodLocations} selectedItems={selectedSuggestedFoodLocations} toggleHandler={(item) => toggleSuggestionSelection('foodLocations', item)} isLoading={isGeneratingSuggestions} />
            <SuggestionCategory title="Theme Parks" items={suggestedThemeParks} selectedItems={selectedSuggestedThemeParks} toggleHandler={(item) => toggleSuggestionSelection('themeParks', item)} isLoading={isGeneratingSuggestions} />
            <SuggestionCategory title="Tourist Spots" items={suggestedTouristSpots} selectedItems={selectedSuggestedTouristSpots} toggleHandler={(item) => toggleSuggestionSelection('touristSpots', item)} isLoading={isGeneratingSuggestions} />
            <SuggestionCategory title="Tours" items={suggestedTours} selectedItems={selectedSuggestedTours} toggleHandler={(item) => toggleSuggestionSelection('tours', item)} isLoading={isGeneratingSuggestions} />
        </SectionWrapper>
    );
};

export default ItinerarySuggestions;
