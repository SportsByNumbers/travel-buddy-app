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
    const [newHomeCityInput, setNewHomeCityInput] = useState(''); // Corrected: Should be useState, not direct assignment
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
    // CRITICAL DEBUG LOGS AND REINFORCED CHECK:
    console.log('App.js (Top Level Render) - travelingParties initial/current state:', travelingParties, 'Type:', typeof travelingParties, 'IsArray:', Array.isArray(travelingParties));
    const partiesToProcess = Array.isArray(travelingParties) ? travelingParties : [];
    console.log('App.js (Top Level Render) - partiesToProcess AFTER Array.isArray check:', partiesToProcess, 'Type:', typeof partiesToProcess, 'IsArray:', Array.isArray(partiesToProcess));


    if (partiesToProcess.length > 0) {
        for (const party of partiesToProcess) {
            console.log('App.js (Top Level Render) - Processing party (in loop):', party, 'Type:', typeof party, 'IsObject:', typeof party === 'object' && party !== null);
            console.log('App.js (Top Level Render) - Party details (if object): ID=', party && party.id, ' Name=', party && party.name, ' Adults=', party && party.adults, ' Children=', party && party.children);

            if (typeof party === 'object' && party !== null && 'adults' in party && 'children' in party) {
                calculatedPeople += (party.adults || 0) + (party.children || 0);
            } else {
                console.error("App.js (Top Level Render) - !!! CRITICAL: Invalid party object found in travelingParties (for calculation), skipping:", party);
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
            const tripsRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`);
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
            const expensesRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips/${currentTripId}/expenses`);
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
    }, [isAuthReady, userId, db, currentTripId]);


    // --- EFFECT: Fetch all countries on component mount for predictive text ---
    useEffect(() => {
        const fetchAllCountries = async () => {
            console.log('App.js (useEffect countries) - Fetching all countries...');
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
                const data = await response.json();
                setAllCountries(data.map(country => ({
                    name: country.name.common,
                    flag: country.flags.svg
                })));
                console.log('App.js (useEffect countries) - Countries fetched successfully.');
            } catch (error) {
                console.error("Error fetching all countries for suggestions:", error);
            }
        };
        fetchAllCountries();
    }, []);

    // --- Helper to reset all trip-related states for a new trip ---
    const resetTripStates = useCallback(() => {
        console.log('App.js (resetTripStates) - Resetting all trip states.');
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
        console.log('App.js (loadTrip) - Attempting to load trip:', tripId);
        if (!db || !userId) {
            console.error("App.js (loadTrip) - Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;
        const tripDocRef = doc(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`, tripId);
        try {
            const tripDocSnap = await getDoc(tripDocRef);
            if (tripDocSnap.exists()) {
                const tripData = tripDocSnap.data();
                console.log('App.js (loadTrip) - Fetched tripData from Firestore:', tripData);
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
                resetTripStates(); // Resets to default initial state
                setIsNewTripStarted(false);
            }
        } catch (error) {
            console.error("App.js (loadTrip) - Error loading trip:", error, error.stack);
            setTravelPlanSummary(null);
            setCurrentTripId(null);
            resetTripStates(); // Resets to default initial state
            setIsNewTripStarted(false);
        }
    };

    // --- Function to create a new trip ---
    const createNewTrip = () => {
        console.log('App.js (createNewTrip) - Starting new trip.');
        setCurrentTripId(null);
        resetTripStates(); // This ensures travelingParties is set to initial array
        setTravelPlanSummary(null);
        setIsNewTripStarted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Function to save the current trip ---
    const saveCurrentTrip = async (summaryData) => {
        console.log('App.js (saveCurrentTrip) - Attempting to save trip.');
        if (!db || !userId) {
            console.error("App.js (saveCurrentTrip) - Firestore not initialized or user not authenticated.");
            return;
        }
        const projectIdForPaths = firebaseConfig.projectId;

        try {
            // Calculate total adults/children for summary data from travelingParties
            const totalAdults = partiesToProcess.reduce((sum, party) => sum + (party.adults || 0), 0); // Use partiesToProcess for safety
            const totalChildren = partiesToProcess.reduce((sum, party) => sum + (party.children || 0), 0); // Use partiesToProcess for safety

            // These variables must be defined here, as they are used below in tripDataToSave
            // Recalculate them or ensure they are passed as arguments if needed
            // For now, let's assume they are derived based on the summaryData or states
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
                countries, cities, starRating, homeCountry, homeCity, topicsOfInterest,
                travelStyle, hotelAmenities, isPerPerson,
                travelingParties, // Keep this as the source of truth for saving
                numberOfAdults: totalAdults, // Add derived totals to summary for display convenience
                numberOfChildren: totalChildren, // Add derived totals to summary for display convenience
                currency,
                moneyAvailable,
                moneySaved,
                contingencyPercentage,
                contingencyAmount, // Used here correctly

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
                const tripDocRef = doc(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`, currentTripId);
                await setDoc(tripDocRef, tripDataToSave, { merge: true });
                console.log("App.js (saveCurrentTrip) - Trip updated with ID:", currentTripId);
            } else {
                const tripsCollectionRef = collection(db, `artifacts/${projectIdForPaths}/users/${userId}/trips`);
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
    };


    // --- MAIN TRAVEL PLAN CALCULATION (modified to call saveCurrentTrip) ---
    const calculateTravelPlan = () => {
        console.log('App.js (calculateTravelPlan) - Calculating travel plan.');
        let hasError = false;
        if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; } else { setHomeCountryError(''); }
        if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; } else { setHomeCityError(''); }
        if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; } else { setDestCountryError(''); setDestCityError(''); }
        if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; } else { setDateError(''); }

        const totalAdults = partiesToProcess.reduce((sum, party) => sum + (party.adults || 0), 0); // Use partiesToProcess for safety
        const totalChildren = partiesToProcess.reduce((sum, party) => sum + (party.children || 0), 0); // Use partiesToProcess for safety

        // RE-ADDED Validation
        if (totalAdults < 1) { setNumberOfAdultsError("Total adults must be at least 1."); hasError = true; } else { setNumberOfAdultsError(''); }
        if (totalChildren < 0) { setNumberOfChildrenError("Total children cannot be negative."); hasError = true; } else { setNumberOfChildrenError(''); }
        if (numberOfPeople < 1) {
            setNumberOfAdultsError("Total number of people (adults + children) must be at least 1."); // Using adult error for total check
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

        const subTotalEstimatedCost = isPerPerson ? totalEstimatedCostBeforeFoodAndContingency * numberOfPeople : totalEstimatedCostBeforeFoodAndContingency;
        const finalTotalFoodCost = isPerPerson ? totalFoodCost * numberOfPeople : totalFoodCost;

        const contingencyAmount = (subTotalEstimatedCost + finalTotalFoodCost) * (contingencyPercentage / 100);

        const grandTotalEstimated = subTotalEstimatedCost + finalTotalFoodCost + contingencyAmount;

        const combinedActualTransportCostFromExpenses = actualTransportCost;
        const actualGrandTotal = actualFlightCost + actualHotelCost + actualActivityCost + actualMiscellaneousCost + actualFoodCost + combinedActualTransportCostFromExpenses;

        const remainingBudgetEstimated = parseFloat(moneyAvailable) + parseFloat(moneySaved) - grandTotalEstimated; // eslint-disable-line no-unused-vars
        const remainingBudgetActual = parseFloat(moneyAvailable) + parseFloat(moneySaved) - actualGrandTotal; // eslint-disable-line no-unused-vars


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
            numberOfAdults: totalAdults, // Add derived totals to summary for display convenience
            numberOfChildren: totalChildren, // Add derived totals to summary for display convenience
            currency,
            moneyAvailable,
            moneySaved,
            contingencyPercentage,
            contingencyAmount, // Used here correctly

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
            actualGrandTotal, // Make sure actualGrandTotal is also included in summaryData

            breakfastAllowance,
            lunchAllowance,
            dinnerAllowance,
            snacksAllowance,
            totalDailyFoodAllowance,
            totalFoodCost: finalTotalFoodCost,

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

            remainingBudgetEstimated, // Include them in summaryData
            remainingBudgetActual,    // Include them in summaryData
            topicsOfInterest,
            selectedSuggestedActivities,
            selectedSuggestedFoodLocations,
            selectedSuggestedThemeParks,
            selectedSuggestedTouristSpots,
            selectedSuggestedTours,
            selectedSuggestedSportingEvents,
        };

        saveCurrentTrip(summaryData);
    };

    const getFormattedCurrency = (amount) => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return `${currency}0.00`;
        switch (currency) {
            case 'JPY': return `¥${numAmount.toFixed(0)}`;
            case 'GBP': return `£${numAmount.toFixed(2)}`;
            case 'EUR': return `€${numAmount.toFixed(2)}`;
            default: return `$${numAmount.toFixed(2)}`;
        }
    };

    const contextValue = {
        db, auth, userId, userName, isAuthReady,
        appId: firebaseConfig.appId,
        trips, setTrips, currentTripId, setCurrentTripId, loadTrip, createNewTrip,
        isNewTripStarted, setIsNewTripStarted,

        countries, setCountries, newCountry, setNewCountry, cities, setCities, newCityName, setNewCityName,
        newCityDuration, setNewCityDuration, newCityStarRating, setNewCityStarRating, newCityTopics, setNewCityTopics,
        startDate, setStartDate, endDate, setEndDate, overallDuration, starRating, setStarRating, travelStyle,
        setTravelStyle, hotelAmenities, setHotelAmenities, homeCountry, setHomeCountry, newHomeCountryInput, setNewHomeCountryInput,
        homeCity, setHomeCity, newHomeCityInput, setNewHomeCityInput, topicsOfInterest, setTopicsOfInterest, availableTopics,
        availableAmenities, isPerPerson, setIsPerPerson,
        travelingParties, setTravelingParties, // Provide travelingParties
        numberOfPeople,
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
        isGeneratingSuggestions, setIsGeneratingSuggestions, suggestionError,
        setSuggestionError, allCountries,
        isGeneratingBudget, setIsGeneratingBudget, budgetError, setBudgetError,
        expenses, setExpenses,

        selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities,
        selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations,
        selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks,
        selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots,
        selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours,
        selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents,

        homeCountryError, setHomeCountryError, homeCityError, setHomeCityError, destCountryError, setDestCountryError,
        destCityError, setDestCityError, dateError, setDateError,
        numberOfAdultsError, setNumberOfAdultsError, numberOfChildrenError, setNumberOfChildrenError,
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

                    {userId ? (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-4 rounded-lg shadow-inner mb-6 print:hidden">
                                <p className="text-sm text-gray-600 mb-2 sm:mb-0">
                                    Welcome, <span className="font-semibold text-indigo-700 break-all">
                                        {userName || userId}
                                    </span>!
                                </p>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={createNewTrip}
                                        className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md text-sm font-semibold hover:bg-green-600 transition-colors duration-200 shadow-md"
                                    >
                                        <PlusCircle size={16} className="mr-1" /> New Trip
                                    </button>
                                    <TripList />
                                    <button
                                        onClick={handleSignOut}
                                        className="px-4 py-2 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600 transition-colors duration-200 shadow-md"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>


                            {/* Main content area for authenticated users */}
                            {currentTripId !== null || isNewTripStarted ? (
                                <ErrorBoundary>
                                    {/* TEMPORARY DEBUGGING: COMMENT OUT SECTIONS ONE BY ONE */}
                                    {/* Start by commenting ALL of these out, then uncomment one by one and redeploy */}

                                    {/* <HomeLocationSection /> */}
                                    {/* <DestinationsSection /> */}
                                    {/* <TripDatesSection /> */}
                                    {/* <PreferencesSection /> */}
                                    {/* <ItinerarySuggestions /> */} 
                                    {/* <BudgetPlanningSection /> */}
                                    {/* <FoodAllowanceSection /> */}
                                    {/* <TransportOptionsSection /> */}
                                    {/* <TravelPlanSummary /> */} 
                                    {/* <ExpenseTracker /> */}


                                    {/* LEAVE this button section for now, as it's just a button */}
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

                                </ErrorBoundary>
                            ) : (
                                <div className="text-center py-20 bg-gray-50 rounded-xl shadow-inner text-gray-600">
                                    <p className="text-lg mb-4">You're signed in! Start by creating a new trip or loading an existing one!</p>
                                    <button
                                        onClick={createNewTrip}
                                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                                    >
                                        <PlusCircle size={20} className="mr-2" /> Start New Travel Plan
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl shadow-inner text-gray-600">
                            <h2 className="text-2xl font-bold text-indigo-800 mb-6">{isLoginMode ? 'Sign In' : 'Sign Up'} to Plan Your Trip</h2>
                            {authError && <p className="text-red-500 mb-4">{authError}</p>}

                            <button
                                onClick={handleGoogleSignIn}
                                className="inline-flex items-center px-6 py-3 mb-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-3" />
                                {isLoginMode ? 'Sign In with Google' : 'Sign Up with Google'}
                            </button>

                            <div className="w-full max-w-sm px-4">
                                <div className="relative flex py-5 items-center">
                                    <div className="flex-grow border-t border-gray-300"></div>
                                    <span className="flex-shrink mx-4 text-gray-500">OR</span>
                                    <div className="flex-grow border-t border-gray-300"></div>
                                </div>

                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                                />
                                <button
                                    onClick={handleEmailAuth}
                                    className="w-full px-6 py-3 mb-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-300 ease-in-out shadow-md"
                                >
                                    {isLoginMode ? 'Sign In with Email' : 'Sign Up with Email'}
                                </button>

                                <button
                                    onClick={() => setIsLoginMode(!isLoginMode)}
                                    className="w-full text-indigo-600 hover:underline text-sm font-medium transition duration-200 ease-in-out"
                                >
                                    {isLoginMode ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TripContext.Provider>
    );
};

export default App;
