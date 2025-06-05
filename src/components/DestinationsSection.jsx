import React, { useContext, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import TagInput from './TagInput';
import InputField from './InputField';
import CheckboxGroup from './CheckboxGroup';
import { useCountrySearch } from '../hooks/useCountrySearch';
import { fetchCountryData } from '../services/apiService';

const DestinationsSection = () => {
    const { countries, setCountries, cities, setCities, newCityName, setNewCityName, newCityDuration, setNewCityDuration, newCityStarRating, setNewCityStarRating, newCityTopics, setNewCityTopics, destCountryError, setDestCountryError, destCityError, setDestCityError, newCityNameError, setNewCityNameError, newCityDurationError, setNewCityDurationError, allCountries, availableTopics } = useContext(TripContext);
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
            const countryData = await fetchCountryData(trimmedCountry, allCountries);
            if (countryData.name) {
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
        setDestCountryInputValue(country.name);
        if (!countries.some(c => c.name.toLowerCase() === country.name.toLowerCase())) {
            setCountries([...countries, country]);
        }
        clearDestCountrySuggestions();
        setDestCountryInputValue(''); // Clear input after selection
        setDestCountryError('');
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
            starRating: newCityStarRating,
            topics: newCityTopics // Use newCityTopics for city-specific interests
        }]);

        setNewCityName('');
        setNewCityDuration(0);
        setNewCityStarRating('');
        setNewCityTopics([]); // Clear city-specific topics
        setNewCityNameError('');
        setNewCityDurationError('');
        setDestCityError(''); // Clear overall dest city error if fixed
    };

    const removeCity = (cityToRemove) => {
        setCities(cities.filter(city => city.name !== cityToRemove.name));
        if (cities.filter(city => city.name !== cityToRemove.name).length === 0 && countries.length === 0) {
            setDestCityError("Please add at least one destination country or city.");
        } else {
            setDestCityError('');
        }
    };

    const handleNewCityTopicChange = (topic) => {
        setNewCityTopics(prevTopics =>
            prevTopics.includes(topic)
                ? prevTopics.filter(t => t !== topic)
                : [...prevTopics, topic]
        );
    };

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
                    error={destCountryError && countries.length === 0 ? destCountryError : ''}
                    showFlags
                    required
                />
                <div>
                    <label htmlFor="newCityName" className="block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500">Add Destination City:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        <InputField
                            id="newCityName"
                            value={newCityName}
                            onChange={(e) => { setNewCityName(e.target.value); setNewCityNameError(''); setDestCityError('');}}
                            placeholder="City Name (e.g., Tokyo)"
                            error={newCityNameError}
                        />
                        <InputField
                            type="number"
                            id="newCityDuration"
                            value={newCityDuration}
                            onChange={(e) => { setNewCityDuration(parseInt(e.target.value) || 0); setNewCityDurationError('');}}
                            placeholder="Days (e.g., 5)"
                            min="0"
                            error={newCityDurationError}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        <InputField
                            type="select"
                            id="newCityStarRating"
                            value={newCityStarRating}
                            onChange={(e) => setNewCityStarRating(e.target.value)}
                            label="City Hotel Rating (Optional)" // Label for the select itself
                        >
                            <option value="">City Hotel Rating (Optional)</option>
                            <option value="1">1 Star (Budget)</option>
                            <option value="2">2 Star (Economy)</option>
                            <option value="3">3 Star (Mid-Range)</option>
                            <option value="4">4 Star (First Class)</option>
                            <option value="5">5 Star (Luxury)</option>
                        </InputField>
                        <CheckboxGroup
                            label="City-Specific Topics"
                            options={availableTopics.map(topic => topic.split(' ')[0])} // Shorten for space
                            selected={newCityTopics}
                            onChange={handleNewCityTopicChange}
                            columns={2}
                        />
                    </div>
                    <button type="button" onClick={addCity} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md w-full">Add City</button>
                    {destCityError && cities.length === 0 && <p className="text-red-500 text-xs mt-1">{destCityError}</p>}
                    <div className="mt-4 flex flex-col gap-3">
                        {cities.map((city) => (
                            <span key={city.name} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex justify-between items-center text-sm font-medium shadow-sm">
                                <span>
                                    {city.name} ({city.duration} days)
                                    {city.starRating && ` - ${city.starRating} Star`}
                                    {city.topics.length > 0 && ` [${city.topics.join(', ')}]`}
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
