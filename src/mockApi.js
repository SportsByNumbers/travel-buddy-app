// mockApi.js

// Simulate a database of users and their trips
const users = {}; // email: { password, trips: [] } - This line MUST appear only ONCE

// --- NEW/UPDATED: Mock data matching AI's generateSuggestions schema ---
// This is what the AI is *supposed* to return for suggestions
const mockAiSuggestionsResponse = {
  activities: [
    { "name": "Tokyo Skytree Visit", "description": "Enjoy panoramic views of Tokyo from this iconic tower, an engineering marvel.", "simulated_estimated_cost_usd": 25, "simulated_booking_link": "https://www.skytreetickets.com/book" },
    { "name": "Ghibli Museum Tour", "description": "Immerse yourself in the magical world of Studio Ghibli's beloved animations. Tickets are hard to get!", "simulated_estimated_cost_usd": 15, "simulated_booking_link": "https://www.ghibli-museum.jp/tickets" },
    { "name": "Shibuya Crossing Experience", "description": "Witness the world's busiest intersection, a symbol of modern Tokyo.", "simulated_estimated_cost_usd": 0, "simulated_booking_link": "" },
    { "name": "Asakusa Senso-ji Temple", "description": "Tokyo's oldest temple, a vibrant spiritual landmark with a bustling market street.", "simulated_estimated_cost_usd": 0, "simulated_booking_link": "" },
    { "name": "Robot Restaurant Show", "description": "A bizarre, high-energy, and uniquely Japanese entertainment spectacle. Book early!", "simulated_estimated_cost_usd": 100, "simulated_booking_link": "https://www.robot-restaurant.com/reserve" }
  ],
  foodLocations: [
    { "name": "Tsukiji Outer Market", "description": "A bustling market known for fresh seafood and street food vendors.", "simulated_price_range": "$$" },
    { "name": "Omoide Yokocho (Memory Lane)", "description": "A narrow alleyway filled with tiny, atmospheric izakaya bars serving yakitori.", "simulated_price_range": "$$" },
    { "name": "Ramen Street (Tokyo Station)", "description": "Underground street dedicated to various famous ramen shops from across Japan.", "simulated_price_range": "$" }
  ],
  themeParks: [
    { "name": "Tokyo Disneyland", "description": "The classic magical kingdom with beloved characters and enchanting rides.", "location": "Urayasu, Chiba", "simulated_estimated_cost_usd": 80 },
    { "name": "Tokyo DisneySea", "description": "A unique Disney park with stunning nautical themes and elaborate attractions.", "location": "Urayasu, Chiba", "simulated_estimated_cost_usd": 85 }
  ],
  touristSpots: [
    { "name": "Meiji Jingu Shrine", "description": "A tranquil oasis dedicated to Emperor Meiji and Empress Shoken, surrounded by a vast forest.", "simulated_estimated_cost_usd": 0 },
    { "name": "Imperial Palace East Garden", "description": "The former site of Edo Castle's inner defense circles, now a beautiful public garden.", "simulated_estimated_cost_usd": 0 }
  ],
  tours: [
    { "name": "Mount Fuji & Hakone Day Tour", "description": "A popular day trip combining scenic views of Mt. Fuji with the natural beauty of Hakone.", "simulated_estimated_cost_usd": 90, "simulated_booking_link": "https://www.faketravelsite.com/fuji-hakone-tour" },
    { "name": "Tokyo Highlights Bus Tour", "description": "See major landmarks like Tokyo Tower, Imperial Palace, and Ginza from a comfortable bus.", "simulated_estimated_cost_usd": 60, "simulated_booking_link": "https://www.faketravelsite.com/tokyo-bus-tour" }
  ],
  sportingEvents: [
    { "name": "Sumo Grand Tournament", "description": "Witness Japan's national sport in action during a tournament period.", "simulated_estimated_cost_usd": 60 },
    { "name": "Baseball Game (Yomiuri Giants)", "description": "Experience the electric atmosphere of a Japanese professional baseball game.", "simulated_estimated_cost_usd": 40 }
  ]
};

