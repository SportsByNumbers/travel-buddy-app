import React, { useContext, useRef, useEffect } from 'react';
import { Home } from 'lucide-react';
import { TripContext } from '../App'; // Adjust path if needed
import SectionWrapper from './SectionWrapper';
import TagInput from './TagInput';
import InputField from './InputField';
import { useCountrySearch } from '../hooks/useCountrySearch';
import { fetchCountryData } from '../services/apiService'; // Assuming you create apiService.js

const HomeLocationSection = () => {
    const { homeCountry, setHomeCountry, homeCity, setHomeCity, newHomeCountryInput, setNewHomeCountryInput, newHomeCityInput, setNewHomeCityInput, homeCountryError, setHomeCountryError, homeCityError, setHomeCityError, allCountries } = useContext(TripContext);
    const homeCountryInputRef = useRef(null);
    const { inputValue: countryInputValue, setInputValue: setCountryInputValue, filteredSuggestions: filteredHomeCountrySuggestions, handleInputChange: handleCountryInputChange, clearSuggestions: clearCountrySuggestions } = useCountrySearch(allCountries, homeCountry.name ? [homeCountry] : []);

    useEffect(() => {
        setNewHomeCountryInput(countryInputValue);
    }, [countryInputValue, setNewHomeCountryInput]);

    const handleSetHomeCountry = async () => {
        const trimmedHomeCountry = countryInputValue.trim();
        if (trimmedHomeCountry === '') {
            setHomeCountryError("Home country cannot be empty.");
            return;
        }
        const countryData = await fetchCountryData(trimmedHomeCountry, allCountries);
        if (countryData.name) {
            setHomeCountry(countryData);
            setCountryInputValue('');
            setHomeCountryError('');
        } else {
            setHomeCountryError("Could not find a valid country for the entered name.");
        }
        clearCountrySuggestions();
    };

    const selectHomeCountrySuggestion = (country) => {
        setCountryInputValue(country.name);
        setHomeCountry(country);
        setHomeCountryError('');
        clearCountrySuggestions();
        homeCountryInputRef.current.focus();
    };

    const handleSetHomeCity = () => {
        const trimmedHomeCity = newHomeCityInput.trim();
        if (trimmedHomeCity === '') {
            setHomeCityError("Home city cannot be empty.");
            return;
        }
        setHomeCity(trimmedHomeCity);
        setNewHomeCityInput('');
        setHomeCityError('');
    };

    return (
        <SectionWrapper title="Your Home Location" icon={Home}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <TagInput
                    label="Home Country"
                    inputRef={homeCountryInputRef}
                    inputValue={countryInputValue}
                    onInputChange={handleCountryInputChange}
                    onInputBlur={clearCountrySuggestions}
                    onAdd={handleSetHomeCountry}
                    suggestions={filteredHomeCountrySuggestions}
                    onSelectSuggestion={selectHomeCountrySuggestion}
                    items={homeCountry.name ? [homeCountry] : []}
                    onRemove={() => setHomeCountry({ name: '', flag: '' })}
                    placeholder="e.g., USA"
                    error={homeCountryError}
                    showFlags
                    required
                />
                <div>
                    <InputField
                        label="Home City"
                        id="newHomeCityInput"
                        value={newHomeCityInput}
                        onChange={(e) => { setNewHomeCityInput(e.target.value); setHomeCityError(''); }}
                        placeholder="e.g., New York"
                        error={homeCityError}
                        required
                    />
                     <button type="button" onClick={handleSetHomeCity} className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md mt-3 w-full">Set Home City</button>
                    {homeCity && (
                        <div className="mt-4 flex flex-wrap gap-3">
                            <span className="bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm">
                                {homeCity}
                                <button type="button" onClick={() => setHomeCity('')} className="ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition duration-200 ease-in-out">&times;</button>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </SectionWrapper>
    );
};

export default HomeLocationSection;
