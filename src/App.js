mport React, { useState, useEffect, useRef } from 'react';
// Re-organized and verified lucide-react imports for clarity
import { MapPin, Compass, Wallet, Car, Home, User, PlaneTakeoff, PlaneLanding, XCircle, Search, CheckCircle, Utensils, Loader, LogIn, LogOut, FolderOpen, Save } from 'lucide-react';
// Import mock API functions - ensure these are correctly exported from your mockApi.js
import { fetchFlightPrices, fetchTravelData, fetchBudgetEstimates, countriesData, registerUser, authenticateUser, saveUserTrip, loadUserTrips } from './mockApi';
import './index.css';

// --- AVAILABLE TOPICS OF INTEREST (for checkboxes) ---
const availableTopics = [
  "History", "Culture", "Food", "Nature", "Adventure", "Relaxation", "Nightlife", "Shopping", "Art", "Music", "Sports", "Family", "Luxury", "Budget", "Wildlife", "Beaches", "Mountains", "City Breaks", "Road Trips", "Cruises", "Festivals", "Theme Parks", "Hiking", "Skiing", "Diving", "Snorkeling", "Museums", "Architecture", "Photography", "Yoga", "Wellness", "Sustainable Travel", "Solo Travel", "Group Travel", "Romantic Getaways", "Backpacking", "Volunteering"
];

// --- FUNCTION TO CALCULATE TOTAL ESTIMATED COST (including itinerary items) ---
const calculateTotalCost = (itineraryItems, durationDays, estimatedFlightCost, estimatedHotelCost, estimatedTransportCost, estimatedMiscellaneousCost, breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance, numberOfPeople, isPerPerson) => {
  // Ensure all numerical inputs are treated as numbers, with a default of 0 if undefined/null
  const numDuration = parseFloat(durationDays || 0);
  const numEstimatedFlightCost = parseFloat(estimatedFlightCost || 0);
  const numEstimatedHotelCost = parseFloat(estimatedHotelCost || 0);
  const numEstimatedTransportCost = parseFloat(estimatedTransportCost || 0);
  const numEstimatedMiscellaneousCost = parseFloat(estimatedMiscellaneousCost || 0);
  const numBreakfastAllowance = parseFloat(breakfastAllowance || 0);
  const numLunchAllowance = parseFloat(lunchAllowance || 0);
  const numDinnerAllowance = parseFloat(dinnerAllowance || 0);
  const numSnacksAllowance = parseFloat(snacksAllowance || 0);
  const numNumberOfPeople = parseInt(numberOfPeople || 1); // Default to 1 person if not set

  // Calculate the cost of itinerary items
  let itineraryCost = 0;
  if (itineraryItems && itineraryItems.length > 0) {
    itineraryCost = itineraryItems.reduce((acc, item) => {
      let itemCost = item.baseCost || 0;
      if (item.type === 'hotel') { // Assuming hotels are per night
        itemCost *= numDuration;
      }
      return acc + itemCost;
    }, 0);
  }

  // Calculate total food cost based on daily allowances and duration
  const totalDailyFoodAllowance = numBreakfastAllowance + numLunchAllowance + numDinnerAllowance + numSnacksAllowance;
  let tripFoodCost = totalDailyFoodAllowance * numDuration;
  if (isPerPerson) {
    tripFoodCost *= numNumberOfPeople;
  }

  // Sum AI-generated general estimates (excluding AI's general activity estimate if specifics are used)
  const totalEstimatedCostsFromAI =
    numEstimatedFlightCost +
    numEstimatedHotelCost +
    numEstimatedTransportCost +
    numEstimatedMiscellaneousCost;

  // The final total is the sum of AI's general estimates, user-selected specific items, and total food cost.
  // Note: AI's estimates for Flight/Hotel/Transport/Misc are assumed to be total trip costs.
  const finalTotal = totalEstimatedCostsFromAI + itineraryCost + tripFoodCost;

  return finalTotal;
};

