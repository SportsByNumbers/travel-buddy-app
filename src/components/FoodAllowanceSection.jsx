import React, { useContext } from 'react';
import { Utensils } from 'lucide-react';
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import InputField from './InputField';

const FoodAllowanceSection = () => {
    const { breakfastAllowance, setBreakfastAllowance, lunchAllowance, setLunchAllowance, dinnerAllowance, setDinnerAllowance, snacksAllowance, setSnacksAllowance, actualFoodCost, setActualFoodCost, getFormattedCurrency } = useContext(TripContext);

    return (
        <SectionWrapper title={`Daily Food Allowances (Per Person, ${getFormattedCurrency(0).charAt(0)})`} icon={Utensils}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Breakfast" id="breakfastAllowance" type="number" value={breakfastAllowance} onChange={(e) => setBreakfastAllowance(parseFloat(e.target.value) || 0)} min="0" />
                <InputField label="Lunch" id="lunchAllowance" type="number" value={lunchAllowance} onChange={(e) => setLunchAllowance(parseFloat(e.target.value) || 0)} min="0" />
                <InputField label="Dinner" id="dinnerAllowance" type="number" value={dinnerAllowance} onChange={(e) => setDinnerAllowance(parseFloat(e.target.value) || 0)} min="0" />
                <InputField label="Snacks" id="snacksAllowance" type="number" value={snacksAllowance} onChange={(e) => setSnacksAllowance(parseFloat(e.target.value) || 0)} min="0" />
                <div className="md:col-span-2">
                    <InputField label={`Actual Total Food Cost (${getFormattedCurrency(0).charAt(0)})`} id="actualFoodCost" type="number" value={actualFoodCost} onChange={(e) => setActualFoodCost(parseFloat(e.target.value) || 0)} min="0" />
                </div>
            </div>
        </SectionWrapper>
    );
};

export default FoodAllowanceSection;
