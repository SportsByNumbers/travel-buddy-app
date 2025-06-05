import React, { useContext, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { TripContext } from '../App'; // Removed .jsx
import SectionWrapper from './SectionWrapper'; // Removed .jsx
import TagInput from './TagInput'; // Removed .jsx
import InputField from './InputField'; // Removed .jsx
import { useCountrySearch } from '../hooks/useCountrySearch'; // Removed .js
import { fetchCountryData } from '../services/apiService'; // Removed .js

const HomeLocationSection = () => {
    const {
        homeCountry, setHomeCountry,
        homeCity, setHomeCity,
        newHomeCountryInput, setNewHomeCountryInput,
        newHomeCityInput, setNewHomeCityInput,
        homeCountryError, setHomeCountryError,
        homeCityError, setHomeCityError,
        allCountries // From App.js context
    } = useContext(TripContext);

    const homeCountryInputRef = useRef(null);
    const homeCityInputRef = useRef(null);

    const { inputValue: homeCountryInputValue, setInputValue: setHomeCountryInputValue, filteredSuggestions: filteredHomeCountrySuggestions, handleInputChange: handleHomeCountryInputChange, clearSuggestions: clearHomeCountrySuggestions } = useCountrySearch(allCountries, homeCountry.name ? [homeCountry] : []);

    const addHomeCountry = async () => {
        const trimmedCountry = homeCountryInputValue.trim();
        if (trimmedCountry === '') {
            setHomeCountryError("Home country cannot be empty.");
            return;
        }
        if (homeCountry.name.toLowerCase() === trimmedCountry.toLowerCase()) {
            setHomeCountryError("This is already your home country.");
            return;
        }
        const countryData = await fetchCountryData(trimmedCountry, allCountries);
        if (countryData.name) {
            setHomeCountry(countryData);
            setHomeCountryError('');
        } else {
            setHomeCountryError("Could not find a valid country for the entered name.");
        }
        setHomeCountryInputValue('');
        clearHomeCountrySuggestions();
    };

    const removeHomeCountry = () => {
        setHomeCountry({ name: '', flag: '' });
        setHomeCountryError("Please set your home country.");
    };

    const selectHomeCountrySuggestion = (country) => {
        setHomeCountry(country);
        setHomeCountryInputValue(''); // Clear input after selection
        clearHomeCountrySuggestions();
        setHomeCountryError('');
        homeCountryInputRef.current.focus();
    };

    const handleHomeCityChange = (e) => {
        setHomeCity(e.target.value);
        setHomeCityError(''); // Clear error on change
    };

    return (
        <SectionWrapper title="Your Home Location" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TagInput
                    label="Home Country"
                    inputRef={homeCountryInputRef}
                    inputValue={homeCountryInputValue}
                    onInputChange={handleHomeCountryInputChange}
                    onInputBlur={clearHomeCountrySuggestions}
                    onAdd={addHomeCountry}
                    suggestions={filteredHomeCountrySuggestions}
                    onSelectSuggestion={selectHomeCountrySuggestion}
                    items={homeCountry.name ? [homeCountry] : []}
                    onRemove={removeHomeCountry}
                    placeholder="e.g., Australia"
                    error={homeCountryError}
                    showFlags
                    required
                />
                <InputField
                    id="homeCity"
                    label="Home City"
                    value={homeCity}
                    onChange={handleHomeCityChange}
                    placeholder="e.g., Sydney"
                    error={homeCityError}
                    required
                />
            </div>
        </SectionWrapper>
    );
};

export default HomeLocationSection;
