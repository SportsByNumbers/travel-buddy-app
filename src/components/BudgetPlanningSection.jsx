import React, { useContext } from 'react';
import { Wallet, Info, Loader } from 'lucide-react'; // Info and Loader are now used
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import InputField from './InputField';
import CostInput from './CostInput';
import { fetchAI } from '../services/apiService';

const BudgetPlanningSection = () => {
    const { isPerPerson, setIsPerPerson, numberOfPeople, setNumberOfPeople, numberOfPeopleError, setNumberOfPeopleError, currency, setCurrency, moneyAvailable, setMoneyAvailable, moneySaved, setMoneySaved, contingencyPercentage, setContingencyPercentage,
            estimatedFlightCost, setEstimatedFlightCost, actualFlightCost, setActualFlightCost,
            estimatedHotelCost, setEstimatedHotelCost, actualHotelCost, setActualHotelCost,
            estimatedActivityCost, setEstimatedActivityCost, actualActivityCost, setActualActivityCost,
            estimatedMiscellaneousCost, setEstimatedMiscellaneousCost, actualMiscellaneousCost, setActualMiscellaneousCost,
            estimatedTransportCost, setEstimatedTransportCost, // Keep these as they are used
            actualTransportCost, setActualTransportCost, // Keep these as they are used
            countries, cities, overallDuration, homeCountry, homeCity,
            selectedSuggestedActivities, selectedSuggestedFoodLocations, selectedSuggestedThemeParks,
            selectedSuggestedTouristSpots, selectedSuggestedTours, selectedSuggestedSportingEvents,
            starRating, travelStyle, hotelAmenities, setDateError, // setDateError is used for validation feedback
            setBreakfastAllowance, setLunchAllowance, setDinnerAllowance, setSnacksAllowance,
            isGeneratingBudget, setIsGeneratingBudget, budgetError, setBudgetError,
            carRental, shuttle, airportTransfers, airportParking, localPublicTransport, taxiRideShare, walking,
    } = useContext(TripContext);

    const { getFormattedCurrency } = useContext(TripContext);

    const buttonClass = "px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";


    const generateBudgetEstimates = async () => {
        // Initial validation check
        let hasError = false;
        if (countries.length === 0 && cities.length === 0) {
          setBudgetError("Please specify destination countries/cities.");
          hasError = true;
        } else {
          setBudgetError('');
        }
        if (overallDuration < 1) {
           setDateError("Please select valid start and end dates.");
           hasError = true;
        } else {
           setDateError('');
        }
        if (numberOfPeople < 1) {
          setNumberOfPeopleError("Number of people must be at least 1.");
          hasError = true;
        } else {
          setNumberOfPeopleError('');
        }
        if (hasError) return;


        setIsGeneratingBudget(true);
        setBudgetError('');

        const destinationPromptCountries = countries.length > 0 ? `${countries.map(c => c.name).join(' and ')}` : '';
        const destinationPromptCities = cities.length > 0 ? `(cities: ${cities.map(c => c.name).join(', ')})` : '';

        let destinationPrompt = '';
        if (destinationPromptCountries && destinationPromptCities) {
            destinationPrompt = `for a trip to ${destinationPromptCountries} ${destinationPromptCities}`;
        } else if (destinationPromptCountries) {
            destinationPrompt = `for a trip to ${destinationPromptCountries}`;
        } else if (destinationPromptCities) {
            destinationPrompt = `for a trip to ${destinationPromptCities}`;
        }

        const homeLocationPrompt = (homeCountry.name && homeCity)
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

        const transportOptions = [
            carRental ? 'car rental' : '',
            shuttle ? 'shuttle' : '',
            airportTransfers ? 'airport transfers' : '',
            airportParking ? 'airport parking' : '',
            localPublicTransport ? 'local public transport' : '',
            taxiRideShare ? 'taxis/ride-share' : '',
            walking ? 'walking' : ''
        ].filter(Boolean).join(', ');

        const hotelAmenitiesPrompt = hotelAmenities.length > 0 ? `with amenities like: ${hotelAmenities.join(', ')}` : '';

        const prompt = `Estimate the following costs in ${currency} for a ${overallDuration}-day trip ${destinationPrompt} ${homeLocationPrompt} for ${numberOfPeople} ${isPerPerson ? 'person' : 'party'}.
        Consider these itinerary items: ${itineraryPrompt || 'general sightseeing'}.
        Preferred overall hotel star rating: ${starRating || 'any'}. Individual city hotel star ratings if provided in city details.
        Travel style: ${travelStyle || 'standard'}. ${hotelAmenitiesPrompt}.
        Transport options: ${transportOptions || 'standard public transport'}.
        Provide the response as a JSON object with keys: "estimatedFlightCost", "estimatedHotelCost", "estimatedActivityCost", "estimatedTransportCost", "estimatedMiscellaneousCost", "breakfastAllowance", "lunchAllowance", "dinnerAllowance", "snacksAllowance". All values should be numbers.`;

        const budgetSchema = {
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
           propertyOrdering: [
             "estimatedFlightCost", "estimatedHotelCost", "estimatedActivityCost",
             "estimatedTransportCost", "estimatedMiscellaneousCost",
             "breakfastAllowance", "lunchAllowance", "dinnerAllowance", "snacksAllowance"
           ]
        };

        try {
            const parsedJson = await fetchAI(prompt, budgetSchema);

            setEstimatedFlightCost(parsedJson.estimatedFlightCost || 0);
            setEstimatedHotelCost(parsedJson.estimatedHotelCost || 0);
            setEstimatedActivityCost(parsedJson.estimatedActivityCost || 0);
            setEstimatedTransportCost(parsedJson.estimatedTransportCost || 0);
            setEstimatedMiscellaneousCost(parsedJson.estimatedMiscellaneousCost || 0);
            setBreakfastAllowance(parsedJson.breakfastAllowance || 0);
            setLunchAllowance(parsedJson.lunchAllowance || 0);
            setDinnerAllowance(parsedJson.dinnerAllowance || 0);
            setSnacksAllowance(parsedJson.snacksAllowance || 0);

        } catch (error) {
            console.error("Error generating budget estimates:", error);
            setBudgetError(error.message || "An error occurred while generating budget estimates.");
        } finally {
            setIsGeneratingBudget(false);
        }
    };

    return (
        <SectionWrapper title="Budget Planning" icon={Wallet} description="Generate AI-powered budget estimates based on your trip details, or manually enter your own. Track actual costs for comparison.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                    <InputField
                        label="Number of People"
                        id="numberOfPeople"
                        type="number"
                        value={numberOfPeople}
                        onChange={(e) => { setNumberOfPeople(Math.max(1, parseInt(e.target.value) || 1)); setNumberOfPeopleError(''); }}
                        min="1"
                        error={numberOfPeopleError}
                        required
                    />
                )}
                <InputField
                    type="select"
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    label="Currency"
                >
                    <option value="USD">USD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                </InputField>
                <InputField
                    label={`Money Available (${getFormattedCurrency(0).charAt(0)})`}
                    id="moneyAvailable"
                    type="number"
                    value={moneyAvailable}
                    onChange={(e) => setMoneyAvailable(parseFloat(e.target.value) || 0)}
                    min="0"
                />
                <InputField
                    label={`Money Saved (${getFormattedCurrency(0).charAt(0)})`}
                    id="moneySaved"
                    type="number"
                    value={moneySaved}
                    onChange={(e) => setMoneySaved(parseFloat(e.target.value) || 0)}
                    min="0"
                />
                <InputField
                    label="Contingency/Buffer (%)"
                    id="contingencyPercentage"
                    type="number"
                    value={contingencyPercentage}
                    onChange={(e) => setContingencyPercentage(parseFloat(e.target.value) || 0)}
                    min="0"
                    max="100"
                    icon={Info} // Used the Info icon here
                />
            </div>

            <div className="text-center mb-6">
                <button
                    onClick={generateBudgetEstimates}
                    className={buttonClass}
                    disabled={isGeneratingBudget || ((countries.length === 0 && cities.length === 0) || overallDuration < 1 || numberOfPeople < 1)}
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
                <CostInput label="Flight Cost" currencySymbol={getFormattedCurrency(0).charAt(0)}
                           estimated={estimatedFlightCost} setEstimated={setEstimatedFlightCost}
                           actual={actualFlightCost} setActual={setActualFlightCost} />
                <CostInput label="Hotel Cost" currencySymbol={getFormattedCurrency(0).charAt(0)}
                           estimated={estimatedHotelCost} setEstimated={setEstimatedHotelCost}
                           actual={actualHotelCost} setActual={setActualHotelCost} />
                <CostInput label="Activity Cost" currencySymbol={getFormattedCurrency(0).charAt(0)}
                           estimated={estimatedActivityCost} setEstimated={setEstimatedActivityCost}
                           actual={actualActivityCost} setActual={setActualActivityCost} />
                <CostInput label="Miscellaneous Cost" currencySymbol={getFormattedCurrency(0).charAt(0)}
                           estimated={estimatedMiscellaneousCost} setEstimated={setEstimatedMiscellaneousCost}
                           actual={actualMiscellaneousCost} setActual={setActualMiscellaneousCost} />

                {/* AI estimated total transport cost and its actual counterpart */}
                <CostInput label="Total Transport Cost (AI Est.)" currencySymbol={getFormattedCurrency(0).charAt(0)}
                           estimated={estimatedTransportCost} setEstimated={setEstimatedTransportCost}
                           actual={actualTransportCost} setActual={setActualTransportCost} />
            </div>
        </SectionWrapper>
    );
};

export default BudgetPlanningSection;
