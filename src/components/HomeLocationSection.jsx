// src/components/HomeLocationSection.jsx
import React, { useContext, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import TagInput from './TagInput.jsx';
import InputField from './InputField.jsx';
import { useCountrySearch } from '../hooks/useCountrySearch.js';
import { fetchCountryData } from '../services/apiService.js';
// Removed: import { safeRender } from '../utils/safeRender.js'; // This import is no longer needed here

const HomeLocationSection = () => {
    const {
        homeCountry, setHomeCountry,
        homeCity, setHomeCity,
        homeCountryError, setHomeCountryError,
        homeCityError, setHomeCityError,
        allCountries
    } = useContext(TripContext);

    const homeCountryInputRef = useRef(null);

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
        setHomeCountryInputValue('');
        clearHomeCountrySuggestions();
        setHomeCountryError('');
        if (homeCountryInputRef.current) {
            homeCountryInputRef.current.focus();
        }
    };

    const handleHomeCityChange = (e) => {
        setHomeCity(e.target.value);
        setHomeCityError('');
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
