// src/components/DestinationsSection.jsx
import React, { useContext, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import TagInput from './TagInput.jsx';
import InputField from './InputField.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
import { useCountrySearch } from '../hooks/useCountrySearch.js';
import { fetchCountryData } from '../services/apiService.js';
import { safeRender } from '../utils/safeRender.js'; 
// Import centralized options
import { STAR_RATING_OPTIONS, AVAILABLE_TOPICS } from '../constants/options.js';


const DestinationsSection = () => {
    const {
        countries, setCountries,
        cities, setCities,
        newCityName, setNewCityName,
        newCityDuration, setNewCityDuration,
        // MODIFIED: newCityStarRating is now an array
        newCityStarRating, setNewCityStarRating, 
        newCityTopics, setNewCityTopics,
        destCountryError, setDestCountryError,
        destCityError, setDestCityError,
        newCityNameError, setNewCityNameError,
        newCityDurationError, setNewCityDurationError,
        allCountries, 
    } = useContext(TripContext);

    const destCountryInputRef = useRef(null);

    const { inputValue: destCountryInputValue, setInputValue: setDestCountryInputValue, filteredSuggestions: filteredDestCountrySuggestions, handleInputChange: handleDestCountryInputChange, clearSuggestions: clearDestCountrySuggestions } = useCountrySearch(allCountries, countries);

    const addCountry = async () => {
        const trimmedCountry = destCountryInputValue.trim();
        if (trimmedCountry === '') {
            setDestCountryError("Destination country cannot be empty.");
            return;
        }
        const existingCountry = countries.find(c => c.name.toLowerCase() === trimmedCountry.toLowerCase());
        if (!existingCountry) {
            // fetchCountryData now also returns currencyCode, ensure it's handled if needed later
            const countryData = await fetchCountryData(trimmedCountry, allCountries); 
            if (countryData?.name) { 
                setCountries([...countries, countryData]);
                setDestCountryError('');
            } else {
                setDestCountryError("Could not find a valid country for the entered name.");
            }
        } else {
            setDestCountryError("This country has already been added.");
        }
        setDestCountryInputValue('');
        clearDestCountrySuggestions();
    };

    const removeCountry = (countryToRemove) => {
        setCountries(countries.filter(country => country.name !== countryToRemove.name));
        if (countries.filter(country => country.name !== countryToRemove.name).length === 0 && cities.length === 0) {
            setDestCountryError("Please add at least one destination country or city.");
        } else {
            setDestCountryError('');
        }
    };

    const selectDestCountrySuggestion = (country) => {
        setDestCountryInputValue(safeRender(country.name));
        if (!countries.some(c => c.name.toLowerCase() === country.name.toLowerCase())) {
            setCountries([...countries, country]);
        }
        clearDestCountrySuggestions();
        setDestCountryInputValue('');
        destCountryInputRef.current.focus();
    };

    const addCity = () => {
        if (newCityName.trim() === '') {
            setNewCityNameError("City name cannot be empty.");
            return;
        }
        if (newCityDuration <= 0) {
            setNewCityDurationError("Duration must be greater than 0.");
            return;
        }
        if (cities.some(c => c.name.toLowerCase() === newCityName.trim().toLowerCase())) {
            setNewCityNameError("This city has already been added.");
            return;
        }

        setCities([...cities, {
            name: newCityName.trim(),
            duration: parseInt(newCityDuration),
            // MODIFIED: newCityStarRating is now an array
            starRating: newCityStarRating, 
            topics: newCityTopics
        }]);

        setNewCityName('');
        setNewCityDuration(0);
        // MODIFIED: Reset newCityStarRating to empty array
        setNewCityStarRating([]); 
        setNewCityTopics([]);
        setNewCityNameError('');
        setNewCityDurationError('');
        setDestCityError('');
    };

    const removeCity = (cityToRemove) => {
        setCities(cities.filter(city => city.name !== cityToRemove.name));
        if (cities.filter(city => city.name !== cityToRemove.name).length === 0 && countries.length === 0) {
            setDestCityError("Please add at least one destination country or city.");
        } else {
            setDestCityError('');
        }
    };

    // This handles multi-select for city-specific topics
    const handleNewCityTopicChange = (topic) => {
        setNewCityTopics(prevTopics =>
            prevTopics.includes(topic)
                ? prevTopics.filter(t => t !== topic)
                : [...prevTopics, topic]
        );
    };

    // This handles multi-select for city-specific star ratings
    const handleNewCityStarRatingChange = useCallback((selectedRatings) => {
        setNewCityStarRating(selectedRatings);
    }, [setNewCityStarRating]);

    return (
        <SectionWrapper title="Travel Destinations" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TagInput
                    label="Add Destination Country"
                    inputRef={destCountryInputRef}
                    inputValue={destCountryInputValue}
                    onInputChange={handleDestCountryInputChange}
                    onInputBlur={clearDestCountrySuggestions}
                    onAdd={addCountry}
                    suggestions={filteredDestCountrySuggestions}
                    onSelectSuggestion={selectDestCountrySuggestion}
                    items={countries}
                    onRemove={removeCountry}
                    placeholder="e.g., Japan"
                    error={destCountryError && countries.length === 0 ? safeRender(destCountryError) : ''}
                    showFlags
                    required
                />
                <div>
                    <label htmlFor="newCityName" className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">Add Destination City:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        <InputField
                            id="newCityName"
                            label="City Name"
                            value={newCityName}
                            onChange={(e) => { setNewCityName(e.target.value); setNewCityNameError(''); setDestCityError('');}}
                            placeholder="e.g., Tokyo"
                            error={newCityNameError}
                            required
                        />
                        <InputField
                            type="number"
                            id="newCityDuration"
                            label="Days"
                            value={newCityDuration}
                            onChange={(e) => { setNewCityDuration(parseInt(e.target.value) || 0); setNewCityDurationError('');}}
                            placeholder="e.g., 5"
                            min="0"
                            error={newCityDurationError}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {/* MODIFIED: Changed to CheckboxGroup for multi-select star ratings */}
                        <CheckboxGroup
                            label="City Hotel Rating (Optional)"
                            options={STAR_RATING_OPTIONS.filter(opt => opt.value !== '').map(opt => ({ value: opt.value, label: opt.label }))} // Filter out 'Any' option
                            selected={newCityStarRating}
                            onChange={handleNewCityStarRatingChange}
                            columns={1} // Or adjust columns as needed
                        />
                        <CheckboxGroup
                            label="City-Specific Topics"
                            options={AVAILABLE_TOPICS.map(topic => ({ value: topic, label: topic }))} // Map raw topics to {value, label}
                            selected={newCityTopics}
                            onChange={handleNewCityTopicChange}
                            columns={2}
                        />
                    </div>
                    <button type="button" onClick={addCity} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md w-full">Add City</button>
                    {destCityError && cities.length === 0 && <p className="text-red-500 text-xs mt-1">{safeRender(destCityError)}</p>}
                    <div className="mt-4 flex flex-col gap-3">
                        {cities.map((city, index) => (
                            <span key={safeRender(city.name || index)} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex justify-between items-center text-sm font-medium shadow-sm">
                                <span>
                                    {safeRender(city.name)} ({safeRender(city.duration)} days)
                                    {/* Render multiple star ratings if available */}
                                    {Array.isArray(city.starRating) && city.starRating.length > 0 && ` - ${city.starRating.map(s => `${s} Star`).join(', ')}`}
                                    {/* Ensure city.topics is an array before joining and rendering */}
                                    {Array.isArray(city.topics) && city.topics.length > 0 && ` [${safeRender(city.topics)}]`}
                                </span>
                                <button type="button" onClick={() => removeCity(city)} className="ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition duration-200 ease-in-out">&times;</button>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default DestinationsSection;
