// backendApi.js

// This file simulates your backend API that would securely call external travel APIs.
// In a real application, these functions would make actual HTTP requests to your Node.js/Python/Go backend.

const mockTravelData = [
  // --- USA - New York ---
  {
    id: 'ny-hotel-plaza', country: "USA", city: "New York", duration: "3 days", type: "hotel",
    name: "The Plaza Hotel", description: "Luxury hotel near Central Park.",
    baseCost: 500, category: "hotels", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=The+Plaza",
    latitude: 40.7646, longitude: -73.9749, rating: 4.8, reviewCount: 1200, familyFriendly: false, bookingLink: "https://example.com/plaza-hotel"
  },
  {
    id: 'ny-activity-liberty', country: "USA", city: "New York", duration: "3 days", type: "activity",
    name: "Statue of Liberty Tour", description: "Visit the iconic Statue of Liberty.",
    baseCost: 50, category: "activities", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Statue+of+Liberty",
    latitude: 40.6892, longitude: -74.0445, rating: 4.7, reviewCount: 5000, familyFriendly: true, bookingLink: "https://example.com/liberty-tour"
  },
  {
    id: 'ny-food-joes', country: "USA", city: "New York", duration: "3 days", type: "food",
    name: "Joe's Shanghai", description: "Famous for soup dumplings in Chinatown.",
    baseCost: 40, category: "foodLocations", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Joe's+Shanghai",
    latitude: 40.7161, longitude: -73.9961, rating: 4.3, reviewCount: 1500, familyFriendly: true, bookingLink: "https://example.com/joes-shanghai"
  },
  {
    id: 'ny-sport-knicks', country: "USA", city: "New York", duration: "3 days", type: "sporting_event",
    name: "Knicks Game (MSG)", description: "Experience an NBA game at Madison Square Garden.",
    baseCost: 150, category: "sportingEvents", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Knicks+Game",
    latitude: 40.7505, longitude: -73.9934, rating: 4.5, reviewCount: 2000, familyFriendly: true, bookingLink: "https://example.com/knicks-tickets"
  },
  {
    id: 'ny-park-coney', country: "USA", city: "New York", duration: "3 days", type: "theme_park",
    name: "Coney Island", description: "Classic amusement park with rides and boardwalk.",
    baseCost: 60, category: "themeParks", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Coney+Island",
    latitude: 40.5749, longitude: -73.9880, rating: 4.2, reviewCount: 3000, familyFriendly: true, bookingLink: "https://example.com/coney-island"
  },
  {
    id: 'ny-spot-timesquare', country: "USA", city: "New York", duration: "3 days", type: "tourist_spot",
    name: "Times Square", description: "Iconic commercial intersection and entertainment hub.",
    baseCost: 0, category: "touristSpots", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Times+Square",
    latitude: 40.7580, longitude: -73.9855, rating: 4.6, reviewCount: 10000, familyFriendly: true, bookingLink: "https://example.com/times-square-info"
  },
  {
    id: 'ny-hotel-marriott', country: "USA", city: "New York", duration: "7 days", type: "hotel",
    name: "New York Marriott Marquis", description: "Modern hotel in Times Square.",
    baseCost: 400, category: "hotels", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Marriott+Marquis",
    latitude: 40.7587, longitude: -73.9865, rating: 4.4, reviewCount: 2500, familyFriendly: true, bookingLink: "https://example.com/marriott-marquis"
  },
  // --- USA - Los Angeles ---
  {
    id: 'la-hotel-beverly', country: "USA", city: "Los Angeles", duration: "5 days", type: "hotel",
    name: "The Beverly Hills Hotel", description: "Historic luxury hotel on Sunset Boulevard.",
    baseCost: 800, category: "hotels", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Beverly+Hills+Hotel",
    latitude: 34.0736, longitude: -118.4116, rating: 4.9, reviewCount: 900, familyFriendly: false, bookingLink: "https://example.com/beverly-hills-hotel"
  },
  {
    id: 'la-activity-walkoffame', country: "USA", city: "Los Angeles", duration: "5 days", type: "activity",
    name: "Hollywood Walk of Fame", description: "Explore the famous stars.",
    baseCost: 0, category: "activities", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Walk+of+Fame",
    latitude: 34.1016, longitude: -118.3411, rating: 4.1, reviewCount: 4000, familyFriendly: true, bookingLink: "https://example.com/walk-of-fame-info"
  },
  {
    id: 'la-food-innout', country: "USA", city: "Los Angeles", duration: "5 days", type: "food",
    name: "In-N-Out Burger", description: "Classic West Coast burger joint.",
    baseCost: 15, category: "foodLocations", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=In-N-Out",
    latitude: 34.1030, longitude: -118.3274, rating: 4.5, reviewCount: 2000, familyFriendly: true, bookingLink: "https://example.com/in-n-out"
  },
  {
    id: 'la-sport-lakers', country: "USA", city: "Los Angeles", duration: "5 days", type: "sporting_event",
    name: "Lakers Game (Crypto.com Arena)", description: "Catch an NBA game with the Lakers.",
    baseCost: 200, category: "sportingEvents", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Lakers+Game",
    latitude: 34.0430, longitude: -118.2673, rating: 4.6, reviewCount: 1800, familyFriendly: true, bookingLink: "https://example.com/lakers-tickets"
  },
  {
    id: 'la-park-disney', country: "USA", city: "Los Angeles", duration: "5 days", type: "theme_park",
    name: "Disneyland Park", description: "The original Disney theme park.",
    baseCost: 150, category: "themeParks", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Disneyland",
    latitude: 33.8121, longitude: -117.9190, rating: 4.8, reviewCount: 8000, familyFriendly: true, bookingLink: "https://example.com/disneyland"
  },
  {
    id: 'la-spot-santamonica', country: "USA", city: "Los Angeles", duration: "5 days", type: "tourist_spot",
    name: "Santa Monica Pier", description: "Amusement park, aquarium, and restaurants on a pier.",
    baseCost: 0, category: "touristSpots", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Santa+Monica",
    latitude: 34.0097, longitude: -118.4967, rating: 4.5, reviewCount: 3500, familyFriendly: true, bookingLink: "https://example.com/santa-monica-pier"
  },
  // --- Japan - Tokyo ---
  {
    id: 'tokyo-hotel-parkhyatt', country: "Japan", city: "Tokyo", duration: "7 days", type: "hotel",
    name: "Park Hyatt Tokyo", description: "Luxury hotel with stunning city views.",
    baseCost: 600, category: "hotels", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Park+Hyatt+Tokyo",
    latitude: 35.6865, longitude: 139.6917, rating: 4.7, reviewCount: 1100, familyFriendly: false, bookingLink: "https://example.com/park-hyatt-tokyo"
  },
  {
    id: 'tokyo-activity-shibuya', country: "Japan", city: "Tokyo", duration: "7 days", type: "activity",
    name: "Shibuya Crossing", description: "Experience the world's busiest intersection.",
    baseCost: 0, category: "activities", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Shibuya+Crossing",
    latitude: 35.6591, longitude: 139.7032, rating: 4.6, reviewCount: 7000, familyFriendly: true, bookingLink: "https://example.com/shibuya-info"
  },
  {
    id: 'tokyo-food-tsukiji', country: "Japan", city: "Tokyo", duration: "7 days", type: "food",
    name: "Tsukiji Outer Market", description: "Fresh seafood and street food stalls.",
    baseCost: 30, category: "foodLocations", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Tsukiji+Market",
    latitude: 35.6664, longitude: 139.7701, rating: 4.5, reviewCount: 4000, familyFriendly: true, bookingLink: "https://example.com/tsukiji-market"
  },
  {
    id: 'tokyo-sport-sumo', country: "Japan", city: "Tokyo", duration: "7 days", type: "sporting_event",
    name: "Sumo Tournament (Ryogoku Kokugikan)", description: "Witness traditional Japanese sumo wrestling.",
    baseCost: 80, category: "sportingEvents", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Sumo+Tournament",
    latitude: 35.6961, longitude: 139.7937, rating: 4.7, reviewCount: 1500, familyFriendly: true, bookingLink: "https://example.com/sumo-tickets"
  },
  {
    id: 'tokyo-park-disney', country: "Japan", city: "Tokyo", duration: "7 days", type: "theme_park",
    name: "Tokyo Disneyland", description: "Disney magic with a Japanese twist.",
    baseCost: 100, category: "themeParks", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Tokyo+Disneyland",
    latitude: 35.6329, longitude: 139.8804, rating: 4.9, reviewCount: 9000, familyFriendly: true, bookingLink: "https://example.com/tokyo-disneyland"
  },
  {
    id: 'tokyo-spot-sensoji', country: "Japan", city: "Tokyo", duration: "7 days", type: "tourist_spot",
    name: "Senso-ji Temple", description: "Tokyo's oldest temple in Asakusa.",
    baseCost: 0, category: "touristSpots", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Senso-ji+Temple",
    latitude: 35.7148, longitude: 139.7967, rating: 4.7, reviewCount: 6000, familyFriendly: true, bookingLink: "https://example.com/sensoji-info"
  },
  // --- France - Paris ---
  {
    id: 'paris-hotel-ritz', country: "France", city: "Paris", duration: "4 days", type: "hotel",
    name: "Ritz Paris", description: "Iconic luxury hotel in Place Vendôme.",
    baseCost: 1200, category: "hotels", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Ritz+Paris",
    latitude: 48.8680, longitude: 2.3276, rating: 4.9, reviewCount: 1000, familyFriendly: false, bookingLink: "https://example.com/ritz-paris"
  },
  {
    id: 'paris-activity-eiffel', country: "France", city: "Paris", duration: "4 days", type: "activity",
    name: "Eiffel Tower Visit", description: "Ascend to the top of the Eiffel Tower.",
    baseCost: 30, category: "activities", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Eiffel+Tower",
    latitude: 48.8584, longitude: 2.2945, rating: 4.7, reviewCount: 12000, familyFriendly: true, bookingLink: "https://example.com/eiffel-tower"
  },
  {
    id: 'paris-food-relais', country: "France", city: "Paris", duration: "4 days", type: "food",
    name: "Le Relais de l'Entrecôte", description: "Famous for its steak frites.",
    baseCost: 50, category: "foodLocations", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Le+Relais",
    latitude: 48.8659, longitude: 2.3025, rating: 4.3, reviewCount: 1800, familyFriendly: true, bookingLink: "https://example.com/le-relais"
  },
  {
    id: 'paris-sport-psg', country: "France", city: "Paris", duration: "4 days", type: "sporting_event",
    name: "Paris Saint-Germain Match", description: "Watch a football match at Parc des Princes.",
    baseCost: 100, category: "sportingEvents", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=PSG+Match",
    latitude: 48.8415, longitude: 2.2530, rating: 4.5, reviewCount: 900, familyFriendly: true, bookingLink: "https://example.com/psg-tickets"
  },
  {
    id: 'paris-park-disneyland', country: "France", city: "Paris", duration: "4 days", type: "theme_park",
    name: "Disneyland Paris", description: "European Disney resort.",
    baseCost: 120, category: "themeParks", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Disneyland+Paris",
    latitude: 48.8760, longitude: 2.7770, rating: 4.8, reviewCount: 7500, familyFriendly: true, bookingLink: "https://example.com/disneyland-paris"
  },
  {
    id: 'paris-spot-louvre', country: "France", city: "Paris", duration: "4 days", type: "tourist_spot",
    name: "Louvre Museum", description: "Home to the Mona Lisa and countless art masterpieces.",
    baseCost: 20, category: "touristSpots", imageUrl: "https://placehold.co/400x250/F0F4F8/3B82F6?text=Louvre+Museum",
    latitude: 48.8606, longitude: 2.3376, rating: 4.7, reviewCount: 15000, familyFriendly: true, bookingLink: "https://example.com/louvre-tickets"
  },
];

