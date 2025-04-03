import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Card, List, Divider, Avatar, Button, Dialog, Portal, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUserProfile, updateUserPreferences } from '../store/slices/userSlice';
import { spacing, fontSizes } from '../utils/theme';
import { toggleDarkMode } from '../store/slices/settingsSlice';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { profile, preferences } = useSelector((state: RootState) => state.user);
  const { darkMode } = useSelector((state: RootState) => state.settings);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  
  // State for profile editing dialog
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [name, setName] = useState(profile.name);
  const [weight, setWeight] = useState(profile.weight.toString());
  const [height, setHeight] = useState(profile.height.toString());
  const [age, setAge] = useState(profile.age.toString());
  const [gender, setGender] = useState(profile.gender);
  
  // State for goal dialog
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goal, setGoal] = useState(preferences.fitnessGoal);
  
  // State for unit preferences
  const [useMetric, setUseMetric] = useState(preferences.useMetricSystem);
  
  // State for notification settings
  const [enableWorkoutReminders, setEnableWorkoutReminders] = useState(preferences.notifications.workoutReminders);
  const [enableNutritionReminders, setEnableNutritionReminders] = useState(preferences.notifications.nutritionReminders);
  const [enableProgressUpdates, setEnableProgressUpdates] = useState(preferences.notifications.progressUpdates);
  
  // Handle toggling dark mode
  const handleToggleDarkMode = () => {
    // Toggle dark mode in Redux
    dispatch(toggleDarkMode());
    
    // Also update local state for immediate feedback
    setLocalDarkMode(!localDarkMode);
    
    // Force reload to apply theme changes
    setTimeout(() => {
      setShowProfileDialog(false); // Close any open dialogs
      setShowGoalDialog(false);
    }, 100);
  };
  
  // Handle toggling metric units
  const handleToggleMetric = () => {
    const newValue = !useMetric;
    setUseMetric(newValue);
    dispatch(updateUserPreferences({ useMetricSystem: newValue }));
  };
  
  // Handle updating profile
  const handleUpdateProfile = () => {
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age, 10);
    
    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for weight, height, and age.');
      return;
    }
    
    dispatch(updateUserProfile({
      name,
      weight: weightNum,
      height: heightNum,
      age: ageNum,
      gender,
    }));
    
    setShowProfileDialog(false);
  };
  
  // Handle updating fitness goal
  const handleUpdateGoal = () => {
    dispatch(updateUserPreferences({ fitnessGoal: goal }));
    setShowGoalDialog(false);
  };
  
  // Handle toggling notification settings
  const handleToggleNotification = (type: 'workoutReminders' | 'nutritionReminders' | 'progressUpdates', value: boolean) => {
    const updates = {
      notifications: {
        ...preferences.notifications,
        [type]: value,
      }
    };
    
    dispatch(updateUserPreferences(updates));
    
    // Update local state
    if (type === 'workoutReminders') setEnableWorkoutReminders(value);
    if (type === 'nutritionReminders') setEnableNutritionReminders(value);
    if (type === 'progressUpdates') setEnableProgressUpdates(value);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Settings</Text>
      
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={profile.name.substring(0, 2).toUpperCase()} 
                color="white"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>{profile.name}</Text>
                <Text style={[styles.profileDetails, { color: theme.colors.onSurfaceVariant }]}>
                  {profile.age} years, {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </Text>
                <Text style={[styles.profileDetails, { color: theme.colors.onSurfaceVariant }]}>
                  {useMetric ? `${profile.height} cm, ${profile.weight} kg` : 
                    `${Math.round(profile.height / 2.54)} in, ${Math.round(profile.weight * 2.2046)} lbs`}
                </Text>
              </View>
            </View>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowProfileDialog(true)} 
              style={[styles.editButton, { borderColor: theme.colors.primary }]}
              textColor={theme.colors.primary}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>
        
        {/* Fitness Goals */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Fitness Goal</Text>
            <View style={styles.goalContainer}>
              <View style={styles.goalItem}>
                <MaterialCommunityIcons 
                  name={
                    goal === 'weightLoss' ? 'scale-bathroom' : 
                    goal === 'muscleGain' ? 'arm-flex' : 'run'
                  } 
                  size={24} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
                  {goal === 'weightLoss' ? 'Weight Loss' : 
                   goal === 'muscleGain' ? 'Muscle Gain' : 
                   goal === 'endurance' ? 'Endurance' : 'General Fitness'}
                </Text>
              </View>
              <Button 
                mode="text" 
                onPress={() => setShowGoalDialog(true)}
                textColor={theme.colors.primary}
              >
                Change
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* App Preferences */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>App Preferences</Text>
            
            <List.Item
              title="Dark Mode"
              description="Enable dark mode for the app"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="theme-light-dark" color={theme.colors.primary} />}
              right={props => <Switch value={localDarkMode} onValueChange={handleToggleDarkMode} />}
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Use Metric System"
              description="Switch between metric and imperial units"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="ruler" color={theme.colors.primary} />}
              right={props => <Switch value={useMetric} onValueChange={handleToggleMetric} />}
            />
          </Card.Content>
        </Card>
        
        {/* Notification Settings */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Notifications</Text>
            
            <List.Item
              title="Workout Reminders"
              description="Get reminders for your scheduled workouts"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="dumbbell" color={theme.colors.primary} />}
              right={props => 
                <Switch 
                  value={enableWorkoutReminders} 
                  onValueChange={(value) => handleToggleNotification('workoutReminders', value)} 
                />
              }
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Nutrition Reminders"
              description="Get reminders to log your meals"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="food-apple" color={theme.colors.primary} />}
              right={props => 
                <Switch 
                  value={enableNutritionReminders} 
                  onValueChange={(value) => handleToggleNotification('nutritionReminders', value)} 
                />
              }
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Progress Updates"
              description="Receive updates about your fitness progress"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="chart-line" color={theme.colors.primary} />}
              right={props => 
                <Switch 
                  value={enableProgressUpdates} 
                  onValueChange={(value) => handleToggleNotification('progressUpdates', value)} 
                />
              }
            />
          </Card.Content>
        </Card>
        
        {/* About & Support */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>About & Support</Text>
            
            <List.Item
              title="Privacy Policy"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
              onPress={() => {/* Navigate to privacy policy */}}
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Terms of Service"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              onPress={() => {/* Navigate to terms of service */}}
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="Contact Support"
              titleStyle={{ color: theme.colors.onSurface }}
              left={props => <List.Icon {...props} icon="help-circle" color={theme.colors.primary} />}
              onPress={() => {/* Open support contact options */}}
            />
            
            <Divider style={[styles.divider, { backgroundColor: theme.colors.outline }]} />
            
            <List.Item
              title="App Version"
              description="1.0.0"
              titleStyle={{ color: theme.colors.onSurface }}
              descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            />
          </Card.Content>
        </Card>
        
        <Button 
          mode="outlined" 
          onPress={() => {/* Handle logout */}} 
          style={[styles.logoutButton, { borderColor: theme.colors.error }]}
          textColor={theme.colors.error}
        >
          Log Out
        </Button>
      </ScrollView>
      
      {/* Profile Edit Dialog */}
      <Portal>
        <Dialog visible={showProfileDialog} onDismiss={() => setShowProfileDialog(false)}>
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            
            <TextInput
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              style={styles.dialogInput}
            />
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { borderColor: theme.colors.outline },
                  gender === 'male' && [styles.genderButtonSelected, 
                    { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
                ]}
                onPress={() => setGender('male')}
              >
                <MaterialCommunityIcons
                  name="gender-male"
                  size={24}
                  color={gender === 'male' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: theme.colors.onSurfaceVariant },
                    gender === 'male' && [styles.genderButtonTextSelected, { color: theme.colors.primary }]
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { borderColor: theme.colors.outline },
                  gender === 'female' && [styles.genderButtonSelected, 
                    { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
                ]}
                onPress={() => setGender('female')}
              >
                <MaterialCommunityIcons
                  name="gender-female"
                  size={24}
                  color={gender === 'female' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: theme.colors.onSurfaceVariant },
                    gender === 'female' && [styles.genderButtonTextSelected, { color: theme.colors.primary }]
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  { borderColor: theme.colors.outline },
                  gender === 'other' && [styles.genderButtonSelected, 
                    { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
                ]}
                onPress={() => setGender('other')}
              >
                <MaterialCommunityIcons
                  name="gender-non-binary"
                  size={24}
                  color={gender === 'other' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    { color: theme.colors.onSurfaceVariant },
                    gender === 'other' && [styles.genderButtonTextSelected, { color: theme.colors.primary }]
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProfileDialog(false)} textColor={theme.colors.onSurface}>Cancel</Button>
            <Button onPress={handleUpdateProfile} textColor={theme.colors.primary}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Goal Setting Dialog */}
      <Portal>
        <Dialog visible={showGoalDialog} onDismiss={() => setShowGoalDialog(false)}>
          <Dialog.Title>Change Fitness Goal</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={[
                styles.goalOption,
                { borderColor: theme.colors.outline },
                goal === 'weightLoss' && [styles.goalOptionSelected, 
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
              ]}
              onPress={() => setGoal('weightLoss')}
            >
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={24}
                color={goal === 'weightLoss' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <View style={styles.goalOptionText}>
                <Text style={[styles.goalOptionTitle, { color: theme.colors.onSurface }]}>Weight Loss</Text>
                <Text style={[styles.goalOptionDescription, { color: theme.colors.onSurfaceVariant }]}>Focus on losing weight and burning fat</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                { borderColor: theme.colors.outline },
                goal === 'muscleGain' && [styles.goalOptionSelected, 
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
              ]}
              onPress={() => setGoal('muscleGain')}
            >
              <MaterialCommunityIcons
                name="arm-flex"
                size={24}
                color={goal === 'muscleGain' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <View style={styles.goalOptionText}>
                <Text style={[styles.goalOptionTitle, { color: theme.colors.onSurface }]}>Muscle Gain</Text>
                <Text style={[styles.goalOptionDescription, { color: theme.colors.onSurfaceVariant }]}>Focus on building muscle and strength</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                { borderColor: theme.colors.outline },
                goal === 'endurance' && [styles.goalOptionSelected, 
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
              ]}
              onPress={() => setGoal('endurance')}
            >
              <MaterialCommunityIcons
                name="run"
                size={24}
                color={goal === 'endurance' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <View style={styles.goalOptionText}>
                <Text style={[styles.goalOptionTitle, { color: theme.colors.onSurface }]}>Endurance</Text>
                <Text style={[styles.goalOptionDescription, { color: theme.colors.onSurfaceVariant }]}>Focus on cardiovascular fitness and endurance</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                { borderColor: theme.colors.outline },
                goal === 'general' && [styles.goalOptionSelected, 
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' }]
              ]}
              onPress={() => setGoal('general')}
            >
              <MaterialCommunityIcons
                name="heart-pulse"
                size={24}
                color={goal === 'general' ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <View style={styles.goalOptionText}>
                <Text style={[styles.goalOptionTitle, { color: theme.colors.onSurface }]}>General Fitness</Text>
                <Text style={[styles.goalOptionDescription, { color: theme.colors.onSurfaceVariant }]}>Balanced approach to overall fitness</Text>
              </View>
            </TouchableOpacity>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowGoalDialog(false)} textColor={theme.colors.onSurface}>Cancel</Button>
            <Button onPress={handleUpdateGoal} textColor={theme.colors.primary}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  profileDetails: {
    fontSize: fontSizes.sm,
  },
  editButton: {
    marginTop: spacing.sm,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalText: {
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  dialogInput: {
    marginBottom: spacing.sm,
  },
  dialogLabel: {
    fontSize: fontSizes.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  genderButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: spacing.xs,
  },
  genderButtonSelected: {
  },
  genderButtonText: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  genderButtonTextSelected: {
    fontWeight: '500',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  goalOptionSelected: {
  },
  goalOptionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  goalOptionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  goalOptionDescription: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
});

export default SettingsScreen; 