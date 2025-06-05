import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Compass, Utensils, Car, Wallet, CheckCircle, Loader, Home, Info, Printer } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Main App component
const App = () => {
  // State variables for various inputs
  const [countries, setCountries] = useState([]); // Stores { name: string, flag: string } for destinations
  const [newCountry, setNewCountry] = useState('');

  // Cities now store objects with more details
  const [cities, setCities] = useState([]); // [{ name: string, duration: number, starRating: string, topics: string[] }]
  const [newCityName, setNewCityName] = useState('');
  const [newCityDuration, setNewCityDuration] = useState(0);
  const [newCityStarRating, setNewCityStarRating] = useState('');
  const [newCityTopics, setNewCityTopics] = useState([]);

  // Overall trip Start and End Dates
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  // Duration will now be derived from overall trip dates or sum of city durations
  const overallDuration = (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;

  const [starRating, setStarRating] = useState(''); // Overall preferred hotel star rating

  // State for Home Location
  const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' });
  const [newHomeCountryInput, setNewHomeCountryInput] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [newHomeCityInput, setNewHomeCityInput] = useState('');

  // Topics of interest (overall trip)
  const [topicsOfInterest, setTopicsOfInterest] = useState([]);
  const availableTopics = ['Food', 'Sport', 'Culture', 'Theme Parks', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Relaxation'];

  // New Hotel Preferences
  const [travelStyle, setTravelStyle] = useState('');
  const [hotelAmenities, setHotelAmenities] = useState([]);
  const availableAmenities = ['Pool', 'Free Breakfast', 'Pet-Friendly', 'Spa', 'Gym', 'Parking', 'Kids Club', 'Beach Access'];


  // Budget Planning states
  const [isPerPerson, setIsPerPerson] = useState(true);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [currency, setCurrency] = useState('USD');
  const [moneyAvailable, setMoneyAvailable] = useState(0);
  const [moneySaved, setMoneySaved] = useState(0);
  const [contingencyPercentage, setContingencyPercentage] = useState(10);

  // Estimated Costs
  const [estimatedFlightCost, setEstimatedFlightCost] = useState(0);
  const [estimatedHotelCost, setEstimatedHotelCost] = useState(0);
  const [estimatedActivityCost, setEstimatedActivityCost] = useState(0);
  const [estimatedMiscellaneousCost, setEstimatedMiscellaneousCost] = useState(0);

  // New Transport Costs
  const [estimatedTransportCost, setEstimatedTransportCost] = useState(0); // AI estimated total transport
  const [carRentalCost, setCarRentalCost] = useState(0);
  const [shuttleCost, setShuttleCost] = useState(0);
  const [airportTransfersCost, setAirportTransfersCost] = useState(0);
  const [airportParkingCost, setAirportParkingCost] = useState(0);
  const [estimatedInterCityFlightCost, setEstimatedInterCityFlightCost] = useState(0); // New inter-city transport
  const [estimatedInterCityTrainCost, setEstimatedInterCityTrainCost] = useState(0);
  const [estimatedInterCityBusCost, setEstimatedInterCityBusCost] = useState(0);
  const [localPublicTransport, setLocalPublicTransport] = useState(false);
  const [taxiRideShare, setTaxiRideShare] = useState(false);
  const [walking, setWalking] = useState(false); // For local transport planning
  const [dailyLocalTransportAllowance, setDailyLocalTransportAllowance] = useState(0);


  // Actual Costs for comparison
  const [actualFlightCost, setActualFlightCost] = useState(0);
  const [actualHotelCost, setActualHotelCost] = useState(0);
  const [actualActivityCost, setActualActivityCost] = useState(0);
  const [actualTransportCost, setActualTransportCost] = useState(0); // Combines all actual transport
  const [actualMiscellaneousCost, setActualMiscellaneousCost] = useState(0);
  const [actualFoodCost, setActualFoodCost] = useState(0);


  // Food allowances
  const [breakfastAllowance, setBreakfastAllowance] = useState(0);
  const [lunchAllowance, setLunchAllowance] = useState(0);
  const [dinnerAllowance, setDinnerAllowance] = useState(0);
  const [snacksAllowance, setSnacksAllowance] = useState(0);

  // Transport options (checkboxes)
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

  // Input validation states
  const [homeCountryError, setHomeCountryError] = useState('');
  const [homeCityError, setHomeCityError] = useState('');
  const [destCountryError, setDestCountryError] = useState('');
  const [destCityError, setDestCityError] = useState('');
  const [dateError, setDateError] = useState('');
  const [numberOfPeopleError, setNumberOfPeopleError] = useState('');
  const [newCityNameError, setNewCityNameError] = useState('');
  const [newCityDurationError, setNewCityDurationError] = useState('');


  // --- EFFECT: Fetch all countries on component mount for predictive text ---
  useEffect(() => {
    const fetchAllCountries = async () => {
      try {
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
    setHomeCountryError(''); // Clear error on input
  };

  const selectHomeCountrySuggestion = async (country) => {
    setNewHomeCountryInput(country.name); // Set input text to selected country name
    setHomeCountry(country); // Set home country state with selected country object
    setFilteredHomeCountrySuggestions([]); // Clear suggestions
    setHomeCountryError('');
    homeCountryInputRef.current.focus(); // Keep focus on input after selection
  };

  const handleSetHomeCountry = async () => {
    const trimmedHomeCountry = newHomeCountryInput.trim();
    if (trimmedHomeCountry === '') {
      setHomeCountryError("Home country cannot be empty.");
      return;
    }
    const countryData = await fetchCountryFlag(trimmedHomeCountry);
    if (countryData.name) { // Only set if a valid country name was found/matched
      setHomeCountry(countryData);
      setNewHomeCountryInput(''); // Clear input after setting
      setFilteredHomeCountrySuggestions([]); // Clear suggestions
      setHomeCountryError('');
    } else {
      setHomeCountryError("Could not find a valid country for the entered name.");
    }
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
    setDestCountryError('');
  };

  const selectDestCountrySuggestion = async (country) => {
    setNewCountry(country.name); // Set input text to selected country name
    if (!countries.some(c => c.name.toLowerCase() === country.name.toLowerCase())) {
      setCountries([...countries, country]); // Add selected country object to destinations
    }
    setFilteredDestCountrySuggestions([]); // Clear suggestions
    setNewCountry(''); // Clear input after selection
    setDestCountryError('');
    destCountryInputRef.current.focus(); // Keep focus on input after selection
  };

  const addCountry = async () => {
    const trimmedCountry = newCountry.trim();
    if (trimmedCountry === '') {
      setDestCountryError("Destination country cannot be empty.");
      return;
    }
    const existingCountry = countries.find(c => c.name.toLowerCase() === trimmedCountry.toLowerCase());
    if (!existingCountry) {
      const countryData = await fetchCountryFlag(trimmedCountry);
      if (countryData.name) { // Only add if a valid country name was found/matched
        setCountries([...countries, countryData]);
        setDestCountryError('');
      } else {
        setDestCountryError("Could not find a valid country for the entered name.");
      }
    } else {
      setDestCountryError("This country has already been added.");
    }
    setNewCountry(''); // Clear input after adding
    setFilteredDestCountrySuggestions([]); // Clear suggestions
  };

  const removeCountry = (countryToRemove) => {
    setCountries(countries.filter(country => country.name !== countryToRemove.name));
    if (countries.filter(country => country.name !== countryToRemove.name).length === 0 && cities.length === 0) {
      setDestCountryError("Please add at least one destination country or city.");
    }
  };

  // Handler for adding a new city object
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
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setDateError(''); // Clear error on change
    if (endDate && date && date > endDate) {
      setEndDate(null); // Reset end date if start date is after it
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setDateError(''); // Clear error on change
  };

  const handleAmenityChange = (amenity) => {
    setHotelAmenities(prevAmenities =>
      prevAmenities.includes(amenity)
        ? prevAmenities.filter(a => a !== amenity)
        : [...prevAmenities, amenity]
    );
  };

  const handleNewCityTopicChange = (topic) => {
    setNewCityTopics(prevTopics =>
      prevTopics.includes(topic)
        ? prevTopics.filter(t => t !== topic)
        : [...prevTopics, topic]
    );
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
      : 'at any time of year';

    const prompt = `Suggest 5-7 popular activities, 5-7 popular food locations (e.g., specific restaurants, food markets), 2-3 popular theme parks, 5-7 popular tourist spots, 3-5 popular tours, and 3-5 popular sporting events ${fullDestinationPrompt} ${homeLocationContext} ${dateContext} ${topicsPrompt}. Consider varied hotel star ratings and specific city durations if provided. Provide the response as a JSON object with keys: "activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents". Each key's value should be an array of strings.`;

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setSuggestionError("Gemini API Key is not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.");
      setIsGeneratingSuggestions(false);
      return;
    }

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
        const jsonString = result.candidates[0].content.parts[0].text.replace(/```json\n|\n```/g, '');
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
      setSuggestionError("An error occurred while generating suggestions. Make sure your API key is correct and try again.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  const generateBudgetEstimates = async () => {
    // Initial validation check
    let hasError = false;
    if (countries.length === 0 && cities.length === 0) {
      setBudgetError("Please specify destination countries/cities.");
      hasError = true;
    } else {
      setBudgetError('');
    }
    if (overallDuration < 1) { // Use overallDuration for budget calculations
      setDateError("Please select valid start and end dates.");
      hasError = true;
    } else {
      setDateError('');
    }
    if (numberOfPeople < 1) {
      setNumberOfPeopleError("Number of people must be at least 1.");
      hasError = true;
    } else {
      setNumberOfPeopleError('');
    }
    if (hasError) return;


    setIsGeneratingBudget(true);
    setBudgetError('');

    const destinationPromptCountries = countries.length > 0 ? `${countries.map(c => c.name).join(' and ')}` : '';
    const destinationPromptCities = cities.length > 0 ? `(cities: ${cities.map(c => c.name).join(', ')})` : '';

    let destinationPrompt = '';
    if (destinationPromptCountries && destinationPromptCities) {
        destinationPrompt = `for a trip to ${destinationPromptCountries} ${destinationPromptCities}`;
    } else if (destinationPromptCountries) {
        destinationPrompt = `for a trip to ${destinationPromptCountries}`;
    } else if (destinationPromptCities) {
        destinationPrompt = `for a trip to ${destinationPromptCities}`;
    }


    const homeLocationPrompt = (homeCountry.name && homeCity)
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
      airportParking ? 'airport parking' : '',
      localPublicTransport ? 'local public transport' : '',
      taxiRideShare ? 'taxis/ride-share' : '',
      walking ? 'walking' : ''
    ].filter(Boolean).join(', ');

    const hotelAmenitiesPrompt = hotelAmenities.length > 0 ? `with amenities like: ${hotelAmenities.join(', ')}` : '';

    const prompt = `Estimate the following costs in ${currency} for a ${overallDuration}-day trip ${destinationPrompt} ${homeLocationPrompt} for ${numberOfPeople} ${isPerPerson ? 'person' : 'party'}.
    Consider these itinerary items: ${itineraryPrompt || 'general sightseeing'}.
    Preferred overall hotel star rating: ${starRating || 'any'}. Individual city hotel star ratings if provided in city details.
    Travel style: ${travelStyle || 'standard'}. ${hotelAmenitiesPrompt}.
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

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setBudgetError("Gemini API Key is not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.");
      setIsGeneratingBudget(false);
      return;
    }

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
        const jsonString = result.candidates[0].content.parts[0].text.replace(/```json\n|\n```/g, '');
        const parsedJson = JSON.parse(jsonString);

        setEstimatedFlightCost(parsedJson.estimatedFlightCost || 0);
        setEstimatedHotelCost(parsedJson.estimatedHotelCost || 0);
        setEstimatedActivityCost(parsedJson.estimatedActivityCost || 0);
        setEstimatedTransportCost(parsedJson.estimatedTransportCost || 0); // AI estimated total transport
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
      setBudgetError("An error occurred while generating budget estimates. Make sure your API key is correct and try again.");
    } finally {
      setIsGeneratingBudget(false);
    }
  };


  // --- MAIN TRAVEL PLAN CALCULATION ---
  const calculateTravelPlan = () => {
    // Validation before generating summary
    let hasError = false;
    if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; }
    if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; }
    if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; }
    if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; }
    if (numberOfPeople < 1) { setNumberOfPeopleError("Number of people must be at least 1."); hasError = true; }

    if (hasError) {
      setTravelPlanSummary(null); // Clear previous summary if there are errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }


    const finalActivities = selectedSuggestedActivities.filter(Boolean).join(', ');
    const finalFoodLocations = selectedSuggestedFoodLocations.filter(Boolean).join(', ');
    const finalThemeParks = selectedSuggestedThemeParks.filter(Boolean).join(', ');
    const finalTouristSpots = selectedSuggestedTouristSpots.filter(Boolean).join(', ');
    const finalTours = selectedSuggestedTours.filter(Boolean).join(', ');
    const finalSportingEvents = selectedSuggestedSportingEvents.filter(Boolean).join(', ');


    // Calculate total food allowance per day
    const totalDailyFoodAllowance = parseFloat(breakfastAllowance) + parseFloat(lunchAllowance) + parseFloat(dinnerAllowance) + parseFloat(snacksAllowance);
    const totalFoodCost = totalDailyFoodAllowance * overallDuration;

    // Calculate total estimated transport costs (AI estimate + manual inputs)
    const combinedEstimatedTransportCost = parseFloat(estimatedTransportCost) +
                                           (carRental ? parseFloat(carRentalCost) : 0) +
                                           (shuttle ? parseFloat(shuttleCost) : 0) +
                                           (airportTransfers ? parseFloat(airportTransfersCost) : 0) +
                                           (airportParking ? parseFloat(airportParkingCost) : 0) +
                                           parseFloat(estimatedInterCityFlightCost) +
                                           parseFloat(estimatedInterCityTrainCost) +
                                           parseFloat(estimatedInterCityBusCost) +
                                           (localPublicTransport ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0) + // Daily local transport cost
                                           (taxiRideShare ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0); // Assuming taxi/ride-share would also have a daily allowance. This could be more granular.


    // Calculate total estimated costs (excluding food for now, as food has its own calculation)
    const totalEstimatedCostBeforeFoodAndContingency =
      parseFloat(estimatedFlightCost) +
      parseFloat(estimatedHotelCost) +
      parseFloat(estimatedActivityCost) +
      combinedEstimatedTransportCost + // Use combined transport cost
      parseFloat(estimatedMiscellaneousCost);

    // Adjust costs based on per person/per party
    const subTotalEstimatedCost = isPerPerson ? totalEstimatedCostBeforeFoodAndContingency * parseInt(numberOfPeople) : totalEstimatedCostBeforeFoodAndContingency;
    const finalTotalFoodCost = isPerPerson ? totalFoodCost * parseInt(numberOfPeople) : totalFoodCost;

    // Calculate contingency
    const contingencyAmount = (subTotalEstimatedCost + finalTotalFoodCost) * (contingencyPercentage / 100);

    const grandTotal = subTotalEstimatedCost + finalTotalFoodCost + contingencyAmount;

    // Calculate budget surplus/deficit
    const remainingBudget = parseFloat(moneyAvailable) + parseFloat(moneySaved) - grandTotal;

    // Calculate actual total transport cost for variance
    const combinedActualTransportCost =
        (carRental ? parseFloat(carRentalCost) : 0) + // Assuming manual inputs for these services are actual for now
        (shuttle ? parseFloat(shuttleCost) : 0) +
        (airportTransfers ? parseFloat(airportTransfersCost) : 0) +
        (airportParking ? parseFloat(airportParkingCost) : 0) +
        parseFloat(estimatedInterCityFlightCost) + // Assuming manual inputs for these services are actual for now
        parseFloat(estimatedInterCityTrainCost) +
        parseFloat(estimatedInterCityBusCost) +
        (localPublicTransport ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0) +
        (taxiRideShare ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0) +
        // Add actual transport cost if it's different from AI estimate
        (actualTransportCost || 0); // Use actualTransportCost if provided by user

    setTravelPlanSummary({
      homeCountry,
      homeCity,
      countries,
      cities, // Now includes duration, starRating, topics for each city
      overallDuration, // Overall trip duration
      startDate: startDate ? startDate.toLocaleDateString() : 'Not set',
      endDate: endDate ? endDate.toLocaleDateString() : 'Not set',
      starRating, // Overall star rating
      travelStyle,
      hotelAmenities,
      activities: finalActivities,
      sportingEvents: finalSportingEvents,
      foodLocations: finalFoodLocations,
      themeParks: finalThemeParks,
      touristSpots: finalTouristSpots,
      tours: finalTours,
      isPerPerson,
      numberOfPeople,
      currency,
      moneyAvailable,
      moneySaved,
      contingencyPercentage,
      contingencyAmount,

      // Estimated Costs
      estimatedFlightCost,
      estimatedHotelCost,
      estimatedActivityCost,
      estimatedMiscellaneousCost,
      combinedEstimatedTransportCost, // Sum of all estimated transport costs
      totalEstimatedCost: subTotalEstimatedCost, // Total estimated before food/contingency adjusted for people

      // Actual Costs
      actualFlightCost,
      actualHotelCost,
      actualActivityCost,
      actualMiscellaneousCost,
      actualTransportCost: combinedActualTransportCost, // Sum of all actual transport costs
      actualFoodCost,

      // Food Allowances
      breakfastAllowance,
      lunchAllowance,
      dinnerAllowance,
      snacksAllowance,
      totalDailyFoodAllowance,
      totalFoodCost: finalTotalFoodCost,

      // Transport Options (checked status and specific costs)
      carRental,
      carRentalCost,
      shuttle,
      shuttleCost,
      airportTransfers,
      airportTransfersCost,
      airportParking,
      airportParkingCost,
      estimatedInterCityFlightCost,
      estimatedInterCityTrainCost,
      estimatedInterCityBusCost,
      localPublicTransport,
      taxiRideShare,
      walking,
      dailyLocalTransportAllowance,

      // Final Totals
      grandTotal,
      remainingBudget,
      topicsOfInterest, // Overall trip topics
    });
  };

  const getFormattedCurrency = (amount) => {
    switch (currency) {
      case 'JPY': return `¥${amount.toFixed(2)}`;
      case 'GBP': return `£${amount.toFixed(2)}`;
      case 'EUR': return `€${amount.toFixed(2)}`;
      default: return `$${amount.toFixed(2)}`;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- TAILWIND CSS CLASSES FOR CONSISTENT STYLING ---
  const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const requiredLabelClass = "block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500";
  const errorClass = "text-red-500 text-xs mt-1"; // For input-specific errors

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


  const summarySectionClass = "mt-12 p-8 border-2 border-indigo-500 rounded-xl bg-indigo-50 shadow-xl print:shadow-none print:border-none";
  const summaryTitleClass = "text-3xl font-bold text-indigo-800 mb-8 text-center print:text-black";
  const summarySubTitleClass = "text-xl font-semibold text-indigo-700 mb-3 print:text-gray-800";
  const summaryItemClass = "text-gray-700 mb-1 print:text-gray-600";
  const totalCostClass = "text-2xl font-bold text-indigo-800 print:text-black";
  const grandTotalAmountClass = "text-green-700 text-3xl font-extrabold print:text-green-800";
  const remainingBudgetClass = (amount) =>
    `text-2xl font-extrabold ${amount >= 0 ? 'text-green-700' : 'text-red-700'} print:${amount >= 0 ? 'text-green-800' : 'text-red-800'}`;
  const varianceClass = (amount) =>
    `font-semibold ${amount < 0 ? 'text-red-600' : amount > 0 ? 'text-green-600' : 'text-gray-600'}`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans antialiased print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-2xl print:shadow-none print:rounded-none print:p-4">
        <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-10 tracking-tight print:text-black">
          <span className="block text-indigo-600 text-xl mb-2 print:text-gray-700">Your Ultimate</span>
          Travel Planner
        </h1>

        {/* --- YOUR HOME LOCATION SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Home className="mr-3 text-indigo-600" size={28} /> Your Home Location
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label htmlFor="newHomeCountryInput" className={requiredLabelClass}>Home Country:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newHomeCountryInput"
                  ref={homeCountryInputRef}
                  value={newHomeCountryInput}
                  onChange={handleHomeCountryInputChange}
                  onBlur={() => setTimeout(() => setFilteredHomeCountrySuggestions([]), 100)}
                  placeholder="e.g., USA"
                  className={`${inputClass} w-full ${homeCountryError ? 'border-red-500' : ''}`}
                />
                <button onClick={handleSetHomeCountry} className={`${buttonClass} ml-3`}>Set</button>
              </div>
              {homeCountryError && <p className={errorClass}>{homeCountryError}</p>}
              {filteredHomeCountrySuggestions.length > 0 && (
                <ul className={suggestionListClass}>
                  {filteredHomeCountrySuggestions.map((country) => (
                    <li
                      key={country.name}
                      onMouseDown={() => selectHomeCountrySuggestion(country)}
                      className={suggestionItemClass}
                    >
                      {country.flag && <img src={country.flag} alt="" className="w-6 h-4 mr-2 rounded-sm" />}
                      {country.name}
                    </li>
                  ))}
                </ul>
              )}
              {homeCountry.name && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className={tagClass}>
                    {homeCountry.name}
                    {homeCountry.flag && <img src={homeCountry.flag} alt={`${homeCountry.name} flag`} className="w-6 h-4 ml-2 rounded-sm" />}
                  </span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="newHomeCityInput" className={requiredLabelClass}>Home City:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newHomeCityInput"
                  value={newHomeCityInput}
                  onChange={(e) => { setNewHomeCityInput(e.target.value); setHomeCityError(''); }}
                  placeholder="e.g., New York"
                  className={`${inputClass} w-full ${homeCityError ? 'border-red-500' : ''}`}
                />
                <button onClick={handleSetHomeCity} className={`${buttonClass} ml-3`}>Set</button>
              </div>
              {homeCityError && <p className={errorClass}>{homeCityError}</p>}
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
            <div className="relative">
              <label htmlFor="newCountry" className={requiredLabelClass}>Add Destination Country:</label>
              <div className="flex items-center">
                <input
                  type="text"
                  id="newCountry"
                  ref={destCountryInputRef}
                  value={newCountry}
                  onChange={handleDestCountryInputChange}
                  onBlur={() => setTimeout(() => setFilteredDestCountrySuggestions([]), 100)}
                  placeholder="e.g., Japan"
                  className={`${inputClass} w-full ${destCountryError && countries.length === 0 ? 'border-red-500' : ''}`}
                />
                <button onClick={addCountry} className={`${buttonClass} ml-3`}>Add</button>
              </div>
              {destCountryError && countries.length === 0 && <p className={errorClass}>{destCountryError}</p>}
              {filteredDestCountrySuggestions.length > 0 && (
                <ul className={suggestionListClass}>
                  {filteredDestCountrySuggestions.map((country) => (
                    <li
                      key={country.name}
                      onMouseDown={() => selectDestCountrySuggestion(country)}
                      className={suggestionItemClass}
                    >
                      {country.flag && <img src={country.flag} alt="" className="w-6 h-4 mr-2 rounded-sm" />}
                      {country.name}
                    </li>
                  ))}
                </ul>
              )}
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
              <label htmlFor="newCityName" className={requiredLabelClass}>Add Destination City:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <input
                  type="text"
                  id="newCityName"
                  value={newCityName}
                  onChange={(e) => { setNewCityName(e.target.value); setNewCityNameError(''); setDestCityError('');}}
                  placeholder="City Name (e.g., Tokyo)"
                  className={`${inputClass} w-full ${newCityNameError ? 'border-red-500' : ''}`}
                />
                <input
                  type="number"
                  id="newCityDuration"
                  value={newCityDuration}
                  onChange={(e) => { setNewCityDuration(parseInt(e.target.value) || 0); setNewCityDurationError('');}}
                  placeholder="Days (e.g., 5)"
                  min="0"
                  className={`${inputClass} w-full ${newCityDurationError ? 'border-red-500' : ''}`}
                />
                {newCityNameError && <p className={`${errorClass} sm:col-span-2`}>{newCityNameError}</p>}
                {newCityDurationError && <p className={`${errorClass} sm:col-span-2`}>{newCityDurationError}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <select
                  id="newCityStarRating"
                  value={newCityStarRating}
                  onChange={(e) => setNewCityStarRating(e.target.value)}
                  className={`${inputClass} w-full`}
                >
                  <option value="">City Hotel Rating (Optional)</option>
                  <option value="1">1 Star (Budget)</option>
                  <option value="2">2 Star (Economy)</option>
                  <option value="3">3 Star (Mid-Range)</option>
                  <option value="4">4 Star (First Class)</option>
                  <option value="5">5 Star (Luxury)</option>
                </select>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map((topic, index) => (
                    <label key={index} className="inline-flex items-center cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                        checked={newCityTopics.includes(topic)}
                        onChange={() => handleNewCityTopicChange(topic)}
                      />
                      <span className="ml-1 text-gray-700">{topic.split(' ')[0]}</span> {/* Shorten for space */}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={addCity} className={`${buttonClass} w-full`}>Add City</button>
              {destCityError && cities.length === 0 && <p className={errorClass}>{destCityError}</p>}
              <div className="mt-4 flex flex-col gap-3">
                {cities.map((city) => (
                  <span key={city.name} className="bg-green-100 text-green-800 px-4 py-2 rounded-full flex justify-between items-center text-sm font-medium shadow-sm">
                    <span>
                      {city.name} ({city.duration} days)
                      {city.starRating && ` - ${city.starRating} Star`}
                      {city.topics.length > 0 && ` [${city.topics.join(', ')}]`}
                    </span>
                    <button onClick={() => removeCity(city)} className={removeButtonClass}>&times;</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
          {/* Overall Date Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="startDate" className={requiredLabelClass}>Overall Trip Start Date:</label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={handleStartDateChange}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Select start date"
                className={`${inputClass} w-full ${dateError ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="endDate" className={requiredLabelClass}>Overall Trip End Date:</label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={handleEndDateChange}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="Select end date"
                className={`${inputClass} w-full ${dateError ? 'border-red-500' : ''}`}
              />
            </div>
            {dateError && <p className={`${errorClass} md:col-span-2`}>{dateError}</p>}
          </div>
          <div>
            <p className={labelClass}>Calculated Overall Duration:</p>
            <p className="text-xl font-semibold text-indigo-700">{overallDuration} days</p>
          </div>
        </div>

        {/* --- ITINERARY & PREFERENCES SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Compass className="mr-3 text-indigo-600" size={28} /> Itinerary & Preferences
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Select your preferred overall hotel star rating, travel style, and topics of interest. Then, generate AI-powered suggestions for your itinerary. Click on suggestions to add them to your plan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Overall Hotel Star Rating */}
            <div>
              <label htmlFor="starRating" className={labelClass}>Overall Hotel Star Rating (Optional):</label>
              <select
                id="starRating"
                value={starRating}
                onChange={(e) => setStarRating(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="">Select a rating</option>
                <option value="1">1 Star (Budget)</option>
                <option value="2">2 Star (Economy)</option>
                <option value="3">3 Star (Mid-Range)</option>
                <option value="4">4 Star (First Class)</option>
                <option value="5">5 Star (Luxury)</option>
              </select>
            </div>
             {/* Travel Style */}
            <div>
              <label htmlFor="travelStyle" className={labelClass}>Travel Style (Optional):</label>
              <select
                id="travelStyle"
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="">Select a style</option>
                <option value="Budget">Budget</option>
                <option value="Mid-Range">Mid-Range</option>
                <option value="Luxury">Luxury</option>
                <option value="Family-Friendly">Family-Friendly</option>
                <option value="Adventure">Adventure</option>
                <option value="Relaxation">Relaxation</option>
              </select>
            </div>
            {/* Hotel Amenities */}
            <div className="md:col-span-2">
              <label className={labelClass}>Preferred Hotel Amenities (Optional):</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableAmenities.map((amenity, index) => (
                  <label key={index} className="inline-flex items-center cursor-pointer bg-gray-100 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-200 transition duration-150 ease-in-out">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      checked={hotelAmenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                    <span className="ml-2 text-gray-800 text-sm font-medium">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Overall Topics of Interest */}
            <div className="md:col-span-2">
              <label className={labelClass}>Overall Topics of Interest (Optional):</label>
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
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading activities...
                    </div>
                ) : (
                    suggestedActivities.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedActivities.includes(item))}
                        onClick={() => toggleSuggestionSelection('activities', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Sporting Events */}
          {suggestedSportingEvents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Sporting Events:</h3>
              <div className="flex flex-wrap gap-2">
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading sporting events...
                    </div>
                ) : (
                    suggestedSportingEvents.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedSportingEvents.includes(item))}
                        onClick={() => toggleSuggestionSelection('sportingEvents', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Food Locations */}
          {suggestedFoodLocations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Food Locations:</h3>
              <div className="flex flex-wrap gap-2">
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading food locations...
                    </div>
                ) : (
                    suggestedFoodLocations.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedFoodLocations.includes(item))}
                        onClick={() => toggleSuggestionSelection('foodLocations', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Theme Parks */}
          {suggestedThemeParks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Theme Parks:</h3>
              <div className="flex flex-wrap gap-2">
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading theme parks...
                    </div>
                ) : (
                    suggestedThemeParks.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedThemeParks.includes(item))}
                        onClick={() => toggleSuggestionSelection('themeParks', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Tourist Spots */}
          {suggestedTouristSpots.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tourist Spots:</h3>
              <div className="flex flex-wrap gap-2">
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading tourist spots...
                    </div>
                ) : (
                    suggestedTouristSpots.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedTouristSpots.includes(item))}
                        onClick={() => toggleSuggestionSelection('touristSpots', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Suggested Tours */}
          {suggestedTours.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tours:</h3>
              <div className="flex flex-wrap gap-2">
                {isGeneratingSuggestions ? (
                    <div className="flex items-center text-gray-500">
                        <Loader className="animate-spin mr-2" size={16} /> Loading tours...
                    </div>
                ) : (
                    suggestedTours.map((item, index) => (
                    <span
                        key={index}
                        className={suggestionTagClass(selectedSuggestedTours.includes(item))}
                        onClick={() => toggleSuggestionSelection('tours', item)}
                    >
                        {item}
                    </span>
                    ))
                )}
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
            Generate AI-powered budget estimates based on your trip details, or manually enter your own. Track actual costs for comparison.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
              <div>
                <label htmlFor="numberOfPeople" className={requiredLabelClass}>Number of People:</label>
                <input
                  type="number"
                  id="numberOfPeople"
                  value={numberOfPeople}
                  onChange={(e) => {setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1)); setNumberOfPeopleError('');}}
                  min="1"
                  className={`${inputClass} w-full ${numberOfPeopleError ? 'border-red-500' : ''}`}
                />
                {numberOfPeopleError && <p className={errorClass}>{numberOfPeopleError}</p>}
              </div>
            )}
            <div>
              <label htmlFor="currency" className={labelClass}>Currency:</label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={`${inputClass} w-full`}
              >
                <option value="USD">USD ($)</option>
                <option value="AUD">AUD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
            <div>
              <label htmlFor="moneyAvailable" className={labelClass}>Money Available ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="moneyAvailable"
                value={moneyAvailable}
                onChange={(e) => setMoneyAvailable(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div>
              <label htmlFor="moneySaved" className={labelClass}>Money Saved ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="moneySaved"
                value={moneySaved}
                onChange={(e) => setMoneySaved(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
             <div>
              <label htmlFor="contingencyPercentage" className={labelClass}>
                Contingency/Buffer (%):
                <Info size={16} className="inline-block ml-1 text-gray-500 cursor-help" title="An extra percentage added to cover unforeseen expenses." />
              </label>
              <input
                type="number"
                id="contingencyPercentage"
                value={contingencyPercentage}
                onChange={(e) => setContingencyPercentage(parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={generateBudgetEstimates}
              className={buttonClass}
              disabled={isGeneratingBudget || ((countries.length === 0 && cities.length === 0) || overallDuration < 1 || numberOfPeople < 1)}
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
            {/* Estimated Costs */}
            <div>
              <label htmlFor="estimatedFlightCost" className={labelClass}>Estimated Flight Cost ({getFormattedCurrency(0).charAt(0)}):</label>
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
              <label htmlFor="actualFlightCost" className={labelClass}>Actual Flight Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualFlightCost"
                value={actualFlightCost}
                onChange={(e) => setActualFlightCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            <div>
              <label htmlFor="estimatedHotelCost" className={labelClass}>Estimated Hotel Cost ({getFormattedCurrency(0).charAt(0)}):</label>
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
              <label htmlFor="actualHotelCost" className={labelClass}>Actual Hotel Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualHotelCost"
                value={actualHotelCost}
                onChange={(e) => setActualHotelCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            <div>
              <label htmlFor="estimatedActivityCost" className={labelClass}>Estimated Activity Cost ({getFormattedCurrency(0).charAt(0)}):</label>
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
              <label htmlFor="actualActivityCost" className={labelClass}>Actual Activity Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualActivityCost"
                value={actualActivityCost}
                onChange={(e) => setActualActivityCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            <div>
              <label htmlFor="estimatedMiscellaneousCost" className={labelClass}>Estimated Miscellaneous Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="estimatedMiscellaneousCost"
                value={estimatedMiscellaneousCost}
                onChange={(e) => setEstimatedMiscellaneousCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
             <div>
              <label htmlFor="actualMiscellaneousCost" className={labelClass}>Actual Miscellaneous Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualMiscellaneousCost"
                value={actualMiscellaneousCost}
                onChange={(e) => setActualMiscellaneousCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>

        {/* --- DAILY FOOD ALLOWANCES SECTION --- */}
        <div className={sectionContainerClass}>
          <h2 className={sectionTitleClass}>
            <Utensils className="mr-3 text-indigo-600" size={28} /> Daily Food Allowances (Per Person, {getFormattedCurrency(0).charAt(0)})
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
            <div className="md:col-span-2">
              <label htmlFor="actualFoodCost" className={labelClass}>Actual Total Food Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualFoodCost"
                value={actualFoodCost}
                onChange={(e) => setActualFoodCost(parseFloat(e.target.value) || 0)}
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
          <p className="text-sm text-gray-600 mb-4">
            Select transport modes and enter their estimated costs.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Estimated Total Transport */}
            <div className="md:col-span-2 mb-4">
              <label htmlFor="estimatedTransportCost" className={labelClass}>AI Estimated Total Transport Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="estimatedTransportCost"
                value={estimatedTransportCost}
                onChange={(e) => setEstimatedTransportCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            {/* Car Rental */}
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={carRental}
                  onChange={(e) => { setCarRental(e.target.checked); if (!e.target.checked) setCarRentalCost(0); }}
                />
                <span className="ml-2 text-gray-800">Car Rental (for trip)</span>
              </label>
              {carRental && (
                <div className="mt-2 ml-7">
                  <label htmlFor="carRentalCost" className={labelClass}>Cost ({getFormattedCurrency(0).charAt(0)}):</label>
                  <input
                    type="number"
                    id="carRentalCost"
                    value={carRentalCost}
                    onChange={(e) => setCarRentalCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    className={`${inputClass} w-full`}
                  />
                </div>
              )}
            </div>

            {/* Shuttle */}
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={shuttle}
                  onChange={(e) => { setShuttle(e.target.checked); if (!e.target.checked) setShuttleCost(0); }}
                />
                <span className="ml-2 text-gray-800">Shuttle Service</span>
              </label>
              {shuttle && (
                <div className="mt-2 ml-7">
                  <label htmlFor="shuttleCost" className={labelClass}>Cost ({getFormattedCurrency(0).charAt(0)}):</label>
                  <input
                    type="number"
                    id="shuttleCost"
                    value={shuttleCost}
                    onChange={(e) => setShuttleCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    className={`${inputClass} w-full`}
                  />
                </div>
              )}
            </div>

            {/* Airport Transfers */}
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={airportTransfers}
                  onChange={(e) => { setAirportTransfers(e.target.checked); if (!e.target.checked) setAirportTransfersCost(0); }}
                />
                <span className="ml-2 text-gray-800">Airport Transfers (Home/Dest)</span>
              </label>
              {airportTransfers && (
                <div className="mt-2 ml-7">
                  <label htmlFor="airportTransfersCost" className={labelClass}>Cost ({getFormattedCurrency(0).charAt(0)}):</label>
                  <input
                    type="number"
                    id="airportTransfersCost"
                    value={airportTransfersCost}
                    onChange={(e) => setAirportTransfersCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    className={`${inputClass} w-full`}
                  />
                </div>
              )}
            </div>

            {/* Airport Parking */}
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={airportParking}
                  onChange={(e) => { setAirportParking(e.target.checked); if (!e.target.checked) setAirportParkingCost(0); }}
                />
                <span className="ml-2 text-gray-800">Airport Parking (Home)</span>
              </label>
              {airportParking && (
                <div className="mt-2 ml-7">
                  <label htmlFor="airportParkingCost" className={labelClass}>Cost ({getFormattedCurrency(0).charAt(0)}):</label>
                  <input
                    type="number"
                    id="airportParkingCost"
                    value={airportParkingCost}
                    onChange={(e) => setAirportParkingCost(parseFloat(e.target.value) || 0)}
                    min="0"
                    className={`${inputClass} w-full`}
                  />
                </div>
              )}
            </div>

            {/* Inter-City Transport */}
            <div className="col-span-1">
              <label htmlFor="estimatedInterCityFlightCost" className={labelClass}>Inter-City Flights ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="estimatedInterCityFlightCost"
                value={estimatedInterCityFlightCost}
                onChange={(e) => setEstimatedInterCityFlightCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="estimatedInterCityTrainCost" className={labelClass}>Inter-City Trains ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="estimatedInterCityTrainCost"
                value={estimatedInterCityTrainCost}
                onChange={(e) => setEstimatedInterCityTrainCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="col-span-1">
              <label htmlFor="estimatedInterCityBusCost" className={labelClass}>Inter-City Buses ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="estimatedInterCityBusCost"
                value={estimatedInterCityBusCost}
                onChange={(e) => setEstimatedInterCityBusCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            {/* Local In-City Transport */}
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={localPublicTransport}
                  onChange={(e) => setLocalPublicTransport(e.target.checked)}
                />
                <span className="ml-2 text-gray-800">Local Public Transport</span>
              </label>
            </div>
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={taxiRideShare}
                  onChange={(e) => setTaxiRideShare(e.target.checked)}
                />
                <span className="ml-2 text-gray-800">Taxis / Ride-Share</span>
              </label>
            </div>
            <div className="col-span-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                  checked={walking}
                  onChange={(e) => setWalking(e.target.checked)}
                />
                <span className="ml-2 text-gray-800">Walking</span>
              </label>
            </div>
            <div className="col-span-1">
              <label htmlFor="dailyLocalTransportAllowance" className={labelClass}>Daily Local Transport Allowance ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="dailyLocalTransportAllowance"
                value={dailyLocalTransportAllowance}
                onChange={(e) => setDailyLocalTransportAllowance(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>

            {/* Actual Total Transport Cost */}
            <div className="md:col-span-2 mt-4">
              <label htmlFor="actualTransportCost" className={labelClass}>Actual Total Transport Cost ({getFormattedCurrency(0).charAt(0)}):</label>
              <input
                type="number"
                id="actualTransportCost"
                value={actualTransportCost}
                onChange={(e) => setActualTransportCost(parseFloat(e.target.value) || 0)}
                min="0"
                className={`${inputClass} w-full`}
              />
            </div>
          </div>
        </div>

        {/* --- GENERATE TRAVEL PLAN BUTTON --- */}
        <div className="text-center mt-10 print:hidden">
          <button
            onClick={calculateTravelPlan}
            className={buttonClass}
            disabled={!homeCountry.name || !homeCity || (countries.length === 0 && cities.length === 0) || !startDate || !endDate || overallDuration < 1 || numberOfPeople < 1}
          >
            Generate Travel Plan
          </button>
        </div>
        {/* --- TRAVEL PLAN SUMMARY SECTION --- */}
        {travelPlanSummary && (
          <div className={summarySectionClass}>
            <h2 className={summaryTitleClass}>
              <CheckCircle className="inline-block mr-3 text-indigo-700 print:text-black" size={32} /> Your Travel Plan Summary
            </h2>
            <div className="text-right print:hidden mb-4">
                <button onClick={handlePrint} className={`${buttonClass} bg-gray-500 hover:bg-gray-600 flex items-center float-right`}>
                    <Printer className="mr-2" size={20} /> Print / Save PDF
                </button>
            </div>
            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
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
              <p className={summaryItemClass}>
                <strong>Destination Cities:</strong>{' '}
                {travelPlanSummary.cities.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {travelPlanSummary.cities.map(city => (
                      <li key={city.name}>
                        {city.name} ({city.duration} days){city.starRating && `, ${city.starRating} Star`}{city.topics.length > 0 && ` [${city.topics.join(', ')}]`}
                      </li>
                    ))}
                  </ul>
                ) : 'Not specified'}
              </p>
              <p className={summaryItemClass}><strong>Overall Duration:</strong> {travelPlanSummary.overallDuration} days</p>
              <p className={summaryItemClass}>
                <strong>Travel Dates:</strong> {travelPlanSummary.startDate} - {travelPlanSummary.endDate}
              </p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
              <h3 className={summarySubTitleClass}>Preferences & Itinerary:</h3>
              <p className={summaryItemClass}><strong>Overall Hotel Star Rating:</strong> {travelPlanSummary.starRating ? `${travelPlanSummary.starRating} Star` : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Travel Style:</strong> {travelPlanSummary.travelStyle || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Hotel Amenities:</strong> {travelPlanSummary.hotelAmenities.length > 0 ? travelPlanSummary.hotelAmenities.join(', ') : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Overall Topics of Interest:</strong> {travelPlanSummary.topicsOfInterest.length > 0 ? travelPlanSummary.topicsOfInterest.join(', ') : 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Activities:</strong> {travelPlanSummary.activities || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Sporting Events:</strong> {travelPlanSummary.sportingEvents || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Food Locations:</strong> {travelPlanSummary.foodLocations || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Theme Parks:</strong> {travelPlanSummary.themeParks || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Tourist Spots:</strong> {travelPlanSummary.touristSpots || 'Not specified'}</p>
              <p className={summaryItemClass}><strong>Tours:</strong> {travelPlanSummary.tours || 'Not specified'}</p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
              <h3 className={summarySubTitleClass}>Estimated vs. Actual Costs ({travelPlanSummary.currency}):</h3>
              <p className={summaryItemClass}><strong>Calculation Basis:</strong> {travelPlanSummary.isPerPerson ? `Per Person (${travelPlanSummary.numberOfPeople} people)` : 'Per Party'}</p>
              <table className="min-w-full bg-white rounded-lg shadow-sm mt-3">
                <thead>
                  <tr className="bg-indigo-100 print:bg-gray-100">
                    <th className="py-2 px-4 text-left text-sm font-semibold text-indigo-700 print:text-gray-800">Category</th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Estimated</th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Actual</th>
                    <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Variance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Flights</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedFlightCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualFlightCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualFlightCost - travelPlanSummary.estimatedFlightCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualFlightCost - travelPlanSummary.estimatedFlightCost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Hotels</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedHotelCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualHotelCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualHotelCost - travelPlanSummary.estimatedHotelCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualHotelCost - travelPlanSummary.estimatedHotelCost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Activities</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedActivityCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualActivityCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualActivityCost - travelPlanSummary.estimatedActivityCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualActivityCost - travelPlanSummary.estimatedActivityCost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Transport</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.combinedEstimatedTransportCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualTransportCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualTransportCost - travelPlanSummary.combinedEstimatedTransportCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualTransportCost - travelPlanSummary.combinedEstimatedTransportCost)}
                    </td>
                  </tr>
                   <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Food</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.totalFoodCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualFoodCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualFoodCost - travelPlanSummary.totalFoodCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualFoodCost - travelPlanSummary.totalFoodCost)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 border-t border-gray-200">Miscellaneous</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedMiscellaneousCost)}</td>
                    <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualMiscellaneousCost)}</td>
                    <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualMiscellaneousCost - travelPlanSummary.estimatedMiscellaneousCost)}`}>
                      {getFormattedCurrency(travelPlanSummary.actualMiscellaneousCost - travelPlanSummary.estimatedMiscellaneousCost)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
              <h3 className={summarySubTitleClass}>Detailed Transport Options:</h3>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                {travelPlanSummary.carRental && <li>Car Rental: {getFormattedCurrency(travelPlanSummary.carRentalCost)}</li>}
                {travelPlanSummary.shuttle && <li>Shuttle Service: {getFormattedCurrency(travelPlanSummary.shuttleCost)}</li>}
                {travelPlanSummary.airportTransfers && <li>Airport Transfers: {getFormattedCurrency(travelPlanSummary.airportTransfersCost)}</li>}
                {travelPlanSummary.airportParking && <li>Airport Parking: {getFormattedCurrency(travelPlanSummary.airportParkingCost)}</li>}
                {travelPlanSummary.estimatedInterCityFlightCost > 0 && <li>Inter-City Flights: {getFormattedCurrency(travelPlanSummary.estimatedInterCityFlightCost)}</li>}
                {travelPlanSummary.estimatedInterCityTrainCost > 0 && <li>Inter-City Trains: {getFormattedCurrency(travelPlanSummary.estimatedInterCityTrainCost)}</li>}
                {travelPlanSummary.estimatedInterCityBusCost > 0 && <li>Inter-City Buses: {getFormattedCurrency(travelPlanSummary.estimatedInterCityBusCost)}</li>}
                {travelPlanSummary.localPublicTransport && <li>Local Public Transport</li>}
                {travelPlanSummary.taxiRideShare && <li>Taxis / Ride-Share</li>}
                {travelPlanSummary.walking && <li>Walking</li>}
                {(travelPlanSummary.localPublicTransport || travelPlanSummary.taxiRideShare) && travelPlanSummary.dailyLocalTransportAllowance > 0 &&
                  <li>Daily Local Transport Allowance: {getFormattedCurrency(travelPlanSummary.dailyLocalTransportAllowance)}</li>
                }
                {!travelPlanSummary.carRental && !travelPlanSummary.shuttle && !travelPlanSummary.airportTransfers && !travelPlanSummary.airportParking &&
                 travelPlanSummary.estimatedInterCityFlightCost === 0 && travelPlanSummary.estimatedInterCityTrainCost === 0 && travelPlanSummary.estimatedInterCityBusCost === 0 &&
                 !travelPlanSummary.localPublicTransport && !travelPlanSummary.taxiRideShare && !travelPlanSummary.walking &&
                 <li>No specific transport options selected.</li>}
              </ul>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
              <h3 className={summarySubTitleClass}>Budget Overview ({travelPlanSummary.currency}):</h3>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                <li className="mb-1">Money Available: <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.moneyAvailable)}</span></li>
                <li className="mb-1">Money Saved: <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.moneySaved)}</span></li>
                <li className="mb-1">Contingency/Buffer ({travelPlanSummary.contingencyPercentage}%): <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.contingencyAmount)}</span></li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-indigo-300 print:border-gray-400 text-right">
              <h3 className={totalCostClass}>Grand Total Estimated Trip Cost: <span className={grandTotalAmountClass}>{getFormattedCurrency(travelPlanSummary.grandTotal)}</span></h3>
              <h3 className={totalCostClass}>Remaining Budget: <span className={remainingBudgetClass(travelPlanSummary.remainingBudget)}>{getFormattedCurrency(travelPlanSummary.remainingBudget)}</span></h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
