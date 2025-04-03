import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Divider,
  HelperText 
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, fontSizes } from '../utils/theme';
import { loginUser } from '../store/slices/userSlice';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form validation
  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email === '' || emailRegex.test(email);
  };
  
  const isPasswordValid = () => {
    return password === '' || password.length >= 6;
  };
  
  // Handle login
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, we would call an API here
      // For now, we'll simulate a successful login after a delay
      setTimeout(() => {
        dispatch(loginUser({
          id: '123',
          email,
          name: 'Demo User',
          avatar: null,
          token: 'mock-jwt-token'
        }));
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setIsLoading(false);
      setError('Invalid email or password. Please try again.');
      console.error('Login error:', err);
    }
  };
  
  // Handle signup
  const handleSignup = () => {
    // Navigate to signup screen
    // navigation.navigate('Signup');
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    // Navigate to forgot password screen
    // navigation.navigate('ForgotPassword');
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image 
            source={require('../../assets/fitness-logo.png')} 
            style={styles.logo}
            resizeMode="contain" 
          />
          <Text style={styles.title}>AI Fitness</Text>
          <Text style={styles.subtitle}>Your personalized fitness journey</Text>
        </View>
        
        <View style={styles.form}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={!isEmailValid()}
            left={<TextInput.Icon icon="email" color={colors.textSecondary} />}
          />
          <HelperText type="error" visible={!isEmailValid()}>
            Please enter a valid email address
          </HelperText>
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry={!isPasswordVisible}
            error={!isPasswordValid()}
            left={<TextInput.Icon icon="lock" color={colors.textSecondary} />}
            right={
              <TextInput.Icon 
                icon={isPasswordVisible ? "eye-off" : "eye"} 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                color={colors.textSecondary} 
              />
            }
          />
          <HelperText type="error" visible={!isPasswordValid()}>
            Password must be at least 6 characters
          </HelperText>
          
          <TouchableOpacity 
            style={styles.forgotPassword} 
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <Button 
            mode="contained" 
            onPress={handleLogin} 
            style={styles.loginButton}
            loading={isLoading}
            disabled={isLoading || !email || !password}
          >
            Log In
          </Button>
          
          <View style={styles.orContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <Divider style={styles.divider} />
          </View>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
              <MaterialCommunityIcons name="google" size={24} color="#EA4335" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
              <MaterialCommunityIcons name="apple" size={24} color="#000000" />
              <Text style={styles.socialButtonText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  input: {
    backgroundColor: colors.card,
    marginBottom: spacing.xs,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  loginButton: {
    padding: spacing.xs,
    backgroundColor: colors.primary,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    backgroundColor: colors.border,
  },
  orText: {
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.sm,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  googleButton: {
    backgroundColor: 'rgba(234, 67, 53, 0.1)',
  },
  appleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  socialButtonText: {
    marginLeft: spacing.sm,
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginRight: spacing.xs,
  },
  signupText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
});

export default LoginScreen; 