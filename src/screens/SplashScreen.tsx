import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { colors, spacing, fontSizes } from '../utils/theme';

type SplashScreenProps = {
  setIsLoading?: (value: boolean) => void;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ setIsLoading }) => {
  // Use try/catch to handle cases where navigation might not be available
  let navigation: NavigationProp<ParamListBase> | undefined;
  try {
    navigation = useNavigation<NavigationProp<ParamListBase>>();
  } catch (error) {
    // Navigation context not available, this is fine if we're using setIsLoading prop
    console.log('Navigation not available in splash screen');
  }

  useEffect(() => {
    // Simulate loading app resources
    const timer = setTimeout(() => {
      // In a real app, we would check if the user is logged in
      // and navigate accordingly
      if (setIsLoading) {
        setIsLoading(false);
      } else if (navigation) {
        // If we're using this as a standalone screen, navigate away when done
        navigation.navigate('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, setIsLoading]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={require('../../assets/fitness-logo.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        <Text style={styles.title}>AI Fitness</Text>
        <Text style={styles.subtitle}>Fitness powered by intelligence</Text>
      </View>
      
      <ActivityIndicator 
        size="large" 
        color={colors.primary}
        style={styles.loader}
      />
      
      <Text style={styles.version}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  loader: {
    marginVertical: spacing.xl,
  },
  version: {
    position: 'absolute',
    bottom: spacing.xl,
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
  }
});

export default SplashScreen; 