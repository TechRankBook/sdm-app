# SDM Cab Hailing App

## Overview
This is a React Native/Expo-based cab hailing application similar to Uber/Lyft, running as a web application in the Replit environment. The app provides booking services for city rides, airport transfers, outstation trips, and hourly rentals.

## Project Architecture
- **Frontend**: React Native Web with Expo SDK 53
- **Styling**: NativeWind (Tailwind CSS for React Native)  
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **Maps**: Google Maps API integration
- **Payments**: Razorpay integration
- **State Management**: Zustand store

## Key Features
- User authentication (customer/driver/admin/vendor roles)
- Real-time ride booking and tracking
- Multiple service types (city, airport, outstation, hourly)
- Vehicle selection (sedan, SUV, premium, hatchback)
- Payment processing with Razorpay
- Notifications system
- Google Maps integration

## Environment Setup
Environment variables are configured in `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`: Google Places API key
- `EXPO_PUBLIC_RAZORPAY_KEY_ID`: Razorpay payment gateway key

## Development Setup
The application runs on port 5000 using Expo Web with the `lan` host setting to allow external access in the Replit environment.

## Recent Changes (September 4, 2025)
- Set up project in Replit environment
- Configured Expo Web development server with proper host settings
- Installed all dependencies and resolved build issues
- Configured deployment settings for production
- Application successfully runs and displays the cab booking interface

## Deployment Configuration
- **Target**: Autoscale (stateless web application)
- **Build**: Exports Expo web bundle
- **Runtime**: Serves static files using serve package

## Project Status
✅ Successfully imported and configured for Replit environment
✅ Development server running on port 5000
✅ All core dependencies installed and working
✅ Deployment configuration completed