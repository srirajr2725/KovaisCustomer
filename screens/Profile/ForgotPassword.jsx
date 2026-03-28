import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { 
  Phone, Shield, Lock, Eye, EyeOff, Check, ArrowLeft, Key 
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const ForgotPassword = ({ 
  goBack, 
  onSendOTP, 
  onVerifyOTP, 
  onResetPassword, 
  showLogin 
}) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Error states
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Flow states
  const [currentStep, setCurrentStep] = useState('phone'); // phone, otp, password
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Refs for TextInputs
  const phoneRef = useRef(null);
  const otpRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // Timer for resend OTP
  React.useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle phone input
  const handlePhoneChange = useCallback((text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);
    setPhone(numericText);
    if (phoneError) setPhoneError('');
  }, [phoneError]);

  // Handle OTP input
  const handleOTPChange = useCallback((text) => {
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
    setOtp(numericText);
    if (otpError) setOtpError('');
  }, [otpError]);

  // Handle password inputs
  const handleNewPasswordChange = useCallback((text) => {
    setNewPassword(text);
    if (passwordError) setPasswordError('');
  }, [passwordError]);

  const handleConfirmPasswordChange = useCallback((text) => {
    setConfirmPassword(text);
    if (confirmPasswordError) setConfirmPasswordError('');
  }, [confirmPasswordError]);

  // Send OTP
  const handleSendOTP = async () => {
    setPhoneError('');
    
    if (!phone) {
      setPhoneError('Mobile number is required');
      phoneRef.current?.focus();
      return;
    }
    
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      phoneRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      // Call your API to send OTP
      if (onSendOTP) {
        const result = await onSendOTP(phone);
        if (result.success) {
          setCurrentStep('otp');
          setOtpSent(true);
          setResendTimer(30); // 30 second timer
          Alert.alert('OTP Sent', `Verification code sent to ${phone}`);
          setTimeout(() => otpRef.current?.focus(), 100);
        } else {
          Alert.alert('Error', result.message || 'Failed to send OTP');
        }
      } else {
        // Mock behavior for demo
        setCurrentStep('otp');
        setOtpSent(true);
        setResendTimer(30);
        Alert.alert('OTP Sent', `Verification code sent to ${phone}`);
        setTimeout(() => otpRef.current?.focus(), 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setOtpError('');
    
    if (!otp) {
      setOtpError('OTP is required');
      otpRef.current?.focus();
      return;
    }
    
    if (otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      otpRef.current?.focus();
      return;
    }

    setIsLoading(true);
    
    try {
      if (onVerifyOTP) {
        const result = await onVerifyOTP(phone, otp);
        if (result.success) {
          setCurrentStep('password');
          Alert.alert('Success', 'OTP verified successfully');
          setTimeout(() => newPasswordRef.current?.focus(), 100);
        } else {
          setOtpError(result.message || 'Invalid OTP');
          otpRef.current?.focus();
        }
      } else {
        // Mock behavior - accept any 6-digit OTP for demo
        setCurrentStep('password');
        Alert.alert('Success', 'OTP verified successfully');
        setTimeout(() => newPasswordRef.current?.focus(), 100);
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
      otpRef.current?.focus();
    }
    
    setIsLoading(false);
  };

  // Reset Password
  const handleResetPassword = async () => {
    setPasswordError('');
    setConfirmPasswordError('');
    
    let isValid = true;
    
    if (!newPassword) {
      setPasswordError('New password is required');
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }
    
    if (!isValid) {
      if (passwordError) {
        newPasswordRef.current?.focus();
      } else if (confirmPasswordError) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    setIsLoading(true);
    
    try {
      if (onResetPassword) {
        const result = await onResetPassword(phone, otp, newPassword);
        if (result.success) {
          Alert.alert(
            'Success', 
            'Password reset successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Reset state and go back to login
                  setPhone('');
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setCurrentStep('phone');
                  setOtpSent(false);
                  showLogin && showLogin();
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', result.message || 'Failed to reset password');
        }
      } else {
        // Mock behavior for demo
        Alert.alert(
          'Success', 
          'Password reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                setPhone('');
                setOtp('');
                setNewPassword('');
                setConfirmPassword('');
                setCurrentStep('phone');
                setOtpSent(false);
                showLogin && showLogin();
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    }
    
    setIsLoading(false);
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    
    try {
      if (onSendOTP) {
        const result = await onSendOTP(phone);
        if (result.success) {
          setResendTimer(30);
          Alert.alert('OTP Sent', 'New verification code sent');
        } else {
          Alert.alert('Error', result.message || 'Failed to resend OTP');
        }
      } else {
        // Mock behavior
        setResendTimer(30);
        Alert.alert('OTP Sent', 'New verification code sent');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
    
    setIsLoading(false);
  };

  const renderPhoneStep = () => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.form}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mobile Number</Text>
        <View style={[
          styles.inputWrapper, 
          phoneError ? styles.inputError : (phone ? styles.inputFocused : {})
        ]}>
          <Phone size={16} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            ref={phoneRef}
            placeholder="Enter 10-digit mobile number"
            style={styles.input}
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="number-pad"
            maxLength={10}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleSendOTP}
          />
        </View>
        {phoneError ? (
          <Animatable.View animation="shake">
            <Text style={styles.errorText}>{phoneError}</Text>
          </Animatable.View>
        ) : null}
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
        onPress={handleSendOTP}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Sending...' : 'Send OTP'}
        </Text>
        <ArrowLeft size={16} color="#FFFFFF" style={styles.buttonIcon} />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderOTPStep = () => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.form}>
      <Text style={styles.otpInfo}>
        We've sent a verification code to {phone}
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter OTP</Text>
        <View style={[
          styles.inputWrapper, 
          otpError ? styles.inputError : (otp ? styles.inputFocused : {})
        ]}>
          <Shield size={16} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            ref={otpRef}
            placeholder="Enter 6-digit OTP"
            style={styles.input}
            value={otp}
            onChangeText={handleOTPChange}
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleVerifyOTP}
          />
        </View>
        {otpError ? (
          <Animatable.View animation="shake">
            <Text style={styles.errorText}>{otpError}</Text>
          </Animatable.View>
        ) : null}
      </View>

      <View style={styles.resendContainer}>
        {resendTimer > 0 ? (
          <Text style={styles.resendTimer}>
            Resend OTP in {resendTimer}s
          </Text>
        ) : (
          <TouchableOpacity onPress={handleResendOTP} disabled={isLoading}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
        onPress={handleVerifyOTP}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Verifying...' : 'Verify OTP'}
        </Text>
        <Check size={16} color="#FFFFFF" style={styles.buttonIcon} />
      </TouchableOpacity>
    </Animatable.View>
  );

  const renderPasswordStep = () => (
    <Animatable.View animation="fadeInUp" duration={600} style={styles.form}>
      <Text style={styles.otpInfo}>
        Create a new password for your account
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={[
          styles.inputWrapper, 
          passwordError ? styles.inputError : (newPassword ? styles.inputFocused : {})
        ]}>
          <Lock size={16} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            ref={newPasswordRef}
            placeholder="Enter new password"
            style={styles.input}
            value={newPassword}
            onChangeText={handleNewPasswordChange}
            secureTextEntry={!showNewPassword}
            placeholderTextColor="#9CA3AF"
            returnKeyType="next"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
            <TouchableOpacity
              onPress={() => setShowNewPassword(!showNewPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              {showNewPassword ? <Eye size={16} color="#6B7280" /> : <EyeOff size={16} color="#6B7280" />}
            </TouchableOpacity>
        </View>
        {passwordError ? (
          <Animatable.View animation="shake">
            <Text style={styles.errorText}>{passwordError}</Text>
          </Animatable.View>
        ) : null}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={[
          styles.inputWrapper, 
          confirmPasswordError ? styles.inputError : (confirmPassword ? styles.inputFocused : {})
        ]}>
          <Lock size={16} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            ref={confirmPasswordRef}
            placeholder="Confirm new password"
            style={styles.input}
            value={confirmPassword}
            onChangeText={handleConfirmPasswordChange}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={handleResetPassword}
          />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              {showConfirmPassword ? <Eye size={16} color="#6B7280" /> : <EyeOff size={16} color="#6B7280" />}
            </TouchableOpacity>
        </View>
        {confirmPasswordError ? (
          <Animatable.View animation="shake">
            <Text style={styles.errorText}>{confirmPasswordError}</Text>
          </Animatable.View>
        ) : null}
      </View>

      <TouchableOpacity 
        style={[styles.primaryButton, isLoading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Text>
        <Check size={16} color="#FFFFFF" style={styles.buttonIcon} />
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <Animatable.View animation="fadeInDown" duration={600} style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (currentStep === 'otp' && otpSent) {
                  setCurrentStep('phone');
                } else if (currentStep === 'password') {
                  setCurrentStep('otp');
                } else {
                  showLogin ? showLogin() : goBack && goBack();
                }
              }}
              activeOpacity={0.7}
            >
              <ArrowLeft size={24} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.iconContainer}>
              <Key size={36} color="#4F46E5" />
            </View>
            
            <Text style={styles.title}>
              {currentStep === 'phone' && 'Forgot Password?'}
              {currentStep === 'otp' && 'Enter OTP'}
              {currentStep === 'password' && 'Reset Password'}
            </Text>
            
            <Text style={styles.subtitle}>
              {currentStep === 'phone' && "Don't worry! Enter your mobile number and we'll send you a verification code."}
              {currentStep === 'otp' && 'Please enter the verification code sent to your mobile number.'}
              {currentStep === 'password' && 'Please create a new password for your account.'}
            </Text>
          </Animatable.View>

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, currentStep !== 'phone' && styles.progressStepCompleted]}>
              <Text style={[styles.progressText, currentStep !== 'phone' && styles.progressTextCompleted]}>1</Text>
            </View>
            <View style={[styles.progressLine, currentStep === 'password' && styles.progressLineCompleted]} />
            <View style={[styles.progressStep, currentStep === 'password' && styles.progressStepCompleted]}>
              <Text style={[styles.progressText, currentStep === 'password' && styles.progressTextCompleted]}>2</Text>
            </View>
          </View>

          {/* Form Steps */}
          {currentStep === 'phone' && renderPhoneStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'password' && renderPasswordStep()}

          {/* Back to Login */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Remember your password? </Text>
            <TouchableOpacity onPress={showLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height * 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.9,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 20,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    width: 120,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepCompleted: {
    backgroundColor: '#4F46E5',
  },
  progressText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  progressTextCompleted: {
    color: '#FFFFFF',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  progressLineCompleted: {
    backgroundColor: '#4F46E5',
  },
  form: {
    width: '100%',
    maxWidth: 360,
  },
  otpInfo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#4F46E5',
    backgroundColor: '#FFFFFF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  resendTimer: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  resendLink: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  loginText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '400',
  },
  loginLink: {
    color: '#4F46E5',
    fontSize: 15,
    fontWeight: '600',
  },
});


















































