---
description: Repository Information Overview
alwaysApply: true
---

# SDM E-Mobility App Information

## Summary
A React Native mobile application for SDM E-Mobility, a sustainable transportation service. The app provides ride booking, payment processing, and user management for both customers and drivers.

## Structure
- **src/components**: Reusable UI components including booking flow components
- **src/constants**: Application constants and environment variables
- **src/hooks**: Custom React hooks for payments, fare calculation, and realtime subscriptions
- **src/navigation**: Navigation configuration for different user roles
- **src/screens**: Screen components organized by user role (auth, customer, driver)
- **src/services**: Backend services including Supabase integration and payment processing
- **src/stores**: State management using Zustand
- **src/types**: TypeScript type definitions
- **src/utils**: Utility functions for error handling and notifications

## Language & Runtime
**Language**: TypeScript/JavaScript
**Framework**: React Native
**State Management**: Zustand with persistence
**Backend**: Supabase

## Dependencies
**Main Dependencies**:
- React Native
- @react-navigation/native, @react-navigation/stack, @react-navigation/bottom-tabs
- @supabase/supabase-js
- zustand
- react-native-toast-message
- @expo/vector-icons
- @react-native-async-storage/async-storage

**Development Dependencies**:
- TypeScript
- Expo tools

## Authentication & Database
**Authentication**: Supabase Auth with phone verification
**Database**: Supabase with typed schema
**Storage**: AsyncStorage for local persistence
**Realtime**: Supabase Realtime for live updates

## Features
**Customer Features**:
- Authentication and profile management
- Ride booking with multiple service types
- Payment processing
- Ride history and tracking
- Notifications

**Driver Features**:
- Driver profile management
- Ride acceptance and management
- Earnings tracking
- Active ride management

## UI Components
**Design System**:
- Modern teal/turquoise color scheme (#2dd4bf)
- Card-based layouts with subtle shadows
- Clean typography with consistent spacing
- Tab-based navigation for main sections

**Key Screens**:
- Authentication flow (login, registration, verification)
- Home screen with booking options
- Booking flow with multi-step process
- Ride history and details
- Payment processing
- User profiles

## Navigation Structure
**Main Navigators**:
- AppNavigator: Root navigator that handles authentication state
- AuthNavigator: Handles login, registration flows
- CustomerNavigator: Tab-based navigation for customer role
- DriverNavigator: Tab-based navigation for driver role

## Data Models
**Core Entities**:
- Users (customers, drivers, admins, vendors)
- Bookings with multiple statuses
- Vehicles with types and details
- Payments with transaction tracking
- Locations with geocoding

## Testing
**Framework**: Not explicitly defined in examined files
**Test Location**: Not found in examined structure