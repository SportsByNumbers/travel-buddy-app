import React, { useContext } from 'react';
import { Compass } from 'lucide-react'; // Only Compass is used
import { TripContext } from '../App';
import SectionWrapper from './SectionWrapper';
import InputField from './InputField';
import CheckboxGroup from './CheckboxGroup';

const PreferencesSection = () => {
    const { starRating, setStarRating, travelStyle, setTravelStyle, hotelAmenities, setHotelAmenities, topicsOfInterest, setTopicsOfInterest, availableTopics, availableAmenities } = useContext(TripContext);

    const handleAmenityChange = (amenity) => {
        setHotelAmenities(prevAmenities =>
            prevAmenities.includes(amenity)
                ? prevAmenities.filter(a => a !== amenity)
                : [...prevAmenities, amenity]
        );
    };

    const handleTopicChange = (topic) => {
        setTopicsOfInterest(prevTopics =>
            prevTopics.includes(topic)
                ? prevTopics.filter(t => t !== topic)
                : [...prevTopics, topic]
        );
    };

    return (
        <SectionWrapper title="General Preferences" icon={Compass} description="Select your preferred overall hotel star rating, travel style, and topics of interest.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputField
                    type="select"
                    id="starRating"
                    value={starRating}
                    onChange={(e) => setStarRating(e.target.value)}
                    label="Overall Hotel Star Rating (Optional)"
                >
                    <option value="">Select a rating</option>
                    <option value="1">1 Star (Budget)</option>
                    <option value="2">2 Star (Economy)</option>
                    <option value="3">3 Star (Mid-Range)</option>
                    <option value="4">4 Star (First Class)</option>
                    <option value="5">5 Star (Luxury)</option>
                </InputField>
                <InputField
                    type="select"
                    id="travelStyle"
                    value={travelStyle}
                    onChange={(e) => setTravelStyle(e.target.value)}
                    label="Travel Style (Optional)"
                >
                    <option value="">Select a style</option>
                    <option value="Budget">Budget</option>
                    <option value="Mid-Range">Mid-Range</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family-Friendly">Family-Friendly</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Relaxation">Relaxation</option>
                </InputField>
                <div className="md:col-span-2">
                    <CheckboxGroup
                        label="Preferred Hotel Amenities (Optional)"
                        options={availableAmenities}
                        selected={hotelAmenities}
                        onChange={handleAmenityChange}
                        columns={4}
                    />
                </div>
                <div className="md:col-span-2">
                    <CheckboxGroup
                        label="Overall Topics of Interest (Optional)"
                        options={availableTopics}
                        selected={topicsOfInterest}
                        onChange={handleTopicChange}
                        columns={4}
                    />
                </div>
            </div>
        </SectionWrapper>
    );
};

export default PreferencesSection;
