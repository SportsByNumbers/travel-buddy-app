// components/BudgetPlanningSection.jsx
import React, { useContext, useState } from 'react'; // Added useState
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import { PlusCircle } from 'lucide-react'; // PlusCircle is still used here

// PartyDetailsDisplay is NOT USED in this version
// import PartyDetailsDisplay from './PartyDetailsDisplay.jsx';

const BudgetPlanningSection = () => {
    const {
        currency, setCurrency,
        moneyAvailable, setMoneyAvailable,
        moneySaved, setMoneySaved,
        contingencyPercentage, setContingencyPercentage,
        estimatedFlightCost, setEstimatedFlightCost,
        estimatedHotelCost, setEstimatedHotelCost,
        estimatedActivityCost, setEstimatedActivityCost,
        estimatedMiscellaneousCost, setEstimatedMiscellaneousCost,
        estimatedTransportCost, setEstimatedTransportCost,
        isPerPerson, setIsPerPerson,
        // Removed travelingParties, setTravelingParties from destructuring here
        numberOfPeople, // This is derived from App.js's (simplified) travelingParties
        numberOfAdultsError, // These are still passed from App.js, but now for general validation
        numberOfChildrenError, // These are still passed from App.js, but now for general validation
        // Access setTravelingParties directly from useContext below when updating
    } = useContext(TripContext);

    // Local states for the fixed Adults/Children inputs
    const [localAdults, setLocalAdults] = useState(useContext(TripContext).travelingParties[0]?.adults || 1);
    const [localChildren, setLocalChildren] = useState(useContext(TripContext).travelingParties[0]?.children || 0);

    // This function will update the main App.js state
    const updateAppTravelingParties = useCallback((adults, children) => {
        useContext(TripContext).setTravelingParties([{ id: 1, name: 'Main Group', adults: adults, children: children }]);
    }, []); // No dependencies as it directly uses context setter

    // Sync local state with global state on initial render and subsequent changes if needed
    useEffect(() => {
        setLocalAdults(useContext(TripContext).travelingParties[0]?.adults || 1);
        setLocalChildren(useContext(TripContext).travelingParties[0]?.children || 0);
    }, [useContext(TripContext).travelingParties]); // Re-sync if App.js's state changes

    // No handlePartyChange or removeParty needed for this simplified UI
    // No addParty button (for dynamic groups) in this simplified UI

    // Debugging logs (these should now run without errors if the root is the map rendering)
    console.log('BudgetPlanningSection (render) - Received travelingParties (for debug):', useContext(TripContext).travelingParties, 'Type:', typeof useContext(TripContext).travelingParties, 'IsArray:', Array.isArray(useContext(TripContext).travelingParties));


    return (
        <SectionWrapper
            icon={<span className="text-xl">💰</span>}
            title="Budget Planning"
            description="Plan your trip's finances. Estimate costs and track savings."
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="USD">USD ($) - US Dollar</option>
                        <option value="EUR">EUR (€) - Euro</option>
                        <option value="GBP">GBP (£) - British Pound</option>
                        <option value="JPY">JPY (¥) - Japanese Yen</option>
                        <option value="AUD">AUD ($) - Australian Dollar</option>
                        <option value="CAD">CAD ($) - Canadian Dollar</option>
                        {/* Add more currencies as needed */}
                    </select>
                </div>

                <InputField
                    label="Money Available for Trip"
                    type="number"
                    value={moneyAvailable}
                    onChange={(e) => setMoneyAvailable(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 5000"
                />
                <InputField
                    label="Money Already Saved"
                    type="number"
                    value={moneySaved}
                    onChange={(e) => setMoneySaved(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 1000"
                />
                <InputField
                    label="Contingency Percentage (%)"
                    type="number"
                    value={contingencyPercentage}
                    onChange={(e) => setContingencyPercentage(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 10"
                    min="0"
                    max="100"
                />
            </div>

            <h3 className="text-lg font-semibold text-indigo-800 mt-8 mb-4">Travel Party Details</h3>
            <div className="mb-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600"
                        checked={isPerPerson}
                        onChange={(e) => setIsPerPerson(e.target.checked)}
                    />
                    <span className="ml-2 text-gray-700">Apply costs per person</span>
                </label>
            </div>

            {/* Display overall validation error messages */}
            {numberOfAdultsError && <p className="mt-1 text-sm text-red-600">{numberOfAdultsError}</p>}
            {numberOfChildrenError && <p className="mt-1 text-sm text-red-600">{numberOfChildrenError}</p>}

            {/* NEW: Fixed inputs for Adults/Children and Debug Message */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md mb-6">
                <p className="font-semibold mb-2">Note: Multi-party breakdown temporarily disabled.</p>
                <p className="text-sm">Please use the total number of adults and children for now. We are resolving a technical issue with dynamic party rendering.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                    label="Total Adults"
                    type="number"
                    value={localAdults}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setLocalAdults(val);
                        updateAppTravelingParties(val, localChildren); // Update App.js state
                    }}
                    placeholder="e.g., 2"
                    min="1"
                />
                <InputField
                    label="Total Children"
                    type="number"
                    value={localChildren}
                    onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setLocalChildren(val);
                        updateAppTravelingParties(localAdults, val); // Update App.js state
                    }}
                    placeholder="e.g., 1"
                    min="0"
                />
            </div>

            <div className="mt-4 flex justify-end items-center">
                {/* No addParty button needed anymore */}
                <p className="text-md font-semibold text-gray-800">
                    Total Travelers: <span className="text-indigo-600 text-lg">{numberOfPeople}</span>
                </p>
            </div>

            <h3 className="text-lg font-semibold text-indigo-800 mt-8 mb-4">Estimated Costs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    label="Estimated Flight Cost"
                    type="number"
                    value={estimatedFlightCost}
                    onChange={(e) => setEstimatedFlightCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 800"
                />
                <InputField
                    label="Estimated Hotel/Accommodation Cost"
                    type="number"
                    value={estimatedHotelCost}
                    onChange={(e) => setEstimatedHotelCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 1500"
                />
                <InputField
                    label="Estimated Activity & Sightseeing Cost"
                    type="number"
                    value={estimatedActivityCost}
                    onChange={(e) => setEstimatedActivityCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 500"
                />
                <InputField
                    label="Estimated Miscellaneous Cost (shopping, souvenirs, etc.)"
                    type="number"
                    value={estimatedMiscellaneousCost}
                    onChange={(e) => setEstimatedMiscellaneousCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 300"
                />
                <InputField
                    label="Estimated Transport Cost (AI generated, if applicable)"
                    type="number"
                    value={estimatedTransportCost}
                    onChange={(e) => setEstimatedTransportCost(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 200"
                />
            </div>
        </SectionWrapper>
    );
};

export default BudgetPlanningSection;
