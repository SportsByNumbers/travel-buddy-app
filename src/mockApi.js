// mockApi.js

// Simulate a database of users and their trips
const users = {}; // email: { password, trips: [] }

// Simulate various travel data with IDs for itinerary tracking
const mockTravelData = {
  hotels: [
    { id: 'H1', name: "Grand Hyatt", description: "Luxury stay in city center", baseCost: 300, type: 'hotel', imageUrl: 'https://images.unsplash.com/photo-1571896349882-3320f78d6de4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'H2', name: "Boutique Hotel", description: "Charming and cozy, near attractions", baseCost: 150, type: 'hotel', imageUrl: 'https://images.unsplash.com/photo-1549448722-e6e737c0ffdc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'H3', name: "Budget Inn", description: "Clean and affordable, great for travelers", baseCost: 80, type: 'hotel', imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fa5fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ],
  activities: [
    { id: 'A1', name: "City Walking Tour", description: "Explore city landmarks on foot", baseCost: 30, type: 'activity', imageUrl: 'https://images.unsplash.com/photo-1533604068598-a3f295b9d3e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'A2', name: "Museum Visit", description: "Discover local art and history", baseCost: 20, type: 'activity', imageUrl: 'https://images.unsplash.com/photo-1563291071-f7614917637b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'A3', name: "Cooking Class", description: "Learn local cuisine", baseCost: 75, type: 'activity', imageUrl: 'https://images.unsplash.com/photo-1587840176884-250a581451e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ],
  sportingEvents: [
    { id: 'SE1', name: "Local Football Match", description: "Experience the local sports scene", baseCost: 40, type: 'sporting_event', imageUrl: 'https://images.unsplash.com/photo-1517466787929-f41099a85693?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'SE2', name: "Basketball Game", description: "High-energy professional basketball", baseCost: 60, type: 'sporting_event', imageUrl: 'https://images.unsplash.com/photo-1546519638-687f8723aedc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ],
  foodLocations: [
    { id: 'F1', name: "Central Market", description: "Vibrant market with local street food", baseCost: 20, type: 'food', imageUrl: 'https://images.unsplash.com/photo-1533059885868-80f2d5901614?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'F2', name: "Fine Dining Restaurant", description: "Michelin-star experience", baseCost: 150, type: 'food', imageUrl: 'https://images.unsplash.com/photo-1555396273-367ba0ee6c14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ],
  themeParks: [
    { id: 'TP1', name: "Adventure Land", description: "Thrilling rides and family fun", baseCost: 90, type: 'theme_park', imageUrl: 'https://images.unsplash.com/photo-1600813083398-356885661214?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'TP2', name: "Fantasy World", description: "Magical experiences and parades", baseCost: 110, type: 'theme_park', imageUrl: 'https://images.unsplash.com/photo-1594954005991-88481350a4b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ],
  touristSpots: [
    { id: 'TS1', name: "Historic Downtown", description: "Charming streets and old buildings", baseCost: 0, type: 'tourist_spot', imageUrl: 'https://images.unsplash.com/photo-1550974771-46487e41d8e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
    { id: 'TS2', name: "Botanical Gardens", description: "Lush greenery and peaceful walks", baseCost: 10, type: 'tourist_spot', imageUrl: 'https://images.unsplash.com/photo-1509379659092-23c317f25906?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1NzM4ODllfDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&q=80&w=400' },
  ]
};

// Simulate fetching travel data based on criteria
const fetchTravelData = async ({ country, city, duration }) => {
  return new Promise(resolve => {
    setTimeout(() => {
      // In a real app, this would filter actual data from a backend/API
      // For simulation, we return a fixed set of items for the selected city/country
      const results = {};
      Object.keys(mockTravelData).forEach(category => {
        results[category] = mockTravelData[category];
      });
      resolve(results);
    }, 1000); // Simulate network delay
  });
};

// Simulate fetching flight prices
const fetchFlightPrices = async ({ originCity, destinationCity, departureDate, returnDate }) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!originCity || !destinationCity || !departureDate || !returnDate) {
        reject(new Error("Please provide all flight details."));
        return;
      }
      // Simulate price range
      const basePrice = 200;
      const variation = Math.floor(Math.random() * 300) - 100; // -100 to 200
      const finalPrice = Math.max(50, basePrice + variation); // Min price 50

      resolve(finalPrice);
    }, 1500); // Simulate network delay
  });
};

// Simulate a database of users and their trips
const users = {}; // email: { password, trips: [] }

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
        // Simple deep copy to prevent direct mutation of saved data
        users[email].trips.push(JSON.parse(JSON.stringify(tripData)));
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
        // Simple deep copy to prevent direct mutation of loaded data
        resolve(JSON.parse(JSON.stringify(users[email].trips)));
      } else {
        reject(new Error("User not found or no trips saved."));
      }
    }, 700);
  });
};

export { fetchTravelData, fetchFlightPrices, authenticateUser, registerUser, saveUserTrip, loadUserTrips };
