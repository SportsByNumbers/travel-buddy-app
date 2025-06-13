// src/components/FoodAllowanceSection.jsx
import React, { useContext } from 'react';
import { Utensils } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import { safeRender } from '../utils/safeRender.js'; // Ensure safeRender is imported

const FoodAllowanceSection = () => {
    const {
        breakfastAllowance, setBreakfastAllowance,
        lunchAllowance, setLunchAllowance,
        dinnerAllowance, setDinnerAllowance,
        snacksAllowance, setSnacksAllowance,
        currency
    } = useContext(TripContext);

    // --- NEW DEBUG LOGS HERE ---
    console.log('FoodAllowanceSection RENDER: breakfastAllowance:', breakfastAllowance, 'currency:', currency);
    // --- END NEW DEBUG LOGS ---

    return (
        <SectionWrapper title="Food Allowance" icon={Utensils}>
            <p className="text-gray-700 mb-4">Estimate your daily food budget per person ({safeRender(currency)}).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <InputField
                    id="breakfastAllowance"
                    label={`Breakfast (${currency})`} // Dynamic currency
                    type="number"
                    value={breakfastAllowance}
                    onChange={(e) => setBreakfastAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 15"
                    min="0"
                />
                <InputField
                    id="lunchAllowance"
                    label={`Lunch (${currency})`} // Dynamic currency
                    type="number"
                    value={lunchAllowance}
                    onChange={(e) => setLunchAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 20"
                    min="0"
                />
                <InputField
                    id="dinnerAllowance"
                    label={`Dinner (${currency})`} // Dynamic currency
                    type="number"
                    value={dinnerAllowance}
                    onChange={(e) => setDinnerAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 30"
                    min="0"
                />
                <InputField
                    id="snacksAllowance"
                    label={`Snacks & Drinks (${currency})`} // Dynamic currency
                    type="number"
                    value={snacksAllowance}
                    onChange={(e) => setSnacksAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 10"
                    min="0"
                />
            </div>
        </SectionWrapper>
    );
};

export default FoodAllowanceSection;
