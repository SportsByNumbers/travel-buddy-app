import React from 'react';

const SectionWrapper = ({ title, icon: Icon, description, children }) => {
    const sectionContainerClass = "mb-8 p-6 bg-white rounded-xl shadow-md";
    const sectionTitleClass = "text-2xl font-bold text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-3 flex items-center";

    return (
        <div className={sectionContainerClass}>
            <h2 className={sectionTitleClass}>
                {Icon && <Icon className="mr-3 text-indigo-600" size={28} />} {title}
            </h2>
            {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}
            {children}
        </div>
    );
};

export default SectionWrapper;
