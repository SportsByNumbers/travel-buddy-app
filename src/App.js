import React, { useState, useEffect, useRef } from 'react';
import {
  Hotel, Activity, Utensils, Award, FerrisWheel, MapPin, Plane, Car, Bus, ParkingSquare,
  DollarSign, CalendarDays, Search, XCircle, PlaneTakeoff, PlaneLanding, Users, LogIn, LogOut, Save, FolderOpen, ListChecks, PlusCircle, MinusCircle, Heart, Home, Lightbulb, Loader
} from 'lucide-react';

// Import mock API functions for simulation
import { fetchTravelData, fetchFlightPrices, authenticateUser, registerUser, saveUserTrip, loadUserTrips } from './mockApi';

// Transport options (fixed for this simulation)
const transportOptions = {
  carRental: { name: "Car Rental", costPerDay: 50, icon: <Car className="w-5 h-5 text-blue-500" /> },
  shuttle: { name: "Shuttle Service", costPerUse: 30, icon: <Bus className="w-5 h-5 text-blue-500" /> },
  airportTransfer: { name: "Airport Transfer", costPerUse: 70, icon: <Plane className="w-5 h-5 text-blue-500" /> },
  airportParking: { name: "Airport Parking", costPerDay: 25, icon: <ParkingSquare className="w-5 h-5 text-blue-500" /> },
};

