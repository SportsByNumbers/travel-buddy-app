import React, { useContext } from 'react';
import { Calendar } from 'lucide-react';
import { TripContext } from '../App.jsx';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';

const TripDatesSection = () => {
    const { startDate, setStartDate, endDate, setEndDate, overallDuration, dateError, setDateError } = useContext(TripContext);

    const handleStartDateChange = (e) => {
        const selectedDate = e.target.value;
        setStartDate(selectedDate ? new Date(selectedDate) : null);
        setDateError(''); // Clear error on change
    };

    const handleEndDateChange = (e) => {
        const selectedDate = e.target.value;
        setEndDate(selectedDate ? new Date(selectedDate) : null);
        setDateError(''); // Clear error on change
    };

    // Format Date objects to YYYY-MM-DD string for input fields
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
                    min={formatToDateInput(startDate)} // End date cannot be before start date
                    error={dateError}
                    required
                />
            </div>
            {overallDuration > 0 && !dateError && (
                <p className="mt-4 text-center text-lg font-semibold text-gray-700">
                    Your trip duration: {overallDuration} days
                </p>
            )}
        </SectionWrapper>
    );
};

export default TripDatesSection;
