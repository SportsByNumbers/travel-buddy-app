// src/components/SectionWrapper.jsx
import React from 'react';

const SectionWrapper = ({ title, icon: Icon, children }) => {
    // Explicitly convert title to a string to prevent "Objects are not valid as a React child" errors.
    // If title is ever an object (e.g., due to an error in the calling component),
    // it will be converted to "[object Object]", which is a valid string for rendering,
    // preventing the crash and potentially highlighting the issue in dev tools.
    const renderedTitle = String(title || ''); // Use String() for explicit conversion

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-3 border-b border-indigo-100 flex items-center">
                {/* This is the correct way to render a component passed as a prop */}
                {Icon && <Icon size={24} className="mr-3 text-indigo-600" />}
                {renderedTitle} {/* Use the explicitly converted title */}
            </h2>
            {children}
        </section>
    );
};

export default SectionWrapper;
