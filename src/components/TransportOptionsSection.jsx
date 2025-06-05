import React, { useContext } from 'react';
import { Plane /* Removed: Car, Train */ } from 'lucide-react'; // Removed unused imports
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';

const TransportOptionsSection = () => {
    const {
        estimatedTransportCost, setEstimatedTransportCost, // AI estimated total transport (optional use)
        carRental, setCarRental, carRentalCost, setCarRentalCost,
        shuttle, setShuttle, shuttleCost, setShuttleCost,
        airportTransfers, setAirportTransfers, airportTransfersCost, setAirportTransfersCost,
        airportParking, setAirportParking, airportParkingCost, setAirportParkingCost,
        estimatedInterCityFlightCost, setEstimatedInterCityFlightCost,
        estimatedInterCityTrainCost, setEstimatedInterCityTrainCost,
        estimatedInterCityBusCost, setEstimatedInterCityBusCost,
        localPublicTransport, setLocalPublicTransport,
        taxiRideShare, setTaxiRideShare,
        walking, setWalking,
        dailyLocalTransportAllowance, setDailyLocalTransportAllowance,
        currency
    } = useContext(TripContext);

    const renderCostInput = (id, label, value, onChange, isChecked, placeholder) => {
        return isChecked && (
            <InputField
                id={id}
                label={`${label} Cost (${currency})`}
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                placeholder={placeholder}
                min="0"
            />
        );
    };

    const renderCheckboxInput = (id, label, value, onChange) => (
        <div className="flex items-center mb-2">
            <input
                type="checkbox"
                id={id}
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
                {label}
            </label>
        </div>
    );

    return (
        <SectionWrapper title="Transport Options" icon={Plane}>
            <p className="text-gray-700 mb-4">Plan your transport methods and estimate associated costs.</p>

            <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Inter-City Travel (Estimated)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                        id="estimatedInterCityFlightCost"
                        label={`Inter-city Flights (${currency})`}
                        type="number"
                        value={estimatedInterCityFlightCost}
                        onChange={(e) => setEstimatedInterCityFlightCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 200"
                        min="0"
                    />
                    <InputField
                        id="estimatedInterCityTrainCost"
                        label={`Inter-city Train (${currency})`}
                        type="number"
                        value={estimatedInterCityTrainCost}
                        onChange={(e) => setEstimatedInterCityTrainCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 100"
                        min="0"
                    />
                    <InputField
                        id="estimatedInterCityBusCost"
                        label={`Inter-city Bus (${currency})`}
                        type="number"
                        value={estimatedInterCityBusCost}
                        onChange={(e) => setEstimatedInterCityBusCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 50"
                        min="0"
                    />
                     <InputField
                        id="estimatedTransportCost"
                        label={`Other Estimated Transport (${currency})`}
                        type="number"
                        value={estimatedTransportCost}
                        onChange={(e) => setEstimatedTransportCost(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 150 (AI estimate)"
                        min="0"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Local Transport Options */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Local Transport Options</h3>
                    {renderCheckboxInput("localPublicTransport", "Local Public Transport (Bus, Metro, Tram)", localPublicTransport, setLocalPublicTransport)}
                    {localPublicTransport && (
                        <InputField
                            id="dailyLocalTransportAllowance"
                            label={`Daily Local Transport Allowance (${currency})`}
                            type="number"
                            value={dailyLocalTransportAllowance}
                            onChange={(e) => setDailyLocalTransportAllowance(parseFloat(e.target.value) || 0)}
                            placeholder="e.g., 20"
                            min="0"
                            className="ml-6"
                        />
                    )}
                    {renderCheckboxInput("taxiRideShare", "Taxi/Ride-Share", taxiRideShare, setTaxiRideShare)}
                    {taxiRideShare && (
                         <InputField
                            id="dailyTaxiRideShareAllowance"
                            label={`Daily Taxi/Ride-Share Allowance (${currency})`}
                            type="number"
                            value={dailyLocalTransportAllowance} // Reusing for simplicity, could be separate
                            onChange={(e) => setDailyLocalTransportAllowance(parseFloat(e.target.value) || 0)}
                            placeholder="e.g., 30"
                            min="0"
                            className="ml-6"
                        />
                    )}
                    {renderCheckboxInput("walking", "Primary Mode: Walking", walking, setWalking)}
                </div>

                {/* Specific Ground Transport Costs */}
                <div className="p-4 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Specific Ground Transport & Parking</h3>
                    {renderCheckboxInput("carRental", "Car Rental", carRental, setCarRental)}
                    {renderCostInput("carRentalCost", "Car Rental", carRentalCost, setCarRentalCost, carRental, "e.g., 300")}

                    {renderCheckboxInput("shuttle", "Hotel/Resort Shuttle", shuttle, setShuttle)}
                    {renderCostInput("shuttleCost", "Shuttle", shuttleCost, setShuttleCost, shuttle, "e.g., 50")}

                    {renderCheckboxInput("airportTransfers", "Private Airport Transfers", airportTransfers, setAirportTransfers)}
                    {renderCostInput("airportTransfersCost", "Airport Transfers", airportTransfersCost, setAirportTransfersCost, airportTransfers, "e.g., 100")}

                    {renderCheckboxInput("airportParking", "Airport Parking at Home", airportParking, setAirportParking)}
                    {renderCostInput("airportParkingCost", "Airport Parking", airportParkingCost, setAirportParkingCost, airportParking, "e.g., 80")}
                </div>
            </div>
        </SectionWrapper>
    );
};

export default TransportOptionsSection;
