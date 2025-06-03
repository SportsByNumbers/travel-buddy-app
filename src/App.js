import React, { useState, useEffect, useRef } from 'react';
// Re-organized and verified lucide-react imports for clarity
import { MapPin, Compass, Wallet, Car, Home, User, PlaneTakeoff, PlaneLanding, XCircle, Search, CheckCircle, Utensils, Loader, LogIn, LogOut, FolderOpen, Save } from 'lucide-react';
// Import mock API functions - ensure these are correctly exported from your mockApi.js
// NOTE: We are NOT using fetchTravelData or fetchBudgetEstimates directly here for AI calls in this diagnostic version.
// Their mock data content is still relevant in mockApi.js, but App.js will bypass them for this test.
import { fetchFlightPrices, countriesData, registerUser, authenticateUser, saveUserTrip, loadUserTrips } from './mockApi';
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
  const [starRating, setStarRating] = useState(''); // Changed to array for consistency with topics
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

  // --- DIAGNOSTIC: generateSuggestions (TEMPORARILY SIMPLIFIED) ---
  // This function is now a simple synchronous stub to bypass potential Babel parsing issues.
  // If the build passes with this, the problem is in the original complex body.
  const generateSuggestions = () => {
    console.log("generateSuggestions is temporarily bypassed for build testing.");
    setSuggestionError(""); // Reset error
    setIsGeneratingSuggestions(false); // Stop loading state
    // Reset suggested activities to empty to reflect no actual generation
    setSuggestedActivities([]);
    setSuggestedFoodLocations([]);
    setSuggestedThemeParks([]);
    setSuggestedTouristSpots([]);
    setSuggestedTours([]);
    setSuggestedSportingEvents([]);
    // Return a basic mock response structure to prevent runtime errors if any part of the UI
    // tries to access properties of the AI response that would otherwise be undefined.
    // This is a minimal structure matching the AI schema for suggestions.
    return { candidates: [{ content: { parts: [{ text: JSON.stringify({ activities: [], foodLocations: [], themeParks: [], touristSpots: [], tours: [], sportingEvents: [] }) }] } }] };
  };


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
}
}; // NO SEMICOLON (Letting ASI handle it correctly for `const fn = () => {};` syntax)


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
      name: `${cities.length > 0 ? cities[0] : 'Unnamed'} trip (${new Date().toLocaleDateString()})`, // Dynamic name
      homeCountry, homeCity, countries, cities, duration, starRating,
      topicsOfInterest,
      selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
      selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents, // FIXED: Removed duplicate 'selectedSuggestedTours'
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
  
  // --- UPDATED: Load selected items as objects ---
  setSelectedSuggestedActivities(trip.selectedSuggestedActivities || []);
  setSelectedSuggestedFoodLocations(trip.selectedSuggestedFoodLocations || []);
  setSelectedSuggestedThemeParks(trip.selectedSuggestedThemeParks || []);
  setSelectedSuggestedTouristSpots(trip.selectedSuggestedTouristSpots || []);
  setSelectedSuggestedTours(trip.selectedSuggestedTours || []);
  setSelectedSuggestedSportingEvents(trip.selectedSuggestedSportingEvents || []);
  
  setItineraryItems(trip.itineraryItems || []); // Restore the actual itinerary items

  setIsPerPerson(trip.isPerPerson);
  // numberOfPeople will be derived from partyMembers
  setPartyMembers(trip.partyMembers || [{ id: 1, age: 30, gender: 'Prefer not to say' }]); // --- NEW: Load party members ---

  // --- UPDATED: Load detailed AI budget info ---
  setEstimatedFlightCost(trip.estimatedFlightCost || 0);
  setAiFlightDetails(trip.aiFlightDetails || null);
  setEstimatedHotelCost(trip.estimatedHotelCost || 0);
  setAiHotelDetails(trip.aiHotelDetails || null);

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

  // =======================================================
  // UPDATED: Recalculate total cost to ensure consistency with restored values
  // =======================================================
  setTotalEstimatedCost(calculateTotalCost(
    trip.itineraryItems || [], // Use loaded itinerary items
    parseInt(trip.duration) || 0,
    parseFloat(trip.estimatedFlightCost) || 0,
    parseFloat(trip.estimatedHotelCost) || 0,
    parseFloat(trip.estimatedTransportCost) || 0,
    parseFloat(trip.estimatedMiscellaneousCost) || 0,
    parseFloat(trip.breakfastAllowance) || 0,
    parseFloat(trip.lunchAllowance) || 0,
    parseFloat(trip.dinnerAllowance) || 0,
    parseFloat(trip.snacksAllowance) || 0,
    // Use the loaded numberOfPeople for calculation
    // Ensure this takes into account partyMembers length if that's the source of truth for numberOfPeople
    parseInt(trip.numberOfPeople) || (trip.partyMembers ? trip.partyMembers.length : 1),
    trip.isPerPerson
  ));

  setSaveLoadMessage(`Trip "${trip.name}" loaded successfully!`);
  setShowAuthModal(false);
  setTimeout(() => setSaveLoadMessage(''), 3000);
};

