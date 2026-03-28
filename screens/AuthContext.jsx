// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'User_data';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);             // actual user object
  const [isAuthenticated, setIsAuthenticated] = useState(false); // boolean
  const [isLoading, setIsLoading] = useState(true);   // initial loading state

  // 🔄 Normalize user data so you never have mismatched structures
const normalizeUser = (data) => {
  const user = data?.data ? data.data : data;

  return {
    ...user,
    user_id: user.user_id || user.id || user.customer_id || null, // ✅ ensures user_id always exists
  };
};


  // 🔐 Check stored auth on startup or when explicitly called
  const checkAuth = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const userObj = normalizeUser(parsed);
         //console.log("Stored user object (from AsyncStorage):", userObj);
        setUser(userObj);
        setIsAuthenticated(true);
        //console.log('AuthContext: restored user', userObj);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        //console.log('AuthContext: no stored user');
      }
    } catch (error) {
      console.error('AuthContext: auth check failed', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Run once at app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🟢 Login and persist user
  const login = async (userData) => {
    try {
      const userObj = normalizeUser(userData);
      //console.log("Stored user object (after login):", userObj);
     await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userObj));
      setUser(userObj);
      setIsAuthenticated(true);
      //console.log('AuthContext: login stored user', userObj);
    } catch (error) {
      console.error('AuthContext: login error', error);
    }
  };
// 🔴 Logout and clear storage
  const logout = async (navigation) => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
    //console.log('AuthContext: cleared storage + reset user');
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }], // 👈 change this to your login screen name
      });
    }
  } catch (error) {
    console.error('AuthContext: logout error', error);
  }
};

  // Require auth wrapper (use in screens like booking flow)
  const requireAuth = (navigation, currentRoute, additionalData = {}) => {
    if (!isAuthenticated || !user) {
      //console.log('AuthContext: user not authenticated, redirecting to AuthScreen');
      navigation.navigate('AuthScreen', {
        returnTo: currentRoute,
        message: 'Please login to continue',
        requiresAuth: true,
        ...additionalData,
      });
      return false;
    }
    return true;
  };

  const contextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for consuming context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