function App() {
  // --- STATE HOOKS ---
  const [countries, setCountries] = useState([]);
  const [newCountry, setNewCountry] = useState('');
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [duration, setDuration] = useState(1);
  const [starRating, setStarRating] = useState('');
  const [topicsOfInterest, setTopicsOfInterest] = useState([]);
  const [suggestedActivities, setSuggestedActivities] = useState([]);
  const [suggestedFoodLocations, setSuggestedFoodLocations] = useState([]);
  const [suggestedThemeParks, setSuggestedThemeParks] = useState([]);
  const [suggestedTouristSpots, setSuggestedTouristSpots] = useState([]);
  const [suggestedTours, setSuggestedTours] = useState([]);
  const [suggestedSportingEvents, setSuggestedSportingEvents] = useState([]);
  const [selectedSuggestedActivities, setSelectedSuggestedActivities] = useState([]);
  const [selectedSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useState([]);
  const [selectedSuggestedThemeParks, setSelectedSuggestedThemeParks] = useState([]);
  const [selectedSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useState([]);
  const [selectedSuggestedTours, setSelectedSuggestedTours] = useState([]);
  const [selectedSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useState([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionError, setSuggestionError] = useState('');
  const [estimatedFlightCost, setEstimatedFlightCost] = useState(0);
  const [estimatedHotelCost, setEstimatedHotelCost] = useState(0);
  const [estimatedActivityCost, setEstimatedActivityCost] = useState(0);
  const [estimatedTransportCost, setEstimatedTransportCost] = useState(0);
  const [estimatedMiscellaneousCost, setEstimatedMiscellaneousCost] = useState(0);
  const [breakfastAllowance, setBreakfastAllowance] = useState(0);
  const [lunchAllowance, setLunchAllowance] = useState(0);
  const [dinnerAllowance, setDinnerAllowance] = useState(0);
  const [snacksAllowance, setSnacksAllowance] = useState(0);
  const [travelPlanSummary, setTravelPlanSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
  const [budgetError, setBudgetError] = useState('');
  const [isPerPerson, setIsPerPerson] = useState(true);
  const [itineraryItems, setItineraryItems] = useState([]);
  const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' });
  const [newHomeCountryInput, setNewHomeCountryInput] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [newHomeCityInput, setNewHomeCityInput] = useState('');
  const [filteredHomeCountrySuggestions, setFilteredHomeCountrySuggestions] = useState([]);
  const [filteredDestCountrySuggestions, setFilteredDestCountrySuggestions] = useState([]);
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [flightCost, setFlightCost] = useState(0);
  const [flightError, setFlightError] = useState('');
  const [flightLoading, setFlightLoading] = useState(false);
  const [carRental, setCarRental] = useState(false);
  const [shuttle, setShuttle] = useState(false);
  const [airportTransfers, setAirportTransfers] = useState(false);
  const [airportParking, setAirportParking] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTrips, setUserTrips] = useState([]);
  const [loadingUserTrips, setLoadingUserTrips] = useState(false);
  const [saveLoadMessage, setSaveLoadMessage] = useState('');
  const [aiFlightDetails, setAiFlightDetails] = useState(null); // Detailed flight info from AI
  const [aiHotelDetails, setAiHotelDetails] = useState(null);   // Detailed hotel info from AI
  const [partyMembers, setPartyMembers] = useState([{ id: 1, age: 30, gender: 'Prefer not to say' }]); // Initial single member
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberGender, setNewMemberGender] = useState('Prefer not to say');

  // --- REFS ---
  const homeCountryInputRef = useRef(null);
  const destCountryInputRef = useRef(null);

  // --- DERIVED STATE (numberOfPeople) ---
  const numberOfPeople = partyMembers.length; // This is now derived from the partyMembers array

  // --- HANDLERS FOR PARTY SIZE ---
  const handleAddMember = () => {
    if (newMemberAge && !isNaN(parseInt(newMemberAge)) && parseInt(newMemberAge) > 0) {
      setPartyMembers([...partyMembers, { id: Date.now(), age: parseInt(newMemberAge), gender: newMemberGender }]);
      setNewMemberAge('');
      setNewMemberGender('Prefer not to say');
    } else {
      alert('Please enter a valid age (a number greater than 0).');
    }
  };

  const handleRemoveMember = (id) => {
    // Prevent removing the last member
    if (partyMembers.length > 1) {
      setPartyMembers(partyMembers.filter(member => member.id !== id));
    } else {
      alert('You must have at least one traveler.');
    }
  };

  // --- HANDLERS FOR HOME COUNTRY ---
  const handleHomeCountryInputChange = (e) => {
    const value = e.target.value;
    setNewHomeCountryInput(value);
    if (value.length > 0) {
      // Assuming countriesData is imported from mockApi.js and contains name and flag
      const filtered = countriesData.filter(country => country.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredHomeCountrySuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setFilteredHomeCountrySuggestions([]);
    }
  };

  const selectHomeCountrySuggestion = (country) => {
    setHomeCountry(country);
    setNewHomeCountryInput('');
    setFilteredHomeCountrySuggestions([]);
    homeCountryInputRef.current.blur(); // Remove focus
  };

  const handleSetHomeCountry = () => {
    if (newHomeCountryInput.trim() !== '') {
      const foundCountry = countriesData.find(country => country.name.toLowerCase() === newHomeCountryInput.trim().toLowerCase());
      if (foundCountry) {
        setHomeCountry(foundCountry);
      } else {
        alert('Country not found. Please select from the suggestions.');
      }
    }
  };

  const handleSetHomeCity = () => {
    if (newHomeCityInput.trim() !== '') {
      setHomeCity(newHomeCityInput.trim());
    }
  };

  // --- HANDLERS FOR DESTINATION COUNTRIES & CITIES ---
  const handleDestCountryInputChange = (e) => {
    const value = e.target.value;
    setNewCountry(value);
    if (value.length > 0) {
      const filtered = countriesData.filter(country => country.name.toLowerCase().includes(value.toLowerCase()));
      setFilteredDestCountrySuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setFilteredDestCountrySuggestions([]);
    }
  };

  const selectDestCountrySuggestion = (country) => {
    addCountry(country);
    setNewCountry('');
    setFilteredDestCountrySuggestions([]);
    destCountryInputRef.current.blur(); // Remove focus
  };

  const addCountry = (selectedCountry) => {
    let country;
    if (typeof selectedCountry === 'string') {
      country = countriesData.find(c => c.name.toLowerCase() === selectedCountry.toLowerCase());
    } else {
      country = selectedCountry;
    }

    if (country && !countries.some(c => c.name === country.name)) {
      setCountries([...countries, country]);
    } else if (typeof selectedCountry === 'string') {
      alert('Country not found or already added.');
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

  // --- HANDLER FOR TOPICS OF INTEREST ---
  const handleTopicChange = (topic) => {
    if (topicsOfInterest.includes(topic)) {
      setTopicsOfInterest(topicsOfInterest.filter(t => t !== topic));
    } else {
      setTopicsOfInterest([...topicsOfInterest, topic]);
    }
  };

  // --- HANDLER FOR SUGGESTION SELECTION ---
  const toggleSuggestionSelection = (category, item) => {
    switch (category) {
      case 'activities':
        setSelectedSuggestedActivities(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      case 'foodLocations':
        setSelectedSuggestedFoodLocations(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      case 'themeParks':
        setSelectedSuggestedThemeParks(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      case 'touristSpots':
        setSelectedSuggestedTouristSpots(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      case 'tours':
        setSelectedSuggestedTours(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      case 'sportingEvents':
        setSelectedSuggestedSportingEvents(prev =>
          prev.some(selectedItem => selectedItem.name === item.name) ? prev.filter(selectedItem => selectedItem.name !== item.name) : [...prev, item]
        );
        break;
      default:
        break;
    }
  };

  // --- UPDATED: AI GENERATION FUNCTIONS (Richer Prompts & Schemas) ---
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

    // --- UPDATED PROMPT: Requesting more structured details for suggestions ---
    const prompt = `Suggest 5-7 popular activities, 5-7 popular food locations, 2-3 popular theme parks, 5-7 popular tourist spots, 3-5 popular tours, and 3-5 popular sporting events for a ${duration}-day trip ${destinationPrompt} <span class="math-inline">\{topicsPrompt\}\.
For each activity, tour, and sporting event, provide its "name", a brief "description" \(2\-3 sentences\), a simulated "estimated\_cost\_usd" \(realistic number, e\.g\., 20\-150\), and a "simulated\_booking\_link" \(e\.g\., "https\://www\.fakewebsite\.com/book/activity"\)\.
For food locations, provide "name", "description", and a "simulated\_price\_range" \(e\.g\., "</span><span class="math-inline">", "</span><span class="math-block">"\)\.
For theme parks and tourist spots, provide "name", "description", "location" \(city/area\), and "simulated\_estimated\_cost\_usd" if applicable\.
Provide the response as a JSON object with keys\: "activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents"\. Each key's value should be an array of objects\.
Example for activities\: \{ "name"\: "Hot Air Balloon Ride", "description"\: "Soar above the city at sunrise\.", "simulated\_estimated\_cost\_usd"\: 120, "simulated\_booking\_link"\: "https\://balloonrides\.com/book" \}\.
Example for food\: \{ "name"\: "Sushi Heaven", "description"\: "Top\-rated sushi experience\.", "simulated\_price\_range"\: "</span>$" }.
    Example for theme park: { "name": "Fantasy Land", "description": "Magical rides and shows.", "location": "Orlando", "simulated_estimated_cost_usd": 100 }.
    Ensure all fields are present in the JSON response.
    `;

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    // --- UPDATED SCHEMA: Reflecting the new structured details for suggestions ---
    const payload = {
      contents: chatHistory,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            "activities": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "simulated_estimated_cost_usd": {"type": "NUMBER"},
                    "simulated_booking_link": {"type": "STRING"}
                }
            }},
            "foodLocations": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "simulated_price_range": {"type": "STRING"}
                }
            }},
            "themeParks": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "location": {"type": "STRING"},
                    "simulated_estimated_cost_usd": {"type": "NUMBER"}
                }
            }},
            "touristSpots": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "simulated_estimated_cost_usd": {"type": "NUMBER"} // Assuming some spots might have entrance fees
                }
            }},
            "tours": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "simulated_estimated_cost_usd": {"type": "NUMBER"},
                    "simulated_booking_link": {"type": "STRING"}
                }
            }},
            "sportingEvents": { "type": "ARRAY", "items": {
                "type": "OBJECT", "properties": {
                    "name": {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "simulated_estimated_cost_usd": {"type": "NUMBER"}
                }
            }}
          },
          "propertyOrdering": ["activities", "foodLocations", "themeParks", "touristSpots", "tours", "sportingEvents"]
        }
      }
    };

    // --- SWITCHED: Use mockApi.js for suggestions during local development ---
    // If you want to use the REAL Gemini API, uncomment the lines below and provide your API Key
    // const apiKey = "YOUR_GEMINI_API_KEY";
    // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    // const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    // const result = await response.json();

    // Use the mock API function for suggestions
    const result = await fetchTravelData(prompt); // fetchTravelData now returns data in Gemini API format


    if (result.candidates && result.candidates.length > 0 &&
        result.candidates[0].content && result.candidates[0].content.parts &&
        result.candidates[0].content.parts.length > 0) {
      const jsonString = result.candidates[0].content.parts[0].text;
      const parsedJson = JSON.parse(jsonString);

      // --- UPDATED: Set states with the new structured objects ---
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
  }; // <--- ADDED SEMICOLON HERE (THIS IS THE CAUSE OF THE ERROR ON LINE 399/429)