// --- EFFECT: Recalculate total cost when relevant states change ---
useEffect(() => {
  const durationDays = parseInt(duration) || 0;
  // =======================================================
  // UPDATED: Call calculateTotalCost for useEffect
  // =======================================================
  setTotalEstimatedCost(calculateTotalCost(
    itineraryItems,
    durationDays,
    estimatedFlightCost, // Use AI's numerical estimate
    estimatedHotelCost,  // Use AI's numerical estimate
    estimatedTransportCost,
    estimatedMiscellaneousCost,
    breakfastAllowance,
    lunchAllowance,
    dinnerAllowance,
    snacksAllowance,
    numberOfPeople, // numberOfPeople is now derived from partyMembers
    isPerPerson
  ));
// --- UPDATED: Add partyMembers to dependencies ---
}, [duration, estimatedFlightCost, estimatedHotelCost, numberOfPeople, breakfastAllowance, lunchAllowance, dinnerAllowance, snacksAllowance, isPerPerson, itineraryItems, estimatedActivityCost, estimatedTransportCost, estimatedMiscellaneousCost, partyMembers]);

// Calculate total budget for comparison
const durationDaysMatch = String(duration).match(/(\d+)/);
const durationDays = durationDaysMatch ? parseInt(durationDaysMatch[1], 10) : 0;

// The `userSetTotalBudget` represents the sum of the AI's initial cost estimates.
// This is what you compare `totalEstimatedCost` (which includes selected itinerary items) against.
const userSetTotalBudget = (estimatedFlightCost + estimatedHotelCost + estimatedActivityCost + estimatedTransportCost + estimatedMiscellaneousCost + (breakfastAllowance + lunchAllowance + dinnerAllowance + snacksAllowance) * durationDays) * (isPerPerson ? numberOfPeople : 1);

const isOverBudget = totalEstimatedCost > userSetTotalBudget && userSetTotalBudget > 0;
const budgetDifference = Math.abs(totalEstimatedCost - userSetTotalBudget);
const totalCalculatedDailyFoodAllowance = (parseFloat(breakfastAllowance) + parseFloat(lunchAllowance) + parseFloat(dinnerAllowance) + parseFloat(snacksAllowance));

// --- TAILWIND CSS CLASSES FOR CONSISTENT STYLING ---
const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const sectionContainerClass = "mb-8 p-6 bg-white rounded-xl shadow-md";
const sectionTitleClass = "text-2xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-3 flex items-center";
const buttonClass = "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md";
const removeButtonClass = "ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full hover:bg-red-600 transition duration-200 ease-in-out";
const tagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";
const flagTagClass = "bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm";

