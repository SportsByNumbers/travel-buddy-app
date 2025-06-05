import React, { useContext } from 'react';
import { Car } from 'lucide-react'; // Car icon is used here
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import InputField from './InputField';

const TransportOptionsSection = () => {
    // Removed estimatedTransportCost, setEstimatedTransportCost, actualTransportCost, setActualTransportCost
    // as their primary display/input is handled in BudgetPlanningSection.
    const {
            carRental, setCarRental, carRentalCost, setCarRentalCost, shuttle, setShuttle, shuttleCost, setShuttleCost,
            airportTransfers, setAirportTransfers, airportTransfersCost, setAirportTransfersCost, airportParking, setAirportParking, airportParkingCost, setAirportParkingCost,
            estimatedInterCityFlightCost, setEstimatedInterCityFlightCost, estimatedInterCityTrainCost, setEstimatedInterCityTrainCost, estimatedInterCityBusCost, setEstimatedInterCityBusCost,
            localPublicTransport, setLocalPublicTransport, taxiRideShare, setTaxiRideShare, walking, setWalking, dailyLocalTransportAllowance, setDailyLocalTransportAllowance,
            getFormattedCurrency
    } = useContext(TripContext);


    const TransportCheckboxWithCost = ({ label, checked, setChecked, cost, setCost, currencySymbol, idPrefix }) => (
        <div className="col-span-1">
            <label className="inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                    checked={checked}
                    onChange={(e) => { setChecked(e.target.checked); if (!e.target.checked) setCost(0); }}
                />
                <span className="ml-2 text-gray-800">{label}</span>
            </label>
            {checked && (
                <div className="mt-2 ml-7">
                    <InputField
                        label={`Cost (${currencySymbol})`}
                        id={`${idPrefix}Cost`}
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                        min="0"
                    />
                </div>
            )}
        </div>
    );

    const InterCityCostInput = ({ label, value, setValue, currencySymbol, id }) => (
        <InputField
            label={`${label} (${currencySymbol})`}
            id={id}
            type="number"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            min="0"
        />
    );


    return (
        <SectionWrapper title="Transport Options" icon={Car} description="Select transport modes and enter their estimated costs.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Estimated Total Transport has its own field in BudgetPlanningSection, so we only need manual ones here */}

                <TransportCheckboxWithCost
                    label="Car Rental (for trip)"
                    checked={carRental} setChecked={setCarRental}
                    cost={carRentalCost} setCost={setCarRentalCost}
                    currencySymbol={getFormattedCurrency(0).charAt(0)} idPrefix="carRental"
                />
                <TransportCheckboxWithCost
                    label="Shuttle Service"
                    checked={shuttle} setChecked={setShuttle}
                    cost={shuttleCost} setCost={setShuttleCost}
                    currencySymbol={getFormattedCurrency(0).charAt(0)} idPrefix="shuttle"
                />
                <TransportCheckboxWithCost
                    label="Airport Transfers (Home/Dest)"
                    checked={airportTransfers} setChecked={setAirportTransfers}
                    cost={airportTransfersCost} setCost={setAirportTransfersCost}
                    currencySymbol={getFormattedCurrency(0).charAt(0)} idPrefix="airportTransfers"
                />
                <TransportCheckboxWithCost
                    label="Airport Parking (Home)"
                    checked={airportParking} setChecked={setAirportParking}
                    cost={airportParkingCost} setCost={setAirportParkingCost}
                    currencySymbol={getFormattedCurrency(0).charAt(0)} idPrefix="airportParking"
                />

                <InterCityCostInput label="Inter-City Flights" value={estimatedInterCityFlightCost} setValue={setEstimatedInterCityFlightCost} currencySymbol={getFormattedCurrency(0).charAt(0)} id="estimatedInterCityFlightCost" />
                <InterCityCostInput label="Inter-City Trains" value={estimatedInterCityTrainCost} setValue={setEstimatedInterCityTrainCost} currencySymbol={getFormattedCurrency(0).charAt(0)} id="estimatedInterCityTrainCost" />
                <InterCityCostInput label="Inter-City Buses" value={estimatedInterCityBusCost} setValue={setEstimatedInterCityBusCost} currencySymbol={getFormattedCurrency(0).charAt(0)} id="estimatedInterCityBusCost" />

                <div className="col-span-1">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                            checked={localPublicTransport}
                            onChange={(e) => setLocalPublicTransport(e.target.checked)}
                        />
                        <span className="ml-2 text-gray-800">Local Public Transport</span>
                    </label>
                </div>
                <div className="col-span-1">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                            checked={taxiRideShare}
                            onChange={(e) => setTaxiRideShare(e.target.checked)} {/* Fixed typo here */}
                        />
                        <span className="ml-2 text-gray-800">Taxis / Ride-Share</span>
                    </label>
                </div>
                <div className="col-span-1">
                    <label className="inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 transition duration-150 ease-in-out"
                            checked={walking}
                            onChange={(e) => setWalking(e.target.checked)}
                        />
                        <span className="ml-2 text-gray-800">Walking</span>
                    </label>
                </div>
                <InputField
                    label={`Daily Local Transport Allowance (${getFormattedCurrency(0).charAt(0)})`}
                    id="dailyLocalTransportAllowance"
                    type="number"
                    value={dailyLocalTransportAllowance}
                    onChange={(e) => setDailyLocalTransportAllowance(parseFloat(e.target.value) || 0)}
                    min="0"
                />
            </div>
        </SectionWrapper>
    );
};

export default TransportOptionsSection;
