// src/components/FoodAllowanceSection.jsx
import React, { useContext } from 'react';
import { Utensils } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';

const FoodAllowanceSection = () => {
    const {
        breakfastAllowance, setBreakfastAllowance,
        lunchAllowance, setLunchAllowance,
        dinnerAllowance, setDinnerAllowance,
        snacksAllowance, setSnacksAllowance,
        currency
    } = useContext(TripContext);

    return (
        <SectionWrapper title="Food Allowance" icon={Utensils}>
            <p className="text-gray-700 mb-4">Estimate your daily food budget per person ({currency}).</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <InputField
                    id="breakfastAllowance"
                    label="Breakfast" // Removed (USD)
                    type="number"
                    value={breakfastAllowance}
                    onChange={(e) => setBreakfastAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 15"
                    min="0"
                />
                <InputField
                    id="lunchAllowance"
                    label="Lunch" // Removed (USD)
                    type="number"
                    value={lunchAllowance}
                    onChange={(e) => setLunchAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 20"
                    min="0"
                />
                <InputField
                    id="dinnerAllowance"
                    label="Dinner" // Removed (USD)
                    type="number"
                    value={dinnerAllowance}
                    onChange={(e) => setDinnerAllowance(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 30"
                    min="0"
                />
                <InputField
                    id="snacksAllowance"
                    label="Snacks & Drinks" // Removed (USD)
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
