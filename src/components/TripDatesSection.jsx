import React, { useContext } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';

const TripDatesSection = () => {
    const { startDate, setStartDate, endDate, setEndDate, dateError, setDateError, overallDuration } = useContext(TripContext);
    const inputClass = "p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out shadow-sm";
    const requiredLabelClass = "block text-sm font-medium text-gray-700 mb-1 after:content-['*'] after:ml-0.5 after:text-red-500";
    const errorClass = "text-red-500 text-xs mt-1";
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";


    const handleStartDateChange = (date) => {
        setStartDate(date);
        setDateError('');
        if (endDate && date && date > endDate) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        setDateError('');
    };

    return (
        <SectionWrapper title="Trip Dates & Duration" icon={CalendarDays}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label htmlFor="startDate" className={requiredLabelClass}>Overall Trip Start Date:</label>
                    <DatePicker
                        id="startDate"
                        selected={startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Select start date"
                        className={`${inputClass} w-full ${dateError ? 'border-red-500' : ''}`}
                    />
                </div>
                <div>
                    <label htmlFor="endDate" className={requiredLabelClass}>Overall Trip End Date:</label>
                    <DatePicker
                        id="endDate"
                        selected={endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="Select end date"
                        className={`${inputClass} w-full ${dateError ? 'border-red-500' : ''}`}
                    />
                </div>
                {dateError && <p className={`${errorClass} md:col-span-2`}>{dateError}</p>}
            </div>
            <div>
                <p className={labelClass}>Calculated Overall Duration:</p>
                <p className="text-xl font-semibold text-indigo-700">{overallDuration} days</p>
            </div>
        </SectionWrapper>
    );
};

export default TripDatesSection;
