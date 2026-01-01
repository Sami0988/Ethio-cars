#!/bin/bash

echo "íº€ Creating Android-only EthioCars project..."

# 1. Create project
npx create-expo-app EthioCarsApp --template
cd EthioCarsApp

# 2. Remove iOS files
rm -rf ios/

# 3. Install Android dependencies
echo "í³¦ Installing dependencies..."
npx expo install @tanstack/react-query axios zustand
npx expo install react-native-paper
npx expo install expo-image-picker expo-file-system expo-secure-store
npx expo install react-native-safe-area-context react-native-screens
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install formik yup
npx expo install @react-navigation/native @react-navigation/stack
npx expo install react-native-vector-icons

# 4. Create folder structure
echo "í³ Creating folder structure..."
mkdir -p src/{screens/{auth,main,listing,create},components,navigation,services,hooks,stores,utils,constants,types}
mkdir -p assets/{images,fonts}

# 5. Create essential files
echo "í³ Creating essential files..."

# Create App.tsx
cat > App.tsx << 'EOF'
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <AppNavigator />
        </QueryClientProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
EOF

# Create navigation/AppNavigator.tsx
mkdir -p src/navigation
cat > src/navigation/AppNavigator.tsx << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuthStore } from '../stores/auth.store';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token } = useAuthStore();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF

# Create stores/auth.store.ts
mkdir -p src/stores
cat > src/stores/auth.store.ts << 'EOF'
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        // Clear secure storage
        SecureStore.deleteItemAsync('auth_token');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
EOF

# Create services/api.ts
mkdir -p src/services
cat > src/services/api.ts << 'EOF'
import axios from 'axios';
import { useAuthStore } from '../stores/auth.store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://ethiocars.com/mobile-api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Car endpoints
export const carApi = {
  getMyCars: (page = 1, limit = 20, status?: string) =>
    api.get('/cars', { params: { page, limit, status } }),
  
  getCar: (id: number) =>
    api.get(`/cars/${id}`),
  
  createCar: (data: any) =>
    api.post('/cars', data),
  
  updateCar: (id: number, data: any) =>
    api.put(`/cars/${id}`, data),
  
  deleteCar: (id: number) =>
    api.delete(`/cars/${id}`),
};

// Data endpoints
export const dataApi = {
  getMakes: () => api.get('/data/makes'),
  getModels: (makeId: number) => api.get('/data/models', { params: { make_id: makeId } }),
  getFeatures: () => api.get('/data/features'),
  getLocations: (regionId?: number, zoneId?: number) =>
    api.get('/data/locations', { params: { region_id: regionId, zone_id: zoneId } }),
};

export default api;
EOF

# Create constants/text.ts with ALL text content
mkdir -p src/constants
cat > src/constants/text.ts << 'EOF'
// ALL APP TEXT IN ONE FILE - COPY FROM PREVIOUS DOCUMENT

export const APP_TEXT = {
  // Splash Screen
  splash: {
    loading: "Loading...",
    welcome: "EthioCars",
    tagline: "Ethiopia's Automotive Marketplace",
  },
  
  // Auth
  auth: {
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to manage your car listings",
      email: "Email Address",
      emailPlaceholder: "your.email@example.com",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      forgotPassword: "Forgot Password?",
      loginButton: "Sign In",
      noAccount: "Don't have an account? ",
      signUp: "Sign Up",
    },
    register: {
      title: "Create Account",
      subtitle: "Join Ethiopia's largest automotive marketplace",
      username: "Username",
      usernamePlaceholder: "Choose username (3-20 characters)",
      phone: "Phone Number",
      phonePlaceholder: "+251 91 123 4567",
      dealerToggle: "I'm registering as a car dealer/company",
      companyName: "Company Name",
      companyPlaceholder: "e.g., Addis Motors PLC",
      license: "Business License Number",
      licensePlaceholder: "DL-2024-XXXXX",
      terms: "I agree to the Terms of Service and Privacy Policy",
      registerButton: "Create Account",
      hasAccount: "Already have an account? ",
      signIn: "Sign In",
    },
  },
  
  // Bottom Tabs
  tabs: {
    home: "Home",
    listings: "My Listings",
    sell: "Sell",
    messages: "Messages",
    profile: "Profile",
  },
  
  // Home Screen
  home: {
    searchPlaceholder: "Search cars (Toyota, Corolla, Addis Ababa...)",
    filters: "Filters",
    sort: "Sort",
    emptyTitle: "No Listings Found",
    emptyMessage: "Try adjusting your filters or check back later",
    emptyButton: "Browse All Cars",
  },
  
  // Car Card
  carCard: {
    negotiable: "Negotiable",
    call: "Call",
    message: "Message",
    save: "Save",
    verifiedDealer: "Verified Dealer",
  },
  
  // Listing Status
  status: {
    active: "Active",
    pending: "Pending",
    sold: "Sold",
    draft: "Draft",
    expired: "Expired",
  },
  
  // Error Messages
  errors: {
    network: "Network error. Please check your connection",
    auth: "Invalid email or password",
    emailExists: "Email already registered",
    usernameExists: "Username already taken",
    required: "This field is required",
    invalidEmail: "Please enter a valid email",
    invalidPhone: "Please enter a valid Ethiopian phone number",
    minPassword: "Password must be at least 6 characters",
    imageTooLarge: "Image too large (max 10MB)",
    maxImages: "Maximum 10 images per listing",
  },
  
  // Success Messages
  success: {
    login: "Login successful",
    register: "Account created successfully",
    listingCreated: "Car listing created successfully",
    listingUpdated: "Listing updated successfully",
    listingDeleted: "Listing deleted successfully",
    profileUpdated: "Profile updated successfully",
  },
  
  // Loading States
  loading: {
    default: "Loading...",
    uploading: "Uploading...",
    processing: "Processing...",
    saving: "Saving...",
  },
};

export default APP_TEXT;
EOF

# Create constants/colors.ts
cat > src/constants/colors.ts << 'EOF'
export const COLORS = {
  // Primary
  primary: '#DC2626',
  primaryDark: '#991B1B',
  primaryLight: '#FEE2E2',
  
  // Secondary
  secondary: '#1E40AF',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  // Neutrals
  background: '#FFFFFF',
  surface: '#F8FAFC',
  border: '#E2E8F0',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    disabled: '#94A3B8',
  },
  
  // Ethiopian accents
  ethioYellow: '#FBBF24',
  ethioGreen: '#10B981',
};

export default COLORS;
EOF

echo "âœ… Project setup complete!"
echo ""
echo "í³± Next steps:"
echo "1. Run: npx expo start --android"
echo "2. Install Expo Go on your Android phone"
echo "3. Scan QR code to run the app"
echo ""
echo "í³ Project structure ready at: $(pwd)"
