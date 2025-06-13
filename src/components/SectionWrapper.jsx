// src/components/SectionWrapper.jsx
import React from 'react';
import { safeRender } from '../utils/safeRender.js';

const SectionWrapper = ({ title, icon: Icon, children }) => {
    const renderedTitle = safeRender(title);
    return (
        <section className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-indigo-800 mb-6 pb-3 border-b border-indigo-100 flex items-center">
                {Icon && <Icon size={24} className="mr-3 text-indigo-600" />}
                {renderedTitle}
            </h2>
            {/* {children} */} {/* COMMENT OUT THIS LINE */}
        </section>
    );
};
export default SectionWrapper;
