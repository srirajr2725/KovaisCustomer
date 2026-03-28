// AuthScreen.js - Your complete updated AuthScreen
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useAuth } from '../AuthContext'; // Add this import
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import SignUp from './SignUp';

const AuthScreen = ({ navigation, route }) => {
  const { login } = useAuth();
  const returnTo = route?.params?.returnTo || null;
  const bookingState = route?.params?.bookingState || null;

  const handleLoginSuccess = async (userData) => {
    await login(userData);

    if (returnTo) {
      //console.log("Redirecting back to:", returnTo, "with bookingState:", bookingState);
      navigation.navigate(returnTo, bookingState ? { bookingState } : {});
    } else {
      navigation.navigate("Home"); // fallback
    }
  };

  return (
    <Login onLogin={handleLoginSuccess} />
  );
};


export default AuthScreen;