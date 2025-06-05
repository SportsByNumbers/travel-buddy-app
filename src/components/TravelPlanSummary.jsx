import React, { useContext } from 'react';
import { CheckCircle, Printer } from 'lucide-react';
import { TripContext } from '../App';

const TravelPlanSummary = () => {
    const { travelPlanSummary, getFormattedCurrency } = useContext(TripContext);
    const summarySectionClass = "mt-12 p-8 border-2 border-indigo-500 rounded-xl bg-indigo-50 shadow-xl print:shadow-none print:border-none";
    const summaryTitleClass = "text-3xl font-bold text-indigo-800 mb-8 text-center print:text-black";
    const summarySubTitleClass = "text-xl font-semibold text-indigo-700 mb-3 print:text-gray-800";
    const summaryItemClass = "text-gray-700 mb-1 print:text-gray-600";
    const totalCostClass = "text-2xl font-bold text-indigo-800 print:text-black";
    const grandTotalAmountClass = "text-green-700 text-3xl font-extrabold print:text-green-800";
    const remainingBudgetClass = (amount) =>
        `text-2xl font-extrabold ${amount >= 0 ? 'text-green-700' : 'text-red-700'} print:${amount >= 0 ? 'text-green-800' : 'text-red-800'}`;
    const varianceClass = (amount) =>
        `font-semibold ${amount < 0 ? 'text-red-600' : amount > 0 ? 'text-green-600' : 'text-gray-600'}`;

    const handlePrint = () => {
        window.print();
    };

    if (!travelPlanSummary) return null; // Only render if summary exists

    return (
        <div className={summarySectionClass}>
            <h2 className={summaryTitleClass}>
                <CheckCircle className="inline-block mr-3 text-indigo-700 print:text-black" size={32} /> Your Travel Plan Summary
            </h2>
            <div className="text-right print:hidden mb-4">
                <button type="button" onClick={handlePrint} className={`px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition duration-200 ease-in-out shadow-md flex items-center float-right`}>
                    <Printer className="mr-2" size={20} /> Print / Save PDF
                </button>
            </div>
            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
                <h3 className={summarySubTitleClass}>Your Trip Details:</h3>
                <p className={summaryItemClass}>
                    <strong>Home Location:</strong>{' '}
                    {travelPlanSummary.homeCity ? `${travelPlanSummary.homeCity}, ` : ''}
                    {travelPlanSummary.homeCountry.name || 'Not specified'}
                    {travelPlanSummary.homeCountry.flag && (
                        <img src={travelPlanSummary.homeCountry.flag} alt={`${travelPlanSummary.homeCountry.name} flag`} className="w-6 h-4 ml-2 inline-block rounded-sm" />
                    )}
                </p>
                <p className={summaryItemClass}>
                    <strong>Destination Countries:</strong>{' '}
                    {travelPlanSummary.countries.length > 0 ? (
                        <span>
                            {travelPlanSummary.countries.map(c => (
                                <span key={c.name} className="inline-flex items-center mr-2">
                                    {c.flag && <img src={c.flag} alt={`${c.name} flag`} className="w-6 h-4 mr-1 rounded-sm" />}
                                    {c.name}
                                </span>
                            ))}
                        </span>
                    ) : 'Not specified'}
                </p>
                <p className={summaryItemClass}>
                    <strong>Destination Cities:</strong>{' '}
                    {travelPlanSummary.cities.length > 0 ? (
                        <ul className="list-disc list-inside ml-4">
                            {travelPlanSummary.cities.map(city => (
                                <li key={city.name}>
                                    {city.name} ({city.duration} days){city.starRating && `, ${city.starRating} Star`}{city.topics.length > 0 && ` [${city.topics.join(', ')}]`}
                                </li>
                            ))}
                        </ul>
                    ) : 'Not specified'}
                </p>
                <p className={summaryItemClass}><strong>Overall Duration:</strong> {travelPlanSummary.overallDuration} days</p>
                <p className={summaryItemClass}>
                    <strong>Travel Dates:</strong> {travelPlanSummary.startDate} - {travelPlanSummary.endDate}
                </p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
                <h3 className={summarySubTitleClass}>Preferences & Itinerary:</h3>
                <p className={summaryItemClass}><strong>Overall Hotel Star Rating:</strong> {travelPlanSummary.starRating ? `${travelPlanSummary.starRating} Star` : 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Travel Style:</strong> {travelPlanSummary.travelStyle || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Hotel Amenities:</strong> {travelPlanSummary.hotelAmenities.length > 0 ? travelPlanSummary.hotelAmenities.join(', ') : 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Overall Topics of Interest:</strong> {travelPlanSummary.topicsOfInterest.length > 0 ? travelPlanSummary.topicsOfInterest.join(', ') : 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Activities:</strong> {travelPlanSummary.activities || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Sporting Events:</strong> {travelPlanSummary.sportingEvents || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Food Locations:</strong> {travelPlanSummary.foodLocations || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Theme Parks:</strong> {travelPlanSummary.themeParks || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Tourist Spots:</strong> {travelPlanSummary.touristSpots || 'Not specified'}</p>
                <p className={summaryItemClass}><strong>Tours:</strong> {travelPlanSummary.tours || 'Not specified'}</p>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
                <h3 className={summarySubTitleClass}>Estimated vs. Actual Costs ({travelPlanSummary.currency}):</h3>
                <p className={summaryItemClass}><strong>Calculation Basis:</strong> {travelPlanSummary.isPerPerson ? `Per Person (${travelPlanSummary.numberOfPeople} people)` : 'Per Party'}</p>
                <table className="min-w-full bg-white rounded-lg shadow-sm mt-3">
                    <thead>
                        <tr className="bg-indigo-100 print:bg-gray-100">
                            <th className="py-2 px-4 text-left text-sm font-semibold text-indigo-700 print:text-gray-800">Category</th>
                            <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Estimated</th>
                            <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Actual</th>
                            <th className="py-2 px-4 text-right text-sm font-semibold text-indigo-700 print:text-gray-800">Variance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Flights</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedFlightCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualFlightCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualFlightCost - travelPlanSummary.estimatedFlightCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualFlightCost - travelPlanSummary.estimatedFlightCost)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Hotels</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedHotelCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualHotelCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualHotelCost - travelPlanSummary.estimatedHotelCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualHotelCost - travelPlanSummary.estimatedHotelCost)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Activities</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedActivityCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualActivityCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualActivityCost - travelPlanSummary.estimatedActivityCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualActivityCost - travelPlanSummary.estimatedActivityCost)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Transport</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.combinedEstimatedTransportCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualTransportCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualTransportCost - travelPlanSummary.combinedEstimatedTransportCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualTransportCost - travelPlanSummary.combinedEstimatedTransportCost)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Food</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.totalFoodCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualFoodCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualFoodCost - travelPlanSummary.totalFoodCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualFoodCost - travelPlanSummary.totalFoodCost)}
                            </td>
                        </tr>
                        <tr>
                            <td className="py-2 px-4 border-t border-gray-200">Miscellaneous</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.estimatedMiscellaneousCost)}</td>
                            <td className="py-2 px-4 border-t border-gray-200 text-right">{getFormattedCurrency(travelPlanSummary.actualMiscellaneousCost)}</td>
                            <td className={`py-2 px-4 border-t border-gray-200 text-right ${varianceClass(travelPlanSummary.actualMiscellaneousCost - travelPlanSummary.estimatedMiscellaneousCost)}`}>
                                {getFormattedCurrency(travelPlanSummary.actualMiscellaneousCost - travelPlanSummary.estimatedMiscellaneousCost)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
                <h3 className={summarySubTitleClass}>Detailed Transport Options:</h3>
                <ul className="list-disc list-inside ml-6 text-gray-700">
                    {travelPlanSummary.carRental && <li>Car Rental: {getFormattedCurrency(travelPlanSummary.carRentalCost)}</li>}
                    {travelPlanSummary.shuttle && <li>Shuttle Service: {getFormattedCurrency(travelPlanSummary.shuttleCost)}</li>}
                    {travelPlanSummary.airportTransfers && <li>Airport Transfers: {getFormattedCurrency(travelPlanSummary.airportTransfersCost)}</li>}
                    {travelPlanSummary.airportParking && <li>Airport Parking: {getFormattedCurrency(travelPlanSummary.airportParkingCost)}</li>}
                    {travelPlanSummary.estimatedInterCityFlightCost > 0 && <li>Inter-City Flights: {getFormattedCurrency(travelPlanSummary.estimatedInterCityFlightCost)}</li>}
                    {travelPlanSummary.estimatedInterCityTrainCost > 0 && <li>Inter-City Trains: {getFormattedCurrency(travelPlanSummary.estimatedInterCityTrainCost)}</li>}
                    {travelPlanSummary.estimatedInterCityBusCost > 0 && <li>Inter-City Buses: {getFormattedCurrency(travelPlanSummary.estimatedInterCityBusCost)}</li>}
                    {travelPlanSummary.localPublicTransport && <li>Local Public Transport</li>}
                    {travelPlanSummary.taxiRideShare && <li>Taxis / Ride-Share</li>}
                    {travelPlanSummary.walking && <li>Walking</li>}
                    {(travelPlanSummary.localPublicTransport || travelPlanSummary.taxiRideShare) && travelPlanSummary.dailyLocalTransportAllowance > 0 &&
                        <li>Daily Local Transport Allowance: {getFormattedCurrency(travelPlanSummary.dailyLocalTransportAllowance)}</li>
                    }
                    {!travelPlanSummary.carRental && !travelPlanSummary.shuttle && !travelPlanSummary.airportTransfers && !travelPlanSummary.airportParking &&
                       travelPlanSummary.estimatedInterCityFlightCost === 0 && travelPlanSummary.estimatedInterCityTrainCost === 0 && travelPlanSummary.estimatedInterCityBusCost === 0 &&
                       !travelPlanSummary.localPublicTransport && !travelPlanSummary.taxiRideShare && !travelPlanSummary.walking &&
                       <li>No specific transport options selected.</li>}
                </ul>
            </div>

            <div className="mb-6 pb-4 border-b border-indigo-200 print:border-gray-300">
                <h3 className={summarySubTitleClass}>Budget Overview ({travelPlanSummary.currency}):</h3>
                <ul className="list-disc list-inside ml-6 text-gray-700">
                    <li className="mb-1">Money Available: <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.moneyAvailable)}</span></li>
                    <li className="mb-1">Money Saved: <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.moneySaved)}</span></li>
                    <li className="mb-1">Contingency/Buffer ({travelPlanSummary.contingencyPercentage}%): <span className="font-semibold">{getFormattedCurrency(travelPlanSummary.contingencyAmount)}</span></li>
                </ul>
            </div>

            <div className="mt-8 pt-6 border-t-2 border-indigo-300 print:border-gray-400 text-right">
                <h3 className={totalCostClass}>Grand Total Estimated Trip Cost: <span className={grandTotalAmountClass}>{getFormattedCurrency(travelPlanSummary.grandTotal)}</span></h3>
                <h3 className={totalCostClass}>Remaining Budget: <span className={remainingBudgetClass(travelPlanSummary.remainingBudget)}>{getFormattedCurrency(travelPlanSummary.remainingBudget)}</span></h3>
            </div>
        </div>
    );
};

export default TravelPlanSummary;
