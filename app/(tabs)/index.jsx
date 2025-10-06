import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator,
  Modal, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/firebase';

// Import CSS for web-specific styling
if (Platform.OS === 'web') {
  require('./index.css');
}

// Toast Modal Component
function ToastModal({ visible, message, type, onClose, isDarkMode }) {
  const getToastStyles = () => {
    const baseStyles = {
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderLeftColor: type === 'success' ? '#10b981' : type === 'info' ? '#3b82f6' : '#ef4444',
    };
    return baseStyles;
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '❌';
    }
  };

  const getTextColor = () => {
    return isDarkMode ? '#f9fafb' : '#1f2937';
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[styles.toastContainer, getToastStyles()]}
          {...(Platform.OS === 'web' && { className: 'toast-container' })}
        >
          <View style={styles.toastContent}>
            <Text style={styles.toastIcon}>{getIcon()}</Text>
            <Text style={[styles.toastMessage, { color: getTextColor() }]}>
              {message}
            </Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.toastCloseButton}
              {...(Platform.OS === 'web' && { className: 'toast-close-button' })}
            >
              <Text style={[styles.toastCloseText, { color: getTextColor() }]}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});

  // Toast modal state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error'); // 'error', 'success', 'info'

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/HomeScreen');
    }
  }, [user]);

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginPassword) {
      errors.password = 'Password is required';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerName.trim()) {
      errors.name = 'Full name is required';
    } else if (!validateName(registerName)) {
      errors.name = 'Name must be at least 2 characters long';
    }
    
    if (!registerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerPassword)) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear errors when user starts typing
  const clearLoginErrors = () => {
    if (Object.keys(loginErrors).length > 0) {
      setLoginErrors({});
    }
  };

  const clearRegisterErrors = () => {
    if (Object.keys(registerErrors).length > 0) {
      setRegisterErrors({});
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    // Clear all errors when switching modes
    setLoginErrors({});
    setRegisterErrors({});
  };

  // Toast message functions
  const showToastMessage = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setIsLoading(false);
      showToastMessage('Login successful! Welcome back.', 'success');
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        default:
          errorMessage = error.message;
      }
      
      showToastMessage(errorMessage, 'error');
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);
      await updateProfile(userCredential.user, {
        displayName: registerName,
      });
      setIsLoading(false);
      showToastMessage('Account created successfully! Welcome to Golf Club.', 'success');
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Registration is currently disabled.';
          break;
        default:
          errorMessage = error.message;
      }
      
      showToastMessage(errorMessage, 'error');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDarkMode && { backgroundColor: '#121212' },
        isWeb && styles.webContainer,
      ]}
      keyboardShouldPersistTaps="handled"
      {...(isWeb && { className: isDarkMode ? 'dark web-container' : 'web-container' })}
    >
      <View 
        style={[styles.contentWrapper, isWeb && styles.webContentWrapper]}
        {...(isWeb && { className: 'web-content-wrapper' })}
    >
      <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, isDarkMode && styles.iconCircleDark]}>
            <Text style={styles.icon}>⛳</Text>
          </View>
        </View>
        <Text 
          style={[styles.title, isDarkMode && { color: '#fff' }]}
          {...(isWeb && { className: 'title' })}
        >
        Welcome to Golf Club
      </Text>
        <Text 
          style={[styles.subtitle, isDarkMode && { color: '#b0b0b0' }]}
          {...(isWeb && { className: 'subtitle' })}
        >
          Master your swing, track your progress
      </Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => handleModeChange('login')}
          style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
          {...(isWeb && { className: 'tab' })}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleModeChange('register')}
          style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
          {...(isWeb && { className: 'tab' })}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Forms */}
      {mode === 'login' ? (
        <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#e0e0e0' }]}>Email</Text>
          <TextInput
            placeholder="name@example.com"
                style={[
                  styles.input, 
                  isDarkMode && styles.inputDark,
                  loginErrors.email && styles.inputError
                ]}
            value={loginEmail}
                onChangeText={(text) => {
                  setLoginEmail(text);
                  clearLoginErrors();
                }}
            keyboardType="email-address"
            autoCapitalize="none"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                {...(isWeb && { className: 'input' })}
              />
              {loginErrors.email && (
                <Text style={[styles.errorText, isDarkMode && { color: '#ff6b6b' }]}>
                  {loginErrors.email}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#e0e0e0' }]}>Password</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
                style={[
                  styles.input, 
                  isDarkMode && styles.inputDark,
                  loginErrors.password && styles.inputError
                ]}
            value={loginPassword}
                onChangeText={(text) => {
                  setLoginPassword(text);
                  clearLoginErrors();
                }}
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                {...(isWeb && { className: 'input' })}
              />
              {loginErrors.password && (
                <Text style={[styles.errorText, isDarkMode && { color: '#ff6b6b' }]}>
                  {loginErrors.password}
                </Text>
              )}
            </View>
          <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, isDarkMode && { color: '#64b5f6' }]}>Forgot password?</Text>
          </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogin} 
              style={[styles.button, isDarkMode && styles.buttonDark]} 
              disabled={isLoading}
              {...(isWeb && { className: 'button' })}
            >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#e0e0e0' }]}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
                style={[
                  styles.input, 
                  isDarkMode && styles.inputDark,
                  registerErrors.name && styles.inputError
                ]}
            value={registerName}
                onChangeText={(text) => {
                  setRegisterName(text);
                  clearRegisterErrors();
                }}
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                {...(isWeb && { className: 'input' })}
              />
              {registerErrors.name && (
                <Text style={[styles.errorText, isDarkMode && { color: '#ff6b6b' }]}>
                  {registerErrors.name}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#e0e0e0' }]}>Email</Text>
          <TextInput
            placeholder="name@example.com"
                style={[
                  styles.input, 
                  isDarkMode && styles.inputDark,
                  registerErrors.email && styles.inputError
                ]}
            value={registerEmail}
                onChangeText={(text) => {
                  setRegisterEmail(text);
                  clearRegisterErrors();
                }}
            keyboardType="email-address"
            autoCapitalize="none"
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                {...(isWeb && { className: 'input' })}
              />
              {registerErrors.email && (
                <Text style={[styles.errorText, isDarkMode && { color: '#ff6b6b' }]}>
                  {registerErrors.email}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, isDarkMode && { color: '#e0e0e0' }]}>Password</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
                style={[
                  styles.input, 
                  isDarkMode && styles.inputDark,
                  registerErrors.password && styles.inputError
                ]}
            value={registerPassword}
                onChangeText={(text) => {
                  setRegisterPassword(text);
                  clearRegisterErrors();
                }}
                placeholderTextColor={isDarkMode ? '#666' : '#999'}
                {...(isWeb && { className: 'input' })}
              />
              {registerErrors.password && (
                <Text style={[styles.errorText, isDarkMode && { color: '#ff6b6b' }]}>
                  {registerErrors.password}
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={handleRegister} 
              style={[styles.button, isDarkMode && styles.buttonDark]} 
              disabled={isLoading}
              {...(isWeb && { className: 'button' })}
            >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity>
          <Text style={[styles.privacyPolicy, isDarkMode && { color: '#64b5f6' }]}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Modal */}
      <ToastModal 
        visible={showToast}
        message={toastMessage}
        type={toastType}
        onClose={hideToast}
        isDarkMode={isDarkMode}
      />
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
  },
  webContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    '@media (max-width: 768px)': {
      padding: 16,
    },
    '@media (max-width: 480px)': {
      padding: 12,
    },
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  webContentWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    '@media (max-width: 768px)': {
      padding: 20,
      borderRadius: 10,
    },
    '@media (max-width: 480px)': {
      padding: 16,
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    },
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  iconCircleDark: {
    backgroundColor: '#1e293b',
    borderColor: '#0ea5e9',
  },
  icon: {
    fontSize: 32,
    color: '#0ea5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1e293b',
    letterSpacing: -0.3,
    '@media (max-width: 768px)': {
      fontSize: 22,
    },
    '@media (max-width: 480px)': {
      fontSize: 20,
    },
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#64748b',
    lineHeight: 20,
    '@media (max-width: 480px)': {
      fontSize: 13,
      marginBottom: 20,
    },
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 7,
  },
  activeTabBackground: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#0ea5e9',
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: '600',
    color: '#374151',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 15,
    color: '#1f2937',
  },
  inputDark: {
    backgroundColor: '#1f2937',
    borderColor: '#374151',
    color: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#0ea5e9',
    fontSize: 13,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonDark: {
    backgroundColor: '#0284c7',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: '#0ea5e9',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // Toast Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  toastContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '100%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  toastCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  toastCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});