function App() {
  // --- DESTINATION & DURATION STATES ---
  const [countries, setCountries] = useState([]); // Stores { name: string, flag: string } for destinations
  const [newCountry, setNewCountry] = useState(''); // Input for adding new destination country
  const [cities, setCities] = useState([]); // Stores string names of destination cities
  const [newCity, setNewCity] = useState(''); // Input for adding new destination city
  const [duration, setDuration] = useState(1); // Trip duration in days

  // --- HOME LOCATION STATES ---
  const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' }); // Stores { name: string, flag: string }
  const [newHomeCountryInput, setNewHomeCountryInput] = useState(''); // Input for home country
  const [homeCity, setHomeCity] = useState(''); // Home city as string
  const [newHomeCityInput, setNewHomeCityInput] = useState(''); // Input for home city

  // --- PREDICTIVE TEXT / COUNTRY SUGGESTIONS STATES ---
  const [allCountries, setAllCountries] = useState([]); // Full list of countries fetched once for suggestions
  const [filteredHomeCountrySuggestions, setFilteredHomeCountrySuggestions] = useState([]);
  const [filteredDestCountrySuggestions, setFilteredDestCountrySuggestions] = useState([]);
  const homeCountryInputRef = useRef(null); // Ref for managing focus on home country input
  const destCountryInputRef = useRef(null); // Ref for managing focus on destination country input

  // --- ITINERARY & PREFERENCES STATES ---
  const [starRating, setStarRating] = useState(''); // Preferred hotel star rating
  const [topicsOfInterest, setTopicsOfInterest] = useState([]); // Selected topics for AI suggestions
  const availableTopics = ['Food', 'Sport', 'Culture', 'Theme Parks', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Relaxation'];
  const [suggestedActivities, setSuggestedActivities] = useState([]); // AI-generated suggestions
  const [suggestedFoodLocations, setSuggestedFoodLocations] = useState([]);
  const [suggestedThemeParks, setSuggestedThemeParks] = useState([]);
  const [suggestedTouristSpots, setSuggestedTouristSpots] = useState([]);
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [suggestedSportingEvents, setSuggestedSportingEvents] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false); // Loading state for AI suggestions
  const [suggestionError, setSuggestionError] = useState(''); // Error for AI suggestions
  const [selectedSuggestedActivities, setSelectedSuggestedActivities] = useState([]); // User's selected suggestions
  const [selectedSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useState([]);
  const [selectedSuggestedThemeParks, setSelectedSuggestedThemeParks] = useState([]);
  const [selectedSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useState([]);
  const [selectedSuggestedTours, setSelectedSuggestedTours] = useState([]);
  const [selectedSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useState([]);
  const [itineraryItems, setItineraryItems] = useState([]); // Combined user-selected itinerary items

  // --- BUDGET PLANNING STATES ---
  const [isPerPerson, setIsPerPerson] = useState(true); // Cost calculation basis (per person/party)
  const [numberOfPeople, setNumberOfPeople] = useState(1); // Number of people for calculations
  const [estimatedFlightCost, setEstimatedFlightCost] = useState(0);
  const [estimatedHotelCost, setEstimatedHotelCost] = useState(0);
  const [estimatedActivityCost, setEstimatedActivityCost] = useState(0);
  const [estimatedTransportCost, setEstimatedTransportCost] = useState(0);
  const [estimatedMiscellaneousCost, setEstimatedMiscellaneousCost] = useState(0);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false); // Loading state for AI budget
  const [budgetError, setBudgetError] = useState(''); // Error for AI budget

  // --- DAILY FOOD ALLOWANCE STATES ---
  const [breakfastAllowance, setBreakfastAllowance] = useState(0);
  const [lunchAllowance, setLunchAllowance] = useState(0);
  const [dinnerAllowance, setDinnerAllowance] = useState(0);
  const [snacksAllowance, setSnacksAllowance] = useState(0);

  // --- TRANSPORT OPTIONS STATES (checkboxes, not AI-driven) ---
  const [carRental, setCarRental] = useState(false);
  const [shuttle, setShuttle] = useState(false);
  const [airportTransfers, setAirportTransfers] = useState(false);
  const [airportParking, setAirportParking] = useState(false);

  // --- FLIGHT SEARCH STATES (Simulated Skyscanner) ---
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [flightCost, setFlightCost] = useState(0);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState('');

  // --- GLOBAL APP STATES ---
  const [travelPlanSummary, setTravelPlanSummary] = useState(null); // Final summary data
  const [loading, setLoading] = useState(false); // General loading for main search button
  const [showDisclaimer, setShowDisclaimer] = useState(true); // Control visibility of disclaimer

  // --- AUTHENTICATION & PERSISTENCE STATES ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false); // Controls Auth/Load modal visibility
  const [isRegistering, setIsRegistering] = useState(false); // Toggles between login/register in modal
  const [userTrips, setUserTrips] = useState([]); // List of saved trips for current user
  const [saveLoadMessage, setSaveLoadMessage] = useState(''); // Feedback messages for save/load
  const [loadingUserTrips, setLoadingUserTrips] = useState(false); // Loading state for fetching user trips


  // --- EFFECT: Fetch all countries on component mount for predictive text ---
  useEffect(() => {
    const fetchAllCountriesData = async () => {
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
    fetchAllCountriesData();
  }, []);

  // --- HELPER FUNCTION: Fetch Country Flag ---
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

  // --- HOME LOCATION HANDLERS ---
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

  // --- DESTINATION HANDLERS ---
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
    setNewCountry(country.name);
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

  // --- ITINERARY & PREFERENCES HANDLERS ---
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


    const destinationPrompt = countries.length > 0 && cities.length > 0
      ? `in the countries: ${countries.map(c => c.name).join(', ')} and cities: ${cities.join(', ')}`
      : countries.length > 0
        ? `in the countries: ${countries.map(c => c.name).join(' and ')}`
        : `in the cities: ${cities.join(', ')}`;

    const topicsPrompt = topicsOfInterest.length > 0
      ? `with a focus on topics such as: ${topicsOfInterest.join(', ')}`
      : '';

    const prompt = `Suggest 5-7 popular activities, 5-7 popular food locations (e.g., specific restaurants, food markets), 2-3 popular theme parks, 5-7 popular tourist spots, 3-5 popular tours, and 3-5 popular sporting events ${destinationPrompt} ${topicsPrompt}. Provide the response as a JSON object with keys: "activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents". Each key's value should be an array of strings.`;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "activities": { "type": "ARRAY", "items": { "type": "STRING" } },
            "foodLocations": { "type": "ARRAY", "items": { "type": "STRING" } },
            "themeParks": { "type": "ARRAY", "items": { "type": "STRING" } },
            "touristSpots": { "type": "ARRAY", "items": { "type": "STRING" } },
            "tours": { "type": "ARRAY", "items": { "type": "STRING" } },
            "sportingEvents": { "type": "ARRAY", "items": { "type": "STRING" } }
          },
          "propertyOrdering": ["activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents"]
        }
      }
    };

    const apiKey = ""; // IMPORTANT: Replace with your actual Gemini API Key if deploying
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

    const destinationPrompt = countries.length > 0 && cities.length > 0
      ? `for a trip to ${countries.map(c => c.name).join(' and ')} (cities: ${cities.join(', ')})`
      : countries.length > 0
        ? `in the countries: ${countries.map(c => c.name).join(' and ')}`
        : `in the cities: ${cities.join(', ')}`;

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

    const transportOptionsPrompt = [
      carRental ? 'car rental' : '',
      shuttle ? 'shuttle' : '',
      airportTransfers ? 'airport transfers' : '',
      airportParking ? 'airport parking' : ''
    ].filter(Boolean).join(', ');

    const prompt = `Estimate the following costs in USD for a ${duration}-day trip ${destinationPrompt} ${homeLocationPrompt} for ${numberOfPeople} ${isPerPerson ? 'person' : 'party'}.
    Consider these itinerary items: ${itineraryPrompt || 'general sightseeing'}.
    Preferred hotel star rating: ${starRating || 'any'}.
    Transport options: ${transportOptionsPrompt || 'standard public transport'}.
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

    const apiKey = ""; // IMPORTANT: Replace with your actual Gemini API Key if deploying
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


  // --- MAIN TRAVEL PLAN CALCULATION (for final summary) ---
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
    const totalFoodCost = totalDailyFoodAllowance * parseInt(duration);

    // Calculate total estimated costs
    const totalEstimatedCost = 0
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
      countries, // Destination countries
      cities,    // Destination cities
      duration,
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

  // --- FLIGHT SEARCH HANDLER ---
  const handleFlightSearch = async () => {
    setFlightLoading(true);
    setFlightError('');
    try {
      // Pass selected destination country/city to mock API if available
      const destCityForFlight = cities.length > 0 ? cities[0] : destinationCity;
      const originCityForFlight = homeCity || originCity;

      const cost = await fetchFlightPrices({
        originCity: originCityForFlight,
        destinationCity: destCityForFlight,
        departureDate,
        returnDate
      });
      setFlightCost(cost);
    } catch (error) {
      console.error("Error fetching flight prices:", error);
      setFlightError(error.message);
      setFlightCost(0);
    } finally {
      setFlightLoading(false);
    }
  };

  // --- ITINERARY ITEM ADD/REMOVE HANDLERS ---
  const handleAddToItinerary = (item) => {
    if (!itineraryItems.some(itineraryItem => itineraryItem.id === item.id)) {
      setItineraryItems(prevItems => [...prevItems, item]);
      // Update total estimated cost immediately
      const durationDays = parseInt(duration) || 0;
      const currentFlightCost = estimatedFlightCost; // Use current estimated flight cost
      const currentPartySize = numberOfPeople;
      const currentBreakfastCost = breakfastAllowance;
      const currentLunchCost = lunchAllowance;
      const currentDinnerCost = dinnerAllowance;
      const currentSnacksCost = snacksAllowance;
      const currentFoodAllowanceType = isPerPerson ? 'perPerson' : 'perParty';
      
      setTotalEstimatedCost(prevCost => {
        let itemCost = item.baseCost;
        if (item.type === 'hotel') {
          itemCost = itemCost * durationDays; // Hotels are per night
        } else if (item.type !== 'flight' && item.type !== 'food') { // Most other items are per person
          itemCost = itemCost * currentPartySize;
        }
        return prevCost + itemCost; // Increment total cost by item cost
      });

      setSaveLoadMessage(`Added "${item.name}" to itinerary.`);
      setTimeout(() => setSaveLoadMessage(''), 2000);
    } else {
      setSaveLoadMessage(`"${item.name}" is already in your itinerary.`);
      setTimeout(() => setSaveLoadMessage(''), 2000);
    }
  };

  const handleRemoveFromItinerary = (itemId) => {
    const itemToRemove = itineraryItems.find(item => item.id === itemId);
    if (!itemToRemove) return;

    setItineraryItems(prevItems => prevItems.filter(item => item.id !== itemId));

    // Decrement total estimated cost immediately
    const durationDays = parseInt(duration) || 0;
    const currentPartySize = numberOfPeople;

    setTotalEstimatedCost(prevCost => {
        let itemCost = itemToRemove.baseCost;
        if (itemToRemove.type === 'hotel') {
            itemCost = itemCost * durationDays;
        } else if (itemToRemove.type !== 'flight' && itemToRemove.type !== 'food') {
            itemCost = itemCost * currentPartySize;
        }
        return prevCost - itemCost;
    });

    setSaveLoadMessage('Item removed from itinerary.');
    setTimeout(() => setSaveLoadMessage(''), 2000);
  };


  // --- MAIN SEARCH & CLEAR HANDLERS ---
  // The 'handleSearch' is now essentially replaced by 'generateSuggestions' and 'generateBudgetEstimates'
  // as the primary ways to populate the plan details.
  // The 'Calculate Travel Plan' button serves as the final summary generator.
  const handleSearch = async () => {
    // This function is retained for structure but its internal logic is now handled by
    // generateSuggestions and generateBudgetEstimates buttons.
    // It could be used to fetch an initial set of mock travel data if needed,
    // but the AI suggestions provide a more dynamic approach.
    setLoading(true);
    setShowDisclaimer(false);
    // Simulate initial data fetch or AI call if no suggestions/budget exists yet
    // For now, it mostly just clears disclaimer and sets loading briefly
    setTimeout(() => {
        setLoading(false);
    }, 500);
  };

  const handleClear = () => {
    // Clear all main input states
    setCountries([]);
    setNewCountry('');
    setCities([]);
    setNewCity('');
    setDuration(1);
    setStarRating('');
    setHomeCountry({ name: '', flag: '' });
    setNewHomeCountryInput('');
    setHomeCity('');
    setNewHomeCityInput('');
    setTopicsOfInterest([]);
    setEstimatedFlightCost(0);
    setEstimatedHotelCost(0);
    setEstimatedActivityCost(0);
    setEstimatedTransportCost(0);
    setEstimatedMiscellaneousCost(0);
    setBreakfastAllowance(0);
    setLunchAllowance(0);
    setDinnerAllowance(0);
    setSnacksAllowance(0);
    setCarRental(false);
    setShuttle(false);
    setAirportTransfers(false);
    setAirportParking(false);
    setOriginCity('');
    setDestinationCity('');
    setDepartureDate('');
    setReturnDate('');
    setFlightCost(0);
    setFlightError('');
    setBudgetError('');
    setSuggestionError('');
    setTravelPlanSummary(null);

    // Clear AI suggestions and selections
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
    setItineraryItems([]); // Clear combined itinerary

    setLoading(false);
    setShowDisclaimer(true);
    setSaveLoadMessage('');
    // Reset budget planning specifics
    setIsPerPerson(true);
    setNumberOfPeople(1);
  };

  // --- AUTHENTICATION & PERSISTENCE HANDLERS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = await authenticateUser({ email: authEmail, password: authPassword });
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      await loadTripsForUser(user.email); // Load trips after successful login
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = await registerUser({ email: authEmail, password: authPassword });
      setCurrentUser(user);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      // No trips to load for a new user yet
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserTrips([]); // Clear saved trips on logout
    setAuthEmail('');
    setAuthPassword('');
    setSaveLoadMessage('');
    handleClear(); // Also clear the current trip plan
  };

  const handleSaveTrip = async () => {
    if (!currentUser) {
      setSaveLoadMessage('Please log in to save your trip.');
      return;
    }
    setSaveLoadMessage('Saving trip...');
    try {
      const tripToSave = {
        name: `${cities.length > 0 ? cities[0] : 'Unnamed'} trip (${new Date().toLocaleDateString()})`, // Dynamic name
        homeCountry, homeCity, countries, cities, duration, starRating,
        topicsOfInterest,
        selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
        selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents,
        itineraryItems, // Save the actual itinerary items
        isPerPerson, numberOfPeople,
        estimatedFlightCost, estimatedHotelCost, estimatedActivityCost,
        estimatedTransportCost, estimatedMiscellaneousCost,
        breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance,
        carRental, shuttle, airportTransfers, airportParking,
        originCity, destinationCity, departureDate, returnDate, flightCost,
        totalEstimatedCost: calculateTotalCost(null, duration, flightCost, numberOfPeople, breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance, isPerPerson ? 'perPerson' : 'perParty', itineraryItems) // Calculate final cost on save
      };
      await saveUserTrip({ email: currentUser.email, tripData: tripToSave });
      setSaveLoadMessage('Trip saved successfully!');
      await loadTripsForUser(currentUser.email); // Refresh list of saved trips
    } catch (error) {
      setSaveLoadMessage(`Error saving trip: ${error.message}`);
    }
    setTimeout(() => setSaveLoadMessage(''), 3000);
  };

  const loadTripsForUser = async (email) => {
    setLoadingUserTrips(true);
    try {
      const trips = await loadUserTrips({ email });
      setUserTrips(trips);
    } catch (error) {
      console.error("Error loading user trips:", error);
      setUserTrips([]);
    } finally {
      setLoadingUserTrips(false);
    }
  };

  const handleLoadSpecificTrip = (trip) => {
    // Restore all states from loaded trip
    setHomeCountry(trip.homeCountry || { name: '', flag: '' });
    setHomeCity(trip.homeCity || '');
    setCountries(trip.countries || []);
    setCities(trip.cities || []);
    setDuration(trip.duration || 1);
    setStarRating(trip.starRating || '');
    setTopicsOfInterest(trip.topicsOfInterest || []);
    setSelectedSuggestedActivities(trip.selectedSuggestedActivities || []);
    setSelectedSuggestedFoodLocations(trip.selectedSuggestedFoodLocations || []);
    setSelectedSuggestedThemeParks(trip.selectedSuggestedThemeParks || []);
    setSelectedSuggestedTouristSpots(trip.selectedSuggestedTouristSpots || []);
    setSelectedSuggestedTours(trip.selectedSuggestedTours || []);
    setSelectedSuggestedSportingEvents(trip.selectedSuggestedSportingEvents || []);
    setItineraryItems(trip.itineraryItems || []); // Restore the actual itinerary items

    setIsPerPerson(trip.isPerPerson);
    setNumberOfPeople(trip.numberOfPeople || 1);
    setEstimatedFlightCost(trip.estimatedFlightCost || 0);
    setEstimatedHotelCost(trip.estimatedHotelCost || 0);
    setEstimatedActivityCost(trip.estimatedActivityCost || 0);
    setEstimatedTransportCost(trip.estimatedTransportCost || 0);
    setEstimatedMiscellaneousCost(trip.estimatedMiscellaneousCost || 0);
    setBreakfastAllowance(trip.breakfastAllowance || 0);
    setLunchAllowance(trip.lunchAllowance || 0);
    setDinnerAllowance(trip.dinnerAllowance || 0);
    setSnacksAllowance(trip.snacksAllowance || 0);
    setCarRental(trip.carRental || false);
    setShuttle(trip.shuttle || false);
    setAirportTransfers(trip.airportTransfers || false);
    setAirportParking(trip.airportParking || false);
    setOriginCity(trip.originCity || '');
    setDestinationCity(trip.destinationCity || '');
    setDepartureDate(trip.departureDate || '');
    setReturnDate(trip.returnDate || '');
    setFlightCost(trip.flightCost || 0);

    // Recalculate total cost to ensure consistency with restored values
    const durationDays = parseInt(trip.duration) || 0;
    const currentFoodAllowanceType = trip.isPerPerson ? 'perPerson' : 'perParty';
    setTotalEstimatedCost(calculateTotalCost(null, durationDays, trip.flightCost, trip.numberOfPeople, trip.breakfastAllowance, trip.lunchAllowance, trip.dinnerAllowance, trip.snacksAllowance, currentFoodAllowanceType, trip.itineraryItems));

    setSaveLoadMessage(`Trip "${trip.name}" loaded successfully!`);
    setShowAuthModal(false);
    setTimeout(() => setSaveLoadMessage(''), 3000);
  };

  // --- EFFECT: Recalculate total cost when relevant states change ---
  useEffect(() => {
    const durationDays = parseInt(duration) || 0;
    const currentFoodAllowanceType = isPerPerson ? 'perPerson' : 'perParty';
    // When itineraryItems are the source of truth for items, pass them directly
    setTotalEstimatedCost(calculateTotalCost(null, durationDays, flightCost, numberOfPeople, breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance, currentFoodAllowanceType, itineraryItems));
  }, [duration, flightCost, numberOfPeople, breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance, isPerPerson, itineraryItems]);

  // Calculate total budget for comparison
  const durationDaysMatch = String(duration).match(/(\d+)/);
  const durationDays = durationDaysMatch ? parseInt(durationDaysMatch[1], 10) : 0;

  let totalBudget = (estimatedActivityCost + estimatedHotelCost + estimatedTransportCost + estimatedMiscellaneousCost); // These are estimates for items outside food
  totalBudget += (breakfastAllowance + lunchAllowance + dinnerAllowance + snacksAllowance); // Add daily food allowance
  totalBudget *= (isPerPerson ? numberOfPeople : 1) * durationDays; // Multiply by people and duration

  // The actual user-set budget from the input field: dailyBudgetPerPerson
  const userSetTotalBudget = (estimatedFlightCost + estimatedHotelCost + estimatedActivityCost + estimatedTransportCost + estimatedMiscellaneousCost + (breakfastAllowance + lunchAllowance + dinnerAllowance + snacksAllowance) * duration) * (isPerPerson ? numberOfPeople : 1);


  const isOverBudget = totalEstimatedCost > userSetTotalBudget && userSetTotalBudget > 0;
  const budgetDifference = Math.abs(totalEstimatedCost - userSetTotalBudget);
  const totalCalculatedDailyFoodAllowance = (breakfastAllowance + lunchAllowance + dinnerAllowance + snacksAllowance);

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

        {/* --- AUTH/USER CONTROLS --- */}
        <div className="flex justify-end mb-4 gap-2 max-w-4xl mx-auto">
          {isLoggedIn ? (
            <>
              <span className="text-gray-600 font-medium self-center hidden sm:block">Welcome, {currentUser?.email}!</span>
              <button
                onClick={handleSaveTrip}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Save className="w-4 h-4 mr-2" /> Save Trip
              </button>
              <button
                onClick={() => { setShowAuthModal(true); setIsRegistering(false); setAuthError(''); setAuthEmail(currentUser.email); loadTripsForUser(currentUser.email); }}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              >
                <FolderOpen className="w-4 h-4 mr-2" /> Load Trip
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAuthModal(true); setIsRegistering(false); setAuthError(''); }}
              className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <LogIn className="w-4 h-4 mr-2" /> Login / Register
            </button>
          )}
        </div>
        {saveLoadMessage && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded-md shadow-sm mb-4 max-w-4xl mx-auto text-center">
            {saveLoadMessage}
          </div>
        )}

        {/* --- DISCLAIMER --- */}
        {showDisclaimer && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm mb-6 max-w-4xl mx-auto relative" role="alert">
            <p className="font-bold">Important Note:</p>
            <p className="text-sm">This app uses **simulated data and backend operations** (authentication, saving/loading trips, AI suggestions, budget estimates). In a real application, these would involve actual API calls to external services (like Skyscanner, Booking.com, dedicated AI APIs) and a backend database (like Firebase, MongoDB, PostgreSQL).</p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900"
              aria-label="Close disclaimer"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* --- AUTHENTICATION MODAL --- */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
              <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
                {isRegistering ? 'Register' : 'Login'}
              </h2>
              <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                <div className="mb-4">
                  <label htmlFor="authEmail" className={labelClass}>Email</label>
                  <input
                    type="email"
                    id="authEmail"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="authPassword" className={labelClass}>Password</label>
                  <input
                    type="password"
                    id="authPassword"
                    className="mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>
                {authError && <p className="text-red-600 text-sm mb-4 text-center">{authError}</p>}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isRegistering ? 'Register' : 'Login'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              {/* Load Trips Section (only shown if logged in and not registering) */}
              {isLoggedIn && !isRegistering && (
                  <div className="mt-8 border-t pt-6 border-gray-200">
                      <h3 className="text-xl font-bold text-blue-600 mb-4 text-center">Your Saved Trips</h3>
                      {loadingUserTrips ? (
                          <p className="text-center text-gray-500">Loading trips...</p>
                      ) : userTrips.length > 0 ? (
                          <ul className="space-y-3 max-h-60 overflow-y-auto">
                              {userTrips.map((trip, index) => (
                                  <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm border border-gray-200">
                                      <span className="font-medium text-gray-800">{trip.name || `Trip ${index + 1}`}</span>
                                      <button
                                          onClick={() => handleLoadSpecificTrip(trip)}
                                          className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      >
                                          Load
                                      </button>
                                  </li>
                              ))}
                          </ul>
                      ) : (
                          <p className="text-center text-gray-500">No trips saved yet.</p>
                      )}
                      <button
                          onClick={() => setShowAuthModal(false)}
                          className="mt-6 w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                          Close
                      </button>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* --- HOME LOCATION SECTION --- */}
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
                  onBlur={() => setTimeout(() => setFilteredHomeCountrySuggestions([]), 100)} // Hide suggestions on blur
                  placeholder="e.g., USA"
                  className={`${inputClass} flex-grow`}
                />
                <button onClick={handleSetHomeCountry} className={`${buttonClass} ml-3`}>Set</button>
              </div>
              {/* Country Suggestions Dropdown */}
              {filteredHomeCountrySuggestions.length > 0 && (
                <ul className={suggestionListClass}>
                  {filteredHomeCountrySuggestions.map((country) => (
                    <li
                      key={country.name}
                      onMouseDown={() => selectHomeCountrySuggestion(country)} // Use onMouseDown to prevent blur
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
                  <span className={flagTagClass}>
                    {homeCountry.flag && <img src={homeCountry.flag} alt={`${homeCountry.name} flag`} className="w-6 h-4 mr-2 rounded-sm" />}
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
                  className={`${inputClass} flex-grow`}
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
                  className={`${inputClass} flex-grow`}
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
                  className={`${inputClass} flex-grow`}
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
          <div>
            <label htmlFor="duration" className={labelClass}>Duration of Stay (days):</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              className={`${inputClass} w-full`}
            />
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

        {/* --- FLIGHT DETAILS SECTION (INTEGRATED) --- */}
        <div className={sectionContainerClass}>
          <h3 className={sectionTitleClass}>
            <PlaneTakeoff className="w-6 h-6 mr-2" /> Flight Details (Simulated Skyscanner)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="originCity" className={labelClass}>Origin City</label>
              <input
                type="text"
                id="originCity"
                className={inputClass}
                value={homeCity || originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="e.g., Sydney"
              />
            </div>
            <div>
              <label htmlFor="destinationCity" className={labelClass}>Destination City</label>
              <input
                type="text"
                id="destinationCity"
                className={inputClass}
                value={cities.length > 0 ? cities[0] : destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder="e.g., New York"
              />
            </div>
            <div>
              <label htmlFor="departureDate" className={labelClass}>Departure Date</label>
              <input
                type="date"
                id="departureDate"
                className={inputClass}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="returnDate" className={labelClass}>Return Date</label>
              <input
                type="date"
                id="returnDate"
                className={inputClass}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleFlightSearch}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            disabled={flightLoading || !originCity || !destinationCity || !departureDate || !returnDate}
          >
            {flightLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PlaneLanding className="w-5 h-5 mr-2" />
            )}
            {flightLoading ? 'Searching Flights...' : 'Search Flights'}
          </button>
          {flightError && <p className="text-red-600 text-sm mt-2 text-center">{flightError}</p>}
          {flightCost > 0 && (
            <p className="mt-4 text-lg font-semibold text-green-700 text-center">
              Simulated Flight Cost: ${flightCost.toLocaleString()}
            </p>
          )}
        </div>

        {/* --- MAIN GENERATE & CLEAR BUTTONS --- */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={calculateTravelPlan}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
            disabled={loading}
          >
            <Search className="w-5 h-5 mr-2" /> Generate Travel Plan
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            <XCircle className="w-5 h-5 mr-2" /> Clear All
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
              <p className={summaryItemClass}><strong>Party Size:</strong> {travelPlanSummary.numberOfPeople} {travelPlanSummary.isPerPerson ? 'person(s)' : 'party'}</p>
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

            {/* Displaying actual itinerary items if added */}
            {itineraryItems.length > 0 && (
              <div className="mb-6 pb-4 border-b border-indigo-200">
                <h3 className={summarySubTitleClass}>Selected Itinerary Items:</h3>
                <ul className="list-disc list-inside ml-6 text-gray-700">
                  {itineraryItems.map(item => (
                    <li key={item.id} className="mb-1">
                      {item.name} (${item.baseCost.toLocaleString()}{item.type === 'hotel' ? ' / night' : ''})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {itineraryItems.length === 0 && (
              <div className="mb-6 pb-4 border-b border-indigo-200">
                  <h3 className={summarySubTitleClass}>Selected Itinerary Items:</h3>
                  <p className="italic ml-6 text-gray-700">No specific items selected from suggestions.</p>
              </div>
            )}


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
              {userSetTotalBudget > 0 && (
                  <p className={`text-lg font-bold mt-2 ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                      Budgeted: ${userSetTotalBudget.toLocaleString()} (You are {isOverBudget ? 'OVER' : 'UNDER'} by ${budgetDifference.toLocaleString()})
                  </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
