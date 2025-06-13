// src/components/TripDatesSection.jsx
import React, { useContext } from 'react';
import { Calendar } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import { safeRender } from '../utils/safeRender.js'; 

const TripDatesSection = () => {
    const { startDate, setStartDate, endDate, setEndDate, overallDuration, dateError, setDateError } = useContext(TripContext);

    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        setStartDate(selectedDate ? new Date(selectedDate) : null);
        setDateError('');
    };

    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        setEndDate(selectedDate ? new Date(selectedDate) : null);
        setDateError('');
    };

    const formatToDateInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <SectionWrapper title="Trip Dates" icon={Calendar}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="startDate"
                    label="Start Date"
                    type="date"
                    value={formatToDateInput(startDate)}
                    onChange={handleStartDateChange}
                    error={dateError}
                    required
                />
                <InputField
                    id="endDate"
                    label="End Date"
                    type="date"
                    value={formatToDateInput(endDate)}
                    onChange={handleEndDateChange}
                    min={formatToDateInput(startDate)}
                    error={dateError}
                    required
                />
            </div>
            {overallDuration > 0 && !dateError && (
                <p className="mt-4 text-center text-lg font-semibold text-gray-700">
                    Your trip duration: {safeRender(overallDuration)} days
                </p>
            )}
        </SectionWrapper>
    );
};

export default TripDatesSection;
