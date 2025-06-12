// src/services/apiService.js

// Function to fetch AI responses from Gemini
export const fetchAI = async (prompt, schema = null) => {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Gemini API Key is not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: schema ? { responseMimeType: "application/json", responseSchema: schema } : {}
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("AI API Error:", errorBody);
            throw new Error(`AI API request failed: ${errorBody.error?.message || response.statusText}`);
        }

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            if (schema) {
                try {
                    // Gemini might sometimes return extra backticks/json wrapper
                    return JSON.parse(text.replace(/```json\n|\n```/g, ''));
                } catch (jsonError) {
                    console.error("Failed to parse JSON from AI response:", text, jsonError);
                    throw new Error("AI response was not valid JSON. Please try again.");
                }
            }
            return text; // Return raw text if no schema expected
        } else {
            console.error("AI API response structure invalid:", result);
            throw new Error("Failed to get a valid response from AI. Response structure invalid.");
        }
    } catch (error) {
        console.error("Error during fetchAI call:", error);
        throw error; // Re-throw to be caught by the component
    }
};

// Function to fetch specific country flag/data including currency
export const fetchCountryData = async (countryName, allCountries) => {
    if (!countryName) return { name: '', flag: '', currencyCode: null }; // Added currencyCode
    
    // Try to find in already fetched allCountries to avoid new API call if possible
    const foundCountry = allCountries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
    if (foundCountry) {
        // Ensure that if found, currencyCode is present in the returned object
        return { 
            name: foundCountry.name, 
            flag: foundCountry.flag, 
            currencyCode: foundCountry.currencyCode || null // Ensure currencyCode is passed if available
        };
    }

    // Fallback: If not found in allCountries, make a specific API call
    try {
        // Request 'currencies' field from RestCountries API
        let response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=flags,name,currencies&fullText=true`);
        if (!response.ok) {
            // Try partial match if exact match fails, still requesting currencies
            response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=flags,name,currencies`);
            if (!response.ok) {
                console.warn(`Could not find full data for country: ${countryName}`);
                return { name: countryName, flag: '', currencyCode: null }; // Return with null currencyCode
            }
        }
        const data = await response.json();
        if (data && data.length > 0) {
            const country = data[0];
            let currencyCode = null;
            if (country.currencies) {
                // Get the first currency code from the currencies object (e.g., {USD: {name: "US Dollar", symbol: "$"}, ...})
                const firstCurrencyKey = Object.keys(country.currencies)[0];
                currencyCode = firstCurrencyKey;
            }
            return { name: country.name.common, flag: country.flags.svg, currencyCode: currencyCode };
        }
        return { name: countryName, flag: '', currencyCode: null }; // Return with null currencyCode if no data
    } catch (error) {
        console.error("Error fetching country data including currency:", error);
        return { name: countryName, flag: '', currencyCode: null }; // Return with null currencyCode on error
    }
};
