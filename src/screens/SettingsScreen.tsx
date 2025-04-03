import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { Card, List, Divider, Avatar, Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { updateUserProfile, updateUserPreferences } from '../store/slices/userSlice';
import { colors, spacing, fontSizes } from '../utils/theme';
import { toggleDarkMode } from '../store/slices/settingsSlice';

const SettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { profile, preferences } = useSelector((state: RootState) => state.user);
  const { darkMode } = useSelector((state: RootState) => state.settings);
  
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
    dispatch(toggleDarkMode());
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
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <ScrollView style={styles.scrollView}>
        {/* User Profile Section */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <Avatar.Text 
                size={80} 
                label={profile.name.substring(0, 2).toUpperCase()} 
                color="white"
                style={{ backgroundColor: colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile.name}</Text>
                <Text style={styles.profileDetails}>
                  {profile.age} years, {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
                </Text>
                <Text style={styles.profileDetails}>
                  {useMetric ? `${profile.height} cm, ${profile.weight} kg` : 
                    `${Math.round(profile.height / 2.54)} in, ${Math.round(profile.weight * 2.2046)} lbs`}
                </Text>
              </View>
            </View>
            
            <Button 
              mode="outlined" 
              onPress={() => setShowProfileDialog(true)} 
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </Card.Content>
        </Card>
        
        {/* Fitness Goals */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Fitness Goal</Text>
            <View style={styles.goalContainer}>
              <View style={styles.goalItem}>
                <MaterialCommunityIcons 
                  name={
                    goal === 'weightLoss' ? 'scale-bathroom' : 
                    goal === 'muscleGain' ? 'arm-flex' : 'run'
                  } 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.goalText}>
                  {goal === 'weightLoss' ? 'Weight Loss' : 
                   goal === 'muscleGain' ? 'Muscle Gain' : 
                   goal === 'endurance' ? 'Endurance' : 'General Fitness'}
                </Text>
              </View>
              <Button 
                mode="text" 
                onPress={() => setShowGoalDialog(true)}
                labelStyle={{ color: colors.primary }}
              >
                Change
              </Button>
            </View>
          </Card.Content>
        </Card>
        
        {/* App Preferences */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>App Preferences</Text>
            
            <List.Item
              title="Dark Mode"
              description="Enable dark mode for the app"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={props => <Switch value={darkMode} onValueChange={handleToggleDarkMode} />}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Use Metric System"
              description="Switch between metric and imperial units"
              left={props => <List.Icon {...props} icon="ruler" />}
              right={props => <Switch value={useMetric} onValueChange={handleToggleMetric} />}
            />
          </Card.Content>
        </Card>
        
        {/* Notification Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Notifications</Text>
            
            <List.Item
              title="Workout Reminders"
              description="Get reminders for your scheduled workouts"
              left={props => <List.Icon {...props} icon="dumbbell" />}
              right={props => 
                <Switch 
                  value={enableWorkoutReminders} 
                  onValueChange={(value) => handleToggleNotification('workoutReminders', value)} 
                />
              }
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Nutrition Reminders"
              description="Get reminders to log your meals"
              left={props => <List.Icon {...props} icon="food-apple" />}
              right={props => 
                <Switch 
                  value={enableNutritionReminders} 
                  onValueChange={(value) => handleToggleNotification('nutritionReminders', value)} 
                />
              }
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Progress Updates"
              description="Receive updates about your fitness progress"
              left={props => <List.Icon {...props} icon="chart-line" />}
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
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>About & Support</Text>
            
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account" />}
              onPress={() => {/* Navigate to privacy policy */}}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document" />}
              onPress={() => {/* Navigate to terms of service */}}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Contact Support"
              left={props => <List.Icon {...props} icon="help-circle" />}
              onPress={() => {/* Open support contact options */}}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
          </Card.Content>
        </Card>
        
        <Button 
          mode="outlined" 
          onPress={() => {/* Handle logout */}} 
          style={styles.logoutButton}
          textColor={colors.error}
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
            
            <Text style={styles.dialogLabel}>Gender</Text>
            <View style={styles.genderButtons}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'male' && styles.genderButtonSelected
                ]}
                onPress={() => setGender('male')}
              >
                <MaterialCommunityIcons
                  name="gender-male"
                  size={24}
                  color={gender === 'male' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'male' && styles.genderButtonTextSelected
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'female' && styles.genderButtonSelected
                ]}
                onPress={() => setGender('female')}
              >
                <MaterialCommunityIcons
                  name="gender-female"
                  size={24}
                  color={gender === 'female' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'female' && styles.genderButtonTextSelected
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'other' && styles.genderButtonSelected
                ]}
                onPress={() => setGender('other')}
              >
                <MaterialCommunityIcons
                  name="gender-non-binary"
                  size={24}
                  color={gender === 'other' ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.genderButtonText,
                    gender === 'other' && styles.genderButtonTextSelected
                  ]}
                >
                  Other
                </Text>
              </TouchableOpacity>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button onPress={handleUpdateProfile}>Save</Button>
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
                goal === 'weightLoss' && styles.goalOptionSelected
              ]}
              onPress={() => setGoal('weightLoss')}
            >
              <MaterialCommunityIcons
                name="scale-bathroom"
                size={24}
                color={goal === 'weightLoss' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.goalOptionText}>
                <Text style={styles.goalOptionTitle}>Weight Loss</Text>
                <Text style={styles.goalOptionDescription}>Focus on losing weight and burning fat</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                goal === 'muscleGain' && styles.goalOptionSelected
              ]}
              onPress={() => setGoal('muscleGain')}
            >
              <MaterialCommunityIcons
                name="arm-flex"
                size={24}
                color={goal === 'muscleGain' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.goalOptionText}>
                <Text style={styles.goalOptionTitle}>Muscle Gain</Text>
                <Text style={styles.goalOptionDescription}>Focus on building muscle and strength</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                goal === 'endurance' && styles.goalOptionSelected
              ]}
              onPress={() => setGoal('endurance')}
            >
              <MaterialCommunityIcons
                name="run"
                size={24}
                color={goal === 'endurance' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.goalOptionText}>
                <Text style={styles.goalOptionTitle}>Endurance</Text>
                <Text style={styles.goalOptionDescription}>Focus on cardiovascular fitness and endurance</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.goalOption,
                goal === 'general' && styles.goalOptionSelected
              ]}
              onPress={() => setGoal('general')}
            >
              <MaterialCommunityIcons
                name="heart-pulse"
                size={24}
                color={goal === 'general' ? colors.primary : colors.textSecondary}
              />
              <View style={styles.goalOptionText}>
                <Text style={styles.goalOptionTitle}>General Fitness</Text>
                <Text style={styles.goalOptionDescription}>Balanced approach to overall fitness</Text>
              </View>
            </TouchableOpacity>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onPress={handleUpdateGoal}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    color: colors.textSecondary,
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
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profileDetails: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  editButton: {
    marginTop: spacing.sm,
    borderColor: colors.border,
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
    color: colors.text,
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
  },
  divider: {
    marginVertical: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderColor: colors.error,
  },
  dialogInput: {
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  dialogLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
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
    borderColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  genderButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  genderButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
  genderButtonTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  goalOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  goalOptionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  goalOptionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  goalOptionDescription: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default SettingsScreen; 