const generateBudgetEstimates = async () => {
  if (countries.length === 0 && cities.length === 0 || duration < 1 || numberOfPeople < 1) {
    setBudgetError("Please ensure countries/cities, duration, and number of people are set to generate budget estimates.");
    return;
  }

  setIsGeneratingBudget(true);
  setBudgetError('');

  const destinationPrompt = countries.length > 0 && cities.length > 0
    ? `in the countries: ${countries.map(c => c.name).join(', ')} and cities: ${cities.join(', ')}`
    : countries.length > 0
      ? `in the countries: ${countries.map(c => c.name).join(' and ')}`
      : `in the cities: ${cities.join(', ')}`;

  const homeLocationPrompt = homeCountry.name && homeCity
    ? `starting from ${homeCity}, ${homeCountry.name}`
    : homeCountry.name
      ? `starting from ${homeCountry.name}`
      : '';

  const itineraryPrompt = [
    selectedSuggestedActivities.length > 0 ? `activities: ${selectedSuggestedActivities.map(item => item.name).join(', ')}` : '', // Now items are objects
    selectedSuggestedFoodLocations.length > 0 ? `food: ${selectedSuggestedFoodLocations.map(item => item.name).join(', ')}` : '',
    selectedSuggestedThemeParks.length > 0 ? `theme parks: ${selectedSuggestedThemeParks.map(item => item.name).join(', ')}` : '',
    selectedSuggestedTouristSpots.length > 0 ? `tourist spots: ${selectedSuggestedTouristSpots.map(item => item.name).join(', ')}` : '',
    selectedSuggestedTours.length > 0 ? `tours: ${selectedSuggestedTours.map(item => item.name).join(', ')}` : '',
    selectedSuggestedSportingEvents.length > 0 ? `sporting events: ${selectedSuggestedSportingEvents.map(item => item.name).join(', ')}` : ''
  ].filter(Boolean).join('; ');

  const transportOptionsPrompt = [
    carRental ? 'car rental' : '',
    shuttle ? 'shuttle' : '',
    airportTransfers ? 'airport transfers' : '',
    airportParking ? 'airport parking' : ''
  ].filter(Boolean).join(', ');

  // --- UPDATED PROMPT: Requesting more detailed budget breakdown ---
  const prompt = `Estimate the following costs in USD for a ${duration}-day trip ${destinationPrompt} ${homeLocationPrompt} for ${numberOfPeople} ${isPerPerson ? 'person' : 'party'}.
  Based on typical online search results, provide specific (simulated, but realistic) details for:
  - Flights: suggest a specific airline (e.g., United Airlines), a plausible route (e.g., SYD-NRT), a departure date and return date (relative to today and trip duration), and an estimated total flight cost for the specified number of people/party.
  - Hotel: suggest a specific hotel name (e.g., Grand Hyatt Tokyo), a location (e.g., Shinjuku), a realistic cost per night, the total number of nights (based on duration), and an estimated total hotel cost for the specified number of people/party.
  - Destination Transport: provide an estimated total cost for local transportation (e.g., public transport passes, taxi rides) for the specified number of people/party.
  - Miscellaneous: provide a general estimated total cost for unexpected expenses or general shopping/souvenirs for the specified number of people/party.
  - Daily Food Allowance (per person): provide separate daily estimates for Breakfast, Lunch, Dinner, and Snacks.

  Consider these itinerary items for activity cost estimation: ${itineraryPrompt || 'general sightseeing'}.
  Preferred hotel star rating: ${starRating || 'any'}.
  Transport options to consider: ${transportOptionsPrompt || 'standard public transport'}.

  Provide the response as a JSON object with keys: "flight", "hotel", "activityCost", "transportCost", "miscellaneousCost", "dailyFoodAllowance".
  "flight" should be an object with: "airline", "route", "departure_date" (YYYY-MM-DD), "return_date" (YYYY-MM-DD), "estimated_cost_usd" (NUMBER).
  "hotel" should be an object with: "name", "location", "cost_per_night_usd" (NUMBER), "total_nights" (NUMBER), "estimated_cost_usd" (NUMBER).
  "activityCost" should be a NUMBER (AI's general activity cost estimate, separate from specific selected activities).
  "transportCost" should be a NUMBER.
  "miscellaneousCost" should be a NUMBER.
  "dailyFoodAllowance" should be an object with: "breakfast_usd", "lunch_usd", "dinner_usd", "snacks_usd" (all NUMBERs).
  Ensure all fields are present in the JSON response.
  `;

  let chatHistory = [];
  chatHistory.push({ role: "user", parts: [{ text: prompt }] });

  // --- UPDATED SCHEMA: Reflecting the new structured budget details ---
  const payload = {
    contents: chatHistory,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          "flight": { "type": "OBJECT", "properties": {
              "airline": {"type": "STRING"},
              "route": {"type": "STRING"},
              "departure_date": {"type": "STRING"},
              "return_date": {"type": "STRING"},
              "estimated_cost_usd": {"type": "NUMBER"}
          }},
          "hotel": { "type": "OBJECT", "properties": {
              "name": {"type": "STRING"},
              "location": {"type": "STRING"},
              "cost_per_night_usd": {"type": "NUMBER"},
              "total_nights": {"type": "NUMBER"},
              "estimated_cost_usd": {"type": "NUMBER"}
          }},
          "activityCost": { "type": "NUMBER" },
          "transportCost": { "type": "NUMBER" },
          "miscellaneousCost": { "type": "NUMBER" },
          "dailyFoodAllowance": { "type": "OBJECT", "properties": {
              "breakfast_usd": {"type": "NUMBER"},
              "lunch_usd": {"type": "NUMBER"},
              "dinner_usd": {"type": "NUMBER"},
              "snacks_usd": {"type": "NUMBER"}
          }}
        },
        "propertyOrdering": [
          "flight", "hotel", "activityCost", "transportCost", "miscellaneousCost", "dailyFoodAllowance"
        ]
      }
    }
  };

  // --- SWITCHED: Use mockApi.js for budget estimates during local development ---
  // If you want to use the REAL Gemini API, uncomment the lines below and provide your API Key
  // const apiKey = "YOUR_GEMINI_API_KEY";
  // const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  // const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  // const result = await response.json();

  // Use the mock API function for budget estimates
  const result = await fetchBudgetEstimates(prompt); // fetchBudgetEstimates now returns data in Gemini API format


  if (result.candidates && result.candidates.length > 0 &&
      result.candidates[0].content && result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0) {
    const jsonString = result.candidates[0].content.parts[0].text;
    const parsedJson = JSON.parse(jsonString);

    // --- UPDATED: Set states with AI's detailed budget estimates ---
    setEstimatedFlightCost(parsedJson.flight?.estimated_cost_usd || 0);
    setAiFlightDetails(parsedJson.flight || null); // Store detailed flight info

    setEstimatedHotelCost(parsedJson.hotel?.estimated_cost_usd || 0);
    setAiHotelDetails(parsedJson.hotel || null); // Store detailed hotel info

    setEstimatedActivityCost(parsedJson.activityCost || 0); // AI's general estimate for activities
    setEstimatedTransportCost(parsedJson.transportCost || 0);
    setEstimatedMiscellaneousCost(parsedJson.miscellaneousCost || 0); // Corrected key name

    setBreakfastAllowance(parsedJson.dailyFoodAllowance?.breakfast_usd || 0);
    setLunchAllowance(parsedJson.dailyFoodAllowance?.lunch_usd || 0);
    setDinnerAllowance(parsedJson.dailyFoodAllowance?.dinner_usd || 0);
    setSnacksAllowance(parsedJson.dailyFoodAllowance?.snacks_usd || 0);

  } else {
    setBudgetError("Failed to get budget estimates. Please try again.");
  }
} catch (error) {
  console.error("Error generating budget estimates:", error);
  setBudgetError("An error occurred while generating budget estimates.");
} finally {
  setIsGeneratingBudget(false);
}; // <--- ADDED SEMICOLON HERE


