// src/utils/safeRender.js

/**
 * Safely converts a value to a string for React rendering.
 * Prevents "Objects are not valid as a React child" errors.
 * If the value is an object (and not null), it attempts to find 'name' or 'label' properties,
 * otherwise it returns a placeholder string.
 * @param {*} value The value to render.
 * @returns {string|number|null} A string, number, or null if the value is intentionally empty.
 */
export const safeRender = (value) => {
    if (value === null || value === undefined) {
        return null; // React can safely render null as nothing
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }
    if (typeof value === 'boolean') {
        return String(value); // Convert booleans to their string representation
    }
    if (Array.isArray(value)) {
        // If it's an array, join its elements to a string.
        // Recursively call safeRender for each element to handle nested objects in arrays.
        return value.map(item => safeRender(item)).filter(Boolean).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
        // Log the problematic object to the console for debugging
        console.error("Attempted to render an unexpected object directly:", value);
        // Try to extract a common display property
        if (value.name !== undefined) {
            return String(value.name);
        }
        if (value.label !== undefined) {
            return String(value.label);
        }
        // Fallback for other objects, or if it's a React component itself
        if (typeof value === 'function' && value.prototype && value.prototype.isReactComponent) {
             // This branch is for React components (like MapPin itself) passed as children directly
             // We return a specific string, as attempting to Stringify it results in [object Function]
             return "[React Component]";
        }
        return "[Object]"; // Generic fallback for objects without name/label
    }
    // Fallback for any other unexpected types
    return String(value);
};
