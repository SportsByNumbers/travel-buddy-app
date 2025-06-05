import React, { useContext } from 'react';
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import InputField from './InputField';
import { DollarSign } from 'lucide-react';

const BudgetPlanningSection = () => {
    const {
        isPerPerson, setIsPerPerson,
        numberOfAdults, setNumberOfAdults, numberOfChildren, setNumberOfChildren, // New states
        numberOfAdultsError, setNumberOfAdultsError, numberOfChildrenError, setNumberOfChildrenError, // New error states
        currency, setCurrency,
        moneyAvailable, setMoneyAvailable,
        moneySaved, setMoneySaved,
        contingencyPercentage, setContingencyPercentage,
        estimatedFlightCost, setEstimatedFlightCost,
        estimatedHotelCost, setEstimatedHotelCost,
        estimatedActivityCost, setEstimatedActivityCost,
        estimatedMiscellaneousCost, setEstimatedMiscellaneousCost,
    } = useContext(TripContext);

    const handleAdultsChange = (e) => {
        const value = parseInt(e.target.value);
        setNumberOfAdults(value < 1 ? 1 : value); // Ensure at least 1 adult
        setNumberOfAdultsError(''); // Clear error on change
    };

    const handleChildrenChange = (e) => {
        const value = parseInt(e.target.value);
        setNumberOfChildren(value < 0 ? 0 : value); // Ensure non-negative children
        setNumberOfChildrenError(''); // Clear error on change
    };

    return (
        <SectionWrapper title="Budget Planning" icon={DollarSign}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Party Size Inputs */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Party Size</h3>
                    <div className="flex items-center mb-3">
                        <input
                            type="checkbox"
                            id="isPerPerson"
                            checked={isPerPerson}
                            onChange={(e) => setIsPerPerson(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="isPerPerson" className="ml-2 block text-sm text-gray-900">
                            Costs are per person
                        </label>
                    </div>
                    <InputField
                        id="numberOfAdults"
                        label="Adults (18+)"
                        type="number"
                        value={numberOfAdults}
                        onChange={handleAdultsChange}
                        placeholder="e.g., 2"
                        min="1"
                        error={numberOfAdultsError}
                        required
                    />
                    <InputField
                        id="numberOfChildren"
                        label="Children (Under 17)"
                        type="number"
                        value={numberOfChildren}
                        onChange={handleChildrenChange}
                        placeholder="e.g., 1"
                        min="0"
                        error={numberOfChildrenError}
                        required
                    />
                </div>

                {/* Currency and Available Money */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Funds</h3>
                    <InputField
                        id="currency"
                        label="Currency"
                        type="select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        options={[
                            { value: 'USD', label: 'USD - United States Dollar' },
                            { value: 'EUR', label: 'EUR - Euro' },
                            { value: 'GBP', label: 'GBP - British Pound' },
                            { value: 'JPY', label: 'JPY - Japanese Yen' },
                            { value: 'AUD', label: 'AUD - Australian Dollar' },
                            { value: 'CAD', label: 'CAD - Canadian Dollar' },
                        ]}
                    />
                    <InputField
                        id="moneyAvailable"
                        label="Money Available"
                        type="number"
                        value={moneyAvailable}
                        onChange={(e) => setMoneyAvailable(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 5000"
                        min="0"
                    />
                    <InputField
                        id="moneySaved"
                        label="Money Already Saved"
                        type="number"
                        value={moneySaved}
                        onChange={(e) => setMoneySaved(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 1000"
                        min="0"
                    />
                    <InputField
                        id="contingencyPercentage"
                        label="Contingency (%)"
                        type="number"
                        value={contingencyPercentage}
                        onChange={(e) => setContingencyPercentage(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 10"
                        min="0"
                        max="100"
                    />
                </div>
            </div>

            {/* Estimated Major Costs */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Estimated Major Costs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        id="estimatedFlightCost"
                        label="Flight Cost"
                        type="number"
                        value={estimatedFlightCost}
                        onChange={(e) => setEstimatedFlightCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 800"
                        min="0"
                    />
                    <InputField
                        id="estimatedHotelCost"
                        label="Hotel Cost"
                        type="number"
                        value={estimatedHotelCost}
                        onChange={(e) => setEstimatedHotelCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 1200"
                        min="0"
                    />
                    <InputField
                        id="estimatedActivityCost"
                        label="Activities Cost"
                        type="number"
                        value={estimatedActivityCost}
                        onChange={(e) => setEstimatedActivityCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 300"
                        min="0"
                    />
                    <InputField
                        id="estimatedMiscellaneousCost"
                        label="Miscellaneous Cost"
                        type="number"
                        value={estimatedMiscellaneousCost}
                        onChange={(e) => setEstimatedMiscellaneousCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 150"
                        min="0"
                    />
                </div>
            </div>
        </SectionWrapper>
    );
};

export default BudgetPlanningSection;