// --- MAIN TRAVEL PLAN CALCULATION (for final summary) ---
const calculateTravelPlan = () => {
  // Combine selected suggested items (as manual input fields are removed for these)
  // Note: These are now objects from AI, need to map to string names for summary display
  const finalActivities = selectedSuggestedActivities.map(item => item.name).filter(Boolean).join(', ');
  const finalFoodLocations = selectedSuggestedFoodLocations.map(item => item.name).filter(Boolean).join(', ');
  const finalThemeParks = selectedSuggestedThemeParks.map(item => item.name).filter(Boolean).join(', ');
  const finalTouristSpots = selectedSuggestedTouristSpots.map(item => item.name).filter(Boolean).join(', ');
  const finalTours = selectedSuggestedTours.map(item => item.name).filter(Boolean).join(', ');
  const finalSportingEvents = selectedSuggestedSportingEvents.map(item => item.name).filter(Boolean).join(', ');

  // Calculate total food allowance for the trip from daily allowances
  const totalDailyFoodAllowance = parseFloat(breakfastAllowance) + parseFloat(lunchAllowance) + parseFloat(dinnerAllowance) + parseFloat(snacksAllowance);
  const totalFoodCost = totalDailyFoodAllowance * parseInt(duration); // This is total for the trip, not per person yet.

  // =======================================================
  // UPDATED: Calculate finalTotalCost using the new function with correct AI estimates
  // Ensure all numerical values are passed as numbers
  // =======================================================
  const finalTotalCost = calculateTotalCost(
    itineraryItems,
    parseInt(duration),
    parseFloat(estimatedFlightCost),
    parseFloat(estimatedHotelCost),
    parseFloat(estimatedTransportCost),
    parseFloat(estimatedMiscellaneousCost),
    parseFloat(breakfastAllowance),
    parseFloat(lunchAllowance),
    parseFloat(dinnerAllowance),
    parseFloat(snacksAllowance),
    parseInt(numberOfPeople), // Pass derived numberOfPeople
    isPerPerson
  );

  // Adjust the total food cost based on per person/per party basis for the summary display
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
    numberOfPeople, // Pass the derived numberOfPeople
    partyMembers, // --- NEW: Pass partyMembers to summary ---
    
    // --- UPDATED: Pass AI's detailed flight/hotel info to summary ---
    estimatedFlightCost, // Numerical value
    aiFlightDetails,     // Detailed object
    estimatedHotelCost,  // Numerical value
    aiHotelDetails,      // Detailed object

    estimatedActivityCost, estimatedTransportCost, estimatedMiscellaneousCost,
    
    totalEstimatedCost: finalTotalCost, // This is the sum of estimated costs including selected items, excluding food, and then adjusted by people if perPerson
    breakfastAllowance,
    lunchAllowance,
    dinnerAllowance,
    snacksAllowance,
    totalDailyFoodAllowance,
    totalFoodCost: finalTotalFoodCost, // This is the total food cost for the trip adjusted by people
    carRental,
    shuttle,
    airportTransfers,
    airportParking,
    grandTotal: finalTotalCost, // grandTotal should already include all costs including food via calculateTotalCost
    topicsOfInterest, // Include topics of interest in summary
  });
};

