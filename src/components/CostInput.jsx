import React from 'react';
import InputField from './InputField'; // Assuming InputField is in the same 'components' directory

const CostInput = ({ label, currencySymbol, estimated, setEstimated, actual, setActual }) => {
    return (
        <>
            <InputField
                label={`Estimated ${label}`}
                id={`estimated${label.replace(/\s/g, '')}`}
                type="number"
                value={estimated}
                onChange={(e) => setEstimated(parseFloat(e.target.value) || 0)}
                min="0"
            />
            <InputField
                label={`Actual ${label}`}
                id={`actual${label.replace(/\s/g, '')}`}
                type="number"
                value={actual}
                onChange={(e) => setActual(parseFloat(e.target.value) || 0)}
                min="0"
            />
        </>
    );
};

export default CostInput;