// --- UPDATED: Suggestion Tag Class now highlights based on item.name (unique identifier) ---
const suggestionTagClass = (item, selectedArray) =>
  `px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition duration-200 ease-in-out ${
    selectedArray.some(selectedItem => selectedItem.name === item.name) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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

      {/* --- NEW SECTION: PARTY SIZE --- */}
      <div className={sectionContainerClass}>
        <h2 className={sectionTitleClass}>
          <User className="mr-3 text-indigo-600" size={28} /> Who's Traveling? (Party Size)
        </h2>
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-800">Total Travelers: {numberOfPeople}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label htmlFor="newMemberAge" className={labelClass}>Age:</label>
            <input
              type="number"
              id="newMemberAge"
              value={newMemberAge}
              onChange={(e) => setNewMemberAge(e.target.value)}
              placeholder="e.g., 30"
              min="1"
              className={`${inputClass} w-full`}
            />
          </div>
          <div>
            <label htmlFor="newMemberGender" className={labelClass}>Gender (Optional):</label>
            <select
              id="newMemberGender"
              value={newMemberGender}
              onChange={(e) => setNewMemberGender(e.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="Prefer not to say">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleAddMember} className={`${buttonClass} w-full`}>Add Member</button>
          </div>
        </div>

        {partyMembers.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Current Party:</h3>
            <div className="flex flex-wrap gap-2">
              {partyMembers.map((member) => (
                <span key={member.id} className="bg-blue-100 text-blue-800 px-4 py-1.5 rounded-full flex items-center text-sm font-medium shadow-sm">
                  Age: {member.age} {member.gender !== 'Prefer not to say' && `(${member.gender})`}
                  {partyMembers.length > 1 && ( // Allow removing only if more than one member
                    <button onClick={() => handleRemoveMember(member.id)} className={removeButtonClass}>&times;</button>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

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
            {/* Country Suggestions Dropdown */}
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
        {flightError && <p className="text-red-600 text-sm mt-2">{flightError}</p>}
        {flightCost > 0 && (
          <p className="mt-4 text-lg font-semibold text-green-700 text-center">
            Simulated Flight Cost: ${flightCost.toLocaleString()}
          </p>
        )}
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
            // onClick={generateSuggestions} // Commented out for diagnostic build
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

        {/* Suggested Activities --- UPDATED UI to show more details --- */}
        {suggestedActivities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Activities:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedActivities.map((item, index) => (
                <div
                  key={item.name + index} // Use name+index as a key for uniqueness if name is not always unique
                  className={suggestionTagClass(item, selectedSuggestedActivities)}
                  onClick={() => toggleSuggestionSelection('activities', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.simulated_estimated_cost_usd && (
                      <div className="text-sm text-gray-700">Cost: ${item.simulated_estimated_cost_usd.toFixed(2)}</div>
                  )}
                  {item.simulated_booking_link && (
                      <a href={item.simulated_booking_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Book Now</a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Sporting Events --- UPDATED UI to show more details --- */}
        {suggestedSportingEvents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Sporting Events:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedSportingEvents.map((item, index) => (
                <div
                  key={item.name + index}
                  className={suggestionTagClass(item, selectedSuggestedSportingEvents)}
                  onClick={() => toggleSuggestionSelection('sportingEvents', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.simulated_estimated_cost_usd && (
                      <div className="text-sm text-gray-700">Cost: ${item.simulated_estimated_cost_usd.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Food Locations --- UPDATED UI to show more details --- */}
        {suggestedFoodLocations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Food Locations:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedFoodLocations.map((item, index) => (
                <div
                  key={item.name + index}
                  className={suggestionTagClass(item, selectedSuggestedFoodLocations)}
                  onClick={() => toggleSuggestionSelection('foodLocations', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.simulated_price_range && (
                      <div className="text-sm text-gray-700">Price Range: {item.simulated_price_range}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Theme Parks --- UPDATED UI to show more details --- */}
        {suggestedThemeParks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Theme Parks:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedThemeParks.map((item, index) => (
                <div
                  key={item.name + index}
                  className={suggestionTagClass(item, selectedSuggestedThemeParks)}
                  onClick={() => toggleSuggestionSelection('themeParks', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.location && <div className="text-sm text-gray-700">Location: {item.location}</div>}
                  {item.simulated_estimated_cost_usd && (
                      <div className="text-sm text-gray-700">Cost: ${item.simulated_estimated_cost_usd.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Tourist Spots --- UPDATED UI to show more details --- */}
        {suggestedTouristSpots.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tourist Spots:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedTouristSpots.map((item, index) => (
                <div
                  key={item.name + index}
                  className={suggestionTagClass(item, selectedSuggestedTouristSpots)}
                  onClick={() => toggleSuggestionSelection('touristSpots', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.simulated_estimated_cost_usd && (
                      <div className="text-sm text-gray-700">Cost: ${item.simulated_estimated_cost_usd.toFixed(2)}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Tours --- UPDATED UI to show more details --- */}
        {suggestedTours.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-indigo-700 mb-3">Tours:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedTours.map((item, index) => (
                <div
                  key={item.name + index}
                  className={suggestionTagClass(item, selectedSuggestedTours)}
                  onClick={() => toggleSuggestionSelection('tours', item)}
                >
                  <div className="font-semibold text-base">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                  {item.simulated_estimated_cost_usd && (
                      <div className="text-sm text-gray-700">Cost: ${item.simulated_estimated_cost_usd.toFixed(2)}</div>
                  )}
                  {item.simulated_booking_link && (
                      <a href={item.simulated_booking_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">Book Now</a>
                  )}
                </div>
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
                onChange={(e) => setIsPerPerson(e.target.checked)} // Fixed: Use e.target.checked
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
                onChange={(e) => setIsPerPerson(!e.target.checked)} // Fixed: Use !e.target.checked
              />
              <span className="ml-2 text-gray-800">Per Party</span>
            </label>
          </div>
        </div>

        {isPerPerson && (
          <div className="mb-6">
            <label htmlFor="numberOfPeople" className={labelClass}>Number of People:</label>
            {/* numberOfPeople is now a derived state, display only, or could be an input for manual override */}
            <input
              type="number"
              id="numberOfPeople"
              value={numberOfPeople}
              readOnly // Made readOnly as it's derived from partyMembers
              min="1"
              className={`${inputClass} w-full bg-gray-100`} // Add bg-gray-100 for read-only styling
            />
          </div>
        )}

        <div className="text-center mb-6">
          <button
            onClick={generateBudgetEstimates}
            className={buttonClass}
            disabled={isGeneratingBudget || (countries.length === 0 && cities.length === 0) || numberOfPeople < 1} // Removed duration check as it's not always needed for initial budget
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

        {/* --- UPDATED: Display AI's detailed flight/hotel info inputs --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="estimatedFlightCost" className={labelClass}>AI Estimated Flight Cost:</label>
            <input
              type="number"
              id="estimatedFlightCost"
              value={estimatedFlightCost}
              onChange={(e) => setEstimatedFlightCost(parseFloat(e.target.value) || 0)}
              min="0"
              className={`${inputClass} w-full`}
              readOnly={aiFlightDetails !== null} // Make read-only if AI provided details
            />
            {aiFlightDetails && (
              <div className="text-sm text-gray-600 mt-2">
                <p>Airline: {aiFlightDetails.airline}</p>
                <p>Route: {aiFlightDetails.route}</p>
                <p>Dates: {aiFlightDetails.departure_date} to {aiFlightDetails.return_date}</p>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="estimatedHotelCost" className={labelClass}>AI Estimated Hotel Cost:</label>
            <input
              type="number"
              id="estimatedHotelCost"
              value={estimatedHotelCost}
              onChange={(e) => setEstimatedHotelCost(parseFloat(e.target.value) || 0)}
              min="0"
              className={`${inputClass} w-full`}
              readOnly={aiHotelDetails !== null} // Make read-only if AI provided details
            />
            {aiHotelDetails && (
              <div className="text-sm text-gray-600 mt-2">
                <p>Hotel: {aiHotelDetails.name}</p>
                <p>Location: {aiHotelDetails.location}</p>
                <p>Cost/Night: ${aiHotelDetails.cost_per_night_usd?.toFixed(2)} for {aiHotelDetails.total_nights} nights</p>
              </div>
            )}
          </div>
          {/* These below are still general AI estimates, no detailed breakdown requested from AI yet */}
          <div>
            <label htmlFor="estimatedActivityCost" className={labelClass}>AI Estimated Activity Cost (General):</label>
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
            <label htmlFor="estimatedTransportCost" className={labelClass}>AI Estimated Transport Cost (Local):</label>
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
            <label htmlFor="estimatedMiscellaneousCost" className={labelClass}>AI Estimated Miscellaneous Cost:</label>
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
            <p className={summaryItemClass}><strong>Destination Countries:</strong>{' '}
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
            <p className={summaryItemClass}><strong>Party Size:</strong> {travelPlanSummary.numberOfPeople} {travelPlanSummary.isPerPerson ? 'person(s)' : 'party'}
                {travelPlanSummary.partyMembers && travelPlanSummary.partyMembers.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                        ({travelPlanSummary.partyMembers.map(m => `Age: ${m.age}${m.gender !== 'Prefer not to say' ? ` (${m.gender})` : ''}`).join(', ')})
                    </span>
                )}
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

          {/* Displaying actual itinerary items if added */}
          {itineraryItems.length > 0 && (
            <div className="mb-6 pb-4 border-b border-indigo-200">
              <h3 className={summarySubTitleClass}>Selected Itinerary Items:</h3>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                {itineraryItems.map(item => (
                  <li key={item.id} className="mb-1">
                    {item.name} (${item.baseCost.toFixed(2)}{item.type === 'hotel' ? ' / night' : ''})
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
              {/* --- UPDATED: Display AI's detailed flight info in summary --- */}
              <li className="mb-1">Estimated Flight Cost: <span className="font-semibold">${travelPlanSummary.estimatedFlightCost.toFixed(2)}</span>
                {travelPlanSummary.aiFlightDetails && (
                  <span className="text-xs text-gray-500 ml-2">({travelPlanSummary.aiFlightDetails.airline}, {travelPlanSummary.aiFlightDetails.route} {travelPlanSummary.aiFlightDetails.departure_date} to {travelPlanSummary.aiFlightDetails.return_date})</span>
                )}
              </li>
              {/* --- UPDATED: Display AI's detailed hotel info in summary --- */}
              <li className="mb-1">Estimated Hotel Cost: <span className="font-semibold">${travelPlanSummary.estimatedHotelCost.toFixed(2)}</span>
                {travelPlanSummary.aiHotelDetails && (
                  <span className="text-xs text-gray-500 ml-2">({travelPlanSummary.aiHotelDetails.name}, {travelPlanSummary.aiHotelDetails.location} @ ${travelPlanSummary.aiHotelDetails.cost_per_night_usd?.toFixed(2)}/night for {travelPlanSummary.aiHotelDetails.total_nights} nights)</span>
                )}
              </li>
              <li className="mb-1">Estimated Activity Cost (General): <span className="font-semibold">${travelPlanSummary.estimatedActivityCost.toFixed(2)}</span></li>
              <li className="mb-1">Estimated Transport Cost (Local): <span className="font-semibold">${travelPlanSummary.estimatedTransportCost.toFixed(2)}</span></li>
              <li className="mb-1">Estimated Miscellaneous Cost: <span className="font-semibold">${travelPlanSummary.estimatedMiscellaneousCost.toFixed(2)}</span></li>
              {/* totalEstimatedCost from state now includes selected itinerary items */}
              <li className="mt-2 text-lg font-bold text-indigo-800">Total Trip Cost (AI estimates + selected items + food): <span className="text-blue-700">${travelPlanSummary.totalEstimatedCost.toFixed(2)}</span></li>
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
            {/* Grand Total now directly uses the `totalEstimatedCost` which is the calculated sum of all components */}
            <h3 className={totalCostClass}>Grand Total Estimated Trip Cost: <span className={grandTotalAmountClass}>${travelPlanSummary.totalEstimatedCost.toFixed(2)}</span></h3>
            {userSetTotalBudget > 0 && (
                <p className={`text-lg font-bold mt-2 ${isOverBudget ? 'text-red-700' : 'text-green-700'}`}>
                    AI Estimated Budget: ${userSetTotalBudget.toLocaleString()} (You are {isOverBudget ? 'OVER' : 'UNDER'} by ${budgetDifference.toLocaleString()})
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
