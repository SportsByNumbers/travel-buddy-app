// src/components/SectionWrapper.jsx
import React from 'react';

const SectionWrapper = ({ title, icon: Icon, children }) => {
    // By destructuring 'icon' as 'Icon', you're assigning the component
    // itself to the 'Icon' variable.
    // Then, you render it using JSX syntax: <Icon ... />
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-3 border-b border-indigo-100 flex items-center">
                {/* This is the correct way to render a component passed as a prop */}
                {Icon && <Icon size={24} className="mr-3 text-indigo-600" />}
                {title}
            </h2>
            {children}
        </section>
    );
};

export default SectionWrapper;
