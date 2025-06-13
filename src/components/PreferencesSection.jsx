// src/components/PreferencesSection.jsx
import React, { useContext, useCallback } from 'react';
import { Star } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
// Import centralized options
import { STAR_RATING_OPTIONS, AVAILABLE_TOPICS, TRAVEL_STYLE_OPTIONS } from '../constants/options.js';

const PreferencesSection = () => {
    const {
        starRating, setStarRating, 
        travelStyle, setTravelStyle,
        hotelAmenities, setHotelAmenities, availableAmenities,
        topicsOfInterest, setTopicsOfInterest, 
    } = useContext(TripContext);

    const handleTopicsChange = useCallback((topic) => {
        setTopicsOfInterest(prevTopics =>
            prevTopics.includes(topic)
                ? prevTopics.filter(t => t !== topic)
                : [...prevTopics, topic]
        );
    }, [setTopicsOfInterest]);

    const handleAmenitiesChange = useCallback((amenity) => {
        setHotelAmenities(prevAmenities =>
            prevAmenities.includes(amenity)
                ? prevAmenities.filter(a => a !== amenity)
                : [...prevAmenities, amenity]
        );
    }, [setHotelAmenities]);

    const handleStarRatingChange = useCallback((selectedRatings) => {
        setStarRating(selectedRatings);
    }, [setStarRating]);


    return (
        <SectionWrapper title="Travel Preferences" icon={Star}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="travelStyle"
                    label="Preferred Travel Style (Optional)"
                    type="select"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    options={TRAVEL_STYLE_OPTIONS} 
                />
                <CheckboxGroup
                    label="Overall Preferred Hotel Rating (Optional)"
                    options={STAR_RATING_OPTIONS.filter(opt => opt.value !== '').map(opt => ({ value: opt.value, label: opt.label }))} 
                    selected={starRating}
                    onChange={handleStarRatingChange}
                    columns={1} 
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <CheckboxGroup
                    label="Topics of Interest (Overall Trip)"
                    options={AVAILABLE_TOPICS.map(topic => ({ value: topic, label: topic }))} 
                    selected={topicsOfInterest}
                    onChange={handleTopicsChange}
                    columns={2}
                />
                <CheckboxGroup
                    label="Hotel Amenities (Optional)"
                    options={availableAmenities.map(amenity => ({ value: amenity, label: amenity }))} 
                    selected={hotelAmenities}
                    onChange={handleAmenitiesChange}
                    columns={2}
                />
            </div>
        </SectionWrapper>
    );
};

export default PreferencesSection;
