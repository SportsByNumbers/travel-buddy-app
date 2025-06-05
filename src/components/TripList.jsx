import React, { useContext, useState } from 'react';
import { TripContext } from '../App.jsx'; // Explicit .jsx
import { ChevronDown, FolderOpen, Trash2 } from 'lucide-react';
import { doc, deleteDoc } from 'firebase/firestore';

const TripList = () => {
    const { trips, loadTrip, currentTripId, db, userId, setTravelPlanSummary, createNewTrip } = useContext(TripContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // Stores trip ID to confirm deletion

    const handleDeleteTrip = async (tripId) => {
        if (!db || !userId) {
            console.error("Firestore not initialized or user not authenticated.");
            return;
        }
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/trips`, tripId));
            console.log("Trip successfully deleted:", tripId);
            // If the deleted trip was the current one, reset the form
            if (currentTripId === tripId) {
                createNewTrip(); // Clears all form data and sets currentTripId to null
            }
            setShowDeleteConfirm(null); // Hide confirmation dialog
        } catch (error) {
            console.error("Error deleting trip:", error);
        }
    };

    const handleLoadClick = (tripId) => {
        loadTrip(tripId);
        setDropdownOpen(false); // Close dropdown after selection
    };

    const handleConfirmDelete = (tripId) => {
        setShowDeleteConfirm(tripId);
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(null);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md text-sm font-semibold hover:bg-indigo-600 transition-colors duration-200 shadow-md"
            >
                <FolderOpen size={16} className="mr-2" /> Load Trip ({trips.length})
                <ChevronDown size={16} className={`ml-2 transform ${dropdownOpen ? 'rotate-180' : 'rotate-0'} transition-transform duration-200`} />
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                    {trips.length === 0 ? (
                        <p className="p-4 text-gray-500 text-sm">No saved trips.</p>
                    ) : (
                        <ul>
                            {trips.map((trip) => (
                                <li key={trip.id} className="border-b last:border-b-0">
                                    <div className={`flex justify-between items-center p-3 hover:bg-gray-50 ${currentTripId === trip.id ? 'bg-indigo-50 font-medium' : ''}`}>
                                        <button
                                            onClick={() => handleLoadClick(trip.id)}
                                            className="flex-grow text-left text-gray-800 text-sm truncate pr-2"
                                            title={trip.homeCity ? `${trip.homeCity} to ${trip.cities.map(c => c.name).join(', ') || trip.countries.map(c => c.name).join(', ')}` : `Trip ID: ${trip.id}`}
                                        >
                                            {trip.homeCity && (trip.cities.length > 0 || trip.countries.length > 0)
                                                ? `${trip.homeCity} to ${trip.cities.map(c => c.name).join(', ') || trip.countries.map(c => c.name).join(', ')}`
                                                : `Trip: ${trip.id.substring(0, 8)}...`}
                                            {trip.startDate && <span className="text-xs text-gray-500 block">{trip.startDate}</span>}
                                        </button>
                                        <button
                                            onClick={() => handleConfirmDelete(trip.id)}
                                            className="p-1 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
                                            title="Delete Trip"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {showDeleteConfirm === trip.id && (
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-75 z-20">
                                            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                                                <p className="mb-4 text-gray-800">Are you sure you want to delete this trip?</p>
                                                <div className="flex justify-center space-x-4">
                                                    <button
                                                        onClick={() => handleDeleteTrip(trip.id)}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={handleCancelDelete}
                                                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default TripList;