// This function simulates your backend API endpoint for searching travel options.
// In a real application, this function would make API calls to Skyscanner, Booking.com, Google Places, etc.
// It aggregates and filters the data before sending it to the frontend.
export const searchTravelOptions = ({ country, city, duration, familyFriendly }) => {
  return new Promise((resolve) => {
    setTimeout(() => { // Simulate network delay for backend processing and external API calls
      const results = {
        hotels: [], activities: [], sportingEvents: [],
        foodLocations: [], themeParks: [], touristSpots: [],
      };

      mockTravelData.forEach(item => {
        // Filter by country, city, duration
        const matchesLocation = (country === '' || item.country === country) &&
                                (city === '' || item.city === city) &&
                                (duration === '' || item.duration === duration);

        // Apply family-friendly filter if requested
        const matchesFamilyFriendly = !familyFriendly || item.familyFriendly; // If familyFriendly is true, item.familyFriendly must be true. If familyFriendly is false, all items are shown.

        if (matchesLocation && matchesFamilyFriendly) {
          if (results[item.category]) {
            results[item.category].push(item);
          }
        }
      });

      // Optional: Sort results by rating descending for "best" advice
      Object.keys(results).forEach(category => {
          results[category].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      });

      resolve(results);
    }, 1500); // Increased delay to simulate multiple API calls on backend
  });
};

