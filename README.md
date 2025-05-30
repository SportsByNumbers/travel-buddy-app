---
title: Travel Buddy App
emoji: 🏢
colorFrom: green
colorTo: green
sdk: docker
pinned: false
short_description: All You Need To Plan Your Next Trip
---
# TravelBuddy

This is a simulated travel planning application built with React and Tailwind CSS.

## Features:
- Plan multi-destination trips with dynamic segments.
- Simulate connecting transport costs between cities.
- Filter options for 'Family-Friendly' experiences.
- View simulated hotels, activities, food, sporting events, theme parks, and tourist spots.
- Display simulated ratings, review counts, and "Book Now" links.
- Input daily budget (per person or per party) and party size.
- Input daily food allowance breakdown (Breakfast, Lunch, Dinner, Snacks) per person or per party.
- Simulate initial flight search and costing.
- Interactive map showing itinerary items and suggestions (requires Google Maps API Key).
- Simulated user authentication (login/register).
- Simulated trip saving and loading for logged-in users.

## How it works (Simulated):
- **Frontend-Backend Architecture:** The app simulates a frontend (React) talking to a backend (`backendApi.js`).
- **Data & APIs:** All travel data, flight pricing, and connecting transport costs are currently mocked within `backendApi.js`. In a real application, the backend would securely call external APIs like Skyscanner, Booking.com, Google Places, Klook, etc.
- **Authentication/Persistence:** User login/registration and trip saving/loading are simulated using in-memory storage in `backendApi.js`. In a real application, this would involve a secure backend database (e.g., Firebase, Supabase, your own API).

## Technologies Used:
- React
- Tailwind CSS
- Lucide React (for icons)
- @react-google-maps/api (for map integration)
- Docker (for deployment)
- Nginx (to serve the static files)

## Deployment to Hugging Face Spaces:
This application is deployed as a custom Docker image on Hugging Face Spaces.

### Local Development:
1. Clone this repository.
2. Ensure you have Node.js and npm installed.
3. `npm install` (to install dependencies and generate `package-lock.json`)
4. **Obtain a Google Maps API Key** and replace `"YOUR_Maps_API_KEY"` in `src/App.js` with your actual key.
5. `npm start`

### Build for Production:
1. `npm run build`