// --- FLIGHT SEARCH HANDLER (separate from AI budget estimate now) ---
const handleFlightSearch = async () => {
  setFlightLoading(true);
  setFlightError('');
  try {
    const destCityForFlight = cities.length > 0 ? cities[0] : destinationCity;
    const originCityForFlight = homeCity || originCity;

    const cost = await fetchFlightPrices({
      originCity: originCityForFlight,
      destinationCity: destCityForFlight,
      departureDate,
      returnDate
    });
    setFlightCost(cost); // This sets the value for the *manual* flight search
  } catch (error) {
    console.error("Error fetching flight prices:", error);
    setFlightError(error.message);
    setFlightCost(0);
  } finally {
    setFlightLoading(false);
  }
};

// --- ITINERARY ITEM ADD/REMOVE HANDLERS (for objects) ---
const handleAddToItinerary = (item) => {
  // Assign a unique ID if item doesn't have one, essential for list keys
  const itemWithId = { ...item, id: item.name + Math.random().toString(36).substr(2, 9) };
  if (!itineraryItems.some(itineraryItem => itineraryItem.name === item.name)) { // Check by name for uniqueness
    const updatedItinerary = [...itineraryItems, {
      id: itemWithId.id,
      name: itemWithId.name,
      // Base cost for itinerary items comes from AI's simulated_estimated_cost_usd
      baseCost: itemWithId.simulated_estimated_cost_usd || 0,
      type: itemWithId.type || 'activity' // Assign a type for calculation
    }];
    setItineraryItems(updatedItinerary);

    const durationDays = parseInt(duration) || 0;

    // =======================================================
    // UPDATED: Calculate totalEstimatedCost using the new function
    // =======================================================
    setTotalEstimatedCost(calculateTotalCost(
      updatedItinerary, // Pass the updated itinerary here
      durationDays,
      estimatedFlightCost, // Use the state value
      estimatedHotelCost,
      estimatedTransportCost,
      estimatedMiscellaneousCost,
      breakfastAllowance,
      lunchAllowance,
      dinnerAllowance,
      snacksAllowance,
      numberOfPeople,
      isPerPerson
    ));

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

  const updatedItinerary = itineraryItems.filter(item => item.id !== itemId);
  setItineraryItems(updatedItinerary);

  const durationDays = parseInt(duration) || 0;

  // =======================================================
  // UPDATED: Decrement total estimated cost using the new function
  // =======================================================
  setTotalEstimatedCost(calculateTotalCost(
    updatedItinerary, // Pass the updated itinerary here
    durationDays,
    estimatedFlightCost, // Use the state value
    estimatedHotelCost,
    estimatedTransportCost,
    estimatedMiscellaneousCost,
    breakfastAllowance,
    lunchAllowance,
    dinnerAllowance,
    snacksAllowance,
    numberOfPeople,
    isPerPerson
  ));

  setSaveLoadMessage('Item removed from itinerary.');
  setTimeout(() => setSaveLoadMessage(''), 2000);
};


// --- MAIN SEARCH & CLEAR HANDLERS ---
const handleSearch = async () => {
  setLoading(true);
  setShowDisclaimer(false);
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
  setAiFlightDetails(null); // Clear detailed AI flight info
  setEstimatedHotelCost(0);
  setAiHotelDetails(null);   // Clear detailed AI hotel info

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
  setTotalEstimatedCost(0); // Clear the total estimated cost

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

  // --- NEW: Clear Party Size states ---
  setPartyMembers([{ id: 1, age: 30, gender: 'Prefer not to say' }]); // Reset to 1 default member
  setNewMemberAge('');
  setNewMemberGender('Prefer not to say');

  setLoading(false);
  setShowDisclaimer(true);
  setSaveLoadMessage('');
  // Reset budget planning specifics
  setIsPerPerson(true);
  // numberOfPeople derived state will automatically update
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
      name: `<span class="math-inline">\{cities\.length \> 0 ? cities\[0\] \: 'Unnamed'\} trip \(</span>{new Date().toLocaleDateString()})`, // Dynamic name
      homeCountry, homeCity, countries, cities, duration, starRating,
      topicsOfInterest,
      selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
      selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents,
      itineraryItems, // Save the actual itinerary items
      isPerPerson, numberOfPeople, // numberOfPeople is now a derived state
      partyMembers, // --- NEW: Save party members ---
      estimatedFlightCost, aiFlightDetails, // Save detailed AI flight info
      estimatedHotelCost, aiHotelDetails,   // Save detailed AI hotel info
      estimatedActivityCost, estimatedTransportCost, estimatedMiscellaneousCost,
      breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance,
      carRental, shuttle, airportTransfers, airportParking,
      originCity, destinationCity, departureDate, returnDate, flightCost, // Manual flight search details

      // =======================================================
      // UPDATED: totalEstimatedCost calculation for saving
      // =======================================================
      totalEstimatedCost: calculateTotalCost(
        itineraryItems,
        duration,
        estimatedFlightCost,
        estimatedHotelCost,
        estimatedTransportCost,
        estimatedMiscellaneousCost,
        breakfastAllowance,
        lunchAllowance,
        dinnerAllowance,
        snacksAllowance,
        numberOfPeople,
        isPerPerson
      )
    };
    await saveUserTrip({ email: currentUser.email, tripData: tripToSave });
    setSaveLoadMessage('Trip saved successfully!');
    await loadTripsForUser(currentUser.email); // Refresh list of saved trips
  } catch (error) {
    setSaveLoadMessage(`Error saving trip: ${error.message}`);
  }
  setTimeout(() => setSaveLoadMessage(''), 3000);
};

const loadUserTrips = async ({ email }) => {
  setLoadingUserTrips(true);
  try {
    const trips = await loadUserTrips({ email });
    setUserTrips(trips);
  }
