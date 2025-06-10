// src/components/SectionWrapper.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js'; // Import the new utility

const SectionWrapper = ({ title, icon: Icon, children }) => {
    // Use safeRender for the title prop
    const renderedTitle = safeRender(title);

    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-3 border-b border-indigo-100 flex items-center">
                {/* This is the correct way to render a component passed as a prop */}
                {Icon && <Icon size={24} className="mr-3 text-indigo-600" />}
                {renderedTitle} {/* Use the safely rendered title */}
            </h2>
            {children}
        </section>
    );
};

export default SectionWrapper;
