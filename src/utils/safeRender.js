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
        // If it's an array, map its elements to safe strings and join.
        return value.map(item => safeRender(item)).filter(item => item !== null).join(', ');
    }
    if (typeof value === 'object' && value !== null) {
        // --- CRITICAL CHANGE HERE ---
        // Log the problematic object to the console for debugging
        console.error("SAFE_RENDER_DEBUG: Attempted to render an unexpected object directly. Problematic object:", value);

        // Try to extract a common display property
        if (value.name !== undefined) {
            return String(value.name);
        }
        if (value.label !== undefined) {
            return String(value.label);
        }
        // If it's a React component itself passed as text child (shouldn't happen with proper JSX)
        if (typeof value === 'function' && value.prototype && value.prototype.isReactComponent) {
             console.error("SAFE_RENDER_DEBUG: React Component passed as text child:", value);
             return null; // Don't render component as text
        }
        // If it's any other unhandled object, return null so React doesn't crash,
        // but the console.error above will provide details.
        return null;
    }
    // Fallback for any other unexpected types (e.g., symbols, bigints if relevant)
    return String(value);
};
