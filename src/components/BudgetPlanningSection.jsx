// components/BudgetPlanningSection.jsx
import React, { useContext } from 'react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import { PlusCircle } /* Removed XCircle from here as it's unused in this version */ from 'lucide-react';

// PartyDetailsDisplay is NOT USED in this extreme debugging test, so no import needed
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
        travelingParties, setTravelingParties,
        numberOfPeople,
        numberOfAdultsError,
        numberOfChildrenError,
    } = useContext(TripContext);

    // Removed handlePartyChange and removeParty functions temporarily
    // as they are unused in the JSX for this debugging step.
    // We will re-add them when PartyDetailsDisplay is re-integrated.

    // Handler to add a new party (still used by the Add Another Group button)
    const addParty = () => {
        const newId = travelingParties.length > 0 ? Math.max(...travelingParties.map(p => p.id)) + 1 : 1;
        setTravelingParties(prevParties => [
            ...prevParties,
            { id: newId, name: `Group ${newId}`, adults: 0, children: 0 }
        ]);
    };

    // CRITICAL DEBUGGING LOGS FOR BudgetPlanningSection.jsx
    console.log('BudgetPlanningSection - Received travelingParties:', travelingParties, 'Type:', typeof travelingParties, 'IsArray:', Array.isArray(travelingParties));
    if (Array.isArray(travelingParties)) {
        travelingParties.forEach((party, index) => {
            console.log(`BudgetPlanningSection - Party ${index}:`, party, 'Type:', typeof party);
            console.log(`BudgetPlanningSection - Party ${index} details: ID=${party.id} Name=${party.name} Adults=${party.adults} Children=${party.children}`);
        });
    }


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

            {/* EXTREME DEBUGGING RENDER: Stringify the whole array and individual items */}
            <div className="space-y-4">
                <p>Debugging travelingParties Array (JSON.stringify):</p>
                <pre>{JSON.stringify(travelingParties, null, 2)}</pre> {/* Render the whole array as string */}

                {/* Only map if it's explicitly an array, then stringify each item */}
                {Array.isArray(travelingParties) ? (
                    travelingParties.map((party, index) => (
                        <div key={String(party.id || `_idx_${index}`)} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                            <p>Debugging Party Item {index}:</p>
                            <pre>{JSON.stringify(party, null, 2)}</pre> {/* Render each item as string */}
                            {/* No inputs, no buttons in this extreme test */}
                        </div>
                    ))
                ) : (
                    <p className="text-red-500">travelingParties is NOT an array! Type: {typeof travelingParties}</p>
                )}
            </div>

            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={addParty}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                >
                    <PlusCircle size={16} className="mr-1" /> Add Another Group
                </button>
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
