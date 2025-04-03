import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Card, Button, ProgressBar, Chip, IconButton, FAB, Portal, Dialog, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, fontSizes } from '../utils/theme';
import { RootState } from '../store';
import { 
  startWorkout, 
  completeWorkout, 
  cancelWorkout, 
  completeSet,
  addExerciseNote,
  addWorkoutNote,
  createWorkout
} from '../store/slices/workoutSlice';

// Interfaces
interface Exercise {
  id: string;
  name: string;
  sets: Array<{
    id: string;
    weight: number;
    reps: number;
    completed: boolean;
  }>;
  targetSets: number;
  targetReps: number;
  notes: string;
}

interface WorkoutSetProps {
  id: string;
  exerciseId: string;
  weight: string;
  reps: string;
  completed: boolean;
  onComplete: (id: string) => void;
  onUpdateWeight: (id: string, weight: string) => void;
  onUpdateReps: (id: string, reps: string) => void;
}

// Component for a single workout set
const WorkoutSet: React.FC<WorkoutSetProps> = ({
  id,
  weight,
  reps,
  completed,
  onComplete,
  onUpdateWeight,
  onUpdateReps
}) => {
  // Get theme from React Native Paper
  const theme = useTheme();
  
  return (
    <View style={[styles.setContainer, { backgroundColor: theme.colors.surface, borderColor: colors.border }]}>
      <View style={styles.setInputs}>
        <TextInput
          style={[styles.setInput, { color: theme.colors.onSurface, borderColor: colors.border }]}
          keyboardType="numeric"
          placeholder="kg"
          placeholderTextColor={colors.textSecondary}
          value={weight}
          onChangeText={(value) => onUpdateWeight(id, value)}
          editable={!completed}
        />
        <Text style={[styles.setDivider, { color: colors.textSecondary }]}>×</Text>
        <TextInput
          style={[styles.setInput, { color: theme.colors.onSurface, borderColor: colors.border }]}
          keyboardType="numeric"
          placeholder="reps"
          placeholderTextColor={colors.textSecondary}
          value={reps}
          onChangeText={(value) => onUpdateReps(id, value)}
          editable={!completed}
        />
      </View>
      
      <TouchableOpacity
        style={[
          styles.completeButton,
          completed ? { backgroundColor: colors.success } : { borderColor: colors.border }
        ]}
        onPress={() => onComplete(id)}
        disabled={completed}
      >
        {completed ? (
          <MaterialCommunityIcons name="check" size={18} color="#fff" />
        ) : (
          <Text style={{ color: colors.textSecondary }}>Done</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const WorkoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { workouts, activeWorkout, workoutInProgress } = useSelector((state: RootState) => state.workout);
  
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(0);
  const [tabView, setTabView] = useState<'strength' | 'cardio' | 'flexibility'>('strength');
  
  // New state for dialogs
  const [showCreateWorkoutDialog, setShowCreateWorkoutDialog] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [showEmptyWorkoutDialog, setShowEmptyWorkoutDialog] = useState(false);
  const [emptyWorkoutName, setEmptyWorkoutName] = useState('');
  
  // State for workout creation
  const [newWorkoutData, setNewWorkoutData] = useState<{
    name: string;
    type: 'strength' | 'cardio' | 'flexibility';
    exercises: Exercise[];
  }>({
    name: '',
    type: 'strength',
    exercises: []
  });
  
  // New state for adding exercises
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    targetSets: '3',
    targetReps: '10'
  });

  // Get theme from React Native Paper
  const theme = useTheme();

  // Start a timer when a workout is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (workoutInProgress) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workoutInProgress]);

  // Functions to handle workout actions
  const handleStartWorkout = (workoutId: string) => {
    dispatch(startWorkout(workoutId));
    setWorkoutNotes('');
    setExerciseNotesMap({});
    setTimer(0);
  };

  const handleCompleteWorkout = () => {
    if (activeWorkout) {
      // Save all notes before completing
      Object.entries(exerciseNotesMap).forEach(([exerciseId, note]) => {
        dispatch(addExerciseNote({ exerciseId, note }));
      });
      dispatch(addWorkoutNote(workoutNotes));

      dispatch(completeWorkout({
        duration: timer,
        caloriesBurned: calculateCaloriesBurned(timer),
        notes: workoutNotes,
      }));
      
      // Show completion message
      Alert.alert(
        "Workout Completed!",
        `Great job! You completed a ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')} workout and burned approximately ${calculateCaloriesBurned(timer)} calories.`,
        [{ text: "OK" }]
      );
    }
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      "Cancel Workout",
      "Are you sure you want to cancel this workout? Your progress will be lost.",
      [
        { text: "Keep Working Out", style: "cancel" },
        { 
          text: "Cancel Workout", 
          style: "destructive",
          onPress: () => dispatch(cancelWorkout())
        }
      ]
    );
  };

  const handleCompleteSet = (exerciseId: string, setIndex: number, weight: number, reps: number) => {
    dispatch(completeSet({ exerciseId, setIndex, weight, reps }));
  };

  const handleExerciseNoteChange = (exerciseId: string, note: string) => {
    setExerciseNotesMap(prev => ({
      ...prev,
      [exerciseId]: note,
    }));
  };

  // Handle creating a new workout routine
  const handleCreateWorkout = () => {
    if (!newWorkoutData.name.trim()) {
      Alert.alert("Please enter a workout name");
      return;
    }
    
    if (newWorkoutData.exercises.length === 0) {
      Alert.alert("Please add at least one exercise");
      return;
    }
    
    dispatch(createWorkout({
      name: newWorkoutData.name,
      type: newWorkoutData.type,
      exercises: newWorkoutData.exercises,
      duration: 0,
      caloriesBurned: 0,
      date: new Date().toISOString(),
      completed: false,
      notes: ''
    }));
    
    // Reset workout data
    setNewWorkoutData({
      name: '',
      type: 'strength',
      exercises: []
    });
    
    setShowCreateWorkoutDialog(false);
    
    Alert.alert(
      "Workout Created",
      "Your new workout routine has been created. You can now start it from the workout list.",
      [{ text: "OK" }]
    );
  };

  // Handle adding an exercise to the new workout
  const handleAddExercise = () => {
    if (!currentExercise.name.trim()) {
      Alert.alert("Please enter an exercise name");
      return;
    }
    
    const numSets = parseInt(currentExercise.targetSets) || 3;
    const numReps = parseInt(currentExercise.targetReps) || 10;
    
    // Create sets array based on target sets
    const sets = Array.from({ length: numSets }, (_, i) => ({
      id: `set-${Date.now()}-${i}`,
      weight: 0,
      reps: numReps,
      completed: false
    }));
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: currentExercise.name,
      sets,
      targetSets: numSets,
      targetReps: numReps,
      notes: ''
    };
    
    setNewWorkoutData(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));
    
    // Reset current exercise form
    setCurrentExercise({
      name: '',
      targetSets: '3',
      targetReps: '10'
    });
    
    setShowExerciseDialog(false);
  };

  // Handle removing an exercise from the new workout
  const handleRemoveExercise = (exerciseId: string) => {
    setNewWorkoutData(prev => ({
      ...prev,
      exercises: prev.exercises.filter(exercise => exercise.id !== exerciseId)
    }));
  };

  // Handle starting an empty workout
  const handleStartEmptyWorkout = () => {
    if (!emptyWorkoutName.trim()) {
      Alert.alert("Please enter a workout name");
      return;
    }
    
    const emptyWorkout = {
      name: emptyWorkoutName,
      type: tabView,
      exercises: [{
        id: '1',
        name: 'Custom Exercise',
        sets: [
          { id: 'set-1', weight: 0, reps: 0, completed: false },
          { id: 'set-2', weight: 0, reps: 0, completed: false },
          { id: 'set-3', weight: 0, reps: 0, completed: false }
        ],
        targetSets: 3,
        targetReps: 10,
        notes: ''
      }],
      duration: 0,
      caloriesBurned: 0,
      date: new Date().toISOString(),
      completed: false,
      notes: ''
    };
    
    dispatch(createWorkout(emptyWorkout));
    const newWorkoutId = (workouts.length + 1).toString();
    
    // Start the newly created workout
    setTimeout(() => {
      handleStartWorkout(newWorkoutId);
    }, 500);
    
    setEmptyWorkoutName('');
    setShowEmptyWorkoutDialog(false);
  };

  // Helper to calculate calories burned (simplified)
  const calculateCaloriesBurned = (seconds: number) => {
    // Simplified calculation - in a real app, this would be more sophisticated
    return Math.round((seconds / 60) * 5); // ~5 calories per minute as a placeholder
  };

  // Render the active workout view
  const renderActiveWorkout = () => {
    if (!activeWorkout) return null;

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.headerWithBack}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={handleCancelWorkout}
          />
          <Text style={[styles.workoutScreenTitle, { color: theme.colors.onBackground }]}>Current Workout</Text>
          <View style={{ width: 40 }} />
        </View>
      
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: colors.border }]}>
          <Card.Content>
            <View style={styles.workoutHeader}>
              <Text style={[styles.workoutTitle, { color: theme.colors.onBackground }]}>{activeWorkout.name}</Text>
              <Chip style={[styles.workoutChip, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>In Progress</Chip>
            </View>

            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.onBackground }]}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
                <Text style={[styles.statValue, { color: theme.colors.onBackground }]}>{calculateCaloriesBurned(timer)} kcal</Text>
              </View>
            </View>

            <ScrollView style={styles.exercisesContainer}>
              {activeWorkout.exercises.map((exercise) => (
                <View key={exercise.id} style={[styles.exerciseCard, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.exerciseName, { color: theme.colors.onBackground }]}>{exercise.name}</Text>
                  
                  <View style={styles.setsContainer}>
                    {exercise.sets.map((set, index) => (
                      <WorkoutSet
                        key={index}
                        id={set.id}
                        exerciseId={exercise.id}
                        weight={String(set.weight)}
                        reps={String(set.reps)}
                        completed={set.completed}
                        onComplete={handleCompleteSet}
                        onUpdateWeight={(id, weight) => dispatch(completeSet({ exerciseId: exercise.id, setIndex: index, weight: Number(weight), reps: set.reps }))}
                        onUpdateReps={(id, reps) => dispatch(completeSet({ exerciseId: exercise.id, setIndex: index, weight: set.weight, reps: Number(reps) }))}
                      />
                    ))}
                  </View>
                  
                  <TextInput
                    style={[styles.notesInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
                    placeholder="Add notes about this exercise..."
                    placeholderTextColor={colors.textSecondary}
                    multiline
                    value={exerciseNotesMap[exercise.id] || ''}
                    onChangeText={(text) => handleExerciseNoteChange(exercise.id, text)}
                  />
                </View>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.notesInput, styles.workoutNotesInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
              placeholder="Add notes about your workout for AI analysis..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
            />

            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={handleCancelWorkout}
              >
                Cancel Workout
              </Button>
            </View>
          </Card.Content>
        </Card>
        <FAB
          style={[styles.finishFab, { backgroundColor: colors.success }]}
          icon="check-circle"
          label="FINISH WORKOUT"
          onPress={handleCompleteWorkout}
          color="white"
        />
      </View>
    );
  };

  // Render the workout selection view
  const renderWorkoutSelection = () => {
    return (
      <View style={[styles.workoutSelectionContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.workoutScreenTitle, { color: theme.colors.onBackground }]}>Workouts</Text>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, tabView === 'strength' && styles.activeTab]}
            onPress={() => setTabView('strength')}
          >
            <MaterialCommunityIcons 
              name="dumbbell" 
              size={18} 
              color={tabView === 'strength' ? colors.text : colors.textSecondary} 
            />
            <Text style={[styles.tabText, tabView === 'strength' && styles.activeTabText]}>
              Strength
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, tabView === 'cardio' && styles.activeTab]}
            onPress={() => setTabView('cardio')}
          >
            <MaterialCommunityIcons 
              name="lightning-bolt" 
              size={18} 
              color={tabView === 'cardio' ? colors.text : colors.textSecondary} 
            />
            <Text style={[styles.tabText, tabView === 'cardio' && styles.activeTabText]}>
              Cardio
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, tabView === 'flexibility' && styles.activeTab]}
            onPress={() => setTabView('flexibility')}
          >
            <MaterialCommunityIcons 
              name="yoga" 
              size={18} 
              color={tabView === 'flexibility' ? colors.text : colors.textSecondary} 
            />
            <Text style={[styles.tabText, tabView === 'flexibility' && styles.activeTabText]}>
              Flexibility
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={[styles.workoutsScrollView, { backgroundColor: theme.colors.background }]}>
          {workouts
            .filter(workout => workout.type === tabView)
            .map(workout => (
              <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surface, borderColor: colors.border }]}>
                <Card.Content>
                  <Text style={[styles.workoutCardTitle, { color: theme.colors.onBackground }]}>{workout.name}</Text>
                  <View style={styles.workoutCardDetails}>
                    <Text style={[styles.workoutCardSubtitle, { color: theme.colors.onBackground }]}>
                      {workout.exercises.length} exercises
                    </Text>
                    <Text style={[styles.workoutCardSubtitle, { color: theme.colors.onBackground }]}>
                      Est. {workout.duration || 30} min
                    </Text>
                  </View>
                  <Button 
                    mode="contained" 
                    onPress={() => handleStartWorkout(workout.id)}
                    style={[styles.startButton, { backgroundColor: colors.primary }]}
                  >
                    Start Workout
                  </Button>
                </Card.Content>
              </Card>
            ))}
        </ScrollView>

        {/* Quick-start options */}
        <View style={[styles.quickStartSection, { backgroundColor: theme.colors.surface }]}>
          <Button 
            mode="outlined" 
            icon="plus" 
            onPress={() => {
              setNewWorkoutData({
                name: '',
                type: tabView,
                exercises: []
              });
              setShowCreateWorkoutDialog(true);
            }}
            style={[styles.quickStartButton, { borderColor: colors.primary }]}
          >
            Create Workout Routine
          </Button>
          
          <Button 
            mode="outlined" 
            icon="dumbbell" 
            onPress={() => setShowEmptyWorkoutDialog(true)}
            style={[styles.quickStartButton, { borderColor: colors.primary }]}
          >
            Start Empty Workout
          </Button>
        </View>
      </View>
    );
  };

  // Create Workout Dialog
  const renderCreateWorkoutDialog = () => (
    <Portal>
      <Dialog visible={showCreateWorkoutDialog} onDismiss={() => setShowCreateWorkoutDialog(false)}>
        <Dialog.Title>Create New Workout</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={[styles.dialogInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
            placeholder="Workout Name"
            value={newWorkoutData.name}
            onChangeText={(text) => setNewWorkoutData(prev => ({...prev, name: text}))}
          />
          
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground, marginTop: spacing.md }]}>
            Exercises ({newWorkoutData.exercises.length})
          </Text>
          
          <ScrollView style={styles.exerciseList} nestedScrollEnabled={true}>
            {newWorkoutData.exercises.map((exercise, index) => (
              <View key={exercise.id} style={[styles.exerciseItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                <View style={styles.exerciseItemHeader}>
                  <Text style={[styles.exerciseItemName, { color: theme.colors.onSurface }]}>
                    {exercise.name}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveExercise(exercise.id)}>
                    <MaterialCommunityIcons name="close" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.exerciseItemDetail, { color: theme.colors.onSurfaceVariant }]}>
                  {exercise.sets.length} sets × {exercise.targetReps} reps
                </Text>
              </View>
            ))}
          </ScrollView>
          
          <Button 
            mode="outlined" 
            icon="plus" 
            onPress={() => setShowExerciseDialog(true)}
            style={[styles.addExerciseButton, { borderColor: colors.primary, marginTop: spacing.sm }]}
          >
            Add Exercise
          </Button>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowCreateWorkoutDialog(false)}>Cancel</Button>
          <Button onPress={handleCreateWorkout}>Create Workout</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // Add Exercise Dialog
  const renderAddExerciseDialog = () => (
    <Portal>
      <Dialog visible={showExerciseDialog} onDismiss={() => setShowExerciseDialog(false)}>
        <Dialog.Title>Add Exercise</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={[styles.dialogInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
            placeholder="Exercise Name"
            value={currentExercise.name}
            onChangeText={(text) => setCurrentExercise(prev => ({...prev, name: text}))}
          />
          
          <View style={styles.exerciseFormRow}>
            <View style={styles.exerciseFormField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>Sets</Text>
              <TextInput
                style={[styles.dialogInput, styles.smallInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
                placeholder="3"
                keyboardType="numeric"
                value={currentExercise.targetSets}
                onChangeText={(text) => setCurrentExercise(prev => ({...prev, targetSets: text}))}
              />
            </View>
            <View style={styles.exerciseFormField}>
              <Text style={[styles.fieldLabel, { color: theme.colors.onSurfaceVariant }]}>Reps per set</Text>
              <TextInput
                style={[styles.dialogInput, styles.smallInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
                placeholder="10"
                keyboardType="numeric"
                value={currentExercise.targetReps}
                onChangeText={(text) => setCurrentExercise(prev => ({...prev, targetReps: text}))}
              />
            </View>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowExerciseDialog(false)}>Cancel</Button>
          <Button onPress={handleAddExercise}>Add</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  // Empty Workout Dialog
  const renderEmptyWorkoutDialog = () => (
    <Portal>
      <Dialog visible={showEmptyWorkoutDialog} onDismiss={() => setShowEmptyWorkoutDialog(false)}>
        <Dialog.Title>Start Empty Workout</Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={[styles.dialogInput, { color: theme.colors.onBackground, backgroundColor: theme.colors.background }]}
            placeholder="Workout Name"
            value={emptyWorkoutName}
            onChangeText={setEmptyWorkoutName}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setShowEmptyWorkoutDialog(false)}>Cancel</Button>
          <Button onPress={handleStartEmptyWorkout}>Start</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <View style={styles.container}>
      {workoutInProgress ? renderActiveWorkout() : renderWorkoutSelection()}
      {renderCreateWorkoutDialog()}
      {renderAddExerciseDialog()}
      {renderEmptyWorkoutDialog()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  workoutScreenTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    padding: spacing.md,
  },
  workoutSelectionContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: spacing.md,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
  },
  activeTabText: {
    color: colors.text,
    fontWeight: '500',
  },
  workoutsScrollView: {
    flex: 1,
    padding: spacing.md,
  },
  workoutCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  workoutCardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workoutCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  workoutCardSubtitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  startButton: {
    backgroundColor: colors.primary,
  },
  quickStartSection: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  quickStartButton: {
    marginBottom: spacing.sm,
    borderColor: colors.primary,
  },
  dialogInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  activeWorkoutContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  workoutTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  workoutChip: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary + '40',
  },
  workoutStats: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.xs,
  },
  exercisesContainer: {
    maxHeight: 400,
  },
  exerciseCard: {
    backgroundColor: colors.cardLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  setsContainer: {
    marginBottom: spacing.sm,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  setInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  setInput: {
    backgroundColor: colors.card,
    borderRadius: 4,
    padding: spacing.xs,
    width: 60,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  setDivider: {
    marginHorizontal: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  completeButton: {
    padding: spacing.xs,
  },
  notesInput: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: spacing.sm,
    color: colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.border,
  },
  workoutNotesInput: {
    marginVertical: spacing.md,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  cancelButton: {
    borderColor: colors.border,
  },
  finishFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.success,
  },
  completeButtonLabel: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  // New styles for workout creation
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  exerciseList: {
    maxHeight: 200,
    marginTop: spacing.xs,
  },
  exerciseItem: {
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  exerciseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseItemName: {
    fontWeight: 'bold',
    fontSize: fontSizes.sm,
  },
  exerciseItemDetail: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  addExerciseButton: {
    marginVertical: spacing.sm,
  },
  exerciseFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  exerciseFormField: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.xs,
  },
  smallInput: {
    padding: spacing.xs,
  },
});

export default WorkoutScreen; 