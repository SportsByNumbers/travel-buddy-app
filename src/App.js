// App.js

import React, { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import { Loader, PlusCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

// Import all refactored components with explicit .jsx extension
import HomeLocationSection from './components/HomeLocationSection.jsx';
import DestinationsSection from './components/DestinationsSection.jsx'; // Now uncommented
import TripDatesSection from './components/TripDatesSection.jsx'; // Now uncommented
import PreferencesSection from './components/PreferencesSection.jsx'; // Now uncommented
import ItinerarySuggestions from './components/ItinerarySuggestions.jsx'; // Now uncommented
import BudgetPlanningSection from './components/BudgetPlanningSection.jsx'; // Now uncommented
import FoodAllowanceSection from './components/FoodAllowanceSection.jsx'; // Now uncommented
import TransportOptionsSection from './components/TransportOptionsSection.jsx'; // Now uncommented
import TravelPlanSummary from './components/TravelPlanSummary.jsx'; // Now uncommented
import TripList from './components/TripList.jsx';
import ExpenseTracker from './components/ExpenseTracker.jsx'; // Now uncommented

// NEW: Import ErrorBoundary
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Import custom hooks with explicit .js extension
import { useMultiSelection } from './hooks/useMultiSelection.js';

// Create a context for sharing state
export const TripContext = createContext();

// Firebase configuration moved OUTSIDE the App component
const firebaseConfig = {
    apiKey: "AIzaSyAiFzUl9jxtiaf-OpFbybOuqGHfQAR6lFA",
    authDomain: "travelbuddy-e050f.firebaseapp.com",
    projectId: "travelbuddy-e050f",
    storageBucket: "travelbuddy-e050f.firebasestorage.app",
    messagingSenderId: "625134272046",
    appId: "1:625134272046:web:a18883626fcfbb2df329bf",
    measurementId: "G-Y5RGMDS33E"
};

// Main App component
const App = () => {
    // Firebase states
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [trips, setTrips] = useState([]);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [isNewTripStarted, setIsNewTripStarted] = useState(false);

    // New states for Email/Password authentication
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoginMode, setIsLoginMode] = useState(true);

    const googleProvider = useMemo(() => auth ? new GoogleAuthProvider() : null, [auth]);

    // State variables for various inputs (keep existing)
    const [countries, setCountries] = useState([]);
    const [newCountry, setNewCountry] = useState('');
    const [cities, setCities] = useState([]);
    const [newCityName, setNewCityName] = useState('');
    const [newCityDuration, setNewCityDuration] = useState(0);
    const [newCityStarRating, setNewCityStarRating] = useState('');
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

    const [travelingParties, setTravelingParties] = useState([
        { id: 1, name: 'Main Group', adults: 1, children: 0 }
    ]);

    let calculatedPeople = 0;
    // CRITICAL FIX: Ensure travelingParties is always an array before attempting iteration.
    // This handles cases where travelingParties might momentarily be a non-array value like 'true'.
    // If travelingParties is not an array, it defaults to an empty array for iteration.
    const partiesToProcess = (Array.isArray(travelingParties) && travelingParties) ? travelingParties : [];

    if (partiesToProcess.length > 0) {
        for (const party of partiesToProcess) {
            // Defensive check for party object structure before accessing properties
            if (typeof party === 'object' && party !== null && 'adults' in party && 'children' in party) {
                calculatedPeople += (party.adults || 0) + (party.children || 0);
            } else {
                console.warn("Invalid party object found in travelingParties, skipping:", party);
            }
        }
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
    const [taxiRideShare, setTaxiRideShare] = useState(false);
    const [walking, setWalking] = useState(false);
    const [dailyLocalTransportAllowance, setDailyLocalTransportAllowance] = useState(0);

    const [actualFlightCost, setActualFlightCost] = useState(0);
    const [actualHotelCost, setActualHotelCost] = useState(0);
    const [actualActivityCost, setActualActivityCost] = useState(0);
    const [actualTransportCost, setActualTransportCost] = useState(0);
    const [actualMiscellaneousCost, setActualMiscellaneousCost] = useState(0);
    const [actualFoodCost, setActualFoodCost] = useState(0);

    const [expenses, setExpenses] = useState([]);

    const [breakfastAllowance, setBreakfastAllowance] = useState(0);
    const [lunchAllowance, setLunchAllowance] = useState(0);
    const [dinnerAllowance, setDinnerAllowance] = useState(0);
    const [snacksAllowance, setSnacksAllowance] = useState(0);
    const [carRental, setCarRental] = useState(false);
    const [shuttle, setShuttle] = useState(false);
    const [airportTransfers, setAirportTransfers] = useState(false);
    const [airportParking, setAirportParking] = useState(false);
    const [travelPlanSummary, setTravelPlanSummary] = useState(null);

    const [selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities] = useMultiSelection([]);
    const [selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useMultiSelection([]);
    const [selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks] = useMultiSelection([]);
    const [selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useMultiSelection([]);
    const [selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours] = useMultiSelection([]);
    const [selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useMultiSelection([]);

    const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    const toggleSuggestionSelection = useCallback((category, item) => {
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
    }, [toggleSuggestedActivities, toggleSuggestedFoodLocations, toggleSuggestedThemeParks, toggleSuggestedTouristSpots, toggleSuggestedTours, toggleSuggestedSportingEvents]);

    const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
    const [budgetError, setBudgetError] = useState('');
    const [allCountries, setAllCountries] = useState([]);

    const [homeCountryError, setHomeCountryError] = useState('');
    const [homeCityError, setHomeCityError] = useState('');
    const [destCountryError, setDestCountryError] = useState('');
    const [destCityError, setDestCityError] = useState('');
    const [dateError, setDateError] = useState('');
    const [numberOfAdultsError, setNumberOfAdultsError] = useState('');
    const [numberOfChildrenError, setNumberOfChildrenError] = useState('');

    const [newCityNameError, setNewCityNameError] = useState('');
    const [newCityDurationError, setNewCityDurationError] = useState('');

    // --- Authentication Handlers ---

    const handleGoogleSignIn = async () => {
        if (!auth || !googleProvider) {
            console.error("Firebase Auth or Google Provider not initialized.");
            setAuthError("Authentication service not ready.");
            return;
        }
        setAuthError('');
        try {
            await signInWithPopup(auth, googleProvider);
            console.log("Signed in with Google successfully.");
        } catch (error) {
            console.error("Google Sign-in Error:", error);
            setAuthError(error.message);
        }
    };

    const handleEmailAuth = async () => {
        if (!auth) {
            console.error("Firebase Auth not initialized.");
            setAuthError("Authentication service not ready.");
            return;
        }
        setAuthError('');
        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                console.log("Signed in with Email/Password successfully.");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                console.log("Signed up with Email/Password successfully.");
            }
        } catch (error) {
            console.error("Email/Password Auth Error:", error);
            setAuthError(error.message);
        }
    };

    const handleSignOut = async () => {
        if (!auth) {
            console.error("Firebase Auth not initialized.");
            return;
        }
        try {
            await signOut(auth);
            console.log("User signed out.");
            setCurrentTripId(null);
            setIsNewTripStarted(false);
            resetTripStates();
            setTravelPlanSummary(null);
            setUserName(null);
        } catch (error) {
            console.error("Sign out Error:", error);
        }
    };


    // --- EFFECT: Firebase Initialization and Authentication ---
    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const firestoreInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(firestoreInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                    setUserName(user.displayName || user.email || user.uid);
                    console.log("Firebase user authenticated:", user.uid);
                } else {
                    console.log("No Firebase user. Waiting for explicit login/signup.");
                    if (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                        try {
                            await signInWithCustomToken(authInstance, window.__initial_auth_token);
                            console.log("Signed in with custom token.");
                        } catch (signInError) {
                            console.error("Firebase Custom Token Sign-in Error:", signInError);
                            setAuthError(signInError.message);
                        }
                    } else {
                        setUserId(null);
                        setUserName(null);
                    }
                }
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsAuthReady(true);
        }
    }, []);


    // --- EFFECT: Fetch trips when user is authenticated ---
    useEffect(() => {
        if (isAuthReady && userId && db) {
            const projectIdForPaths = firebaseConfig.projectId;
            const tripsRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`);
            const q = query(tripsRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTrips(fetchedTrips);
            }, (error) => {
                console.error("Error fetching trips:", error);
            });

            return () => unsubscribe();
        }
    }, [isAuthReady, userId, db]);


    // --- EFFECT: Fetch expenses for the current trip ---
    useEffect(() => {
        if (isAuthReady && userId && db && currentTripId) {
            const projectIdForPaths = firebaseConfig.projectId;
            const expensesRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips/${currentTripId}/expenses`);
            const q = query(expensesRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedExpenses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date
                }));
                setExpenses(fetchedExpenses);

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
            setExpenses([]);
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
    const resetTripStates = useCallback(() => {
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
        // Ensure reset always sets to a valid array
        setTravelingParties([{ id: 1, name: 'Main Group', adults: 1, children: 0 }]);

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

        setSelectedSuggestedActivities?.([]);
        setSelectedSuggestedFoodLocations?.([]);
        setSelectedSuggestedThemeParks?.([]);
        setSelectedSuggestedTouristSpots?.([]);
        setSelectedSuggestedTours?.([]);
        setSelectedSuggestedSportingEvents?.([]);

        setHomeCountryError('');
        setHomeCityError('');
        setDestCountryError('');
        setDestCityError('');
        setDateError('');
        setNumberOfAdultsError('');
        setNumberOfChildrenError('');
        setNewCityNameError('');
        setNewCityDurationError('');
        setExpenses([]);
    }, [
        setCountries, setCities, setStartDate, setEndDate, setStarRating, setHomeCountry, setHomeCity,
        setTopicsOfInterest, setTravelStyle, setHotelAmenities, setIsPerPerson, setTravelingParties,
        setCurrency, setMoneyAvailable, setMoneySaved, setContingencyPercentage, setEstimatedFlightCost,
        setEstimatedHotelCost, setEstimatedActivityCost, setEstimatedMiscellaneousCost, setEstimatedTransportCost,
        setCarRentalCost, setShuttleCost, setAirportTransfersCost, setAirportParkingCost, setEstimatedInterCityFlightCost,
        setEstimatedInterCityTrainCost, setEstimatedInterCityBusCost, setLocalPublicTransport, setTaxiRideShare,
        setWalking, setDailyLocalTransportAllowance, setBreakfastAllowance, setLunchAllowance, setDinnerAllowance,
        setSnacksAllowance, setCarRental, setShuttle, setAirportTransfers, setAirportParking, setTravelPlanSummary,
        setSelectedSuggestedActivities, setSelectedSuggestedFoodLocations, setSelectedSuggestedThemeParks,
        setSelectedSuggestedTouristSpots, setSelectedSuggestedTours, setSelectedSuggestedSportingEvents,
        setHomeCountryError, setHomeCityError, setDestCountryError, setDestCityError, setDateError,
        setNumberOfAdultsError, setNumberOfChildrenError,
        setNewCityNameError, setNewCityDurationError, setExpenses
    ]);


    // --- Function to load a selected trip ---
    const loadTrip = async (tripId) => {
        if (!db || !userId) {
            console.error("Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;
        const tripDocRef = doc(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`, tripId);
        try {
            const tripDocSnap = await getDoc(tripDocRef);
            if (tripDocSnap.exists()) {
                const tripData = tripDocSnap.data();
                resetTripStates(); // Call reset before populating states

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

                // CRITICAL FIX FOR "true is not iterable" ERROR:
                // Ensure tripData.travelingParties is explicitly an array.
                // If it's not, it means saved data might be corrupted from a previous bug,
                // so we reset it to the default initial array.
                if (Array.isArray(tripData.travelingParties)) {
                    setTravelingParties(tripData.travelingParties);
                } else {
                    console.warn("tripData.travelingParties for trip ID:", tripId, " is not an array. Resetting to default [{ id: 1, name: 'Main Group', adults: 1, children: 0 }]. This likely indicates old or corrupted saved data.");
                    setTravelingParties([{ id: 1, name: 'Main Group', adults: 1, children: 0 }]);
                }


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

                setSelectedSuggestedActivities(tripData.selectedSuggestedActivities || []);
                setSelectedSuggestedFoodLocations(tripData.selectedSuggestedFoodLocations || []);
                setSelectedSuggestedThemeParks(tripData.selectedSuggestedThemeParks || []);
                setSelectedSuggestedTouristSpots(tripData.selectedTouristSpots || []);
                setSelectedSuggestedTours(tripData.selectedSuggestedTours || []);
                setSelectedSuggestedSportingEvents(tripData.selectedSuggestedSportingEvents || []);

                setCurrentTripId(tripId);
                setIsNewTripStarted(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                console.warn("No such trip document!");
                setTravelPlanSummary(null);
                setCurrentTripId(null);
                resetTripStates(); // Resets to default initial state
                setIsNewTripStarted(false);
            }
        } catch (error) {
            console.error("Error loading trip:", error);
            setTravelPlanSummary(null);
            setCurrentTripId(null);
            resetTripStates(); // Resets to default initial state
            setIsNewTripStarted(false);
        }
    };

    // --- Function to create a new trip ---
    const createNewTrip = () => {
        setCurrentTripId(null);
        resetTripStates();
        setTravelPlanSummary(null);
        setIsNewTripStarted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Function to save the current trip ---
    const saveCurrentTrip = async (summaryData) => {
        if (!db || !userId) {
            console.error("Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;

        try {
            // Calculate total adults/children for summary data from travelingParties
            const totalAdults = travelingParties.reduce((sum, party) => sum + (party.adults || 0), 0);
            const totalChildren = travelingParties.reduce((sum, party) => sum + (party.children || 0), 0);

            const tripDataToSave = {
                ...summaryData,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                createdAt: currentTripId ? summaryData.createdAt : serverTimestamp(),
                updatedAt: serverTimestamp(),
                countries, cities, starRating, homeCountry, homeCity, topicsOfInterest,
                travelStyle, hotelAmenities, isPerPerson,
                travelingParties, // Keep this as the source of truth for saving
                numberOfAdults: totalAdults, // Add derived totals to summary for display convenience
                numberOfChildren: totalChildren, // Add derived totals to summary for display convenience
                currency,
                moneyAvailable,
                moneySaved,
                contingencyPercentage,
                estimatedFlightCost,
                estimatedHotelCost,
                estimatedActivityCost,
                estimatedMiscellaneousCost,
                estimatedTransportCost,
                carRentalCost,
                shuttleCost,
                airportTransfersCost,
                airportParkingCost,
                estimatedInterCityFlightCost,
                estimatedInterCityTrainCost,
                estimatedInterCityBusCost,
                localPublicTransport,
                taxiRideShare,
                walking,
                dailyLocalTransportAllowance,
                breakfastAllowance,
                lunchAllowance,
                dinnerAllowance,
                snacksAllowance,
                carRental,
                shuttle,
                airportTransfers,
                airportParking,
                selectedSuggestedActivities,
                selectedSuggestedFoodLocations,
                selectedSuggestedThemeParks,
                selectedSuggestedTouristSpots,
                selectedSuggestedTours,
                selectedSuggestedSportingEvents,
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
        let hasError = false;
        if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; } else { setHomeCountryError(''); }
        if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; } else { setHomeCityError(''); }
        if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; } else { setDestCountryError(''); setDestCityError(''); }
        if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; } else { setDateError(''); }

        const totalAdults = travelingParties.reduce((sum, party) => sum + party.adults, 0);
        const totalChildren = travelingParties.reduce((sum, party) => sum + party.children, 0);

        // RE-ADDED Validation
        if (totalAdults < 1) { setNumberOfAdultsError("Total adults must be at least 1."); hasError = true; } else { setNumberOfAdultsError(''); }
        if (totalChildren < 0) { setNumberOfChildrenError("Total children cannot be negative."); hasError = true; } else { setNumberOfChildrenError(''); }
        if (numberOfPeople < 1) {
            setNumberOfAdultsError("Total number of people (adults + children) must be at least 1."); // Using adult error for total check
            hasError = true;
        }


        if (hasError) {
            setTravelPlanSummary(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        const finalActivities = selectedSuggestedActivities.filter(Boolean).join(', ');
        const finalFoodLocations = selectedSuggestedFoodLocations.filter(Boolean).join(', ');
        const finalThemeParks = selectedSuggestedThemeParks.filter(Boolean).join(', ');
        const finalTouristSpots = selectedSuggestedTouristSpots.filter(Boolean).join(', ');
        const finalTours = selectedSuggestedTours.filter(Boolean).join(', ');
        const finalSportingEvents = selectedSuggestedSportingEvents.filter(Boolean).join(', ');

        const totalDailyFoodAllowance = parseFloat(breakfastAllowance) + parseFloat(lunchAllowance) + parseFloat(dinnerAllowance) + parseFloat(snacksAllowance);
        const totalFoodCost = totalDailyFoodAllowance * overallDuration;

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


        const totalEstimatedCostBeforeFoodAndContingency =
            parseFloat(estimatedFlightCost) +
            parseFloat(estimatedHotelCost) +
            parseFloat(estimatedActivityCost) +
            combinedEstimatedTransportCost +
            parseFloat(estimatedMiscellaneousCost);

        const subTotalEstimatedCost = isPerPerson ? totalEstimatedCostBeforeFoodAndContingency * numberOfPeople : totalEstimatedCostBeforeFoodAndContingency;
        const finalTotalFoodCost = isPerPerson ? totalFoodCost * numberOfPeople : totalFoodCost;

        const contingencyAmount = (subTotalEstimatedCost + finalTotalFoodCost) * (contingencyPercentage / 100);

        const grandTotalEstimated = subTotalEstimatedCost + finalTotalFoodCost + contingencyAmount;

        const remainingBudgetEstimated = parseFloat(moneyAvailable) + parseFloat(moneySaved) - grandTotalEstimated;

        const combinedActualTransportCostFromExpenses = actualTransportCost;
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
            travelingParties, // Pass travelingParties to summaryData
            numberOfPeople,
            numberOfAdults: totalAdults, // Pass derived totals to summaryData
            numberOfChildren: totalChildren, // Pass derived totals to summaryData
            currency,
            moneyAvailable,
            moneySaved,
            contingencyPercentage,
            contingencyAmount,

            estimatedFlightCost,
            estimatedHotelCost,
            estimatedActivityCost,
            estimatedMiscellaneousCost,
            combinedEstimatedTransportCost,
            totalEstimatedCost: subTotalEstimatedCost,
            grandTotalEstimated,

            actualFlightCost,
            actualHotelCost,
            actualActivityCost,
            actualMiscellaneousCost,
            actualTransportCost: combinedActualTransportCostFromExpenses,
            actualFoodCost,
            actualGrandTotal,

            breakfastAllowance,
            lunchAllowance,
            dinnerAllowance,
            snacksAllowance,
            totalDailyFoodAllowance,
            totalFoodCost: finalTotalFoodCost,

            carRental,
            carRentalCost,
