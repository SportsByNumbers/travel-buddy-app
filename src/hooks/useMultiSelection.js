import { useState } from 'react';

export const useMultiSelection = (initialState = []) => {
    const [selectedItems, setSelectedItems] = useState(initialState);

    const toggleItem = (item) => {
        setSelectedItems((prevSelectedItems) => {
            if (prevSelectedItems.includes(item)) {
                return prevSelectedItems.filter((i) => i !== item);
            } else {
                return [...prevSelectedItems, item];
            }
        });
    };

    return [selectedItems, toggleItem, setSelectedItems];
};
