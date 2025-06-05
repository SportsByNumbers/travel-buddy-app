import { useState } from 'react';

export const useCountrySearch = (allCountries, existingCountries = []) => {
    const [inputValue, setInputValue] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value.length > 1) { // Start filtering after 1 character
            setFilteredSuggestions(
                allCountries.filter(country =>
                    country.name.toLowerCase().includes(value.toLowerCase()) &&
                    !existingCountries.some(c => c.name.toLowerCase() === country.name.toLowerCase()) // Exclude already added countries
                ).slice(0, 10) // Limit to 10 suggestions
            );
        } else {
            setFilteredSuggestions([]);
        }
    };

    const clearSuggestions = () => {
        // Delay clearing to allow onMouseDown on suggestion item to fire
        setTimeout(() => setFilteredSuggestions([]), 100);
    };

    return {
        inputValue,
        setInputValue, // Expose setter to allow external updates (e.g., when a suggestion is selected)
        filteredSuggestions,
        handleInputChange,
        clearSuggestions,
    };
};
