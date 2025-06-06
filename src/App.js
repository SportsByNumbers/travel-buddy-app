// App.js

import React, { useState, useEffect, createContext } from 'react';
import { Loader, PlusCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

// Import all refactored components with explicit .jsx extension
import HomeLocationSection from './components/HomeLocationSection.jsx';
import DestinationsSection from './components/DestinationsSection.jsx';
import TripDatesSection from './components/TripDatesSection.jsx';
import PreferencesSection from './components/PreferencesSection.jsx';
import ItinerarySuggestions from './components/ItinerarySuggestions.jsx';
import BudgetPlanningSection from './components/BudgetPlanningSection.jsx';
import FoodAllowanceSection from './components/FoodAllowanceSection.jsx';
import TransportOptionsSection from './components/TransportOptionsSection.jsx';
import TravelPlanSummary from './components/TravelPlanSummary.jsx';
import TripList from './components/TripList.jsx'; // New component
import ExpenseTracker from './components/ExpenseTracker.jsx'; // New component

// Import custom hooks with explicit .js extension
import { useMultiSelection } from './hooks/useMultiSelection.js';

// Create a context for sharing state
export const TripContext = createContext();

// Main App component
const App = () => {
    // Firebase configuration (moved to top-level scope within App component)
    const firebaseConfig = {
        apiKey: "AIzaSyAiFzUl9jxtiaf-OpFbybOuqGHfQAR6lFA", // Directly use the provided API Key
        authDomain: "travelbuddy-e050f.firebaseapp.com",
        projectId: "travelbuddy-e050f",
        storageBucket: "travelbuddy-e050f.firebasestorage.app",
        messagingSenderId: "625134272046",
        appId: "1:625134272046:web:a18883626fcfbb2df329bf",
        measurementId: "G-Y5RGMDS33E"
    };

    // Firebase states
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [isNewTripStarted, setIsNewTripStarted] = useState(false); // NEW STATE: To control initial display

    // State variables for various inputs (keep existing)
    const [countries, setCountries] = useState([]);
    const [newCountry, setNewCountry] = '';
    const [cities, setCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [newCityDuration, setNewCityDuration] = useState(0);
    const [newCityStarRating, setNewCityStarRating] = '';
    const [newCityTopics, setNewCityTopics] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const overallDuration = (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const [starRating, setStarRating] = useState('');
    const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' });
    const [newHomeCountryInput, setNewHomeCountryInput] = useState('');
    const [homeCity, setHomeCity] = '';
    const [newHomeCityInput, setNewHomeCityInput] = '';
    const [topicsOfInterest, setTopicsOfInterest] = useState([]);
    const availableTopics = ['Food', 'Sport', 'Culture', 'Theme Parks', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Relaxation'];
    const [travelStyle, setTravelStyle] = useState('');
    const [hotelAmenities, setHotelAmenities] = useState([]);
    const availableAmenities = ['Pool', 'Free Breakfast', 'Pet-Friendly', 'Spa', 'Gym', 'Parking', 'Kids Club', 'Beach Access'];
    const [isPerPerson, setIsPerPerson] = useState(true);

    // MODIFIED: numberOfAdults and numberOfChildren are now part of travelingParties
    // The previous numberOfAdults and numberOfChildren states can be removed if they are solely replaced by travelingParties.
    // If you need a fallback or a default for initial new trips, you can initialize travelingParties with one default group.
    const [travelingParties, setTravelingParties] = useState([
        { id: 1, name: 'Main Group', adults: 1, children: 0 } // Initialize with one default group
    ]);

    // Derived total numberOfPeople from all groups
    // FIX: Added robust check to ensure travelingParties is an array before reduce, and added optional chaining for safety.
    console.log('travelingParties (before numberOfPeople calc):', travelingParties, 'Type:', typeof travelingParties, 'IsArray:', Array.isArray(travelingParties));
    let calculatedPeople = 0;
    // Ensure travelingParties is an array before iterating
    const partiesToProcess = Array.isArray(travelingParties) ? travelingParties : [];

    if (partiesToProcess.length > 0) {
        console.log('travelingParties is array, attempting loop for numberOfPeople...');
        for (const party of partiesToProcess) {
            console.log('Party object in travelingParties loop:', party, 'Type:', typeof party, 'IsNull:', party === null);
            if (typeof party === 'object' && party !== null) { // Ensure party is an object
                calculatedPeople += (party.adults || 0) + (party.children || 0);
            } else {
                console.warn('Non-object or null found in travelingParties array, skipping:', party);
            }
        }
    } else {
        console.log('travelingParties is empty or not an array for numberOfPeople calc, defaulting to 0.');
    }
    const numberOfPeople = calculatedPeople;


    const [currency, setCurrency] = useState('USD');
    const [moneyAvailable, setMoneyAvailable] = useState(0);
    const [moneySaved, setMoneySaved] = useState(0);
    const [contingencyPercentage, setContingencyPercentage] = useState(10);
    const [estimatedFlightCost, setEstimatedFlightCost] = useState(0);
    const [estimatedHotelCost, setEstimatedHotelCost] = useState(0);
    const [estimatedActivityCost, setEstimatedActivityCost] = useState(0);
    const [estimatedMiscellaneousCost, setEstimatedMiscellaneousCost] = useState(0);
    const [estimatedTransportCost, setEstimatedTransportCost] = useState(0);
    const [carRentalCost, setCarRentalCost] = useState(0);
    const [shuttleCost, setShuttleCost] = useState(0);
    const [airportTransfersCost, setAirportTransfersCost] = useState(0);
    const [airportParkingCost, setAirportParkingCost] = useState(0);
    const [estimatedInterCityFlightCost, setEstimatedInterCityFlightCost] = useState(0);
    const [estimatedInterCityTrainCost, setEstimatedInterCityTrainCost] = useState(0);
    const [estimatedInterCityBusCost, setEstimatedInterCityBusCost] = useState(0);
    const [localPublicTransport, setLocalPublicTransport] = useState(false);
    const [taxiRideShare, setTaxiRideShare = useState(false);
    const [walking, setWalking] = useState(false);
    const [dailyLocalTransportAllowance, setDailyLocalTransportAllowance] = useState(0);

    // Actual Costs (now will be primarily driven by ExpenseTracker)
    const [actualFlightCost, setActualFlightCost] = useState(0);
    const [actualHotelCost, setActualHotelCost] = useState(0);
    const [actualActivityCost, setActualActivityCost] = useState(0);
    const [actualTransportCost, setActualTransportCost] = useState(0);
    const [actualMiscellaneousCost, setActualMiscellaneousCost] = useState(0);
    const [actualFoodCost, setActualFoodCost] = useState(0);

    const [expenses, setExpenses] = useState([]); // State to hold actual expenses for the current trip

    const [breakfastAllowance, setBreakfastAllowance] = useState(0);
    const [lunchAllowance, setLunchAllowance] = useState(0);
    const [dinnerAllowance, setDinnerAllowance] = useState(0);
    const [snacksAllowance, setSnacksAllowance] = useState(0);
    const [carRental, setCarRental] = useState(false);
    const [shuttle, setShuttle] = useState(false);
    const [airportTransfers, setAirportTransfers] = useState(false);
    const [airportParking, setAirportParking] = useState(false);
    const [travelPlanSummary, setTravelPlanSummary] = useState(null);

    // Removed the direct useState declarations for suggestedActivities, suggestedFoodLocations, etc.
    // They are now managed solely by useMultiSelection.
    // const [suggestedActivities, setSuggestedActivities] = useState([]);
    // const [suggestedFoodLocations, setSuggestedFoodLocations] = useState([]);
    // const [suggestedThemeParks, setSuggestedThemeParks] = useState([]);
    // const [suggestedTouristSpots, setSuggestedTouristSpots] = useState([]);
    // const [suggestedTours, setSuggestedTours] = useState([]);
    // const [suggestedSportingEvents, setSuggestedSportingEvents] = useState([]);

    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    // These are the ACTUAL setters returned by useMultiSelection, used in resetTripStates and contextValue
    const [selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities] = useMultiSelection([]);
    const [selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useMultiSelection([]);
    const [selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks] = useMultiSelection([]);
    const [selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useMultiSelection([]);
    const [selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours] = useMultiSelection([]);
    const [selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useMultiSelection([]);

    const toggleSuggestionSelection = (category, item) => {
        const setterMap = {
            activities: toggleSuggestedActivities,
            foodLocations: toggleSuggestedFoodLocations,
            themeParks: toggleSuggestedThemeParks,
            touristSpots: toggleSuggestedTouristSpots,
            tours: toggleSuggestedTours,
            sportingEvents: toggleSuggestedSportingEvents,
        };
        const toggle = setterMap[category];
        if (toggle) toggle(item);
    };

    const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
    const [budgetError, setBudgetError] = useState('');
    const [allCountries, setAllCountries] = useState([]);

    // Input validation states
    const [homeCountryError, setHomeCountryError] = useState('');
    const [homeCityError, setHomeCityError] = useState('');
    const [destCountryError, setDestCountryError] = useState('');
    const [destCityError, setDestCityError] = useState('');
    const [dateError, setDateError] = useState('');
    // Updated: numberOfPeopleError replaced with more specific errors
    // These specific errors might now be handled within the BudgetPlanningSection per group
    const [numberOfAdultsError, setNumberOfAdultsError] = useState('');
    const [numberOfChildrenError, setNumberOfChildrenError] = useState('');

    const [newCityNameError, setNewCityNameError] = useState('');
    const [newCityDurationError, setNewCityDurationError] = useState('');

    // --- EFFECT: Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            // Define firebaseConfig directly (hardcoded for direct implementation as requested)
            // It's still recommended to use environment variables for security in production.
            const firebaseConfig = {
                apiKey: "AIzaSyAiFzUl9jxtiaf-OpFbybOuqGHfQAR6lFA", // Directly use the provided API Key
                authDomain: "travelbuddy-e050f.firebaseapp.com",
                projectId: "travelbuddy-e050f",
                storageBucket: "travelbuddy-e050f.firebasestorage.app",
                messagingSenderId: "625134272046",
                appId: "1:625134272046:web:a18883626fcfbb2df329bf",
                measurementId: "G-Y5RGMDS33E"
            };

            // This check will now always pass as apiKey is hardcoded
            if (!firebaseConfig.apiKey) {
                console.error("Firebase config is missing apiKey. This theoretical error should not appear with hardcoded values.");
                setIsAuthReady(true);
                return;
            }

            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const firestoreInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(firestoreInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    console.log("Firebase user authenticated:", user.uid);
                } else {
                    console.log("No Firebase user, signing in anonymously...");
                    try {
                        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                            await signInWithCustomToken(authInstance, __initial_auth_token);
                            console.log("Signed in with custom token.");
                        } else {
                            await signInAnonymously(authInstance);
                            console.log("Signed in anonymously.");
                        }
                    } catch (signInError) {
                        console.error("Firebase Anonymous/Custom Token Sign-in Error:", signInError);
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe(); // Cleanup auth listener
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsAuthReady(true); // Ensure app can still render even if Firebase fails
        }
    }, []);

    // --- EFFECT: Fetch trips when user is authenticated ---
    useEffect(() => {
        // FIX: Added console.log for Firebase init state
        console.log('Firebase init state (for trips effect):', { isAuthReady, userId, db });
        if (isAuthReady && userId && db) {
            // FIX: Corrected to use projectId for paths
            const projectIdForPaths = firebaseConfig.projectId; // Use projectId directly from hardcoded config
            const tripsRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`);
            const q = query(tripsRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTrips(fetchedTrips);
                console.log("Fetched trips:", fetchedTrips);
            }, (error) => {
                console.error("Error fetching trips:", error);
            });

            return () => unsubscribe(); // Cleanup snapshot listener
        }
    }, [isAuthReady, userId, db, firebaseConfig.projectId]);


    // --- EFFECT: Fetch expenses for the current trip ---
    useEffect(() => {
        if (isAuthReady && userId && db && currentTripId) {
            // FIX: Corrected to use projectId for paths
            const projectIdForPaths = firebaseConfig.projectId; // Use projectId directly from hardcoded config
            const expensesRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips/${currentTripId}/expenses`);
            const q = query(expensesRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedExpenses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date // Convert Firestore Timestamp to Date object
                }));
                setExpenses(fetchedExpenses);
                console.log("Fetched expenses for trip", currentTripId, ":", fetchedExpenses);

                // Aggregate actual costs from expenses
                let totalActualFood = 0;
                let totalActualTransport = 0;
                let totalActualActivity = 0;
                let totalActualMiscellaneous = 0;
                let totalActualHotel = 0;
                let totalActualFlight = 0;

                fetchedExpenses.forEach(expense => {
                    const amount = parseFloat(expense.amount) || 0;
                    switch (expense.category) {
                        case 'Food':
                            totalActualFood += amount;
                            break;
                        case 'Transport':
                            totalActualTransport += amount;
                            break;
                        case 'Activities':
                            totalActualActivity += amount;
                            break;
                        case 'Hotel':
                            totalActualHotel += amount;
                            break;
                        case 'Flight':
                            totalActualFlight += amount;
                            break;
                        case 'Miscellaneous':
                        default:
                            totalActualMiscellaneous += amount;
                            break;
                    }
                });
                setActualFoodCost(totalActualFood);
                setActualTransportCost(totalActualTransport);
                setActualActivityCost(totalActualActivity);
                setActualMiscellaneousCost(totalActualMiscellaneous);
                setActualHotelCost(totalActualHotel);
                setActualFlightCost(totalActualFlight);

            }, (error) => {
                console.error("Error fetching expenses:", error);
            });

            return () => unsubscribe();
        } else {
            setExpenses([]); // Clear expenses if no trip is selected or not authenticated
            setActualFoodCost(0);
            setActualTransportCost(0);
            setActualActivityCost(0);
            setActualMiscellaneousCost(0);
            setActualHotelCost(0);
            setActualFlightCost(0);
        }
    }, [isAuthReady, userId, db, currentTripId, firebaseConfig.projectId]);


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

    // --- Helper to reset all trip-related states for a new trip ---
    const resetTripStates = () => {
        setCountries([]);
        setCities([]);
        setStartDate(null);
        setEndDate(null);
        setStarRating('');
        setHomeCountry({ name: '', flag: '' });
        setHomeCity('');
        setTopicsOfInterest([]);
        setTravelStyle('');
        setHotelAmenities([]);
        setIsPerPerson(true);
        // MODIFIED: Reset travelingParties
        setTravelingParties([{ id: 1, name: 'Main Group', adults: 1, children: 0 }]); // Reset to default group
        // Removed old numberOfAdults and numberOfChildren resets
        setCurrency('USD');
        setMoneyAvailable(0);
        setMoneySaved(0);
        setContingencyPercentage(10);
        setEstimatedFlightCost(0);
        setEstimatedHotelCost(0);
        setEstimatedActivityCost(0);
        setEstimatedMiscellaneousCost(0);
        setEstimatedTransportCost(0);
        setCarRentalCost(0);
        setShuttleCost(0);
        setAirportTransfersCost(0);
        setAirportParkingCost(0);
        setEstimatedInterCityFlightCost(0);
        setEstimatedInterCityTrainCost(0);
        setEstimatedInterCityBusCost(0);
        setLocalPublicTransport(false);
        setTaxiRideShare(false);
        setWalking(false);
        setDailyLocalTransportAllowance(0);
        setBreakfastAllowance(0);
        setLunchAllowance(0);
        setDinnerAllowance(0);
        setSnacksAllowance(0);
        setCarRental(false);
        setShuttle(false);
        setAirportTransfers(false);
        setAirportParking(false);
        setTravelPlanSummary(null);

        // FIX: Corrected to use setSelectedSuggested... setters, ensuring they are functions before calling
        if (typeof setSelectedSuggestedActivities === 'function') setSelectedSuggestedActivities([]);
        if (typeof setSelectedSuggestedFoodLocations === 'function') setSelectedSuggestedFoodLocations([]);
        if (typeof setSelectedSuggestedThemeParks === 'function') setSelectedSuggestedThemeParks([]);
        if (typeof setSelectedSuggestedTouristSpots === 'function') setSelectedSuggestedTouristSpots([]);
        if (typeof setSelectedSuggestedTours === 'function') setSelectedSuggestedTours([]);
        if (typeof setSelectedSuggestedSportingEvents === 'function') setSelectedSuggestedSportingEvents([]);

        setHomeCountryError('');
        setHomeCityError('');
        setDestCountryError('');
        setDestCityError('');
        setDateError('');
        setNumberOfAdultsError(''); // Reset new errors
        setNumberOfChildrenError(''); // Reset new errors
        setNewCityNameError('');
        setNewCityDurationError('');
        setExpenses([]); // Clear expenses for new trip
    };

    // --- Function to load a selected trip ---
    const loadTrip = async (tripId) => {
        if (!db || !userId) {
            console.error("Firestore not initialized or user not authenticated.");
            return;
        }
        // FIX: Corrected to use projectId for paths
        const projectIdForPaths = firebaseConfig.projectId; // Use projectId directly from hardcoded config
        const tripDocRef = doc(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`, tripId);
        try {
            const tripDocSnap = await getDoc(tripDocRef);
            if (tripDocSnap.exists()) {
                const tripData = tripDocSnap.data();
                console.log("Loading trip data:", tripData);
                // FIX: Added console.log to inspect the value of tripData.travelingParties
                console.log('tripData.travelingParties in loadTrip (from Firestore):', tripData.travelingParties, 'Type:', typeof tripData.travelingParties, 'IsArray:', Array.isArray(tripData.travelingParties));


                // Reset all states first to avoid stale data
                resetTripStates();

                // Populate states with loaded data (handle potential undefined/null)
                setCountries(tripData.countries || []);
                setCities(tripData.cities || []);
                setStartDate(tripData.startDate ? new Date(tripData.startDate) : null);
                setEndDate(tripData.endDate ? new Date(tripData.endDate) : null);
                setStarRating(tripData.starRating || '');
                setHomeCountry(tripData.homeCountry || { name: '', flag: '' });
                setHomeCity(tripData.homeCity || '');
                setTopicsOfInterest(tripData.topicsOfInterest || []);
                setTravelStyle(tripData.travelStyle || '');
                setHotelAmenities(tripData.hotelAmenities || []);
                setIsPerPerson(tripData.isPerPerson !== undefined ? tripData.isPerPerson : true);
                // MODIFIED: Load travelingParties, ensuring it's an array
                // If tripData.travelingParties is not an array, use default.
                setTravelingParties(Array.isArray(tripData.travelingParties) ? tripData.travelingParties : [{ id: 1, name: 'Main Group', adults: 1, children: 0 }]);
                console.log('travelingParties in loadTrip (after set):', travelingParties, 'Type:', typeof travelingParties, 'IsArray:', Array.isArray(travelingParties));

                // Removed old numberOfAdults and numberOfChildren loads
                setCurrency(tripData.currency || 'USD');
                setMoneyAvailable(tripData.moneyAvailable || 0);
                setMoneySaved(tripData.moneySaved || 0);
                setContingencyPercentage(tripData.contingencyPercentage || 10);
                setEstimatedFlightCost(tripData.estimatedFlightCost || 0);
                setEstimatedHotelCost(tripData.estimatedHotelCost || 0);
                setEstimatedActivityCost(tripData.estimatedActivityCost || 0);
                setEstimatedMiscellaneousCost(tripData.estimatedMiscellaneousCost || 0);
                setEstimatedTransportCost(tripData.estimatedTransportCost || 0);
                setCarRentalCost(tripData.carRentalCost || 0);
                setShuttleCost(tripData.shuttleCost || 0);
                setAirportTransfersCost(tripData.airportTransfersCost || 0);
                setAirportParkingCost(tripData.airportParkingCost || 0);
                setEstimatedInterCityFlightCost(tripData.estimatedInterCityFlightCost || 0);
                setEstimatedInterCityTrainCost(tripData.estimatedInterCityTrainCost || 0);
                setEstimatedInterCityBusCost(tripData.estimatedInterCityBusCost || 0);
                setLocalPublicTransport(tripData.localPublicTransport || false);
                setTaxiRideShare(tripData.taxiRideShare || false);
                setWalking(tripData.walking || false);
                setDailyLocalTransportAllowance(tripData.dailyLocalTransportAllowance || 0);
                setBreakfastAllowance(tripData.breakfastAllowance || 0);
                setLunchAllowance(tripData.lunchAllowance || 0);
                setDinnerAllowance(tripData.dinnerAllowance || 0);
                setSnacksAllowance(tripData.snacksAllowance || 0);
                setCarRental(tripData.carRental || false);
                setShuttle(tripData.shuttle || false);
                setAirportTransfers(tripData.airportTransfers || false);
                setAirportParking(tripData.airportParking || false);
                setTravelPlanSummary(tripData.travelPlanSummary || null);

                // Load selected AI suggestions (ensure they exist and handle defaults)
                setSelectedSuggestedActivities(tripData.selectedSuggestedActivities || []);
                setSelectedSuggestedFoodLocations(tripData.selectedSuggestedFoodLocations || []);
                setSelectedSuggestedThemeParks(tripData.selectedSuggestedThemeParks || []);
                setSelectedSuggestedTouristSpots(tripData.selectedSuggestedTouristSpots || []);
                setSelectedSuggestedTours(tripData.selectedSuggestedTours || []);
                setSelectedSuggestedSportingEvents(tripData.selectedSuggestedSportingEvents || []);

                setCurrentTripId(tripId); // Set the current trip ID after loading
                setIsNewTripStarted(false); // EXISTING TRIP: Set to false
                console.log(`Trip ${tripId} loaded successfully.`);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.warn("No such trip document!");
                setTravelPlanSummary(null);
                setCurrentTripId(null);
                resetTripStates();
                setIsNewTripStarted(false); // Reset to false if not found
            }
        } catch (error) {
            console.error("Error loading trip:", error);
            setTravelPlanSummary(null);
            setCurrentTripId(null);
            resetTripStates();
            setIsNewTripStarted(false); // Reset to false on error
        }
    };

    // --- Function to create a new trip ---
    const createNewTrip = () => {
        setCurrentTripId(null); // Deselect any active trip
        resetTripStates(); // Clear all form data
        setTravelPlanSummary(null); // Clear summary
        setIsNewTripStarted(true); // NEW: Set to true when a new trip is initiated
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Function to save the current trip ---
    const saveCurrentTrip = async (summaryData) => {
        if (!db || !userId) {
            console.error("Firestore not initialized or user not authenticated.");
            return;
        }
        // FIX: Corrected to use projectId for paths
        const projectIdForPaths = firebaseConfig.projectId; // Use projectId directly from hardcoded config

        try {
            const tripDataToSave = {
                ...summaryData, // This spread already includes airportTransfersCost from summaryData
                // Convert Date objects to ISO strings for Firestore compatibility
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                createdAt: currentTripId ? summaryData.createdAt : serverTimestamp(), // Preserve original creation time if updating
                updatedAt: serverTimestamp(),
                // Include all form states that make up the trip (ensure no duplicates with summaryData)
                countries, cities, starRating, homeCountry, homeCity, topicsOfInterest,
                travelStyle, hotelAmenities, isPerPerson,
                travelingParties,
                currency,
                moneyAvailable, moneySaved, contingencyPercentage, estimatedFlightCost,
                estimatedHotelCost, // Corrected: Removed duplicate estimatedHotelCost from here
                estimatedActivityCost, estimatedMiscellaneousCost,
                estimatedTransportCost, carRentalCost, shuttleCost,
                airportTransfersCost,
                airportParkingCost, estimatedInterCityFlightCost, estimatedInterCityTrainCost,
                estimatedInterCityBusCost, localPublicTransport, taxiRideShare, walking,
                dailyLocalTransportAllowance, breakfastAllowance, lunchAllowance, dinnerAllowance,
                snacksAllowance, carRental, shuttle, airportTransfers, airportParking,
                selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
                selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents,
            };

            if (currentTripId) {
                const tripDocRef = doc(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`, currentTripId);
                await setDoc(tripDocRef, tripDataToSave, { merge: true });
                console.log("Trip updated with ID:", currentTripId);
            } else {
                const tripsCollectionRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`);
                const newTripDocRef = await addDoc(tripsCollectionRef, tripDataToSave);
                setCurrentTripId(newTripDocRef.id);
                console.log("New trip created with ID:", newTripDocRef.id);
            }
            setTravelPlanSummary(summaryData);
            setTimeout(() => {
                const summaryElement = document.getElementById('travel-plan-summary');
                if (summaryElement) {
                    summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

        } catch (error) {
            console.error("Error saving trip:", error);
        }
    };


    // --- MAIN TRAVEL PLAN CALCULATION (modified to call saveCurrentTrip) ---
    const calculateTravelPlan = () => {
        // Validation before generating summary
        let hasError = false;
        if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; } else { setHomeCountryError(''); }
        if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; } else { setHomeCityError(''); }
        if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; } else { setDestCountryError(''); setDestCityError(''); }
        if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; } else { setDateError(''); }

        // MODIFIED Validation for adults/children based on travelingParties
        const totalAdults = travelingParties.reduce((sum, party) => sum + party.adults, 0);
        const totalChildren = travelingParties.reduce((sum, party) => sum + party.children, 0);

        if (totalAdults < 1) { setNumberOfAdultsError("Total adults must be at least 1."); hasError = true; } else { setNumberOfAdultsError(''); }
        if (totalChildren < 0) { setNumberOfChildrenError("Total children cannot be negative."); hasError = true; } else { setNumberOfChildrenError(''); }
        if (numberOfPeople < 1) { // Ensure total people is at least 1
            setNumberOfAdultsError("Total number of people (adults + children) must be at least 1.");
            hasError = true;
        }

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
                                                (localPublicTransport ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0) +
                                                (taxiRideShare ? (parseFloat(dailyLocalTransportAllowance) * overallDuration) : 0);


        // Calculate total estimated costs (excluding food for now, as food has its own calculation)
        const totalEstimatedCostBeforeFoodAndContingency =
            parseFloat(estimatedFlightCost) +
            parseFloat(estimatedHotelCost) +
            parseFloat(estimatedActivityCost) +
            combinedEstimatedTransportCost +
            parseFloat(estimatedMiscellaneousCost);

        // Adjust costs based on per person/per party using total people
        const subTotalEstimatedCost = isPerPerson ? totalEstimatedCostBeforeFoodAndContingency * numberOfPeople : totalEstimatedCostBeforeFoodAndContingency;
        const finalTotalFoodCost = isPerPerson ? totalFoodCost * numberOfPeople : totalFoodCost;

        // Calculate contingency
        const contingencyAmount = (subTotalEstimatedCost + finalTotalFoodCost) * (contingencyPercentage / 100);

        const grandTotalEstimated = subTotalEstimatedCost + finalTotalFoodCost + contingencyAmount;

        // Calculate budget surplus/deficit based on ESTIMATED vs moneyAvailable + moneySaved
        const remainingBudgetEstimated = parseFloat(moneyAvailable) + parseFloat(moneySaved) - grandTotalEstimated;

        // Calculate actual total transport cost for variance (now primarily from aggregated expenses)
        const combinedActualTransportCostFromExpenses = actualTransportCost; // From aggregated expenses
        const actualGrandTotal = actualFlightCost + actualHotelCost + actualActivityCost + actualMiscellaneousCost + actualFoodCost + combinedActualTransportCostFromExpenses;
        const remainingBudgetActual = parseFloat(moneyAvailable) + parseFloat(moneySaved) - actualGrandTotal;


        const summaryData = {
            homeCountry,
            homeCity,
            countries,
            cities,
            overallDuration,
            startDate: startDate ? startDate.toLocaleDateString() : 'Not set',
            endDate: endDate ? endDate.toLocaleDateString() : 'Not set',
            starRating,
            travelStyle,
            hotelAmenities,
            activities: finalActivities,
            sportingEvents: finalSportingEvents,
            foodLocations: finalFoodLocations,
            themeParks: finalThemeParks,
            touristSpots: finalTouristSpots,
            tours: finalTours,
            isPerPerson,
            travelingParties, // MODIFIED: Include travelingParties in summary data
            numberOfPeople, // Total derived people
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
            combinedEstimatedTransportCost,
            totalEstimatedCost: subTotalEstimatedCost, // Total estimated before food/contingency adjusted for people
            grandTotalEstimated, // New: Grand total including contingency

            // Actual Costs (now from aggregated expenses)
            actualFlightCost,
            actualHotelCost,
            actualActivityCost,
            actualMiscellaneousCost,
            actualTransportCost: combinedActualTransportCostFromExpenses,
            actualFoodCost,
            actualGrandTotal, // New: Grand total actual spending

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
            remainingBudgetEstimated,
            remainingBudgetActual, // New: Grand total including contingency, based on actual spending
            topicsOfInterest,
            // Include selected AI suggestions for persistence
            selectedSuggestedActivities,
            selectedSuggestedFoodLocations,
            selectedSuggestedThemeParks,
            selectedSuggestedTouristSpots,
            selectedSuggestedTours,
            selectedSuggestedSportingEvents,
        };

        saveCurrentTrip(summaryData); // Save/update the trip in Firestore
    };

    const getFormattedCurrency = (amount) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return `${currency}0.00`;
        switch (currency) {
            case 'JPY': return `¥${numAmount.toFixed(0)}`; // JPY typically doesn't use decimals
            case 'GBP': return `£${numAmount.toFixed(2)}`;
            case 'EUR': return `€${numAmount.toFixed(2)}`;
            default: return `$${numAmount.toFixed(2)}`;
        }
    };

    // Bundle all state and helper functions into a single context value
    const contextValue = {
        db, auth, userId, isAuthReady, // Firebase related
        appId: firebaseConfig.appId, // Use the correct appId from the hardcoded config for context
        trips, setTrips, currentTripId, setCurrentTripId, loadTrip, createNewTrip,
        isNewTripStarted, setIsNewTripStarted, // NEW: Include in context

        countries, setCountries, newCountry, setNewCountry, cities, setCities, newCityName, setNewCityName,
        newCityDuration, setNewCityDuration, newCityStarRating, setNewCityStarRating, newCityTopics, setNewCityTopics,
        startDate, setStartDate, endDate, setEndDate, overallDuration, starRating, setStarRating, travelStyle,
        setTravelStyle, hotelAmenities, setHotelAmenities, homeCountry, setHomeCountry, newHomeCountryInput, setNewHomeCountryInput,
        homeCity, setHomeCity, newHomeCityInput, setNewHomeCityInput, topicsOfInterest, setTopicsOfInterest, availableTopics,
        availableAmenities, isPerPerson, setIsPerPerson,
        travelingParties, setTravelingParties, // MODIFIED: Include travelingParties in context
        numberOfPeople, // Pass derived total
        currency, setCurrency,
        moneyAvailable, setMoneyAvailable, moneySaved, setMoneySaved, contingencyPercentage, setContingencyPercentage,
        estimatedFlightCost, setEstimatedFlightCost, estimatedHotelCost, setEstimatedHotelCost, estimatedActivityCost,
        setEstimatedActivityCost, estimatedMiscellaneousCost, setEstimatedMiscellaneousCost, estimatedTransportCost,
        setEstimatedTransportCost, carRentalCost, setCarRentalCost, shuttleCost, setShuttleCost, airportTransfersCost,
        setAirportTransfersCost, airportParkingCost, setAirportParkingCost, estimatedInterCityFlightCost,
        setEstimatedInterCityFlightCost, estimatedInterCityTrainCost, setEstimatedInterCityTrainCost,
        estimatedInterCityBusCost, setEstimatedInterCityBusCost, localPublicTransport, setLocalPublicTransport,
        taxiRideShare, setTaxiRideShare, walking, setWalking, dailyLocalTransportAllowance, setDailyLocalTransportAllowance,
        actualFlightCost, setActualFlightCost, actualHotelCost, setActualHotelCost, actualActivityCost,
        setActualActivityCost, actualTransportCost, setActualTransportCost, actualMiscellaneousCost,
        setActualMiscellaneousCost, actualFoodCost, setActualFoodCost, breakfastAllowance, setBreakfastAllowance,
        lunchAllowance, setLunchAllowance, dinnerAllowance, setDinnerAllowance, snacksAllowance, setSnacksAllowance,
        carRental, setCarRental, shuttle, setShuttle, airportTransfers, setAirportTransfers, airportParking, setAirportParking,
        travelPlanSummary, setTravelPlanSummary,
        // Removed redundant suggestedActivities, etc. from context as they are duplicates of selectedSuggestedActivities from useMultiSelection
        // suggestedActivities, setSuggestedActivities, suggestedFoodLocations,
        // setSuggestedFoodLocations, suggestedThemeParks, setSuggestedThemeParks, suggestedTouristSpots,
        // setSuggestedTouristSpots, suggestedTours, setSuggestedTours, suggestedSportingEvents,
        // setSuggestedSportingEvents,
        isGeneratingSuggestions, setIsGeneratingSuggestions, suggestionError,
        setSuggestionError, allCountries,
        isGeneratingBudget, setIsGeneratingBudget, budgetError, setBudgetError,
        expenses, setExpenses, // Pass expenses state

        // These are the actual setSelected functions, make sure to use them if needed by children
        selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities,
        selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations,
        selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks,
        selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots,
        selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours,
        selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents,

        homeCountryError, setHomeCountryError, homeCityError, setHomeCityError, destCountryError, setDestCountryError,
        destCityError, setDestCityError, dateError, setDateError,
        numberOfAdultsError, setNumberOfAdultsError, numberOfChildrenError, setNumberOfChildrenError, // New error states
        newCityNameError, setNewCityNameError, newCityDurationError, setNewCityDurationError,

        getFormattedCurrency, toggleSuggestionSelection
    };

    if (!isAuthReady) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <Loader className="animate-spin text-indigo-600" size={48} />
                <p className="ml-4 text-indigo-800 text-lg">Loading application...</p>
            </div>
        );
    }

    return (
        <TripContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans antialiased print:bg-white print:p-0">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-2xl print:shadow-none print:rounded-none print:p-4">
                    <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-6 tracking-tight print:text-black">
                        <span className="block text-indigo-600 text-xl mb-1 print:text-gray-700">Your Ultimate</span>
                        Travel Planner
                    </h1>

                    {userId && ( // Display userId and trip management only when authenticated
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-inner mb-6 print:hidden">
                            <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                                User ID: <span className="font-mono text-indigo-700 break-all">{userId}</span>
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={createNewTrip}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md text-sm font-semibold hover:bg-green-600 transition-colors duration-200 shadow-md"
                                >
                                    <PlusCircle size={16} className="mr-1" /> New Trip
                                </button>
                                <TripList /> {/* New TripList component */}
                            </div>
                        </div>
                    )}


                    {/* MODIFIED: Only show sections if a trip is being planned (either new or loaded) */}
                    {currentTripId !== null || isNewTripStarted ? (
                        <>
                            <HomeLocationSection />
                            <DestinationsSection />
                            <TripDatesSection />
                            <PreferencesSection />
                            <ItinerarySuggestions />
                            <BudgetPlanningSection />
                            <FoodAllowanceSection />
                            <TransportOptionsSection />

                            {/* Generate Travel Plan Button */}
                            <div className="text-center mt-10 print:hidden">
                                <button
                                    onClick={calculateTravelPlan}
                                    className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!homeCountry.name || !homeCity || (countries.length === 0 && cities.length === 0) || !startDate || !endDate || overallDuration < 1 || numberOfPeople < 1}
                                >
                                    {isGeneratingSuggestions ? (
                                        <span className="flex items-center justify-center">
                                            <Loader className="animate-spin mr-2" size={24} /> Generating Plan & Saving...
                                        </span>
                                    ) : (
                                        currentTripId ? 'Update Travel Plan' : 'Generate & Save Travel Plan'
                                    )}
                                </button>
                            </div>

                            {/* Travel Plan Summary */}
                            <TravelPlanSummary />
                            {/* Expense Tracker Section */}
                            <ExpenseTracker /> {/* New ExpenseTracker component */}
                        </>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-xl shadow-inner text-gray-600">
                            <p className="text-lg mb-4">Start by creating a new trip or loading an existing one!</p>
                            <button
                                onClick={createNewTrip}
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                            >
                                <PlusCircle size={20} className="mr-2" /> Start New Travel Plan
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </TripContext.Provider>
    );
};

export default App;
