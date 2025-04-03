import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Button, Avatar, ProgressBar, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootState } from '../store';
import { spacing, fontSizes } from '../utils/theme';

// Add tintColor helper for icons that need color properties not in MD3Colors
const iconColors = {
  success: '#4CAF50',  // Green
  warning: '#FFC107',  // Amber 
  info: '#2196F3',     // Blue
  error: '#F44336'     // Red
};

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();
  const user = useSelector((state: RootState) => state.user);
  const profile = user?.profile || { name: 'User' };
  
  // Get theme from React Native Paper
  const theme = useTheme();
  
  // Fix the destructuring to match the actual state shape
  const workout = useSelector((state: RootState) => state.workout);
  const activeWorkout = workout?.activeWorkout || null;
  const workoutHistory = workout?.workoutHistory || [];
  const workouts = workout?.workouts || [];
  
  const nutrition = useSelector((state: RootState) => state.nutrition);
  const foodEntries = nutrition?.foodEntries || [];
  const dailyGoals = nutrition?.dailyGoals || { 
    calories: 2000, 
    protein: 150, 
    carbs: 200, 
    fat: 65 
  };
  const water = nutrition?.water || { current: 0, target: 2 };
  
  // Filter entries for today
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = foodEntries.filter(entry => entry.date === today);
  
  // Calculate daily nutrition totals
  const nutritionTotals = todayEntries.reduce((acc, entry) => ({
    calories: acc.calories + entry.calories,
    protein: acc.protein + entry.protein,
    carbs: acc.carbs + entry.carbs,
    fat: acc.fat + entry.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  // Get next scheduled workout - using regular workouts instead of scheduledWorkouts
  const nextWorkout = workouts.find(workout => 
    !workout.completed && new Date(workout.date) >= new Date()
  );
  
  // Calculate workout stats using workoutHistory instead of completedWorkouts
  const workoutStats = {
    completed: workoutHistory.length,
    streak: calculateStreak(),
    lastWorkout: workoutHistory.length > 0 ? 
      workoutHistory[0] : null
  };
  
  // Helper function to calculate workout streak
  function calculateStreak() {
    // This would be more complex in a real app
    return workoutHistory.length > 0 ? 3 : 0; // Mock value
  }
  
  // Navigate to workout screen
  const handleStartWorkout = () => {
    navigation.navigate('Workout');
  };
  
  // Navigate to nutrition screen
  const handleLogFood = () => {
    navigation.navigate('Nutrition');
  };
  
  // Navigate to progress screen
  const handleViewProgress = () => {
    navigation.navigate('Progress');
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={[styles.greeting, { color: theme.colors.onBackground }]}>Hello, {profile.name}!</Text>
          <Text style={[styles.welcomeMessage, { color: theme.colors.onSurfaceVariant }]}>
            {getGreetingMessage()}
          </Text>
        </View>
        <Avatar.Text 
          size={60} 
          label={profile.name.substring(0, 2).toUpperCase()} 
          color="white"
          style={{ backgroundColor: theme.colors.primary }}
        />
      </View>
      
      {/* Today's Overview Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Today's Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="fire" size={24} color={iconColors.warning} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionTotals.calories}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>kcal</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="food-drumstick" size={24} color={iconColors.success} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionTotals.protein}g</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>protein</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="water" size={24} color={iconColors.info} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{water.current}L</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>water</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="dumbbell" size={24} color={theme.colors.primary} />
              <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{workoutStats.streak}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>streak</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
      
      {/* Active Workout Card (if exists) */}
      {activeWorkout ? (
        <Card style={[styles.card, { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.outline, 
          borderLeftColor: theme.colors.primary, 
          borderLeftWidth: 3 
        }]}>
          <Card.Content>
            <View style={styles.activeWorkoutHeader}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color={theme.colors.primary} />
              <Text style={[styles.activeWorkoutTitle, { color: theme.colors.primary }]}>Workout in Progress</Text>
            </View>
            <Text style={[styles.workoutName, { color: theme.colors.onSurface }]}>{activeWorkout.name}</Text>
            <Text style={[styles.workoutDetails, { color: theme.colors.onSurfaceVariant }]}>
              Started {formatTimeAgo(new Date(activeWorkout.date))} • {
                activeWorkout.exercises.filter(ex => 
                  ex.sets.some(set => set.completed)
                ).length
              } of {activeWorkout.exercises.length} exercises
            </Text>
            <Button 
              mode="contained" 
              onPress={handleStartWorkout}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              textColor={theme.colors.onPrimary}
            >
              Continue Workout
            </Button>
          </Card.Content>
        </Card>
      ) : nextWorkout ? (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Next Workout</Text>
            <Text style={[styles.workoutName, { color: theme.colors.onSurface }]}>{nextWorkout.name}</Text>
            <Text style={[styles.workoutDetails, { color: theme.colors.onSurfaceVariant }]}>
              Scheduled for {formatDate(new Date(nextWorkout.date))} • {nextWorkout.duration || 45} min
            </Text>
            <Button 
              mode="contained" 
              onPress={handleStartWorkout}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              textColor={theme.colors.onPrimary}
            >
              Start Workout
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Ready for a Workout?</Text>
            <Text style={[styles.noWorkoutText, { color: theme.colors.onSurfaceVariant }]}>
              No workouts scheduled for today. Choose a workout to get started.
            </Text>
            <Button 
              mode="contained" 
              onPress={handleStartWorkout}
              style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
              textColor={theme.colors.onPrimary}
            >
              Browse Workouts
            </Button>
          </Card.Content>
        </Card>
      )}
      
      {/* Nutrition Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Nutrition Today</Text>
          <View style={styles.nutritionSection}>
            <View style={styles.nutritionHeader}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.onSurface }]}>Calories</Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.onSurface }]}>
                {nutritionTotals.calories} / {dailyGoals.calories} kcal
              </Text>
            </View>
            <ProgressBar 
              progress={Math.min(nutritionTotals.calories / dailyGoals.calories, 1)} 
              color={theme.colors.primary} 
              style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}
            />
          </View>
          
          <View style={styles.macrosGrid}>
            <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, { color: theme.colors.onSurface }]}>Protein</Text>
              <View style={styles.macroValueContainer}>
                <Text style={[styles.macroValue, { color: theme.colors.onSurface }]}>{nutritionTotals.protein}</Text>
                <Text style={[styles.macroUnit, { color: theme.colors.onSurfaceVariant }]}>g</Text>
              </View>
              <ProgressBar 
                progress={Math.min(nutritionTotals.protein / dailyGoals.protein, 1)} 
                color={iconColors.success} 
                style={[styles.macroProgressBar, { backgroundColor: theme.colors.surfaceVariant }]}
              />
            </View>
            
            <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, { color: theme.colors.onSurface }]}>Carbs</Text>
              <View style={styles.macroValueContainer}>
                <Text style={[styles.macroValue, { color: theme.colors.onSurface }]}>{nutritionTotals.carbs}</Text>
                <Text style={[styles.macroUnit, { color: theme.colors.onSurfaceVariant }]}>g</Text>
              </View>
              <ProgressBar 
                progress={Math.min(nutritionTotals.carbs / dailyGoals.carbs, 1)} 
                color={iconColors.warning} 
                style={[styles.macroProgressBar, { backgroundColor: theme.colors.surfaceVariant }]}
              />
            </View>
            
            <View style={styles.macroItem}>
              <Text style={[styles.macroLabel, { color: theme.colors.onSurface }]}>Fats</Text>
              <View style={styles.macroValueContainer}>
                <Text style={[styles.macroValue, { color: theme.colors.onSurface }]}>{nutritionTotals.fat}</Text>
                <Text style={[styles.macroUnit, { color: theme.colors.onSurfaceVariant }]}>g</Text>
              </View>
              <ProgressBar 
                progress={Math.min(nutritionTotals.fat / dailyGoals.fat, 1)} 
                color={iconColors.error} 
                style={[styles.macroProgressBar, { backgroundColor: theme.colors.surfaceVariant }]}
              />
            </View>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={handleLogFood}
            style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
            textColor={theme.colors.primary}
            icon="food-apple"
          >
            Log Food
          </Button>
        </Card.Content>
      </Card>
      
      {/* Progress Highlights Card */}
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Card.Content>
          <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>Progress Highlights</Text>
          
          <View style={styles.highlightItem}>
            <View style={styles.highlightIconContainer}>
              <MaterialCommunityIcons name="trending-up" size={24} color={iconColors.success} />
            </View>
            <View style={styles.highlightContent}>
              <Text style={[styles.highlightTitle, { color: theme.colors.onSurface }]}>Bench Press Improvement</Text>
              <Text style={[styles.highlightDescription, { color: theme.colors.onSurfaceVariant }]}>Up 10lbs since last month</Text>
            </View>
          </View>
          
          <Divider style={[styles.divider, { backgroundColor: theme.colors.surfaceVariant }]} />
          
          <View style={styles.highlightItem}>
            <View style={styles.highlightIconContainer}>
              <MaterialCommunityIcons name="trophy" size={24} color={iconColors.warning} />
            </View>
            <View style={styles.highlightContent}>
              <Text style={[styles.highlightTitle, { color: theme.colors.onSurface }]}>New Personal Record</Text>
              <Text style={[styles.highlightDescription, { color: theme.colors.onSurfaceVariant }]}>Deadlift max: 225lbs</Text>
            </View>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={handleViewProgress}
            style={[styles.outlineButton, { borderColor: theme.colors.primary }]}
            textColor={theme.colors.primary}
            icon="chart-line"
          >
            View All Progress
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

// Helper function to get greeting based on time of day
function getGreetingMessage() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Ready for a great day?";
  if (hour < 18) return "Good afternoon! How's your day going?";
  return "Good evening! Still time for a workout!";
}

// Format date in readable format
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('en-US', options);
}

// Format relative time
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  welcomeContent: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  welcomeMessage: {
    fontSize: fontSizes.md,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
  },
  activeWorkoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  activeWorkoutTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  workoutName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  workoutDetails: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  noWorkoutText: {
    fontSize: fontSizes.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  outlineButton: {
    marginTop: spacing.md,
  },
  nutritionSection: {
    marginBottom: spacing.md,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  nutritionLabel: {
    fontSize: fontSizes.md,
  },
  nutritionValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  macroItem: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  macroLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  macroValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  macroValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  macroUnit: {
    fontSize: fontSizes.xs,
    marginLeft: 2,
  },
  macroProgressBar: {
    height: 4,
    borderRadius: 2,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  highlightIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  highlightDescription: {
    fontSize: fontSizes.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
});

export default DashboardScreen; 