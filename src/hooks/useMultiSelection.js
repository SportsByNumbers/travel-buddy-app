import { useState } from 'react';

export const useMultiSelection = (initial = []) => {
    const [selectedItems, setSelectedItems] = useState(initial);

    const toggleSelection = (item) => {
        setSelectedItems(prev =>
            prev.includes(item)
                ? prev.filter(s => s !== item)
                : [...prev, item]
        );
    };

    return [selectedItems, toggleSelection, setSelectedItems]; // Return the setter for external resets if needed
};
