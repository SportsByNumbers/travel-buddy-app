import React, { useState, useEffect, useCallback } from 'react';
import {
  Hotel, Activity, Utensils, Award, FerrisWheel, MapPin, Plane, Car, Bus, ParkingSquare,
  DollarSign, CalendarDays, Search, XCircle, PlaneTakeoff, PlaneLanding, Users, LogIn, LogOut, Save, FolderOpen, ListChecks, PlusCircle, MinusCircle, Map, Baby, Star, Link, Plus, Trash2
} from 'lucide-react';
// IMPORTING FROM THE CONCEPTUAL BACKEND API FILE
import { searchTravelOptions, fetchFlightPrices, authenticateUser, registerUser, saveUserTrip, loadUserTrips, simulateConnectingTransportCost } from './backendApi';

import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// --- Place your actual Google Maps API Key here ---
// This key should be loaded from environment variables for security.
// For Create React App, variables starting with REACT_APP_ are exposed to the browser.
const Maps_API_KEY = process.env.REACT_APP_Maps_API_KEY;

// Transport options are fixed for this simulation
const transportOptions = {
  carRental: { name: "Car Rental", costPerDay: 50, icon: <Car className="w-5 h-5 text-blue-500" /> },
  shuttle: { name: "Shuttle Service", costPerUse: 30, icon: <Bus className="w-5 h-5 text-blue-500" /> },
  airportTransfer: { name: "Airport Transfer", costPerUse: 70, icon: <Plane className="w-5 h-5 text-blue-500" /> },
  airportParking: { name: "Airport Parking", costPerDay: 25, icon: <ParkingSquare className="w-5 h-5 text-blue-500" /> },
};

// Helper to get unique values for dropdowns (initial load)
// In a real app, these would come from an API endpoint listing available countries/cities/durations.
const getUniqueValues = (data, key) => {
  const initialTravelData = [ // A subset for dropdown initialization
    { country: "USA", city: "New York", duration: "3 days" },
    { country: "USA", city: "Los Angeles", duration: "5 days" },
    { country: "Japan", city: "Tokyo", duration: "7 days" },
    { country: "France", city: "Paris", duration: "4 days" },
  ];
  return [...new Set(initialTravelData.map(item => item[key]))].sort();
};

const countries = getUniqueValues([], 'country');
const cities = getUniqueValues([], 'city');
const durations = getUniqueValues([], 'duration');

