// App.js

import React, { useState, useEffect, createContext, useCallback, useMemo } from 'react';
import { Loader, PlusCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getRedirectResult } from 'firebase/auth'; 
import { getFirestore, doc, getDoc, setDoc, collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

// Import ALL refactored components with explicit .jsx extension
import HomeLocationSection from './components/HomeLocationSection.jsx';
import DestinationsSection from './components/DestinationsSection.jsx';
import TripDatesSection from './components/TripDatesSection.jsx';
import PreferencesSection from './components/PreferencesSection.jsx';
import ItinerarySuggestions from './components/ItinerarySuggestions.jsx';
import BudgetPlanningSection from './components/BudgetPlanningSection.jsx';
import FoodAllowanceSection from './components/FoodAllowanceSection.jsx';
import TransportOptionsSection from './components/TransportOptionsSection.jsx';
import TravelPlanSummary from './components/TravelPlanSummary.jsx';
import TripList from './components/TripList.jsx';
import ExpenseTracker from './components/ExpenseTracker.jsx';

// NEW: Import ErrorBoundary
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Import custom hooks with explicit .js extension
import { useMultiSelection } from './hooks/useMultiSelection.js';

// Import centralized options
import { STAR_RATING_OPTIONS, AVAILABLE_TOPICS, TRAVEL_STYLE_OPTIONS, EXPENSE_CATEGORIES } from './constants/options.js';


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
    const [newCityStarRating, setNewCityStarRating] = useState([]); // Array for city-specific multi-selection
    const [newCityTopics, setNewCityTopics] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const overallDuration = (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;
    const [starRating, setStarRating] = useState([]); // Array for overall multi-selection
    const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' });
    const [homeCurrency, setHomeCurrency] = useState(null);
    const [homeCity, setHomeCity] = useState('');
    const [newHomeCityInput, setNewHomeCityInput] = useState(''); 
    const [topicsOfInterest, setTopicsOfInterest] = useState([]);
    const [travelStyle, setTravelStyle] = useState('');
    const [hotelAmenities, setHotelAmenities] = useState([]);
    const availableAmenities = ['Pool', 'Free Breakfast', 'Pet-Friendly', 'Spa', 'Gym', 'Parking', 'Kids Club', 'Beach Access', 'Wifi', 'Laundry Services', 'Laundry Facilities']; 
    const [isPerPerson, setIsPerPerson] = useState(true);

    const [travelingParties, setTravelingParties] = useState([
        { id: 1, name: 'Main Group', adults: 1, children: 0 }
    ]);

    let calculatedPeople = 0;
    const partiesToProcess = Array.isArray(travelingParties) ? travelingParties : [];

    if (partiesToProcess.length > 0) {
        for (const party of partiesToProcess) {
            if (typeof party === 'object' && party !== null && 'adults' in party && 'children' in party) {
                calculatedPeople += (party.adults || 0) + (party.children || 0);
            } else {
                console.error("App.js - !!! CRITICAL: Invalid party object found in travelingParties (for calculation), skipping:", party);
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
        } catch (error) { // CORRECTED: Removed extra '}'
            console.error("Sign out Error:", error);
        }
    };

    // --- EFFECT: Firebase Initialization and Authentication (Handles Redirect Result) ---
    useEffect(() => {
        console.log('App.js (useEffect auth) - Starting Firebase initialization...');
        try {
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const firestoreInstance = getFirestore(app);

            setAuth(authInstance);
            setDb(firestoreInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                console.log('App.js (onAuthStateChanged) - User:', user);
                if (user) {
                    setUserId(user.uid);
                    setUserName(user.displayName || user.email || user.uid);
                    console.log("Firebase user authenticated:", user.uid);
                } else {
                    console.log("No Firebase user. Checking for redirect result or waiting for explicit login/signup.");
                    try {
                        const result = await getRedirectResult(authInstance);
                        if (result) {
                            const signedInUser = result.user;
                            setUserId(signedInUser.uid);
                            setUserName(signedInUser.displayName || signedInUser.email || signedInUser.uid);
                            console.log("Signed in with redirect result:", signedInUser.uid);
                        } else {
                            setUserId(null);
                            setUserName(null);
                        }
                    } catch (redirectError) {
                        console.error("Firebase Redirect Sign-in Error:", redirectError);
                        setAuthError(redirectError.message);
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
        console.log('App.js (useEffect trips) - isAuthReady:', isAuthReady, 'userId:', userId, 'db:', db);
        if (isAuthReady && userId && db) {
            const projectIdForPaths = firebaseConfig.projectId;
            const tripsRef = collection(db, `artifacts/<span class="math-inline">\{projectIdForPaths\}/users/</span>{userId}/trips`);
            const q = query(tripsRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTrips = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                console.log('App.js (onSnapshot trips) - Fetched trips:', fetchedTrips);
                setTrips(fetchedTrips);
            }, (error) => {
                console.error("Error fetching trips:", error);
            });

            return () => unsubscribe();
        } else {
            console.log('App.js (useEffect trips) - Not fetching trips (auth not ready or no user/db)');
        }
    }, [isAuthReady, userId, db]);


    // --- EFFECT: Fetch expenses for the current trip ---
    useEffect(() => {
        console.log('App.js (useEffect expenses) - isAuthReady:', isAuthReady, 'userId:', userId, 'db:', db, 'currentTripId:', currentTripId);
        if (isAuthReady && userId && db && currentTripId) {
            const projectIdForPaths = firebaseConfig.projectId;
            const expensesRef = collection(db, `artifacts/<span class="math-inline">\{projectIdForPaths\}/users/</span>{userId}/trips/${currentTripId}/expenses`);
            const q = query(expensesRef);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedExpenses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date
                }));
                console.log('App.js (onSnapshot expenses) - Fetched expenses:', fetchedExpenses);
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
            console.log('App.js (useEffect expenses) - Not fetching expenses (no current trip or auth not ready)');
        }
    }, [isAuthReady, userId, db, currentTripId]); // Added currentTripId to dependencies


    // --- EFFECT: Fetch all countries on component mount for predictive text ---
    useEffect(() => {
        const fetchAllCountries = async () => {
            console.log('App.js (useEffect countries) - Fetching all countries...');
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,currencies');
                const data = await response.json();
                setAllCountries(data.map(country => {
                    let currencyCode = null;
                    if (country.currencies) {
                        const firstCurrencyKey = Object.keys(country.currencies)[0];
                        currencyCode = firstCurrencyKey;
                    }
                    return {
                        name: country.name.common,
                        flag: country.flags.svg,
                        currencyCode: currencyCode,
                    };
                }));
                console.log('App.js (useEffect countries) - Countries fetched successfully.');
            } catch (error) { 
                console.error("Error fetching all countries for suggestions:", error);
            } 
        };
        fetchAllCountries();
    }, []);

    // --- Helper to set home country and update main currency state ---
    const handleSetHomeCountry = useCallback((countryData) => {
        console.log('App.js (handleSetHomeCountry) - Setting home country:', countryData);
        setHomeCountry(countryData);
        if (countryData && countryData.currencyCode) {
            setHomeCurrency(countryData.currencyCode);
            setCurrency(countryData.currencyCode);
        } else {
            setHomeCurrency(null);
            setCurrency('USD');
        }
    }, [setHomeCountry, setHomeCurrency, setCurrency]);

    // --- Helper to reset all trip-related states for a new trip ---
    const resetTripStates = useCallback(() => {
        console.log('App.js (resetTripStates) - Resetting all trip states.');
        setCountries([]);
        setCities([]);
        setStartDate(null);
        setEndDate(null);
        setStarRating([]);
        setHomeCountry({ name: '', flag: '' });
        setHomeCurrency(null);
        setHomeCity('');
        setTopicsOfInterest([]);
        setTravelStyle('');
        setHotelAmenities([]);
        setIsPerPerson(true);
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
        setCountries, setCities, setStartDate, setEndDate, setStarRating, setHomeCountry, setHomeCity, setHomeCurrency,
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
        console.log('App.js (loadTrip) - Attempting to load trip:', tripId);
        if (!db || !userId) {
            console.error("App.js (loadTrip) - Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;
        const tripDocRef = doc(db, `artifacts/<span class="math-inline">\{projectIdForPaths\}/users/</span>{userId}/trips`, tripId);
        try { // Corrected: This try block is now correctly structured.
            const tripDocSnap = await getDoc(tripDocRef);
            if (tripDocSnap.exists()) {
                const tripData = tripDocSnap.data();
                console.log('App.js (loadTrip) - Fetched tripData from Firestore:', tripData);
                resetTripStates(); // Call reset before populating states

                setCountries(tripData.countries || []);
                setCities(tripData.cities || []);
                setStartDate(tripData.startDate ? new Date(tripData.startDate) : null);
                setEndDate(tripData.endDate ? new Date(tripData.endDate) : null);
                setStarRating(Array.isArray(tripData.starRating) ? tripData.starRating : (tripData.starRating ? [tripData.starRating] : []));
                setHomeCountry(tripData.homeCountry || { name: '', flag: '' });
                setHomeCurrency(tripData.homeCurrency || null); // Load home currency
                setHomeCity(tripData.homeCity || '');
                setTopicsOfInterest(tripData.topicsOfInterest || []);
                setTravelStyle(tripData.travelStyle || '');
                setHotelAmenities(tripData.hotelAmenities || []);
                setIsPerPerson(tripData.isPerPerson !== undefined ? tripData.isPerPerson : true);

                if (Array.isArray(tripData.travelingParties)) {
                    setTravelingParties(tripData.travelingParties);
                } else {
                    console.error("App.js (loadTrip) - !!! CRITICAL: tripData.travelingParties for trip ID:", tripId, " is NOT an array. It is:", tripData.travelingParties, "Type:", typeof tripData.travelingParties, ". Resetting to default.");
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
                console.log('App.js (loadTrip) - Trip loaded successfully for:', tripId);
            } else {
                console.warn("App.js (loadTrip) - No such trip document found for ID:", tripId);
                setTravelPlanSummary(null);
                setCurrentTripId(null);
                resetTripStates(); 
                setIsNewTripStarted(false);
            }
        } catch (error) { 
            console.error("App.js (loadTrip) - Error loading trip:", error, error.stack);
            setTravelPlanSummary(null);
            setCurrentTripId(null);
            resetTripStates(); 
            setIsNewTripStarted(false);
        }
    };

    // --- Function to create a new trip ---
    const createNewTrip = () => {
        console.log('App.js (createNewTrip) - Starting new trip.');
        setCurrentTripId(null);
        resetTripStates(); 
        setTravelPlanSummary(null);
        setIsNewTripStarted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log('App.js (createNewTrip) - isNewTripStarted set to true. currentTripId is null.');
    };

    // --- Function to save the current trip ---
    const saveCurrentTrip = async (summaryData) => {
        console.log('App.js (saveCurrentTrip) - Attempting to save trip with summaryData:', summaryData);
        if (!db || !userId) {
            console.error("App.js (saveCurrentTrip) - Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;

        try { 
            const totalAdults = partiesToProcess.reduce((sum, party) => sum + (party.adults || 0), 0);
            const totalChildren = partiesToProcess.reduce((sum, party) => sum + (party.children || 0), 0);

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


            const tripDataToSave = {
                ...summaryData,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                createdAt: currentTripId ? summaryData.createdAt : serverTimestamp(),
                updatedAt: serverTimestamp(),
                countries, cities,
                starRating: starRating, 
                homeCountry, homeCity, topicsOfInterest,
                travelStyle, hotelAmenities, isPerPerson,
                travelingParties, 
                numberOfAdults: totalAdults, 
                numberOfChildren: totalChildren, 
                currency, 
                homeCurrency, 
                moneyAvailable,
                moneySaved,
                contingencyPercentage,
                contingencyAmount, 

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
            console.log('App.js (saveCurrentTrip) - Trip data to save:', tripDataToSave);


            if (currentTripId) {
                const tripDocRef = doc(db, `artifacts/<span class="math-inline">\{projectIdForPaths\}/users/</span>{userId}/trips`, currentTripId);
                await setDoc(tripDocRef, tripDataToSave, { merge: true });
                console.log("App.js (saveCurrentTrip) - Trip updated with ID:", currentTripId);
            } else {
                const tripsCollectionRef = collection(db, `artifacts/<span class="math-inline">\{projectIdForPaths\}/users/</span>{userId}/trips`);
                const newTripDocRef = await addDoc(tripsCollectionRef, tripDataToSave);
                setCurrentTripId(newTripDocRef.id);
                console.log("App.js (saveCurrentTrip) - New trip created with ID:", newTripDocRef.id);
            }
            setTravelPlanSummary(summaryData);
            setTimeout(() => {
                const summaryElement = document.getElementById('travel-plan-summary');
                if (summaryElement) {
                    summaryElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

        } catch (error) { 
            console.error("App.js (saveCurrentTrip) - Error saving trip:", error, error.stack);
        }
        console.log("App.js (saveCurrentTrip) - Trip saved/updated. Current Trip ID:", currentTripId);
    };


    const calculateTravelPlan = () => {
        console.log('App.js (calculateTravelPlan) - Calculating travel plan.');
        console.log('App.js (calculateTravelPlan) - States for calculation: homeCountry:', homeCountry, 'homeCity:', homeCity, 'countries:', countries, 'cities:', cities, 'startDate:', startDate, 'endDate:', endDate, 'numberOfPeople:', numberOfPeople);

        let hasError = false;
        if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; } else { setHomeCountryError(''); }
        if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; } else { setHomeCityError(''); }
        if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; } else { setDestCountryError(''); setDestCityError(''); }
        if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; } else { setDateError(''); }

        const totalAdults = partiesToProcess.reduce((sum, party) => sum + (party.adults || 0), 0); 
        const totalChildren = partiesToProcess.reduce((sum, party) => sum + (party.children || 0), 0); 

        if (totalAdults < 1) { setNumberOfAdultsError("Total adults must be at least 1."); hasError = true; } else { setNumberOfAdultsError(''); }
        if (totalChildren < 0) { setNumberOfChildrenError("Total children cannot be negative."); hasError = true; } else { setNumberOfChildrenError(''); }
        if (numberOfPeople < 1) {
            setNumberOfAdultsError("Total number of people (adults + children) must be at least 1."); 
            hasError = true;
        }

        if (hasError) {
            console.warn('App.js (calculateTravelPlan) - Validation errors detected, not generating summary.');
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

        const subTotalEstimatedCost = isPerPerson ? totalEstimatedCostBeforeFoodAndContingency * numberOfPeople : totalEstimatedCostBeforeFoodAndC
