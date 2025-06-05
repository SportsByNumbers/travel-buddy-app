import React, { useContext } from 'react';
import { Star } from 'lucide-react';
import { TripContext } from '../App.js';
import SectionWrapper from './SectionWrapper.jsx';
import InputField from './InputField.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';

const PreferencesSection = () => {
    const {
        starRating, setStarRating,
        travelStyle, setTravelStyle,
        hotelAmenities, setHotelAmenities, availableAmenities,
        topicsOfInterest, setTopicsOfInterest, availableTopics
    } = useContext(TripContext);

    const handleTopicsChange = (topic) => {
        setTopicsOfInterest(prevTopics =>
            prevTopics.includes(topic)
                ? prevTopics.filter(t => t !== topic)
                : [...prevTopics, topic]
        );
    };

    const handleAmenitiesChange = (amenity) => {
        setHotelAmenities(prevAmenities =>
            prevAmenities.includes(amenity)
                ? prevAmenities.filter(a => a !== amenity)
                : [...prevAmenities, amenity]
        );
    };

    return (
        <SectionWrapper title="Travel Preferences" icon={Star}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                    id="travelStyle"
                    label="Preferred Travel Style (Optional)"
                    type="select"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    options={[
                        { value: '', label: 'Select a style' },
                        { value: 'Luxury', label: 'Luxury' },
                        { value: 'Budget', label: 'Budget-Friendly' },
                        { value: 'Adventure', label: 'Adventure' },
                        { value: 'Relaxation', label: 'Relaxation' },
                        { value: 'Cultural', label: 'Cultural Immersion' },
                        { value: 'Family', label: 'Family-Friendly' },
                    ]}
                />
                <InputField
                    id="starRating"
                    label="Overall Preferred Hotel Rating (Optional)"
                    type="select"
                    value={starRating}
                    onChange={(e) => setStarRating(e.target.value)}
                    options={[
                        { value: '', label: 'Any Star Rating' },
                        { value: '1', label: '1 Star (Budget)' },
                        { value: '2', label: '2 Star (Economy)' },
                        { value: '3', label: '3 Star (Mid-Range)' },
                        { value: '4', label: '4 Star (First Class)' },
                        { value: '5', label: '5 Star (Luxury)' },
                    ]}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <CheckboxGroup
                    label="Topics of Interest (Overall Trip)"
                    options={availableTopics}
                    selected={topicsOfInterest}
                    onChange={handleTopicsChange}
                    columns={2}
                />
                <CheckboxGroup
                    label="Hotel Amenities (Optional)"
                    options={availableAmenities}
                    selected={hotelAmenities}
                    onChange={handleAmenitiesChange}
                    columns={2}
                />
            </div>
        </SectionWrapper>
    );
};

export default PreferencesSection;