export const fetchFlightPrices = ({ originCity, destinationCity, departureDate, returnDate }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => { // Simulate network delay
      if (!originCity || !destinationCity || !departureDate || !returnDate) {
        reject(new Error("Missing flight details."));
        return;
      }

      let simulatedCost = 300; // Base flight cost
      // Add randomness/complexity based on simulated route/dates
      if (originCity.toLowerCase().includes('sydney') && destinationCity.toLowerCase().includes('new york')) {
        simulatedCost = 1500 + Math.floor(Math.random() * 500);
      } else if (originCity.toLowerCase().includes('tokyo') && destinationCity.toLowerCase().includes('paris')) {
        simulatedCost = 1200 + Math.floor(Math.random() * 400);
      } else {
        simulatedCost = 500 + Math.floor(Math.random() * 300);
      }

      // Add a small factor for longer trips
      if (departureDate && returnDate) {
        const dep = new Date(departureDate);
        const ret = new Date(returnDate);
        if (ret > dep) {
          const diffTime = Math.abs(ret - dep);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          simulatedCost += diffDays * 5; // Small daily increment
        }
      }
      resolve(simulatedCost);
    }, 1500); // Simulate API call delay
  });
};

// Function to simulate connecting transport cost between two cities
// In a real backend, this would call APIs for flights/trains between these cities.
export const simulateConnectingTransportCost = (fromCity, toCity) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let cost = 0;
      // Simple logic: greater distance implies higher cost
      const distanceMap = {
        'New York-Los Angeles': 400, 'Los Angeles-New York': 400,
        'New York-Paris': 800, 'Paris-New York': 800,
        'New York-Tokyo': 1000, 'Tokyo-New York': 1000,
        'Los Angeles-Tokyo': 900, 'Tokyo-Los Angeles': 900,
        'Paris-Tokyo': 950, 'Tokyo-Paris': 950,
        'Paris-Los Angeles': 750, 'Los Angeles-Paris': 750,
        // Add more routes as needed
      };
      const routeKey = `${fromCity}-${toCity}`;
      cost = distanceMap[routeKey] || 300; // Default if route not explicitly defined

      resolve(cost);
    }, 800); // Simulate network delay
  });
};


// Simulated user data and persistence (would be a real database in a real app)
let users = {
  "test@example.com": {
    password: "password123",
    savedTrips: [] // Each trip will be an object
  }
};

export const authenticateUser = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users[email];
      if (user && user.password === password) {
        // Return a simplified user object without sensitive info
        resolve({ email: user.email });
      } else {
        reject(new Error("Invalid email or password."));
      }
    }, 500);
  });
};

export const registerUser = ({ email, password }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        reject(new Error("User with this email already exists."));
      } else {
        users[email] = { password, savedTrips: [] };
        resolve({ email });
      }
    }, 500);
  });
};

export const saveUserTrip = ({ email, tripData }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (users[email]) {
        // In a real app, you'd store this in a database,
        // and ensure the tripData is properly structured.
        users[email].savedTrips.push(tripData);
        resolve({ success: true, message: "Trip saved successfully!" });
      } else {
        reject(new Error("User not found."));
      }
    }, 700);
  });
};

export const loadUserTrips = ({ email }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = users[email];
      if (user) {
        resolve(user.savedTrips);
      } else {
        reject(new Error("User not found."));
      }
    }, 700);
  });
};
