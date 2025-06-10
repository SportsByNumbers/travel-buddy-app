// src/components/TravelPlanSummary.jsx
import React, { useContext } from 'react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import { FileText } from 'lucide-react';

const TravelPlanSummary = () => {
    const { travelPlanSummary, getFormattedCurrency, currentTripId } = useContext(TripContext);

    if (!travelPlanSummary) {
        return (
            <SectionWrapper title="Travel Plan Summary" icon={FileText} className="mt-12 print:hidden">
                {currentTripId ? (
                    <p className="text-center text-gray-600 text-lg py-10">Generate your travel plan to see the summary here.</p>
                ) : (
                    <p className="text-center text-gray-600 text-lg py-10">Start planning your trip to generate a summary.</p>
                )}
            </SectionWrapper>
        );
    }

    // Helper to calculate variance
    const calculateVariance = (estimated, actual) => {
        const est = parseFloat(estimated) || 0;
        const act = parseFloat(actual) || 0;
        return act - est;
    };

    // Helper to format variance
    const formatVariance = (variance) => {
        const formatted = getFormattedCurrency(Math.abs(variance));
        if (variance > 0) return `(+${formatted} over budget)`;
        if (variance < 0) return `(-${formatted} under budget)`;
        return `(${formatted} on budget)`;
    };

    const renderCostRow = (label, estimated, actual) => {
        const variance = calculateVariance(estimated, actual);
        return (
            <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-700 font-medium">{label}:</span>
                <div className="flex flex-col items-end">
                    <span className="text-gray-900">{getFormattedCurrency(estimated)} (Est.)</span>
                    {actual !== undefined && (
                        <span className={`text-sm ${variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {getFormattedCurrency(actual)} (Actual) {formatVariance(variance)}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Defensive handling for potentially missing/non-array properties
    const cities = Array.isArray(travelPlanSummary.cities) ? travelPlanSummary.cities : [];
    const countries = Array.isArray(travelPlanSummary.countries) ? travelPlanSummary.countries : [];
    const topicsOfInterest = Array.isArray(travelPlanSummary.topicsOfInterest) ? travelPlanSummary.topicsOfInterest : [];
    const hotelAmenities = Array.isArray(travelPlanSummary.hotelAmenities) ? travelPlanSummary.hotelAmenities : [];


    return (
        <SectionWrapper title="Travel Plan Summary" icon={FileText} className="mt-12">
            <div id="travel-plan-summary" className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
                <h3 className="text-2xl font-bold text-indigo-800 mb-4 pb-2 border-b-2 border-indigo-200">Trip Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-6">
                    <p><strong className="font-semibold">Home:</strong> {travelPlanSummary.homeCity || 'N/A'}, {travelPlanSummary.homeCountry?.name || 'N/A'}</p>
                    <p><strong className="font-semibold">Destinations:</strong>
                        {(cities.map(c => c.name).join(', ') || countries.map(c => c.name).join(', ')) || 'N/A'}
                    </p>
                    <p><strong className="font-semibold">Dates:</strong> {travelPlanSummary.startDate || 'N/A'} - {travelPlanSummary.endDate || 'N/A'} ({travelPlanSummary.overallDuration || 0} days)</p>
                    <p><strong className="font-semibold">Travelers:</strong> {travelPlanSummary.numberOfAdults || 0} Adults, {travelPlanSummary.numberOfChildren || 0} Children (Total: {travelPlanSummary.numberOfPeople || 0})</p>
                    <p><strong className="font-semibold">Travel Style:</strong> {travelPlanSummary.travelStyle || 'Not specified'}</p>
                    <p><strong className="font-semibold">Hotel Rating:</strong> {travelPlanSummary.starRating || 'Any'}</p>
                    <p><strong className="font-semibold">Topics:</strong> {topicsOfInterest.join(', ') || 'None'}</p>
                    <p><strong className="font-semibold">Hotel Amenities:</strong> {hotelAmenities.join(', ') || 'None'}</p>
                </div>

                {cities.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-xl font-bold text-indigo-700 mb-3 pb-1 border-b border-indigo-100">City Breakdown</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {cities.map((city, index) => (
                                <div key={index} className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                                    <p className="font-semibold text-indigo-800">{city.name} ({city.duration} days)</p>
                                    {city.starRating && <p className="text-sm text-gray-600">Hotel: {city.starRating} Star</p>}
                                    {(Array.isArray(city.topics) && city.topics.length > 0) && <p className="text-sm text-gray-600">Topics: {city.topics.join(', ')}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h3 className="text-2xl font-bold text-indigo-800 mb-4 pb-2 border-b-2 border-indigo-200">Budget Summary ({travelPlanSummary.currency || 'USD'})</h3>
                <div className="space-y-3 mb-6">
                    {renderCostRow("Flights", travelPlanSummary.estimatedFlightCost, travelPlanSummary.actualFlightCost)}
                    {renderCostRow("Hotels", travelPlanSummary.estimatedHotelCost, travelPlanSummary.actualHotelCost)}
                    {renderCostRow("Activities", travelPlanSummary.estimatedActivityCost, travelPlanSummary.actualActivityCost)}
                    {renderCostRow("Food", travelPlanSummary.totalFoodCost, travelPlanSummary.actualFoodCost)}
                    {renderCostRow("Transport", travelPlanSummary.combinedEstimatedTransportCost, travelPlanSummary.actualTransportCost)}
                    {renderCostRow("Miscellaneous", travelPlanSummary.estimatedMiscellaneousCost, travelPlanSummary.actualMiscellaneousCost)}
                </div>

                <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-4 border-t-2 border-gray-300">
                    <span>Total Estimated Cost (inc. contingency):</span>
                    <span className="text-indigo-700">{getFormattedCurrency(travelPlanSummary.grandTotalEstimated)}</span>
                </div>
                   <div className="flex justify-between items-center text-lg font-bold text-gray-900 pt-2 pb-4">
                    <span>Total Actual Cost:</span>
                    <span className="text-indigo-700">{getFormattedCurrency(travelPlanSummary.actualGrandTotal)}</span>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg shadow-inner">
                    <p className="flex justify-between font-bold text-blue-800 text-lg">
                        <span>Money Available:</span>
                        <span>{getFormattedCurrency(travelPlanSummary.moneyAvailable)}</span>
                    </p>
                    <p className="flex justify-between font-bold text-blue-800 text-lg">
                        <span>Money Saved:</span>
                        <span>{getFormattedCurrency(travelPlanSummary.moneySaved)}</span>
                    </p>
                    <p className="flex justify-between font-bold text-blue-800 text-lg">
                        <span>Contingency ({travelPlanSummary.contingencyPercentage || 0}%):</span>
                        <span>{getFormattedCurrency(travelPlanSummary.contingencyAmount)}</span>
                    </p>
                    <p className={`flex justify-between font-bold text-xl mt-4 pt-4 border-t border-blue-200 ${travelPlanSummary.remainingBudgetActual >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        <span>Remaining Budget (Actual):</span>
                        <span>{getFormattedCurrency(travelPlanSummary.remainingBudgetActual)}</span>
                    </p>
                       <p className={`flex justify-between font-bold text-lg ${travelPlanSummary.remainingBudgetEstimated >= 0 ? 'text-green-700' : 'text-red-700'} `}>
                        <span>Remaining Budget (Estimated):</span>
                        <span>{getFormattedCurrency(travelPlanSummary.remainingBudgetEstimated)}</span>
                    </p>
                </div>

                <h3 className="text-2xl font-bold text-indigo-800 mt-8 mb-4 pb-2 border-b-2 border-indigo-200">Planned Activities & More</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    {travelPlanSummary.activities && <p><strong className="font-semibold">Activities:</strong> {travelPlanSummary.activities || 'N/A'}</p>}
                    {travelPlanSummary.foodLocations && <p><strong className="font-semibold">Food Locations:</strong> {travelPlanSummary.foodLocations || 'N/A'}</p>}
                    {travelPlanSummary.themeParks && <p><strong className="font-semibold">Theme Parks:</strong> {travelPlanSummary.themeParks || 'N/A'}</p>}
                    {travelPlanSummary.touristSpots && <p><strong className="font-semibold">Tourist Spots:</strong> {travelPlanSummary.touristSpots || 'N/A'}</p>}
                    {travelPlanSummary.tours && <p><strong className="font-semibold">Tours:</strong> {travelPlanSummary.tours || 'N/A'}</p>}
                    {travelPlanSummary.sportingEvents && <p><strong className="font-semibold">Sporting Events:</strong> {travelPlanSummary.sportingEvents || 'N/A'}</p>}

                    <div className="col-span-full mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-bold text-indigo-700 mb-2">Daily Food Allowances:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            <li>Breakfast: {getFormattedCurrency(travelPlanSummary.breakfastAllowance)}</li>
                            <li>Lunch: {getFormattedCurrency(travelPlanSummary.lunchAllowance)}</li>
                            <li>Dinner: {getFormattedCurrency(travelPlanSummary.dinnerAllowance)}</li>
                            <li>Snacks: {getFormattedCurrency(travelPlanSummary.snacksAllowance)}</li>
                            <li className="font-semibold mt-2">Total Daily Food Allowance: {getFormattedCurrency(travelPlanSummary.totalDailyFoodAllowance)}</li>
                        </ul>
                    </div>

                    <div className="col-span-full mt-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <h4 className="font-bold text-indigo-700 mb-2">Transport Options:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                            {travelPlanSummary.carRental && <li>Car Rental (Cost: {getFormattedCurrency(travelPlanSummary.carRentalCost)})</li>}
                            {travelPlanSummary.shuttle && <li>Shuttle (Cost: {getFormattedCurrency(travelPlanSummary.shuttleCost)})</li>}
                            {travelPlanSummary.airportTransfers && <li>Airport Transfers (Cost: {getFormattedCurrency(travelPlanSummary.airportTransfersCost)})</li>}
                            {travelPlanSummary.airportParking && <li>Airport Parking (Cost: {getFormattedCurrency(travelPlanSummary.airportParkingCost)})</li>}
                            {travelPlanSummary.estimatedInterCityFlightCost > 0 && <li>Inter-city Flights (Estimated: {getFormattedCurrency(travelPlanSummary.estimatedInterCityFlightCost)})</li>}
                            {travelPlanSummary.estimatedInterCityTrainCost > 0 && <li>Inter-city Train (Estimated: {getFormattedCurrency(travelPlanSummary.estimatedInterCityTrainCost)})</li>}
                            {travelPlanSummary.estimatedInterCityBusCost > 0 && <li>Inter-city Bus (Estimated: {getFormattedCurrency(travelPlanSummary.estimatedInterCityBusCost)})</li>}
                            {travelPlanSummary.localPublicTransport && <li>Local Public Transport (Daily Allowance: {getFormattedCurrency(travelPlanSummary.dailyLocalTransportAllowance)})</li>}
                            {travelPlanSummary.taxiRideShare && <li>Taxi/Ride-Share (Daily Allowance: {getFormattedCurrency(travelPlanSummary.dailyLocalTransportAllowance)})</li>}
                            {travelPlanSummary.walking && <li>Walking</li>}
                            {!travelPlanSummary.carRental && !travelPlanSummary.shuttle && !travelPlanSummary.airportTransfers && !travelPlanSummary.airportParking &&
                             travelPlanSummary.estimatedInterCityFlightCost === 0 && travelPlanSummary.estimatedInterCityTrainCost === 0 && travelPlanSummary.estimatedInterCityBusCost === 0 &&
                             !travelPlanSummary.localPublicTransport && !travelPlanSummary.taxiRideShare && !travelPlanSummary.walking && <li>No specific transport options selected.</li>}
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md"
                    >
                        Print Plan
                    </button>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default TravelPlanSummary;