// --- NEW: Mock data matching AI's generateBudgetEstimates schema ---
// This is what the AI is *supposed* to return for budget estimates
const mockAiBudgetResponse = {
  flight: {
    "airline": "Japan Airlines (JAL)",
    "route": "SYD-NRT",
    "departure_date": "2025-10-05",
    "return_date": "2025-10-12",
    "estimated_cost_usd": 1200
  },
  hotel: {
    "name": "Park Hyatt Tokyo",
    "location": "Shinjuku",
    "cost_per_night_usd": 350,
    "total_nights": 7,
    "estimated_cost_usd": 2450
  },
  activityCost: 500, // General estimate for unspecified activities / buffer
  transportCost: 150, // Local transportation
  miscellaneousCost: 200,
  dailyFoodAllowance: {
    "breakfast_usd": 20,
    "lunch_usd": 40,
    "dinner_usd": 60,
    "snacks_usd": 10
  }
};


// --- UPDATED: Simulate AI Suggestions (wraps mock data in Gemini-like response) ---
export const fetchTravelData = async (options) => { // This function is called by generateSuggestions in App.js
  console.log("Mock API: Simulating AI Suggestions for:", options);
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify(mockAiSuggestionsResponse) // Return the structured mock data as a string
            }]
          }
        }]
      });
    }, 1500); // Simulate network delay
  });
};

// --- NEW: Simulate AI Budget Estimates (wraps mock data in Gemini-like response) ---
export const fetchBudgetEstimates = async (promptData) => { // This function will be called by generateBudgetEstimates in App.js
    console.log("Mock API: Simulating AI Budget Estimates for:", promptData);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                candidates: [{
                    content: {
                        parts: [{
                            text: JSON.stringify(mockAiBudgetResponse) // Return the structured mock budget data as a string
                        }]
                    }
                }]
            });
        }, 1800); // Simulate network delay
    });
};


// --- Remaining mock functions (Authentication, Save/Load, Manual Flight Search) ---

// Simulate fetching flight prices (for the manual search button in App.js)
const fetchFlightPrices = async ({ originCity, destinationCity, departureDate, returnDate }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!originCity || !destinationCity || !departureDate || !returnDate) {
        reject(new Error("Please provide all flight details."));
        return;
      }
      // Simulate price range
      const basePrice = 800; // Starting a higher base price for flights
      const variation = Math.floor(Math.random() * 600) - 300; // -300 to 300
      const finalPrice = Math.max(200, basePrice + variation); // Min price 200

      resolve(finalPrice);
    }, 1500); // Simulate network delay
  });
};

// Simulate user authentication
const authenticateUser = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email] && users[email].password === password) {
        resolve({ email: email, name: email.split('@')[0] });
      } else {
        reject(new Error("Invalid email or password."));
      }
    }, 500);
  });
};

// Simulate user registration
const registerUser = async ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        reject(new Error("User with this email already exists."));
      } else {
        users[email] = { password: password, trips: [] };
        resolve({ email: email, name: email.split('@')[0] });
      }
    }, 500);
  });
};

// Simulate saving user trip
const saveUserTrip = async ({ email, tripData }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        users[email].trips.push(JSON.parse(JSON.stringify(tripData))); // Deep copy
        resolve({ success: true, message: "Trip saved!" });
      } else {
        reject(new Error("User not found."));
      }
    }, 700);
  });
};

// Simulate loading user trips
const loadUserTrips = async ({ email }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        resolve(JSON.parse(JSON.stringify(users[email].trips))); // Deep copy
      } else {
        reject(new Error("User not found or no trips saved."));
      }
    }, 700);
  });
};

export {
    fetchTravelData,
    fetchFlightPrices,
    authenticateUser,
    registerUser,
    saveUserTrip,
    loadUserTrips,
    fetchBudgetEstimates // --- NEW: Export the new mock function ---
};
