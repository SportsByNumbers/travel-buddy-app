// src/utils/safeRender.js

/**
 * Safely converts a value to a string for React rendering.
 * Prevents "Objects are not valid as a React child" errors.
 * If the value is an object (and not null), it attempts to find 'name' or 'label' properties,
 * otherwise it returns null (which React can safely render as nothing) and logs the issue.
 * @param {*} value The value to render.
 * @returns {string|number|null} A string, number, or null.
 */
export const safeRender = (value) => {
    if (value === null || value === undefined || value === '') { // Also treat empty string as null for cleaner render
        return null; // React can safely render null as nothing
    }
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }
    if (typeof value === 'boolean') {
        return String(value); // Convert booleans to their string representation
    }
    if (Array.isArray(value)) {
        // Recursively call safeRender for each element and filter out any nulls before joining.
        return value.map(item => safeRender(item)).filter(item => item !== null && item !== '').join(', ');
    }
    if (typeof value === 'object') { // Check for object, including functions for React components
        // --- CRITICAL DEBUGGING POINT ---
        // Log the problematic object to the console for deep inspection
        console.error("DEBUG_REACT_ERROR_130_OBJECT_DETECTED: Attempted to render an unexpected object directly.", { value, type: typeof value, isArray: Array.isArray(value), keys: Object.keys(value) });

        // Try to extract a common display property from the object
        if (value.name !== undefined) {
            return String(value.name);
        }
        if (value.label !== undefined) {
            return String(value.label);
        }
        // If it's a React component itself passed as text child (shouldn't happen with proper JSX)
        if (typeof value === 'function' && value.prototype && value.prototype.isReactComponent) {
             console.error("DEBUG_REACT_ERROR_130_REACT_COMPONENT_RENDERED_AS_TEXT: React Component passed as text child:", value);
             return null; // Don't render component as text
        }
        // Fallback for any other unhandled object. Returning null prevents the React crash.
        return null;
    }
    // Fallback for any other unexpected primitive types (e.g., symbols, bigints if relevant)
    return String(value);
};
