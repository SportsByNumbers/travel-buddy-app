import React, { useState, useEffect, createContext } from 'react';
import { MapPin, Compass, Utensils, Car, Wallet, CheckCircle, Loader, Home, Info, Printer } from 'lucide-react';

// Import all refactored components
import HomeLocationSection from './components/HomeLocationSection';
import DestinationsSection from './components/DestinationsSection';
import TripDatesSection from './components/TripDatesSection';
import PreferencesSection from './components/PreferencesSection';
import ItinerarySuggestions from './components/ItinerarySuggestions';
import BudgetPlanningSection from './components/BudgetPlanningSection';
import FoodAllowanceSection from './components/FoodAllowanceSection';
import TransportOptionsSection from './components/TransportOptionsSection';
import TravelPlanSummary from './components/TravelPlanSummary';

// Import custom hooks
import { useMultiSelection } from './hooks/useMultiSelection';

// Create a context for sharing state
export const TripContext = createContext();

// Main App component
const App = () => {
    // State variables for various inputs
    const [countries, setCountries] = useState([]); // Stores { name: string, flag: string } for destinations
    const [newCountry, setNewCountry] = useState(''); // Used by TagInput within DestinationsSection

    // Cities now store objects with more details
    const [cities, setCities] = useState([]); // [{ name: string, duration: number, starRating: string, topics: string[] }]
    const [newCityName, setNewCityName] = useState(''); // Used by InputField within DestinationsSection
    const [newCityDuration, setNewCityDuration] = useState(0); // Used by InputField within DestinationsSection
    const [newCityStarRating, setNewCityStarRating] = useState(''); // Used by InputField within DestinationsSection
    const [newCityTopics, setNewCityTopics] = useState([]); // Used by CheckboxGroup within DestinationsSection

    // Overall trip Start and End Dates
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    // Duration will now be derived from overall trip dates or sum of city durations
    const overallDuration = (startDate && endDate) ? Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1 : 0;

    const [starRating, setStarRating] = useState(''); // Overall preferred hotel star rating

    // State for Home Location
    const [homeCountry, setHomeCountry] = useState({ name: '', flag: '' });
    const [newHomeCountryInput, setNewHomeCountryInput] = useState(''); // Used by TagInput within HomeLocationSection
    const [homeCity, setHomeCity] = useState('');
    const [newHomeCityInput, setNewHomeCityInput] = useState(''); // Used by InputField within HomeLocationSection

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

    // Transport options (checkboxes) - only for their boolean state here, costs in specific state above
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

    // States for selected AI-generated suggestions using custom hook
    const [selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities] = useMultiSelection([]);
    const [selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations] = useMultiSelection([]);
    const [selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks] = useMultiSelection([]);
    const [selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots] = useMultiSelection([]);
    const [selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours] = useMultiSelection([]);
    const [selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents] = useMultiSelection([]);

    // Consolidated toggle for AI suggestions
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

    // States for AI-generated budget
    const [isGeneratingBudget, setIsGeneratingBudget] = useState(false);
    const [budgetError, setBudgetError] = useState('');

    // States for country suggestions (predictive text)
    const [allCountries, setAllCountries] = useState([]); // Full list of countries for suggestions

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


    // --- MAIN TRAVEL PLAN CALCULATION ---
    const calculateTravelPlan = () => {
        // Validation before generating summary
        let hasError = false;
        if (homeCountry.name === '') { setHomeCountryError("Please set your home country."); hasError = true; } else { setHomeCountryError(''); }
        if (homeCity === '') { setHomeCityError("Please set your home city."); hasError = true; } else { setHomeCityError(''); }
        if (countries.length === 0 && cities.length === 0) { setDestCountryError("Please add at least one destination country or city."); setDestCityError("Please add at least one destination country or city."); hasError = true; } else { setDestCountryError(''); setDestCityError(''); }
        if (!startDate || !endDate || overallDuration < 1) { setDateError("Please select valid start and end dates."); hasError = true; } else { setDateError(''); }
        if (numberOfPeople < 1) { setNumberOfPeopleError("Number of people must be at least 1."); hasError = true; } else { setNumberOfPeopleError(''); }

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

    // Bundle all state and helper functions into a single context value
    const contextValue = {
        // State variables
        countries, setCountries, newCountry, setNewCountry, cities, setCities, newCityName, setNewCityName,
        newCityDuration, setNewCityDuration, newCityStarRating, setNewCityStarRating, newCityTopics, setNewCityTopics,
        startDate, setStartDate, endDate, setEndDate, overallDuration, starRating, setStarRating, travelStyle,
        setTravelStyle, hotelAmenities, setHotelAmenities, homeCountry, setHomeCountry, newHomeCountryInput, setNewHomeCountryInput,
        homeCity, setHomeCity, newHomeCityInput, setNewHomeCityInput, topicsOfInterest, setTopicsOfInterest, availableTopics,
        availableAmenities, isPerPerson, setIsPerPerson, numberOfPeople, setNumberOfPeople, currency, setCurrency,
        moneyAvailable, setMoneyAvailable, moneySaved, setMoneySaved, contingencyPercentage, setContingencyPercentage,
        estimatedFlightCost, setEstimatedFlightCost, estimatedHotelCost, setEstimatedHotelCost, estimatedActivityCost,
        setEstimatedActivityCost, estimatedMiscellaneousCost, setEstimatedMiscellaneousCost, estimatedTransportCost,
        setEstimatedTransportCost, carRentalCost, setCarRentalCost, shuttleCost, setShuttleCost, airportTransfersCost,
        setAirportTransfersCost, airportParkingCost, setAirportParkingCost, estimatedInterCityFlightCost,
        setEstimatedInterCityFlightCost, estimatedInterCityTrainCost, setEstimatedInterCityTrainCost,
        estimatedInterCityBusCost, setEstimatedInterCityBusCost, localPublicTransport, setLocalPublicTransport,
        taxiRideShare, setTaxiRideShare, walking, setWalking, dailyLocalTransportAllowance, setDailyLocalTransportAllowance, // Fix: Changed setTaxiShare to setTaxiRideShare
        actualFlightCost, setActualFlightCost, actualHotelCost, setActualHotelCost, actualActivityCost,
        setActualActivityCost, actualTransportCost, setActualTransportCost, actualMiscellaneousCost,
        setActualMiscellaneousCost, actualFoodCost, setActualFoodCost, breakfastAllowance, setBreakfastAllowance,
        lunchAllowance, setLunchAllowance, dinnerAllowance, setDinnerAllowance, snacksAllowance, setSnacksAllowance,
        carRental, setCarRental, shuttle, setShuttle, airportTransfers, setAirportTransfers, airportParking, setAirportParking,
        travelPlanSummary, setTravelPlanSummary, suggestedActivities, setSuggestedActivities, suggestedFoodLocations,
        setSuggestedFoodLocations, suggestedThemeParks, setSuggestedThemeParks, suggestedTouristSpots,
        setSuggestedTouristSpots, suggestedTours, setSuggestedTours, suggestedSportingEvents,
        setSuggestedSportingEvents, isGeneratingSuggestions, setIsGeneratingSuggestions, suggestionError,
        setSuggestionError, allCountries,
        isGeneratingBudget, setIsGeneratingBudget, budgetError, setBudgetError,

        // Selected AI suggestions (from useMultiSelection hook)
        selectedSuggestedActivities, toggleSuggestedActivities, setSelectedSuggestedActivities,
        selectedSuggestedFoodLocations, toggleSuggestedFoodLocations, setSelectedSuggestedFoodLocations,
        selectedSuggestedThemeParks, toggleSuggestedThemeParks, setSelectedSuggestedThemeParks,
        selectedSuggestedTouristSpots, toggleSuggestedTouristSpots, setSelectedSuggestedTouristSpots,
        selectedSuggestedTours, toggleSuggestedTours, setSelectedSuggestedTours,
        selectedSuggestedSportingEvents, toggleSuggestedSportingEvents, setSelectedSuggestedSportingEvents,

        // Input validation states
        homeCountryError, setHomeCountryError, homeCityError, setHomeCityError, destCountryError, setDestCountryError,
        destCityError, setDestCityError, dateError, setDateError, numberOfPeopleError, setNumberOfPeopleError,
        newCityNameError, setNewCityNameError, newCityDurationError, setNewCityDurationError,

        // Helper functions
        getFormattedCurrency, toggleSuggestionSelection
    };

    return (
        <TripContext.Provider value={contextValue}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans antialiased print:bg-white print:p-0">
                <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-2xl print:shadow-none print:rounded-none print:p-4">
                    <h1 className="text-4xl font-extrabold text-center text-indigo-900 mb-10 tracking-tight print:text-black">
                        <span className="block text-indigo-600 text-xl mb-2 print:text-gray-700">Your Ultimate</span>
                        Travel Planner
                    </h1>

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
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                            disabled={!homeCountry.name || !homeCity || (countries.length === 0 && cities.length === 0) || !startDate || !endDate || overallDuration < 1 || numberOfPeople < 1}
                        >
                            {isGeneratingSuggestions ? (
                                <span className="flex items-center justify-center">
                                    <Loader className="animate-spin mr-2" size={20} /> Generating Plan...
                                </span>
                            ) : (
                                'Generate Travel Plan'
                            )}
                        </button>
                    </div>

                    {/* Travel Plan Summary */}
                    <TravelPlanSummary />
                </div>
            </div>
        </TripContext.Provider>
    );
};

export default App;