function App() {
  // State for managing multiple trip segments (destinations)
  const [tripSegments, setTripSegments] = useState([{ id: 1, country: '', city: '', durationDays: 0 }]);

  // States for search results
  const [filteredResults, setFilteredResults] = useState({}); // Aggregated results from all segments for display
  const [allFilteredResultsBySegment, setAllFilteredResultsBySegment] = useState({}); // Results specific to each segment ID

  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);
  const [loading, setLoading] = useState(false); // General loading state for trip planning
  const [showDisclaimer, setShowDisclaimer] = useState(true); // Initial disclaimer visibility

  // States for initial flight details (to the first destination)
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState(''); // This will be pre-filled from the first segment's city
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [flightCost, setFlightCost] = useState(0);
  const [flightLoading, setFlightLoading] = useState(false); // Loading state for flight search
  const [flightError, setFlightError] = useState(''); // Error message for flight search

  // States for connecting transport costs between segments
  const [connectingTransportCosts, setConnectingTransportCosts] = useState({}); // Stores costs like { 'segmentId1-segmentId2': cost }
  const [connectingTransportLoading, setConnectingTransportLoading] = useState(false); // Loading state for connecting transport calculation

  // States for daily budget and party size
  const [dailyBudgetPerPerson, setDailyBudgetPerPerson] = useState(100);
  const [partySize, setPartySize] = useState(1);
  const [dailyBudgetPerType, setDailyBudgetPerType] = useState('perPerson'); // 'perPerson' or 'perParty'

  // States for detailed food allowance breakdown
  const [breakfastCost, setBreakfastCost] = useState(15);
  const [lunchCost, setLunchCost] = useState(25);
  const [dinnerCost, setDinnerCost] = useState(40);
  const [snacksCost, setSnacksCost] = useState(10);
  const [foodAllowanceType, setFoodAllowanceType] = useState('perPerson'); // 'perPerson' or 'perParty'

  // States for user authentication and trip persistence
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Stores logged-in user's info (e.g., email)
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState(''); // Error message for auth operations
  const [showAuthModal, setShowAuthModal] = useState(false); // Controls visibility of login/register modal
  const [isRegistering, setIsRegistering] = useState(false); // Toggles between login and register forms
  const [userTrips, setUserTrips] = useState([]); // Stores list of trips loaded for the current user
  const [saveLoadMessage, setSaveLoadMessage] = useState(''); // Feedback message for save/load operations
  const [loadingUserTrips, setLoadingUserTrips] = useState(false); // Loading state for loading saved trips

  // State for selected itinerary items
  const [itineraryItems, setItineraryItems] = useState([]); // Array of items added to the user's itinerary

  // States for Google Map functionality
  const [showMap, setShowMap] = useState(false); // Controls visibility of the map
  const [mapCenter, setMapCenter] = useState(null); // Center coordinates for the map
  const [mapZoom, setMapZoom] = useState(12); // Zoom level for the map

  // State for Family-Friendly preference filter
  const [familyFriendly, setFamilyFriendly] = useState(false);

  // Helper function to get approximate coordinates for known cities
  const getCityCoordinates = (city) => {
    switch(city) {
      case 'New York': return { lat: 40.7128, lng: -74.0060 };
      case 'Los Angeles': return { lat: 34.0522, lng: -118.2437 };
      case 'Tokyo': return { lat: 35.6895, lng: 139.6917 };
      case 'Paris': return { lat: 48.8566, lng: 2.3522 };
      default: return null; // Return null if city not found
    }
  };

  // Helper function to manage trip segments (add/remove/update individual segments)
  const handleSegmentChange = (id, field, value) => {
    setTripSegments(prevSegments =>
      prevSegments.map(segment =>
        segment.id === id ? { ...segment, [field]: value } : segment
      )
    );
  };

  // Handler for adding a new trip segment
  const handleAddSegment = () => {
    const newId = tripSegments.length > 0 ? Math.max(...tripSegments.map(s => s.id)) + 1 : 1;
    setTripSegments(prevSegments => [...prevSegments, { id: newId, country: '', city: '', durationDays: 0 }]);
    // Clear results and itinerary when adding a new segment to prompt a fresh search
    setFilteredResults({});
    setAllFilteredResultsBySegment({});
    setItineraryItems([]);
  };

  // Handler for removing a trip segment
  const handleRemoveSegment = (id) => {
    if (tripSegments.length > 1) { // Ensure at least one segment remains
      setTripSegments(prevSegments => prevSegments.filter(segment => segment.id !== id));
      setAllFilteredResultsBySegment(prevResults => {
        const newResults = { ...prevResults };
        delete newResults[id]; // Remove results associated with the removed segment
        return newResults;
      });
      // Remove itinerary items that were specifically for this segment
      setItineraryItems(prevItems => prevItems.filter(item => item.segmentId !== id));
    } else {
      setSaveLoadMessage("Cannot remove the last segment. Clear the form instead.");
      setTimeout(() => setSaveLoadMessage(''), 3000); // Display message briefly
    }
  };

  // Function to calculate the total estimated cost of the trip
  const calculateTotalCost = (aggregatedResults, durationDaysPerSegment, currentFlightCost, currentPartySize, currentBreakfastCost, currentLunchCost, currentDinnerCost, currentSnacksCost, currentFoodAllowanceType, currentItineraryItems, currentConnectingTransportCosts) => {
    let total = 0;
    // Return 0 if essential data is missing (e.g., party size or no results)
    if (!currentPartySize || !aggregatedResults) return 0;

    // Calculate costs based on selected itinerary items if present, otherwise use aggregated search results
    if (currentItineraryItems && currentItineraryItems.length > 0) {
        currentItineraryItems.forEach(item => {
            // Find the duration of the segment this item belongs to
            const segmentDuration = tripSegments.find(s => s.id === item.segmentId)?.durationDays || 0;
            if (item.type === 'hotel') {
                total += item.baseCost * segmentDuration; // Hotel cost is per night for its segment's duration
            } else {
                total += item.baseCost * currentPartySize; // Other items are per person
            }
        });

        // Add daily food allowance for EACH segment's duration based on selected type
        const totalDailyFoodAllowanceForCalculation = (currentBreakfastCost + currentLunchCost + currentDinnerCost + currentSnacksCost);
        tripSegments.forEach(segment => {
            if (segment.durationDays > 0) {
                if (currentFoodAllowanceType === 'perPerson') {
                    total += totalDailyFoodAllowanceForCalculation * segment.durationDays * currentPartySize;
                } else { // perParty
                    total += totalDailyFoodAllowanceForCalculation * segment.durationDays;
                }
            }
        });

    } else {
        // Fallback: If no specific itinerary items selected, estimate based on broad filtered results for each segment
        tripSegments.forEach(segment => {
            const segmentResults = aggregatedResults[segment.id] || {}; // Get results for this specific segment

            const segmentHotelCosts = segmentResults.hotels?.reduce((sum, item) => sum + item.baseCost, 0) || 0;
            total += segmentHotelCosts * segment.durationDays; // Hotel cost per night for its segment's duration

            const segmentOtherCosts = [
                ...(segmentResults.activities || []),
                ...(segmentResults.sportingEvents || []),
                ...(segmentResults.themeParks || []),
                ...(segmentResults.touristSpots || []),
            ].reduce((sum, item) => sum + item.baseCost, 0);
            total += segmentOtherCosts * currentPartySize; // Per person items

            const segmentFoodLocationsCost = segmentResults.foodLocations?.reduce((sum, item) => sum + item.baseCost, 0) || 0;
            total += segmentFoodLocationsCost * currentPartySize; // Per person food from mock data

            // Daily food allowance for this segment
            const totalDailyFoodAllowanceForCalculation = (currentBreakfastCost + currentLunchCost + currentSnacksCost + currentDinnerCost);
            if (segment.durationDays > 0) {
                if (currentFoodAllowanceType === 'perPerson') {
                    total += totalDailyFoodAllowanceForCalculation * segment.durationDays * currentPartySize;
                } else { // perParty
                    total += totalDailyFoodAllowanceForCalculation * segment.durationDays;
                }
            }
        });
    }

    // Add initial flight cost (to the very first destination)
    total += currentFlightCost * currentPartySize;

    // Add connecting transport costs
    Object.values(currentConnectingTransportCosts).forEach(cost => {
        total += cost * currentPartySize; // Connecting transport typically per person
    });

    // Add base transport options (like car rental for the total trip duration, and initial/final airport transfers)
    const totalTripDuration = tripSegments.reduce((sum, segment) => sum + segment.durationDays, 0);
    total += transportOptions.carRental.costPerDay * totalTripDuration; // Car rental for entire trip
    total += transportOptions.airportTransfer.costPerUse * 2 * currentPartySize; // Assuming round trip airport transfer

    return total;
  };

  // Main handler for planning the multi-stop trip
  const handleSearch = async () => {
    setLoading(true); // Start general loading
    setShowDisclaimer(false); // Hide disclaimer once search starts
    setFilteredResults({}); // Clear aggregated results from previous search
    setAllFilteredResultsBySegment({}); // Clear segment-specific results
    setItineraryItems([]); // Clear current itinerary
    setShowMap(false); // Hide map
    setMapCenter(null); // Reset map center
    setConnectingTransportCosts({}); // Clear connecting transport costs
    setConnectingTransportLoading(true); // Start loading for connecting transport


    const newAllFilteredResultsBySegment = {};
    const newConnectingTransportCosts = {};
    let firstSegmentCoords = null;
    let hasInputError = false;

    try {
      // 1. Validate inputs for each segment and fetch results
      for (let i = 0; i < tripSegments.length; i++) {
        const segment = tripSegments[i];
        if (!segment.country || !segment.city || segment.durationDays <= 0) {
          setSaveLoadMessage(`Please fill in all Country, City, and Duration details for Segment ${i + 1}.`);
          hasInputError = true;
          break; // Exit loop on first validation error
        }

        // Call conceptual backend API to search for options for this specific segment
        const segmentResults = await searchTravelOptions({
          country: segment.country,
          city: segment.city,
          duration: `${segment.durationDays} days`, // Format duration for the mock API
          familyFriendly: familyFriendly // Pass the family-friendly filter
        });
        newAllFilteredResultsBySegment[segment.id] = segmentResults;

        // Get coordinates for the first valid city to center the map later
        if (!firstSegmentCoords && segment.city) {
            firstSegmentCoords = getCityCoordinates(segment.city);
        }

        // 2. Simulate connecting transport cost between consecutive segments
        if (i > 0) {
            const prevSegment = tripSegments[i-1];
            const cost = await simulateConnectingTransportCost(prevSegment.city, segment.city);
            newConnectingTransportCosts[`${prevSegment.id}-${segment.id}`] = cost;
        }
      }

      if (hasInputError) {
          // If there was a validation error, stop here after setting the message
          return;
      }

      // Update states with fetched and calculated data
      setAllFilteredResultsBySegment(newAllFilteredResultsBySegment);
      setConnectingTransportCosts(newConnectingTransportCosts);


      // Aggregate all results from all segments into a single list for general display
      const aggregated = { hotels: [], activities: [], sportingEvents: [], foodLocations: [], themeParks: [], touristSpots: [] };
      Object.values(newAllFilteredResultsBySegment).forEach(segmentResults => {
          Object.keys(segmentResults).forEach(category => {
              if (aggregated[category]) {
                  aggregated[category].push(...segmentResults[category]);
              }
          });
      });
      // Remove any duplicate items that might appear if they match multiple segments
      Object.keys(aggregated).forEach(category => {
          const uniqueItems = Array.from(new Map(aggregated[category].map(item => [item.id, item])).values());
          aggregated[category] = uniqueItems;
      });

      setFilteredResults(aggregated); // This is the data displayed in the main suggestion sections

      // Set map center to the first segment's city if coordinates are available
      if (firstSegmentCoords) {
          setMapCenter(firstSegmentCoords);
          setShowMap(true); // Show map automatically after a successful search
      } else {
          setShowMap(false);
          setMapCenter(null);
      }


      const initialTotalCost = calculateTotalCost(newAllFilteredResultsBySegment, tripSegments.map(s => s.durationDays), flightCost, partySize, breakfastCost, lunchCost, dinnerCost, snacksCost, foodAllowanceType, [], newConnectingTransportCosts);
      setTotalEstimatedCost(initialTotalCost);

    } catch (error) {
      console.error("Error planning trip:", error);
      setSaveLoadMessage(`Error planning trip: ${error.message}. Please try again.`);
      setTimeout(() => setSaveLoadMessage(''), 5000);
    } finally {
      setLoading(false); // End general loading
      setConnectingTransportLoading(false); // End connecting transport loading
    }
  };

  // Handler for clearing all form inputs and results
  const handleClear = () => {
    setTripSegments([{ id: 1, country: '', city: '', durationDays: 0 }]); // Reset to a single empty segment
    setFilteredResults({});
    setAllFilteredResultsBySegment({});
    setTotalEstimatedCost(0);
    setOriginCity('');
    setDestinationCity('');
    setDepartureDate('');
    setReturnDate('');
    setFlightCost(0);
    setFlightError('');
    setConnectingTransportCosts({});
    setConnectingTransportLoading(false);
    setDailyBudgetPerPerson(100);
    setPartySize(1);
    setBreakfastCost(15);
    setLunchCost(25);
    setDinnerCost(40);
    setSnacksCost(10);
    setFoodAllowanceType('perPerson');
    setDailyBudgetPerType('perPerson');
    setFamilyFriendly(false);
    setShowDisclaimer(true);
    setSaveLoadMessage('');
    setItineraryItems([]);
    setShowMap(false);
    setMapCenter(null);
  };

  // Handler for searching the initial flight to the first destination
  const handleFlightSearch = async () => {
    setFlightLoading(true);
    setFlightError('');
    try {
      // Ensure the first trip segment's city is defined for the initial flight search
      if (tripSegments.length === 0 || !tripSegments[0].city) {
        setFlightError("Please define at least the first trip segment's city for flight search.");
        setFlightLoading(false);
        return;
      }
      const firstSegmentCity = tripSegments[0].city; // The destination for the initial flight
      const cost = await fetchFlightPrices({ originCity, destinationCity: firstSegmentCity, departureDate, returnDate });
      setFlightCost(cost);

      // Recalculate total cost to include the new flight cost
      const totalCalculated = calculateTotalCost(allFilteredResultsBySegment, tripSegments.map(s => s.durationDays), cost, partySize, breakfastCost, lunchCost, dinnerCost, snacksCost, foodAllowanceType, itineraryItems, connectingTransportCosts);
      setTotalEstimatedCost(totalCalculated);

    } catch (error) {
      console.error("Error fetching flight prices:", error);
      setFlightError(error.message);
      setFlightCost(0); // Reset cost if error
    } finally {
      setFlightLoading(false);
    }
  };

  // Handler for adding an item to the itinerary
  const handleAddToItinerary = (item, segmentId) => {
    // Only add items with valid coordinates for map display purposes
    if (item.latitude && item.longitude) {
      // Create a new item object including the segmentId it belongs to
      const itemWithSegment = { ...item, segmentId: segmentId };

      // Prevent adding the exact same item to the itinerary for the same segment multiple times
      if (!itineraryItems.some(itineraryItem => itineraryItem.id === itemWithSegment.id && itineraryItem.segmentId === itemWithSegment.segmentId)) {
        setItineraryItems(prevItems => [...prevItems, itemWithSegment]);
        setSaveLoadMessage(`Added "${item.name}" to itinerary for Segment ${segmentId}.`);
        setTimeout(() => setSaveLoadMessage(''), 2000);
      } else {
        setSaveLoadMessage(`"${item.name}" is already in your itinerary for Segment ${segmentId}.`);
        setTimeout(() => setSaveLoadMessage(''), 2000);
      }
    } else {
        setSaveLoadMessage(`"${item.name}" has no coordinates to display on map.`);
        setTimeout(() => setSaveLoadMessage(''), 2000);
    }
  };

  // Handler for removing an item from the itinerary
  const handleRemoveFromItinerary = (itemId) => {
    // This currently removes all instances of an item with that ID.
    // For more granular control in multi-segment trips, you might need to filter by both item ID and segment ID.
    setItineraryItems(prevItems => prevItems.filter(item => item.id !== itemId));
    setSaveLoadMessage('Item removed from itinerary.');
    setTimeout(() => setSaveLoadMessage(''), 2000);
  };

  // useEffect hook to recalculate total cost whenever relevant states change
  useEffect(() => {
    // Recalculate total cost using the latest state values
    const totalCalculated = calculateTotalCost(allFilteredResultsBySegment, tripSegments.map(s => s.durationDays), flightCost, partySize, breakfastCost, lunchCost, dinnerCost, snacksCost, foodAllowanceType, itineraryItems, connectingTransportCosts);
    setTotalEstimatedCost(totalCalculated);
  }, [allFilteredResultsBySegment, tripSegments, flightCost, partySize, breakfastCost, lunchCost, dinnerCost, snacksCost, foodAllowanceType, itineraryItems, connectingTransportCosts]);


  // Calculate total budget for comparison
  const totalTripDuration = tripSegments.reduce((sum, segment) => sum + segment.durationDays, 0);
  let totalBudget = 0;
  if (dailyBudgetPerType === 'perPerson') {
    totalBudget = dailyBudgetPerPerson * totalTripDuration * partySize;
  } else { // perParty
    totalBudget = dailyBudgetPerPerson * totalTripDuration;
  }

  // Determine if the trip is over budget and calculate the difference
  const isOverBudget = totalEstimatedCost > totalBudget && totalBudget > 0;
  const budgetDifference = Math.abs(totalEstimatedCost - totalBudget);
  const totalCalculatedDailyFoodAllowance = (breakfastCost + lunchCost + dinnerCost + snacksCost);

  // --- Authentication Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setAuthError(''); // Clear previous errors
    try {
      const user = await authenticateUser({ email: authEmail, password: authPassword });
      setCurrentUser(user); // Set current user
      setIsLoggedIn(true); // Update login status
      setShowAuthModal(false); // Close auth modal
      await loadTripsForUser(user.email); // Load saved trips for the logged-in user
    } catch (error) {
      setAuthError(error.message); // Display authentication error
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
      // No trips to load for a brand new user yet
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null); // Clear current user
    setUserTrips([]); // Clear saved trips from state
    setAuthEmail(''); // Clear auth form fields
    setAuthPassword('');
    setSaveLoadMessage(''); // Clear any save/load messages
    handleClear(); // Also clear the current trip plan
  };

  // Handler for saving the current trip plan
  const handleSaveTrip = async () => {
    if (!currentUser) {
      setSaveLoadMessage('Please log in to save your trip.');
      return;
    }
    setSaveLoadMessage('Saving trip...');
    try {
      // Construct the trip data to save
      const tripToSave = {
        name: `Multi-Stop Trip to ${tripSegments.map(s => s.city).filter(Boolean).join(', ')} (${new Date().toLocaleDateString()})`, // Dynamic name
        tripSegments, // Save all trip segments
        originCity, departureDate, returnDate,
        flightCost, dailyBudgetPerPerson, partySize, dailyBudgetPerType,
        breakfastCost, lunchCost, dinnerCost, snacksCost, foodAllowanceType,
        familyFriendly,
        allFilteredResultsBySegment, // Save detailed results for loading purposes
        connectingTransportCosts, // Save connecting transport costs
        totalEstimatedCost, // Save the final calculated total cost
        itineraryItems // Save the selected itinerary items
      };
      await saveUserTrip({ email: currentUser.email, tripData: tripToSave });
      setSaveLoadMessage('Trip saved successfully!');
      await loadTripsForUser(currentUser.email); // Refresh the list of saved trips
    } catch (error) {
      setSaveLoadMessage(`Error saving trip: ${error.message}`);
    }
    setTimeout(() => setSaveLoadMessage(''), 3000); // Clear message after 3 seconds
  };

  // Handler for loading all saved trips for the current user
  const loadTripsForUser = async (email) => {
    setLoadingUserTrips(true);
    try {
      const trips = await loadUserTrips({ email });
      setUserTrips(trips);
    } catch (error) {
      console.error("Error loading user trips:", error);
      setUserTrips([]); // Clear trips on error
    } finally {
      setLoadingUserTrips(false);
    }
  };

  // Handler for loading a specific saved trip into the app's state
  const handleLoadSpecificTrip = (trip) => {
    // Restore all relevant state variables from the loaded trip data
    setTripSegments(trip.tripSegments || [{ id: 1, country: '', city: '', durationDays: 0 }]);
    setOriginCity(trip.originCity || '');
    setDestinationCity(trip.destinationCity || '');
    setDepartureDate(trip.departureDate || '');
    setReturnDate(trip.returnDate || '');
    setFlightCost(trip.flightCost || 0);
    setDailyBudgetPerPerson(trip.dailyBudgetPerPerson || 100);
    setPartySize(trip.partySize || 1);
    setDailyBudgetPerType(trip.dailyBudgetPerType || 'perPerson');
    setBreakfastCost(trip.breakfastCost || 15);
    setLunchCost(trip.lunchCost || 25);
    setDinnerCost(trip.dinnerCost || 40);
    setSnacksCost(trip.snacksCost || 10);
    setFoodAllowanceType(trip.foodAllowanceType || 'perPerson');
    setFamilyFriendly(trip.familyFriendly || false);
    setAllFilteredResultsBySegment(trip.allFilteredResultsBySegment || {});
    setConnectingTransportCosts(trip.connectingTransportCosts || {});
    setTotalEstimatedCost(trip.totalEstimatedCost || 0);
    setItineraryItems(trip.itineraryItems || []);

    // Re-aggregate filteredResults for display based on loaded segment results
    const aggregated = { hotels: [], activities: [], sportingEvents: [], foodLocations: [], themeParks: [], touristSpots: [] };
    Object.values(trip.allFilteredResultsBySegment || {}).forEach(segmentResults => {
        Object.keys(segmentResults).forEach(category => {
            if (aggregated[category]) {
                aggregated[category].push(...segmentResults[category]);
            }
        });
    });
    // Remove duplicates from aggregated list
    Object.keys(aggregated).forEach(category => {
        const uniqueItems = Array.from(new Map(aggregated[category].map(item => [item.id, item])).values());
        aggregated[category] = uniqueItems;
    });
    setFilteredResults(aggregated);

    // Set map center based on the first segment's city from the loaded trip
    if (trip.tripSegments && trip.tripSegments.length > 0 && trip.tripSegments[0].city) {
      const cityCoords = getCityCoordinates(trip.tripSegments[0].city);
      if (cityCoords) {
        setMapCenter(cityCoords);
        setShowMap(true); // Show map when a trip is loaded
      }
    } else {
        setShowMap(false);
        setMapCenter(null);
    }

    setSaveLoadMessage(`Trip "${trip.name}" loaded.`);
    setShowAuthModal(false); // Close the auth modal after loading
    setTimeout(() => setSaveLoadMessage(''), 3000);
  };

  // Memoized map container style to prevent unnecessary re-renders
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '0.5rem'
  };

  // Memoized map options for performance
  const mapOptions = {
    disableDefaultUI: false, // Keep default UI elements like zoom controls
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    scaleControl: true
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans text-gray-800 p-4 sm:p-8">
      {/* Header Section */}
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-2 drop-shadow-md">
          <Plane className="inline-block w-10 h-10 mr-2 text-indigo-500" />
          TravelBuddy
        </h1>
        <p className="text-lg text-gray-600">Your personalized guide to the best travel experiences.</p>
      </header>

      {/* Authentication and User Controls */}
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
      {/* Save/Load Message Display */}
      {saveLoadMessage && (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 rounded-md shadow-sm mb-4 max-w-4xl mx-auto text-center">
          {saveLoadMessage}
        </div>
      )}

      {/* Disclaimer about simulated data */}
      {showDisclaimer && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-sm mb-6 max-w-4xl mx-auto relative" role="alert">
          <p className="font-bold">Important Note:</p>
          <p className="text-sm">This app simulates a **frontend-backend architecture** for multi-destination trips. In a real application, functions like `searchTravelOptions` and `simulateConnectingTransportCost` in `backendApi.js` would involve your backend server securely calling external APIs (Skyscanner, Booking.com, Google Places, etc.) to get live data.</p>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="absolute top-2 right-2 text-yellow-700 hover:text-yellow-900"
            aria-label="Close disclaimer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
              {isRegistering ? 'Register' : 'Login'}
            </h2>
            <form onSubmit={isRegistering ? handleRegister : handleLogin}>
              <div className="mb-4">
                <label htmlFor="authEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                <label htmlFor="authPassword" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
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
            <p className="mt-6 text-center text-sm">
              {isRegistering ? (
                <>Already have an account? <button onClick={() => setIsRegistering(false)} className="text-blue-600 hover:underline">Login</button></>
              ) : (
                <>Don't have an account? <button onClick={() => setIsRegistering(true)} className="text-blue-600 hover:underline">Register</button></>
              )}
            </p>

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


      {/* Main Input Form Section */}
      <section className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto mb-8 border border-blue-200">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center">
          <Search className="w-6 h-6 mr-2" /> Plan Your Trip
        </h2>

        {/* Multi-Destination Segments Input */}
        <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center mt-6">
            <MapPin className="w-5 h-5 mr-2" /> Trip Destinations
        </h3>
        {tripSegments.map((segment, index) => (
          <div key={segment.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
            <h4 className="absolute -top-3 left-3 bg-gray-50 px-2 text-sm font-semibold text-gray-600">Segment {index + 1}</h4>
            <div>
              <label htmlFor={`country-${segment.id}`} className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                id={`country-${segment.id}`}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={segment.country}
                onChange={(e) => handleSegmentChange(segment.id, 'country', e.target.value)}
              >
                <option value="">Select Country</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`city-${segment.id}`} className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <select
                id={`city-${segment.id}`}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={segment.city}
                onChange={(e) => handleSegmentChange(segment.id, 'city', e.target.value)}
              >
                <option value="">Select City</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`duration-${segment.id}`} className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
              <input
                type="number"
                id={`duration-${segment.id}`}
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={segment.durationDays}
                onChange={(e) => handleSegmentChange(segment.id, 'durationDays', Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
            {/* Remove Segment button (only if more than one segment exists) */}
            {tripSegments.length > 1 && (
              <button
                onClick={() => handleRemoveSegment(segment.id)}
                className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                title="Remove segment"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {/* Button to add another trip segment */}
        <button
          onClick={handleAddSegment}
          className="flex items-center px-4 py-2 border border-dashed border-blue-400 text-sm font-medium rounded-md shadow-sm text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Another Destination
        </button>


        {/* Family-Friendly Checkbox */}
        <div className="mt-4 flex items-center">
            <input
                type="checkbox"
                id="familyFriendly"
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                checked={familyFriendly}
                onChange={(e) => setFamilyFriendly(e.target.checked)}
            />
            <label htmlFor="familyFriendly" className="ml-2 text-lg font-medium text-gray-700 flex items-center">
                <Baby className="w-5 h-5 mr-1" /> Show Family-Friendly Options Only
            </label>
        </div>


        {/* Budget and Party Size Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
            <DollarSign className="w-6 h-6 mr-2" /> Budget & Party Size
          </h3>
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="dailyBudgetPerType"
                  value="perPerson"
                  checked={dailyBudgetPerType === 'perPerson'}
                  onChange={() => setDailyBudgetPerType('perPerson')}
                />
                <span className="ml-2 text-gray-700">Daily Budget Per Person</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="dailyBudgetPerType"
                  value="perParty"
                  checked={dailyBudgetPerType === 'perParty'}
                  onChange={() => setDailyBudgetPerType('perParty')}
                />
                <span className="ml-2 text-gray-700">Daily Budget Per Party</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-700 mb-1">Daily Budget ($)</label>
              <input
                type="number"
                id="dailyBudget"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={dailyBudgetPerPerson}
                onChange={(e) => setDailyBudgetPerPerson(Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="partySize" className="block text-sm font-medium text-gray-700 mb-1">Party Size</label>
              <input
                type="number"
                id="partySize"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Daily Food Allowance Breakdown Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
            <Utensils className="w-6 h-6 mr-2" /> Daily Food Allowance ($)
          </h3>
          <div className="mb-4">
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="foodAllowanceType"
                  value="perPerson"
                  checked={foodAllowanceType === 'perPerson'}
                  onChange={() => setFoodAllowanceType('perPerson')}
                />
                <span className="ml-2 text-gray-700">Per Person</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600"
                  name="foodAllowanceType"
                  value="perParty"
                  checked={foodAllowanceType === 'perParty'}
                  onChange={() => setFoodAllowanceType('perParty')}
                />
                <span className="ml-2 text-gray-700">Per Party</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
            <div>
              <label htmlFor="breakfastCost" className="block text-sm font-medium text-gray-700 mb-1">Breakfast</label>
              <input
                type="number"
                id="breakfastCost"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={breakfastCost}
                onChange={(e) => setBreakfastCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="lunchCost" className="block text-sm font-medium text-gray-700 mb-1">Lunch</label>
              <input
                type="number"
                id="lunchCost"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={lunchCost}
                onChange={(e) => setLunchCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="dinnerCost" className="block text-sm font-medium text-gray-700 mb-1">Dinner</label>
              <input
                type="number"
                id="dinnerCost"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={dinnerCost}
                onChange={(e) => setDinnerCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="snacksCost" className="block text-sm font-medium text-gray-700 mb-1">Snacks</label>
              <input
                type="number"
                id="snacksCost"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={snacksCost}
                onChange={(e) => setSnacksCost(Math.max(0, parseInt(e.target.value, 10) || 0))}
                min="0"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Total Daily Food Allowance: <span className="font-semibold">${totalCalculatedDailyFoodAllowance.toLocaleString()}</span> {foodAllowanceType === 'perPerson' ? 'per person' : 'for the party'}
          </p>
        </div>


        {/* Initial Flight Details Section (to the first destination) */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
            <PlaneTakeoff className="w-6 h-6 mr-2" /> Initial Flight Details (to first destination)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label htmlFor="originCity" className="block text-sm font-medium text-gray-700 mb-1">Origin City</label>
              <input
                type="text"
                id="originCity"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                placeholder="e.g., Sydney"
              />
            </div>
            <div>
              <label htmlFor="destinationCity" className="block text-sm font-medium text-gray-700 mb-1">Destination City (First Stop)</label>
              <input
                type="text"
                id="destinationCity"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={tripSegments[0]?.city || destinationCity} // Prefill from the first segment's city
                onChange={(e) => setDestinationCity(e.target.value)}
                placeholder={tripSegments[0]?.city ? `Pre-filled: ${tripSegments[0].city}` : "e.g., New York"}
                disabled={!!tripSegments[0]?.city} // Disable if first segment city is already selected
              />
            </div>
            <div>
              <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700 mb-1">Departure Date</label>
              <input
                type="date"
                id="departureDate"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
              <input
                type="date"
                id="returnDate"
                className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleFlightSearch}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out transform hover:scale-105 w-full sm:w-auto"
            disabled={flightLoading || !originCity || !tripSegments[0]?.city || !departureDate || !returnDate}
          >
            {flightLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PlaneLanding className="w-5 h-5 mr-2" />
            )}
            {flightLoading ? 'Searching Flights...' : 'Search Initial Flight'}
          </button>
          {flightError && <p className="text-red-600 text-sm mt-2 text-center">{flightError}</p>}
          {flightCost > 0 && (
            <p className="mt-4 text-lg font-semibold text-green-700 text-center">
              Simulated Initial Flight Cost: ${flightCost.toLocaleString()}
            </p>
          )}
        </div>

        {/* Action Buttons: Plan Trip and Clear All */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button
            onClick={handleSearch}
            className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
            // Disable search if any segment is incomplete or if loading
            disabled={loading || tripSegments.some(s => !s.country || !s.city || s.durationDays <= 0)}
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Search className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Planning Multi-Stop Trip...' : 'Plan Multi-Stop Trip'}
          </button>
          <button
            onClick={handleClear}
            className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            <XCircle className="w-5 h-5 mr-2" /> Clear All
          </button>
        </div>
      </section>

      {/* Results Section - Displayed after a successful search */}
      {!loading && Object.keys(filteredResults).length > 0 && (
        <section className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto mb-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Your Travel Plan</h2>

          {/* Connecting Transport Costs Display */}
          {Object.keys(connectingTransportCosts).length > 0 && (
            <div className="mb-8 p-4 bg-orange-50 rounded-lg shadow-inner border border-orange-200">
              <h3 className="text-xl font-semibold text-orange-700 mb-3 flex items-center">
                <Plane className="w-5 h-5 mr-2" /> Connecting Transport (Simulated)
              </h3>
              {connectingTransportLoading ? (
                  <p className="text-center text-orange-600">Calculating connecting costs...</p>
              ) : (
                  <ul className="list-disc list-inside text-gray-800">
                      {Object.entries(connectingTransportCosts).map(([key, cost]) => {
                          const [fromId, toId] = key.split('-'); // Extract segment IDs from the key
                          // Find the corresponding segments to display city names
                          const fromSegment = tripSegments.find(s => s.id === parseInt(fromId));
                          const toSegment = tripSegments.find(s => s.id === parseInt(toId));
                          if (fromSegment && toSegment) {
                              return (
                                  <li key={key}>
                                      Flight/Train from <span className="font-semibold">{fromSegment.city}</span> to <span className="font-semibold">{toSegment.city}</span>: ${cost.toLocaleString()}
                                  </li>
                              );
                          }
                          return null;
                      })}
                  </ul>
              )}
              <p className="text-sm text-gray-500 mt-3">
                These costs simulate flights/trains between your chosen destinations.
              </p>
            </div>
          )}

          {/* Itinerary Section */}
          <div className="mb-8 p-4 bg-purple-50 rounded-lg shadow-inner border border-purple-200">
            <h3 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
              <ListChecks className="w-5 h-5 mr-2" /> Your Itinerary
            </h3>
            {itineraryItems.length === 0 ? (
              <p className="text-gray-600 italic">No items added to your itinerary yet. Add items from the suggestions below!</p>
            ) : (
              <ul className="space-y-3">
                {itineraryItems.map(item => {
                  const segment = tripSegments.find(s => s.id === item.segmentId); // Find the segment this item belongs to
                  return (
                    <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center">
                        <div className="flex items-center">
                          {/* Display icon based on item type */}
                          {item.type === 'hotel' && <Hotel className="w-5 h-5 text-blue-500 mr-2" />}
                          {item.type === 'activity' && <Activity className="w-5 h-5 text-green-500 mr-2" />}
                          {item.type === 'sporting_event' && <Award className="w-5 h-5 text-red-500 mr-2" />}
                          {item.type === 'food' && <Utensils className="w-5 h-5 text-orange-500 mr-2" />}
                          {item.type === 'theme_park' && <FerrisWheel className="w-5 h-5 text-purple-500 mr-2" />}
                          {item.type === 'tourist_spot' && <MapPin className="w-5 h-5 text-teal-500 mr-2" />}
                          <span className="font-medium text-gray-900">{item.name}</span>
                        </div>
                        {/* Display which segment this item is for */}
                        {segment && (
                          <span className="text-sm text-gray-500 sm:ml-2 mt-1 sm:mt-0">
                            (for <span className="font-semibold">{segment.city}</span>)
                          </span>
                        )}
                        <span className="ml-2 text-sm text-gray-500">(${item.baseCost.toLocaleString()}{item.type === 'hotel' ? ' / night' : ''})</span>
                      </div>
                      <button
                        onClick={() => handleRemoveFromItinerary(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove from itinerary"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            {/* Button to toggle map visibility (only if itinerary has items with coordinates) */}
            {itineraryItems.some(item => item.latitude && item.longitude) && (
                <button
                    onClick={() => setShowMap(!showMap)} // Toggle map visibility
                    className="mt-4 flex items-center justify-center px-4 py-2 text-sm rounded-md shadow-sm text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                    <Map className="w-4 h-4 mr-2" /> {showMap ? 'Hide Map' : 'View Itinerary on Map'}
                </button>
            )}
          </div>

          {/* Live Google Map Section */}
          {showMap && mapCenter && (
              <div className="mb-8 p-4 bg-gray-100 rounded-lg shadow-inner border border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
                      <Map className="w-5 h-5 mr-2" /> Interactive Map
                  </h3>
                  {/* LoadScript loads the Google Maps API. Your API key is passed here. */}
                  <LoadScript googleMapsApiKey={Maps_API_KEY}>
                      <GoogleMap
                          mapContainerStyle={mapContainerStyle}
                          center={mapCenter}
                          zoom={mapZoom}
                          options={mapOptions}
                      >
                          {/* Markers for items currently in the itinerary */}
                          {itineraryItems.filter(item => item.latitude && item.longitude).map((item, index) => (
                              <Marker
                                  key={item.id} // Use item ID as key
                                  position={{ lat: item.latitude, lng: item.longitude }}
                                  title={item.name}
                                  // You can add custom icons or info windows here for more detail
                              />
                          ))}
                           {/* Optional: Markers for other filtered results that are NOT in the itinerary */}
                           {Object.values(filteredResults).flat().filter(item =>
                               !itineraryItems.some(it => it.id === item.id) && item.latitude && item.longitude
                           ).map((item, index) => (
                               <Marker
                                   key={`filtered-${item.id}`} // Use a distinct key for non-itinerary items
                                   position={{ lat: item.latitude, lng: item.longitude }}
                                   title={item.name}
                               />
                           ))}
                      </GoogleMap>
                  </LoadScript>
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    (Map displays locations of items in your itinerary and suggestions. Maximize window for better view.)
                  </p>
              </div>
          )}


          {/* Estimated Costs & Allowances Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" /> Estimated Costs & Allowances
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <DollarSign className="w-6 h-6 text-green-600 mr-3" />
                <p className="text-lg font-medium">Total Estimated Cost: <span className="font-bold text-green-700">${totalEstimatedCost.toLocaleString()}</span></p>
              </div>
              <div className="flex items-center bg-white p-3 rounded-md shadow-sm">
                <Utensils className="w-6 h-6 text-orange-600 mr-3" />
                <p className="text-lg font-medium">Daily Food Allowance: <span className="font-bold text-orange-700">${totalCalculatedDailyFoodAllowance.toLocaleString()}</span> {foodAllowanceType === 'perPerson' ? 'per person' : 'for the party'}</p>
              </div>
            </div>
            {/* Display initial flight cost if available */}
            {flightCost > 0 && (
                <p className="text-md font-medium text-gray-700 mt-2 text-center">
                    (Includes initial flight cost of ${flightCost.toLocaleString()} per person)
                </p>
            )}
            {/* Display connecting transport costs if available */}
             {Object.keys(connectingTransportCosts).length > 0 && (
                <p className="text-md font-medium text-gray-700 mt-2 text-center">
                    (Includes connecting transport costs totaling ${Object.values(connectingTransportCosts).reduce((sum, cost) => sum + cost * partySize, 0).toLocaleString()} for {partySize} people)
                </p>
            )}
            <p className="text-sm text-gray-500 mt-3">
              Note: Costs are estimates based on simulated data and typical travel expenses. Live pricing would vary.
            </p>

            {/* Budget Comparison Display */}
            {totalBudget > 0 && (
              <div className={`mt-4 p-3 rounded-md shadow-sm text-center ${isOverBudget ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                <p className="font-bold text-lg">
                  <DollarSign className="inline-block w-5 h-5 mr-1" />
                  Your Total Budget: ${totalBudget.toLocaleString()} ({dailyBudgetPerType === 'perPerson' ? 'per person' : 'per party'})
                </p>
                {isOverBudget ? (
                  <p className="text-md">
                    You are <span className="font-bold">${budgetDifference.toLocaleString()}</span> over budget!
                  </p>
                ) : (
                  <p className="text-md">
                    You are <span className="font-bold">${budgetDifference.toLocaleString()}</span> under budget. Great planning!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Transport Options Display */}
          <div className="mb-8 p-4 bg-indigo-50 rounded-lg shadow-inner border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-700 mb-3 flex items-center">
              <Car className="w-5 h-5 mr-2" /> Transport Options
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(transportOptions).map(([key, option]) => (
                <div key={key} className="flex items-center bg-white p-3 rounded-md shadow-sm">
                  {option.icon}
                  <p className="ml-2 text-md font-medium">{option.name}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              Availability and exact costs for these options would depend on your specific booking and location.
            </p>
          </div>


          {/* Dynamic Content Sections (Suggestions for each trip segment) */}
          {tripSegments.map(segment => {
            const segmentResults = allFilteredResultsBySegment[segment.id];
            // Display a message if no suggestions found for a specific segment
            if (!segmentResults || Object.values(segmentResults).every(arr => arr.length === 0)) {
                return (
                    <div key={`no-results-${segment.id}`} className="text-center text-gray-500 py-4">
                        <p className="text-lg">No suggestions found for Segment {segment.id} ({segment.city || 'N/A'}).</p>
                    </div>
                );
            }
            return (
              <div key={`segment-suggestions-${segment.id}`} className="mb-8 p-4 border border-blue-100 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" /> Suggestions for {segment.city}
                </h3>
                {/* Iterate through each category (hotels, activities, etc.) for this segment */}
                {Object.entries(segmentResults).map(([category, items]) => (
                  items.length > 0 && (
                    <div key={category} className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 capitalize flex items-center">
                        {/* Category specific icons */}
                        {category === 'hotels' && <Hotel className="w-5 h-5 mr-2" />}
                        {category === 'activities' && <Activity className="w-5 h-5 mr-2" />}
                        {category === 'sportingEvents' && <Award className="w-5 h-5 mr-2" />}
                        {category === 'foodLocations' && <Utensils className="w-5 h-5 mr-2" />}
                        {category === 'themeParks' && <FerrisWheel className="w-5 h-5 mr-2" />}
                        {category === 'touristSpots' && <MapPin className="w-5 h-5 mr-2" />}
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                          <div key={item.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl border border-gray-200">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-40 object-cover"
                              // Fallback image in case of load error
                              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x250/E0E7FF/4F46E5?text=${item.name.replace(/\s/g, '+')}`; }}
                            />
                            <div className="p-4">
                              <h5 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h5>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              <p className="text-md font-semibold text-blue-600">
                                Cost: ${item.baseCost.toLocaleString()}
                                {item.type === 'hotel' && ' / night'}
                              </p>
                              {/* Display Rating and Review Count if available */}
                              {item.rating && item.reviewCount !== undefined && (
                                  <p className="text-sm text-gray-700 flex items-center mt-1">
                                      <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                                      {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString()} reviews)
                                  </p>
                              )}
                              {/* Display Family-Friendly Tag if applicable */}
                              {item.familyFriendly && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                      <Baby className="w-3 h-3 mr-1" /> Family-Friendly
                                  </span>
                              )}

                              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                                {/* Button to add item to itinerary */}
                                <button
                                  onClick={() => handleAddToItinerary(item, segment.id)} // Pass segment ID to associate item
                                  className="flex-1 flex items-center justify-center px-3 py-1 text-sm rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                                >
                                  <PlusCircle className="w-4 h-4 mr-2" /> Add to Itinerary
                                </button>
                                {/* Simulated "Book Now" Button (links to external site) */}
                                {item.bookingLink && (
                                    <a
                                        href={item.bookingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center px-3 py-1 text-sm rounded-md shadow-sm text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                                    >
                                        <Link className="w-4 h-4 mr-2" /> Book Now
                                    </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            );
          })}

          {/* Message if no overall results found for any segment */}
          {Object.values(allFilteredResultsBySegment).every(segmentResult =>
              Object.values(segmentResult).every(arr => arr.length === 0)
          ) && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg">No results found for your selected trip segments.</p>
              <p>Try adjusting your destinations, durations, or family-friendly filter.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default App;
