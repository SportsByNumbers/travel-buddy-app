// components/BudgetPlanningSection.jsx
import React, { useContext } from 'react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import { PlusCircle, XCircle } from 'lucide-react';

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

    // Handler to update a specific party's details - now used in JSX again
    const handlePartyChange = (id, field, value) => {
        setTravelingParties(prevParties =>
            prevParties.map(party =>
                party.id === id ? { ...party, [field]: value } : party
            )
        );
    };

    // Handler to add a new party
    const addParty = () => {
        const newId = travelingParties.length > 0 ? Math.max(...travelingParties.map(p => p.id)) + 1 : 1;
        setTravelingParties(prevParties => [
            ...prevParties,
            { id: newId, name: `Group ${newId}`, adults: 0, children: 0 }
        ]);
    };

    // Handler to remove a party - now used in JSX again
    const removeParty = (idToRemove) => {
        setTravelingParties(prevParties => prevParties.filter(party => party.id !== idToRemove));
    };

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

            <div className="space-y-4">
                {travelingParties.map(party => (
                    <div key={party.id} className="p-4 border border-gray-200 rounded-md bg-gray-50 flex items-center gap-4">
                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            {/* UNCOMMENT ALL THREE InputFields here */}
                            <InputField
                                label={`Group Name`}
                                type="text"
                                value={party.name}
                                onChange={(e) => handlePartyChange(party.id, 'name', e.target.value)}
                                placeholder={`e.g., Family A`}
                            />
                            <InputField
                                label={`Adults (${party.name})`}
                                type="number"
                                value={party.adults}
                                onChange={(e) => handlePartyChange(party.id, 'adults', parseInt(e.target.value) || 0)}
                                min="0"
                            />
                            <InputField
                                label={`Children (${party.name})`}
                                type="number"
                                value={party.children}
                                onChange={(e) => handlePartyChange(party.id, 'children', parseInt(e.target.value) || 0)}
                                min="0"
                            />
                        </div>
                        {travelingParties.length > 1 && ( // Only show remove button if there's more than one group
                            <button
                                onClick={() => removeParty(party.id)}
                                className="p-2 text-red-500 hover:text-red-700 transition-colors duration-200"
                                title="Remove group"
                            >
                                <XCircle size={20} />
                            </button>
                        )}
                    </div>
                ))}
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
