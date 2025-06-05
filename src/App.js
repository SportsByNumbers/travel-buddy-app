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
    const [newCountry, setNewCountry] = useState('');
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
    const [homeCity, setHomeCity] = useState('');
    const [newHomeCityInput, setNewHomeCityInput] = useState('');
    const [topicsOfInterest, setTopicsOfInterest] = useState([]);
    const availableTopics = ['Food', 'Sport', 'Culture', 'Theme Parks', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Relaxation'];
    const [travelStyle, setTravelStyle] = useState('');
    const [hotelAmenities, setHotelAmenities] = useState([]);
    const availableAmenities = ['Pool', 'Free Breakfast', 'Pet-Friendly', 'Spa', 'Gym', 'Parking', 'Kids Club', 'Beach Access'];
    const [isPerPerson, setIsPerPerson] = useState(true);

    // Updated: numberOfPeople replaced by numberOfAdults and numberOfChildren
    const [numberOfAdults, setNumberOfAdults] = useState(1);
    const [numberOfChildren, setNumberOfChildren] = useState(0);
    const numberOfPeople = numberOfAdults + numberOfChildren; // Derived total

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
    const [taxiRideShare, setTaxiRideShare] = useState(false);
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
    const [airportTransfers, setAirportTransfers] = useState(false); // CORRECTED: Use useState
    const [airportParking, setAirportParking] = useState(false);     // CORRECTED: Use useState
    const [travelPlanSummary, setTravelPlanSummary] = useState(null);
    const [suggestedActivities, setSuggestedActivities] = useState([]);
    const [suggestedFoodLocations, setSuggestedFoodLocations] = useState([]);
    const [suggestedThemeParks, setSuggestedThemeParks] = useState([]);
    const [suggestedTouristSpots, setSuggestedTouristSpots] = useState([]);
    const [suggestedTours, setSuggestedTours] = useState([]);
    const [suggestedSportingEvents, setSuggestedSportingEvents] = useState([]);
    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

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
    const [numberOfAdultsError, setNumberOfAdultsError] = useState('');
    const [numberOfChildrenError, setNumberOfChildrenError] = useState('');

    const [newCityNameError, setNewCityNameError] = useState('');
    const [newCityDurationError, setNewCityDurationError] = useState('');

    // --- EFFECT: Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            // Define firebaseConfig directly from environment variables
            const firebaseConfig = {
                apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
                authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
                appId: process.env.REACT_APP_FIREBASE_APP_ID,
                measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID // Optional
            };

            // Ensure apiKey is present for initialization
            if (!firebaseConfig.apiKey) {
                console.error("Firebase config is missing apiKey. Please check your .env variables (e.g., REACT_APP_FIREBASE_API_KEY). Cannot initialize Firebase.");
                setIsAuthReady(true); // Allow app to proceed, but Firebase won't work
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
                        // If you still need __initial_auth_token, ensure it's defined
                        // For typical React apps, you might not use a custom token unless specifically needed for backend auth.
                        // If not used, you can remove this block.
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
        if (isAuthReady && userId && db) {
            // Use process.env.REACT_APP_FIREBASE_APP_ID or a default if __app_id is truly a global variable
            const appId = process.env.REACT_APP_FIREBASE_APP_ID || 'default-app-id';
            const tripsRef = collection(db, `artifacts/<span class="math-inline">\{appId\}/users/</span>{userId}/trips`);
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
    }, [isAuthReady, userId, db]);

    // --- EFFECT: Fetch expenses for the current trip ---
    useEffect(() => {
        if (isAuthReady && userId && db && currentTripId) {
            const appId = process.env.REACT_APP_FIREBASE_APP_ID || 'default-app-id';
            const expensesRef = collection(db, `artifacts/<span class="math-inline">\{appId\}/users/</span>{userId}/trips/${currentTripId}/expenses`);
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
    }, [isAuthReady, userId, db, currentTripId]);


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
        setNumberOfAdults(1); // Reset to 1 adult
        setNumberOfChildren(0); // Reset to 0 children
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
        setActualFlightCost(0);
        setActualHotelCost(0);
        setActualActivityCost(0);
        setActualMiscellaneousCost(0);
        setActualFoodCost(0);
        setBreakfastAllowance(0);
        setLunchAllowance(0);
        setDinnerAllowance(0);
        setSnacksAllowance(0);
        setCarRental(false);
        setShuttle(false);
        setAirportTransfers(false);
        setAirportParking(false);
        setTravelPlanSummary(null);
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
        const appId = process.env.REACT_APP_FIREBASE_APP_ID || 'default-app-id';
        const tripDocRef = doc(db, `artifacts/<span class="math-inline">\{appId\}/users/</span>{userId}/trips`, tripId);
        try {
            const tripDocSnap = await getDoc(tripDocRef);
            if (tripDocSnap.exists()) {
                const tripData = tripDocSnap.data();
                console.log("Loading trip data:", tripData);

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
                setNumberOfAdults(tripData.numberOfAdults || 1); // Load adults
                setNumberOfChildren(tripData.numberOfChildren || 0); // Load children
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
        const appId = process.env.REACT_APP_FIREBASE_APP_ID || 'default-app-id';

        try {
            const tripDataToSave = {
                ...summaryData,
                // Convert Date objects to ISO strings for Firestore compatibility
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                createdAt: currentTripId ? summaryData.createdAt : serverTimestamp(), // Preserve original creation time if updating
                updatedAt: serverTimestamp(),
                // Include all form states that make up the trip
                countries, cities, starRating, homeCountry, homeCity, topicsOfInterest,
                travelStyle, hotelAmenities, isPerPerson, numberOfAdults, numberOfChildren, // Save adult/children counts
                currency,
                moneyAvailable, moneySaved, contingencyPercentage, estimatedFlightCost,
                estimatedHotelCost, estimatedActivityCost, estimatedMiscellaneousCost,
                estimatedTransportCost, carRentalCost, shuttleCost, airportTransfersCost,
                airportParkingCost, estimatedInterCityFlightCost, estimatedInterCityTrainCost,
                estimatedInterCityBusCost, localPublicTransport, taxiRideShare, walking,
                dailyLocalTransportAllowance, breakfastAllowance, lunchAllowance, dinnerAllowance,
                snacksAllowance, carRental, shuttle, airportTransfers, airportParking,
                selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
                selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents,
            };

            if (currentTripId) {
                // Update existing trip
                const tripDocRef = doc(db, `artifacts/<span class="math-inline">\{appId\}/users/</span>{userId}/trips`, currentTripId);
                await setDoc(tripDocRef, tripDataToSave, { merge: true });
                console.log("Trip updated with ID:", currentTripId);
            } else {
                // Create new trip
                const tripsCollectionRef = collection(db, `artifacts/<span class="math-inline">\{appId\}/users/</span>{userId}/trips`);
                const newTripDocRef = await addDoc(tripsCollectionRef, tripDataToSave);
                setCurrentTripId(newTripDocRef.id); // Set the newly created trip as current
                console.log("New trip created with ID:", newTripDocRef.id);
            }
            // After saving, generate summary again to refresh UI with latest data, and scroll to summary
            setTravelPlanSummary(summaryData);
            setTimeout(() => { // Small delay to allow state update before scrolling
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
        // Updated validation for adults/children
        if (numberOfAdults < 1) { setNumberOfAdultsError("Number of adults must be at least 1."); hasError = true; } else { setNumberOfAdultsError(''); }
        if (numberOfChildren < 0) { setNumberOfChildrenError("Number of children cannot be negative."); hasError = true; } else { setNumberOfChildrenError(''); }
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
            numberOfAdults, // Include in summary data
            numberOfChildren, // Include in summary data
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
            remainingBudgetActual, // New: Remaining budget based on actual spending
            topicsOfInterest,
            // Include selected AI suggestions for persistence
            selected
