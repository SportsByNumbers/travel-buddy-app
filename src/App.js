import React, { useState, useEffect, useRef } from 'react';
// Corrected Lucide imports - removed unused icons as per ESLint warnings
import { MapPin, Compass, Utensils, Car, Wallet, CheckCircle, Loader, Home } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


// Main App component
const App = () => {
  // State variables for various inputs
  const [countries, setCountries] = useState([]); // Stores { name: string, flag: string } for destinations
  const [newCountry, setNewCountry] = useState('');
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  // Start and End Dates
  const [startDate, setStartDate] = useState(null); // Initial state is null
  const [endDate, setEndDate] = useState(null); // Initial state is null
  // Duration will now be derived, with corrected parentheses for ESLint
  // ESLint Fix: Added parentheses to clarify the order of operations for '&&' and '?'
  const duration = (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
  const [starRating, setStarRating] = useState('');

  // State for Home Location
  const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' }); // Stores { name: string, flag: string }
  const [newHomeCountryInput, setNewHomeCountryInput] = useState(''); // Input for home country
  const [homeCity, setHomeCity] = useState(''); // Home city as string
  const [newHomeCityInput, setNewHomeCityInput] = useState(''); // Input for home city

  // Topics of interest
  const [topicsOfInterest, setTopicsOfInterest] = useState([]);
  const availableTopics = ['Food', 'Sport', 'Culture', 'Theme Parks', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Relaxation'];

  // Budget Planning states
  const [isPerPerson, setIsPerPerson] = useState(true); // true for per person, false for per party
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [estimatedFlightCost, setEstimatedFlightCost] = useState(0);
  const [estimatedHotelCost, setEstimatedHotelCost] = useState(0);
  const [estimatedActivityCost, setEstimatedActivityCost] = useState(0);
  const [estimatedTransportCost, setEstimatedTransportCost] = useState(0);
  // CORRECTED: Proper useState declaration
  const [estimatedMiscellaneousCost, setEstimatedMiscellaneousCost] = useState(0);

  // Food allowances
  const [breakfastAllowance, setBreakfastAllowance] = useState(0);
  const [lunchAllowance, setLunchAllowance] = useState(0);
  const [dinnerAllowance, setDinnerAllowance] = useState(0);
  const [snacksAllowance, setSnacksAllowance] = useState(0);

  // Transport options
  const [carRental, setCarRental] = useState(false);
  const [shuttle, setShuttle] = useState(false);
  const [airportTransfers, setAirportTransfers] = useState(false);
  const [airportParking, setAirportParking] = useState(false);

  // State for the generated travel plan summary
  const [travelPlanSummary, setTravelPlanSummary] = useState(null);

  // States for AI-generated suggestions
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [suggestedFoodLocations, setSuggestedFoodLocations] = useState([]);
  const [suggestedThemeParks, setSuggestedThemeParks] = useState([]);
  const [suggestedTouristSpots, setSuggestedTouristSpots] = useState([]);
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [suggestedSportingEvents, setSuggestedSportingEvents] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');

  // States for selected AI-generated suggestions
  const [selectedSuggestedActivities, setSelectedSuggestedActivities] = useState([]);
  const [selectedSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useState([]);
  const [selectedSuggestedThemeParks, setSelectedSuggestedThemeParks] = useState([]);
  const [selectedSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useState([]);
  const [selectedSuggestedTours, setSelectedSuggestedTours] = useState([]);
  const [selectedSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useState([]);

  // States for AI-generated budget
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState('');

  // States for country suggestions (predictive text)
  const [allCountries, setAllCountries] = useState([]); // Full list of countries for suggestions
  const [filteredHomeCountrySuggestions, setFilteredHomeCountrySuggestions] = useState([]);
  const [filteredDestCountrySuggestions, setFilteredDestCountrySuggestions] = useState([]);
  const homeCountryInputRef = useRef(null); // Ref for home country input
  const destCountryInputRef = useRef(null); // Ref for destination country input


  // --- EFFECT: Fetch all countries on component mount for predictive text ---
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
        // CORRECTED: Removed Markdown link formatting from URL
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await response.json();
        setAllCountries(data.map(country => ({
          name: country.name.common,
          flag: country.flags.svg
        })));
      } catch (error) {
        console.error("Error fetching all countries for suggestions:", error);
      }
    };
    fetchAllCountries();
  }, []);

  // Function to fetch specific country flag/data
  const fetchCountryFlag = async (countryName) => {
    if (!countryName) return { name: '', flag: '' };
    // Try to find in already fetched allCountries to avoid new API call if possible
    const foundCountry = allCountries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (foundCountry) return foundCountry;

    // Fallback: If not found in allCountries, make a specific API call
    try {
      let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=flags,name&fullText=true`);
      if (!response.ok) {
        // Try partial match if exact match fails
        response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=flags,name`);
        if (!response.ok) {
          console.warn(`Could not find flag for country: ${countryName}`);
          return { name: countryName, flag: '' };
        }
      }
      const data = await response.json();
      if (data && data.length > 0) {
        return { name: data[0].name.common, flag: data[0].flags.svg };
      }
      return { name: countryName, flag: '' };
    } catch (error) {
      console.error("Error fetching country flag:", error);
      return { name: countryName, flag: '' };
    }
  };

  // --- HANDLERS FOR HOME LOCATION INPUTS AND PREDICTIVE TEXT ---
  const handleHomeCountryInputChange = (e) => {
    const value = e.target.value;
    setNewHomeCountryInput(value);
    if (value.length > 1) { // Start filtering after 1 character
      setFilteredHomeCountrySuggestions(
        allCountries.filter(country =>
          country.name.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 10) // Limit to 10 suggestions
      );
    } else {
      setFilteredHomeCountrySuggestions([]);
    }
  };

  const selectHomeCountrySuggestion = async (country) => {
    setNewHomeCountryInput(country.name); // Set input text to selected country name
    setHomeCountry(country); // Set home country state with selected country object
    setFilteredHomeCountrySuggestions([]); // Clear suggestions
    homeCountryInputRef.current.focus(); // Keep focus on input after selection
  };

  const handleSetHomeCountry = async () => {
    const trimmedHomeCountry = newHomeCountryInput.trim();
    if (trimmedHomeCountry !== '') {
      const countryData = await fetchCountryFlag(trimmedHomeCountry);
      if (countryData.name) { // Only set if a valid country name was found/matched
        setHomeCountry(countryData);
      }
      setNewHomeCountryInput(''); // Clear input after setting
      setFilteredHomeCountrySuggestions([]); // Clear suggestions
    }
  };

  const handleSetHomeCity = () => {
    const trimmedHomeCity = newHomeCityInput.trim();
    if (trimmedHomeCity !== '') {
      setHomeCity(trimmedHomeCity);
      setNewHomeCityInput('');
    }
  };

  // --- HANDLERS FOR DESTINATION INPUTS AND PREDICTIVE TEXT ---
  const handleDestCountryInputChange = (e) => {
    const value = e.target.value;
    setNewCountry(value);
    if (value.length > 1) { // Start filtering after 1 character
      setFilteredDestCountrySuggestions(
        allCountries.filter(country =>
          country.name.toLowerCase().includes(value.toLowerCase()) &&
          !countries.some(c => c.name.toLowerCase() === country.name.toLowerCase()) // Exclude already added countries
        ).slice(0, 10) // Limit to 10 suggestions
      );
    } else {
      setFilteredDestCountrySuggestions([]);
    }
  };

  const selectDestCountrySuggestion = async (country) => {
    setNewCountry(country.name); // Set input text to selected country name
    if (!countries.some(c => c.name.toLowerCase() === country.name.toLowerCase())) {
      setCountries([...countries, country]); // Add selected country object to destinations
    }
    setFilteredDestCountrySuggestions([]); // Clear suggestions
    destCountryInputRef.current.focus(); // Keep focus on input after selection
  };

  const addCountry = async () => {
    const trimmedCountry = newCountry.trim();
    if (trimmedCountry !== '') {
      const existingCountry = countries.find(c => c.name.toLowerCase() === trimmedCountry.toLowerCase());
      if (!existingCountry) {
        const countryData = await fetchCountryFlag(trimmedCountry);
        if (countryData.name) { // Only add if a valid country name was found/matched
          setCountries([...countries, countryData]);
        }
      }
      setNewCountry(''); // Clear input after adding
      setFilteredDestCountrySuggestions([]); // Clear suggestions
    }
  };

  const removeCountry = (countryToRemove) => {
    setCountries(countries.filter(country => country.name !== countryToRemove.name));
  };

  const addCity = () => {
    if (newCity.trim() !== '' && !cities.includes(newCity.trim())) {
      setCities([...cities, newCity.trim()]);
      setNewCity('');
    }
  };

  const removeCity = (cityToRemove) => {
    setCities(cities.filter(city => city !== cityToRemove));
  };

  // --- HANDLERS FOR ITINERARY SUGGESTIONS AND TOPICS ---
  const toggleSuggestionSelection = (category, item) => {
    const setterMap = {
      activities: setSelectedSuggestedActivities,
      foodLocations: setSelectedSuggestedFoodLocations,
      themeParks: setSelectedSuggestedThemeParks,
      touristSpots: setSelectedSuggestedTouristSpots,
      tours: setSelectedSuggestedTours,
      sportingEvents: setSelectedSuggestedSportingEvents,
    };
    const currentSelectionsMap = {
      activities: selectedSuggestedActivities,
      foodLocations: selectedSuggestedFoodLocations,
      themeParks: selectedSuggestedThemeParks,
      touristSpots: selectedSuggestedTouristSpots,
      tours: selectedSuggestedTours,
      sportingEvents: selectedSuggestedSportingEvents,
    };

    const currentSelections = currentSelectionsMap[category];
    const setter = setterMap[category];

    if (currentSelections.includes(item)) {
      setter(currentSelections.filter(selectedItem => selectedItem !== item));
    } else {
      setter([...currentSelections, item]);
    }
  };

  const handleTopicChange = (topic) => {
    setTopicsOfInterest(prevTopics =>
      prevTopics.includes(topic)
        ? prevTopics.filter(t => t !== topic)
        : [...prevTopics, topic]
    );
  };


  // --- AI GENERATION FUNCTIONS ---
  const generateSuggestions = async () => {
    if (countries.length === 0 && cities.length === 0) {
      setSuggestionError("Please select at least one country or city to get suggestions.");
      return;
    }

    setIsGeneratingSuggestions(true);
    setSuggestionError('');

    // Clear previous suggestions and selections
    setSuggestedActivities([]);
    setSuggestedFoodLocations([]);
    setSuggestedThemeParks([]);
    setSuggestedTouristSpots([]);
    setSuggestedTours([]);
    setSuggestedSportingEvents([]);
    setSelectedSuggestedActivities([]);
    setSelectedSuggestedFoodLocations([]);
    setSelectedSuggestedThemeParks([]);
    setSelectedSuggestedTouristSpots([]);
    setSelectedSuggestedTours([]);
    setSelectedSuggestedSportingEvents([]);


    // ESLint Fix: Added parentheses to clarify the order of operations for '&&' and ':'
    const destinationPrompt = (countries.length > 0 && cities.length > 0)
      ? `in the countries: ${countries.map(c => c.name).join(', ')} and cities: ${cities.join(', ')}`
      : (countries.length > 0)
        ? `in the countries: ${countries.map(c => c.name).join(', ')}`
        : `in the cities: ${cities.join(', ')}`;

    const topicsPrompt = topicsOfInterest.length > 0
      ? `with a focus on topics such as: ${topicsOfInterest.join(', ')}`
      : '';

    const prompt = `Suggest 5-7 popular activities, 5-7 popular food locations (e.g., specific restaurants, food markets), 2-3 popular theme parks, 5-7 popular tourist spots, 3-5 popular tours, and 3-5 popular sporting events ${destinationPrompt} ${topicsPrompt}. Provide the response as a JSON object with keys: "activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents". Each key's value should be an array of strings.`;

    const apiKey = "AIzaSyDYgF6Mc-fSbM_DO9e5cLkgLaJ6lFXscok"; // Your Gemini API Key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonString);

        setSuggestedActivities(parsedJson.activities || []);
        setSuggestedFoodLocations(parsedJson.foodLocations || []);
        setSuggestedThemeParks(parsedJson.themeParks || []);
        setSuggestedTouristSpots(parsedJson.touristSpots || []);
        setSuggestedTours(parsedJson.tours || []);
        setSuggestedSportingEvents(parsedJson.sportingEvents || []);

      } else {
        setSuggestionError("Failed to get suggestions. Please try again.");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setSuggestionError("An error occurred while generating suggestions.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateBudgetEstimates = async () => {
    if (countries.length === 0 && cities.length === 0 || duration < 1 || numberOfPeople < 1) {
      setBudgetError("Please ensure countries/cities, duration, and number of people are set to generate budget estimates.");
      return;
    }

    setIsGeneratingBudget(true);
    setBudgetError('');

    // ESLint Fix: Added parentheses to clarify the order of operations for '&&' and ':'
    const destinationPrompt = (countries.length > 0 && cities.length > 0)
      ? `for a trip to ${countries.map(c => c.name).join(' and ')} (cities: ${cities.join(', ')})`
      : (countries.length > 0)
        ? `for a trip to ${countries.map(c => c.name).join(' and ')}`
        : `for a trip to ${cities.join(', ')}`;

    const homeLocationPrompt = homeCountry.name && homeCity
      ? `starting from ${homeCity}, ${homeCountry.name}`
      : homeCountry.name
        ? `starting from ${homeCountry.name}`
        : '';

    const itineraryPrompt = [
      selectedSuggestedActivities.length > 0 ? `activities: ${selectedSuggestedActivities.join(', ')}` : '',
      selectedSuggestedFoodLocations.length > 0 ? `food: ${selectedSuggestedFoodLocations.join(', ')}` : '',
      selectedSuggestedThemeParks.length > 0 ? `theme parks: ${selectedSuggestedThemeParks.join(', ')}` : '',
      selectedSuggestedTouristSpots.length > 0 ? `tourist spots: ${selectedSuggestedTouristSpots.join(', ')}` : '',
      selectedSuggestedTours.length > 0 ? `tours: ${selectedSuggestedTours.join(', ')}` : '',
      selectedSuggestedSportingEvents.length > 0 ? `sporting events: ${selectedSuggestedSportingEvents.join(', ')}` : ''
    ].filter(Boolean).join('; ');

    const transportOptions = [
      carRental ? 'car rental' : '',
      shuttle ? 'shuttle' : '',
      airportTransfers ? 'airport transfers' : '',
      airportParking ? 'airport parking' : ''
    ].filter(Boolean).join(', ');

    const prompt = `Estimate the following costs in USD for a ${duration}-day trip ${destinationPrompt} ${homeLocationPrompt} for ${numberOfPeople} ${isPerPerson ? 'person' : 'party'}.
    Consider these itinerary items: ${itineraryPrompt || 'general sightseeing'}.
    Preferred hotel star rating: ${starRating || 'any'}.
    Transport options: ${transportOptions || 'standard public transport'}.
    Provide the response as a JSON object with keys: "estimatedFlightCost", "estimatedHotelCost", "estimatedActivityCost", "estimatedTransportCost", "estimatedMiscellaneousCost", "breakfastAllowance", "lunchAllowance", "dinnerAllowance", "snacksAllowance". All values should be numbers.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "estimatedFlightCost": { "type": "NUMBER" },
            "estimatedHotelCost": { "type": "NUMBER" },
            "estimatedActivityCost": { "type": "NUMBER" },
            "estimatedTransportCost": { "type": "NUMBER" },
            "estimatedMiscellaneousCost": { "type": "NUMBER" },
            "breakfastAllowance": { "type": "NUMBER" },
            "lunchAllowance": { "type": "NUMBER" },
            "dinnerAllowance": { "type": "NUMBER" },
            "snacksAllowance": { "type": "NUMBER" }
          },
          "propertyOrdering": [
            "estimatedFlightCost", "estimatedHotelCost", "estimatedActivityCost",
            "estimatedTransportCost", "estimatedMiscellaneousCost",
            "breakfastAllowance", "lunchAllowance", "dinnerAllowance", "snacksAllowance"
          ]
        }
      }
    };

    const apiKey = "AIzaSyDYgF6Mc-fSbM_DO9e5cLkgLaJ6lFXscok"; // Your Gemini API Key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonString);

        // Auto-populate fields with AI-generated values
        setEstimatedFlightCost(parsedJson.estimatedFlightCost || 0);
        setEstimatedHotelCost(parsedJson.estimatedHotelCost || 0);
        setEstimatedActivityCost(parsedJson.estimatedActivityCost || 0);
        setEstimatedTransportCost(parsedJson.estimatedTransportCost || 0);
        setEstimatedMiscellaneousCost(parsedJson.estimatedMiscellaneousCost || 0);
        setBreakfastAllowance(parsedJson.breakfastAllowance || 0);
        setLunchAllowance(parsedJson.lunchAllowance || 0);
        setDinnerAllowance(parsedJson.dinnerAllowance || 0);
        setSnacksAllowance(parsedJson.snacksAllowance || 0);

      } else {
        setBudgetError("Failed to get budget estimates. Please try again.");
      }
    } catch (error) {
      console.error("Error generating budget estimates:", error);
      setBudgetError("An error occurred while generating budget estimates.");
    } finally {
      setIsGeneratingBudget(false);
    }
  };


  // --- MAIN TRAVEL PLAN CALCULATION ---
  const calculateTravelPlan = () => {
    // Combine selected suggested items (as manual input fields are removed for these)
    const finalActivities = selectedSuggestedActivities.filter(Boolean).join(', ');
    const finalFoodLocations = selectedSuggestedFoodLocations.filter(Boolean).join(', ');
    const finalThemeParks = selectedSuggestedThemeParks.filter(Boolean).join(', ');
    const finalTouristSpots = selectedSuggestedTouristSpots.filter(Boolean).join(', ');
    const finalTours = selectedSuggestedTours.filter(Boolean).join(', ');
    const finalSportingEvents = selectedSuggestedSportingEvents.filter(Boolean).join(', ');


    // Calculate total food allowance per day
    const totalDailyFoodAllowance = parseFloat(breakfastAllowance) + parseFloat(lunchAllowance) + parseFloat(dinnerAllowance) + parseFloat(snacksAllowance);
    const totalFoodCost = totalDailyFoodAllowance * duration; // Use derived duration

    // Calculate total estimated costs
    const totalEstimatedCost =
      parseFloat(estimatedFlightCost) +
      parseFloat(estimatedHotelCost) +
      parseFloat(estimatedActivityCost) +
      parseFloat(estimatedTransportCost) +
      parseFloat(estimatedMiscellaneousCost);

    // Adjust costs based on per person/per party
    const finalTotalCost = isPerPerson ? totalEstimatedCost * parseInt(numberOfPeople) : totalEstimatedCost;
    const finalTotalFoodCost = isPerPerson ? totalFoodCost * parseInt(numberOfPeople) : totalFoodCost;

    setTravelPlanSummary({
      homeCountry,
      homeCity,
      countries,
      cities,
      duration, // Still pass duration in summary
      startDate: startDate ? startDate.toLocaleDateString() : 'Not set', // Pass formatted dates
      endDate: endDate ? endDate.toLocaleDateString() : 'Not set',
      starRating,
      activities: finalActivities,
      sportingEvents: finalSportingEvents,
      foodLocations: finalFoodLocations,
      themeParks: finalThemeParks,
      touristSpots: finalTouristSpots,
      tours: finalTours, // Include tours in summary
      isPerPerson,
      numberOfPeople,
      estimatedFlightCost,
      estimatedHotelCost,
      estimatedActivityCost,
      estimatedTransportCost,
      estimatedMiscellaneousCost,
      totalEstimatedCost: finalTotalCost, // This is the sum of estimated costs before food
      breakfastAllowance,
      lunchAllowance,
      dinnerAllowance,
      snacksAllowance,
      totalDailyFoodAllowance,
      totalFoodCost: finalTotalFoodCost,
      carRental,
      shuttle,
      airportTransfers,
      airportParking,
      grandTotal: finalTotalCost + finalTotalFoodCost, // Grand total including food
      topicsOfInterest, // Include topics of interest in summary
    });
  };

  // --- TAILWIND CSS CLASSES FOR CONSISTENT STYLING ---
  const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionContainerClass = "mb-8 p-6 bg-white rounded-xl shadow-md";
  const sectionTitleClass = "text-2xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-3 flex items-center";
  const buttonClass = "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md";
  const removeButtonClass = "ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition duration-200 ease-in-out";
  const tagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";
  const flagTagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";
  const suggestionTagClass = (isSelected) =>
    `px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition duration-200 ease-in-out ${
      isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }`;
  const suggestionListClass = "absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto mt-1";
  const suggestionItemClass = "p-2 cursor-pointer hover:bg-gray-100 flex items-center text-gray-800";


  const summarySectionClass = "mt-12 p-8 border-2 border-indigo-500 rounded-xl bg-indigo-50 shadow-xl";
  const summaryTitleClass = "text-3xl font-bold text-indigo-800 mb-8 text-center";
  const summarySubTitleClass = "text-xl font-semibold text-indigo-700 mb-3";
  const summaryItemClass = "text-gray-700 mb-1";
  const totalCostClass = "text-2xl font-bold text-indigo-800";
  const grandTotalAmountClass = "text-green-700 text-3xl font-extrabold";


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans antialiased">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-10 tracking-tight">
          <span className="block text-indigo-600 text-xl mb-2">Your Ultimate</span>
          Travel Planner
        </h1>

        {/* --- YOUR HOME LOCATION SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Home className="mr-3 text-indigo-600" size={28} /> Your Home Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative"> {/* Added relative for dropdown positioning */}
              <label htmlFor="newHomeCountryInput" className={labelClass}>Home Country:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newHomeCountryInput"
                  ref={homeCountryInputRef}
                  value={newHomeCountryInput}
                  onChange={handleHomeCountryInputChange}
                  // onBlur event to hide suggestions after focus loss. Use setTimeout to allow click on suggestion.
                  onBlur={() => setTimeout(() => setFilteredHomeCountrySuggestions([]), 100)}
                  placeholder="e.g., USA"
                  className={`${inputClass} w-full`}
                />
                <button onClick={handleSetHomeCountry} className={`${buttonClass} ml-3`}>Set</button>
              </div>
              {/* Country Suggestions Dropdown */}
              {filteredHomeCountrySuggestions.length > 0 && (
                <ul className={suggestionListClass}>
                  {filteredHomeCountrySuggestions.map((country) => (
                    <li
                      key={country.name}
                      // onMouseDown to prevent onBlur from firing before onClick/select
                      onMouseDown={() => selectHomeCountrySuggestion(country)}
                      className={suggestionItemClass}
                    >
                      {country.flag && <img src={country.flag} alt="" className="w-6 h-4 mr-2 rounded-sm" />}
                      {country.name}
                    </li>
                  ))}
                </ul>
              )}
              {/* Display selected home country */}
              {homeCountry.name && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className={tagClass}>
                    {homeCountry.name}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="newHomeCityInput" className={labelClass}>Home City:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newHomeCityInput"
                  value={newHomeCityInput}
                  onChange={(e) => setNewHomeCityInput(e.target.value)}
                  placeholder="e.g., New York"
                  className={`${inputClass} w-full`}
                />
                <button onClick={handleSetHomeCity} className={`${buttonClass} ml-3`}>Set</button>
              </div>
              {homeCity && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className={tagClass}>
                    {homeCity}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- TRAVEL DESTINATIONS & DURATION SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <MapPin className="mr-3 text-indigo-600" size={28} /> Travel Destinations & Duration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative"> {/* Added relative for dropdown positioning */}
              <label htmlFor="newCountry" className={labelClass}>Add Destination Country:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newCountry"
                  ref={destCountryInputRef}
                  value={newCountry}
                  onChange={handleDestCountryInputChange}
                  onBlur={() => setTimeout(() => setFilteredDestCountrySuggestions([]), 100)} // Hide suggestions on blur
                  placeholder="e.g., Japan"
                  className={`${inputClass} w-full`}
                />
                <button onClick={addCountry} className={`${buttonClass} ml-3`}>Add</button>
              </div>
              {/* Destination Country Suggestions Dropdown */}
              {filteredDestCountrySuggestions.length > 0 && (
                <ul className={suggestionListClass}>
                  {filteredDestCountrySuggestions.map((country) => (
                    <li
                      key={country.name}
                      onMouseDown={() => selectDestCountrySuggestion(country)} // Use onMouseDown to prevent blur
                      className={suggestionItemClass}
                    >
                      {country.flag && <img src={country.flag} alt="" className="w-6 h-4 mr-2 rounded-sm" />}
                      {country.name}
                    </li>
                  ))}
                </ul>
              )}
              {/* Display selected destination countries */}
              <div className="mt-4 flex flex-wrap gap-3">
                {countries.map((country) => (
                  <span key={country.name} className={flagTagClass}>
                    {country.flag && <img src={country.flag} alt={`${country.name} flag`} className="w-6 h-4 mr-2 rounded-sm" />}
                    {country.name}
                    <button onClick={() => removeCountry(country)} className={removeButtonClass}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="newCity" className={labelClass}>Add Destination City:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newCity"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g., Tokyo"
                  className={`${inputClass} w-full`}
                />
                <button onClick={addCity} className={`${buttonClass} ml-3`}>Add</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {cities.map((city) => (
                  <span key={city} className="bg-green-100 text-green-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm">
                    {city}
                    <button onClick={() => removeCity(city)} className={removeButtonClass}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Date Pickers for Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startDate" className={labelClass}>Start Date:</label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={labelClass}>End Date:</label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate} // End date cannot be before start date
                placeholderText="Select end date"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
          <div>
            <p className={labelClass}>Calculated Duration:</p>
            <p className="text-xl font-semibold text-indigo-700">{duration} days</p>
          </div>
        </div>

        {/* --- ITINERARY & PREFERENCES SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Compass className="mr-3 text-indigo-600" size={28} /> Itinerary & Preferences
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Select your preferred hotel star rating and topics of interest. Then, generate AI-powered suggestions for your itinerary. Click on suggestions to add them to your plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Hotel Star Rating */}
            <div>
              <label htmlFor="starRating" className={labelClass}>Preferred Hotel Star Rating:</label>
              <select
                id="starRating"
                value={starRating}
                onChange={(e) => setStarRating(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="">Select a rating</option>
                <option value="1">1 Star</option>
                <option value="2">2 Star</option>
                <option value="3">3 Star</option>
                <option value="4">4 Star</option>
                <option value="5">5 Star</option>
              </select>
            </div>
            {/* Topics of Interest */}
            <div className="md:col-span-2">
              <label className={labelClass}>Topics of Interest:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableTopics.map((topic, index) => (
                  <label key={index} className="inline-flex items-center cursor-pointer bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={topicsOfInterest.includes(topic)}
                      onChange={() => handleTopicChange(topic)}
                    />
                    <span className="ml-2 text-gray-800 text-sm font-medium">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

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

          {/* Suggested Activities */}
          {suggestedActivities.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Activities:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedActivities.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedActivities.includes(item))}
                    onClick={() => toggleSuggestionSelection('activities', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Sporting Events */}
          {suggestedSportingEvents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Sporting Events:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedSportingEvents.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedSportingEvents.includes(item))}
                    onClick={() => toggleSuggestionSelection('sportingEvents', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Food Locations */}
          {suggestedFoodLocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Food Locations:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedFoodLocations.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedFoodLocations.includes(item))}
                    onClick={() => toggleSuggestionSelection('foodLocations', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Theme Parks */}
          {suggestedThemeParks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Theme Parks:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedThemeParks.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedThemeParks.includes(item))}
                    onClick={() => toggleSuggestionSelection('themeParks', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tourist Spots */}
          {suggestedTouristSpots.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tourist Spots:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTouristSpots.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedTouristSpots.includes(item))}
                    onClick={() => toggleSuggestionSelection('touristSpots', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Tours */}
          {suggestedTours.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tours:</h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTours.map((item, index) => (
                  <span
                    key={index}
                    className={suggestionTagClass(selectedSuggestedTours.includes(item))}
                    onClick={() => toggleSuggestionSelection('tours', item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- BUDGET PLANNING SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Wallet className="mr-3 text-indigo-600" size={28} /> Budget Planning
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Generate AI-powered budget estimates based on your trip details, or manually enter your own.
          </p>

          <div className="mb-6">
            <label className={labelClass}>Cost Calculation Basis:</label>
            <div className="flex space-x-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  name="costBasis"
                  value="perPerson"
                  checked={isPerPerson}
                  onChange={() => setIsPerPerson(true)}
                />
                <span className="ml-2 text-gray-800">Per Person</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  className="form-radio h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                  name="costBasis"
                  value="perParty"
                  checked={!isPerPerson}
                  onChange={() => setIsPerPerson(false)}
                />
                <span className="ml-2 text-gray-800">Per Party</span>
              </label>
            </div>
          </div>

          {isPerPerson && (
            <div className="mb-6">
              <label htmlFor="numberOfPeople" className={labelClass}>Number of People:</label>
              <input
                type="number"
                id="numberOfPeople"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                className={`${inputClass} w-full`}
              />
            </div>
          )}
          <div className="text-center mb-6">
            <button
              onClick={generateBudgetEstimates}
              className={buttonClass}
              disabled={isGeneratingBudget || (countries.length === 0 && cities.length === 0) || duration < 1 || numberOfPeople < 1}
            >
              {isGeneratingBudget ? (
                <span className="flex items-center justify-center">
                  <Loader className="animate-spin mr-2" size={20} /> Generating Budget...
                </span>
              ) : (
                'Generate Budget Estimates'
              )}
            </button>
            {budgetError && <p className="text-red-500 text-sm mt-2">{budgetError}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="estimatedFlightCost" className={labelClass}>Estimated Flight Cost:</label>
              <input
                type="number"
                id="estimatedFlightCost"
                value={estimatedFlightCost}
                onChange={(e) => setEstimatedFlightCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="estimatedHotelCost" className={labelClass}>Estimated Hotel Cost:</label>
              <input
                type="number"
                id="estimatedHotelCost"
                value={estimatedHotelCost}
                onChange={(e) => setEstimatedHotelCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="estimatedActivityCost" className={labelClass}>Estimated Activity Cost:</label>
              <input
                type="number"
                id="estimatedActivityCost"
                value={estimatedActivityCost}
                onChange={(e) => setEstimatedActivityCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="estimatedTransportCost" className={labelClass}>Estimated Transport Cost:</label>
              <input
                type="number"
                id="estimatedTransportCost"
                value={estimatedTransportCost}
                onChange={(e) => setEstimatedTransportCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="estimatedMiscellaneousCost" className={labelClass}>Estimated Miscellaneous Cost:</label>
              <input
                type="number"
                id="estimatedMiscellaneousCost"
                value={estimatedMiscellaneousCost}
                onChange={(e) => setEstimatedMiscellaneousCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>

        {/* --- DAILY FOOD ALLOWANCES SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Utensils className="mr-3 text-indigo-600" size={28} /> Daily Food Allowances (Per Person)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="breakfastAllowance" className={labelClass}>Breakfast:</label>
              <input
                type="number"
                id="breakfastAllowance"
                value={breakfastAllowance}
                onChange={(e) => setBreakfastAllowance(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="lunchAllowance" className={labelClass}>Lunch:</label>
              <input
                type="number"
                id="lunchAllowance"
                value={lunchAllowance}
                onChange={(e) => setLunchAllowance(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="dinnerAllowance" className={labelClass}>Dinner:</label>
              <input
                type="number"
                id="dinnerAllowance"
                value={dinnerAllowance}
                onChange={(e) => setDinnerAllowance(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="snacksAllowance" className={labelClass}>Snacks:</label>
              <input
                type="number"
                id="snacksAllowance"
                value={snacksAllowance}
                onChange={(e) => setSnacksAllowance(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>

        {/* --- TRANSPORT OPTIONS SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Car className="mr-3 text-indigo-600" size={28} /> Transport Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                checked={carRental}
                onChange={(e) => setCarRental(e.target.checked)}
              />
              <span className="ml-2 text-gray-800">Car Rental</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                checked={shuttle}
                onChange={(e) => setShuttle(e.target.checked)}
              />
              <span className="ml-2 text-gray-800">Shuttle</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                checked={airportTransfers}
                onChange={(e) => setAirportTransfers(e.target.checked)}
              />
              <span className="ml-2 text-gray-800">Airport Transfers</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                checked={airportParking}
                onChange={(e) => setAirportParking(e.target.checked)}
              />
              <span className="ml-2 text-gray-800">Airport Parking</span>
            </label>
          </div>
        </div>

        {/* --- GENERATE TRAVEL PLAN BUTTON --- */}
        <div className="text-center mt-10">
          <button onClick={calculateTravelPlan} className={buttonClass}>
            Generate Travel Plan
          </button>
        </div>
        {/* --- TRAVEL PLAN SUMMARY SECTION --- */}
        {travelPlanSummary && (
          <div className={summarySectionClass}>
            <h2 className={summaryTitleClass}>
              <CheckCircle className="inline-block mr-3 text-indigo-700" size={32} /> Your Travel Plan Summary
            </h2>
            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Your Trip Details:</h3>
              <p className={summaryItemClass}>
                <strong>Home Location:</strong>{' '}
                {travelPlanSummary.homeCity ? `${travelPlanSummary.homeCity}, ` : ''}
                {travelPlanSummary.homeCountry.name || 'Not specified'}
                {travelPlanSummary.homeCountry.flag && (
                  <img src={travelPlanSummary.homeCountry.flag} alt={`${travelPlanSummary.homeCountry.name} flag`} className="w-6 h-4 ml-2 inline-block rounded-sm" />
                )}
              </p>
              <p className={summaryItemClass}>
                <strong>Destination Countries:</strong>{' '}
                {travelPlanSummary.countries.length > 0 ? (
                  <span>
                    {travelPlanSummary.countries.map(c => (
                      <span key={c.name} className="inline-flex items-center mr-2">
                        {c.flag && <img src={c.flag} alt={`${c.name} flag`} className="w-6 h-4 mr-1 rounded-sm" />}
                        {c.name}
                      </span>
                    ))}
                  </span>
                ) : 'Not specified'}
              </p>
              <p className={summaryItemClass}><strong>Destination Cities:</strong> {travelPlanSummary.cities.length > 0 ? travelPlanSummary.cities.join(', ') : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Duration:</strong> {travelPlanSummary.duration} days</p>
              <p className={summaryItemClass}>
                <strong>Travel Dates:</strong> {travelPlanSummary.startDate} - {travelPlanSummary.endDate}
              </p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Preferences & Itinerary:</h3>
              <p className={summaryItemClass}><strong>Hotel Star Rating:</strong> {travelPlanSummary.starRating ? `${travelPlanSummary.starRating} Star` : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Topics of Interest:</strong> {travelPlanSummary.topicsOfInterest.length > 0 ? travelPlanSummary.topicsOfInterest.join(', ') : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Activities:</strong> {travelPlanSummary.activities || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Sporting Events:</strong> {travelPlanSummary.sportingEvents || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Food Locations:</strong> {travelPlanSummary.foodLocations || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Theme Parks:</strong> {travelPlanSummary.themeParks || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Tourist Spots:</strong> {travelPlanSummary.touristSpots || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Tours:</strong> {travelPlanSummary.tours || 'Not specified'}</p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Estimated Costs:</h3>
              <p className={summaryItemClass}><strong>Calculation Basis:</strong> {travelPlanSummary.isPerPerson ? `Per Person (${travelPlanSummary.numberOfPeople} people)` : 'Per Party'}</p>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                <li className="mb-1">Estimated Flight Cost: <span className="font-semibold">${travelPlanSummary.estimatedFlightCost.toFixed(2)}</span></li>
                <li className="mb-1">Estimated Hotel Cost: <span className="font-semibold">${travelPlanSummary.estimatedHotelCost.toFixed(2)}</span></li>
                <li className="mb-1">Estimated Activity Cost: <span className="font-semibold">${travelPlanSummary.estimatedActivityCost.toFixed(2)}</span></li>
                <li className="mb-1">Estimated Transport Cost: <span className="font-semibold">${travelPlanSummary.estimatedTransportCost.toFixed(2)}</span></li>
                <li className="mb-1">Estimated Miscellaneous Cost: <span className="font-semibold">${travelPlanSummary.estimatedMiscellaneousCost.toFixed(2)}</span></li>
                <li className="mt-2 text-lg font-bold text-indigo-800">Subtotal (Excluding Food): <span className="text-blue-700">${travelPlanSummary.totalEstimatedCost.toFixed(2)}</span></li>
              </ul>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Food Allowances:</h3>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                <li className="mb-1">Daily Breakfast Allowance: <span className="font-semibold">${travelPlanSummary.breakfastAllowance.toFixed(2)}</span></li>
                <li className="mb-1">Daily Lunch Allowance: <span className="font-semibold">${travelPlanSummary.lunchAllowance.toFixed(2)}</span></li>
                <li className="mb-1">Daily Dinner Allowance: <span className="font-semibold">${travelPlanSummary.dinnerAllowance.toFixed(2)}</span></li>
                <li className="mb-1">Daily Snacks Allowance: <span className="font-semibold">${travelPlanSummary.snacksAllowance.toFixed(2)}</span></li>
                <li className="mt-2 text-lg font-bold text-indigo-800">Total Daily Food Allowance: <span className="text-blue-700">${travelPlanSummary.totalDailyFoodAllowance.toFixed(2)}</span></li>
                <li className="mt-1 text-lg font-bold text-indigo-800">Total Food Cost for Trip: <span className="text-blue-700">${travelPlanSummary.totalFoodCost.toFixed(2)}</span></li>
              </ul>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Transport Options Selected:</h3>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                {travelPlanSummary.carRental && <li>Car Rental</li>}
                {travelPlanSummary.shuttle && <li>Shuttle</li>}
                {travelPlanSummary.airportTransfers && <li>Airport Transfers</li>}
                {travelPlanSummary.airportParking && <li>Airport Parking</li>}
                {!travelPlanSummary.carRental && !travelPlanSummary.shuttle && !travelPlanSummary.airportTransfers && !travelPlanSummary.airportParking && <li>No specific transport options selected.</li>}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-indigo-300 text-right">
              <h3 className={totalCostClass}>Grand Total Estimated Trip Cost: <span className={grandTotalAmountClass}>${travelPlanSummary.grandTotal.toFixed(2)}</span></h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
