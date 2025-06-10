// src/components/SectionWrapper.jsx
import React from 'react';

const SectionWrapper = ({ title, icon: Icon, children }) => {
    // Defensive check and explicit conversion for the title prop.
    // This will force the title to be a string or an empty string,
    // ensuring React never tries to render a non-string object directly here.
    let displayTitle = '';
    if (typeof title === 'string' || typeof title === 'number') {
        displayTitle = String(title);
    } else if (title && typeof title === 'object' && title !== null) {
        // If an object is passed, try to get a 'name' or 'label' property,
        // or fall back to a generic indicator.
        // This is the most likely spot where a rogue object is being passed.
        console.error("SectionWrapper received an object as 'title' prop:", title);
        displayTitle = title.name || title.label || '[Invalid Title Object]'; // Try to extract a string
    } else {
        // Handle undefined, null, or other unexpected types
        displayTitle = String(title || '');
    }

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-3 border-b border-indigo-100 flex items-center">
                {Icon && <Icon size={24} className="mr-3 text-indigo-600" />}
                {displayTitle} {/* Use the defensively prepared title */}
            </h2>
            {children}
        </section>
    );
};

export default SectionWrapper;
