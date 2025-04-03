import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card, Button, ProgressBar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { colors, spacing, fontSizes } from '../utils/theme';
import { RootState } from '../store';
import { 
  startWorkout, 
  completeWorkout, 
  cancelWorkout, 
  completeSet,
  addExerciseNote,
  addWorkoutNote,
} from '../store/slices/workoutSlice';

interface WorkoutSetProps {
  exerciseId: string;
  setIndex: number;
  weight: number;
  reps: number;
  completed: boolean;
  onComplete: (exerciseId: string, setIndex: number, weight: number, reps: number) => void;
}

// Component for a single workout set
const WorkoutSet: React.FC<WorkoutSetProps> = ({ 
  exerciseId, 
  setIndex, 
  weight, 
  reps, 
  completed, 
  onComplete 
}) => {
  const [currentWeight, setCurrentWeight] = useState(weight);
  const [currentReps, setCurrentReps] = useState(reps);

  const handleComplete = () => {
    onComplete(exerciseId, setIndex, currentWeight, currentReps);
  };

  return (
    <View style={styles.setRow}>
      <Text style={styles.setText}>Set {setIndex + 1}</Text>
      <View style={styles.weightInput}>
        <TextInput
          style={[styles.input, completed && styles.completedInput]}
          value={String(currentWeight)}
          onChangeText={(text) => setCurrentWeight(Number(text) || 0)}
          keyboardType="numeric"
          editable={!completed}
        />
        <Text style={styles.inputLabel}>kg</Text>
      </View>
      <View style={styles.repsInput}>
        <TextInput
          style={[styles.input, completed && styles.completedInput]}
          value={String(currentReps)}
          onChangeText={(text) => setCurrentReps(Number(text) || 0)}
          keyboardType="numeric"
          editable={!completed}
        />
        <Text style={styles.inputLabel}>reps</Text>
      </View>
      <TouchableOpacity 
        style={[styles.completeButton, completed && styles.completedButton]} 
        onPress={handleComplete}
        disabled={completed}
      >
        <MaterialCommunityIcons 
          name={completed ? "check-circle" : "checkbox-blank-circle-outline"} 
          size={24} 
          color={completed ? colors.success : colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
};

const WorkoutScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { workouts, activeWorkout, workoutInProgress } = useSelector((state: RootState) => state.workout);
  
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exerciseNotesMap, setExerciseNotesMap] = useState<Record<string, string>>({});
  const [timer, setTimer] = useState(0);
  const [tabView, setTabView] = useState<'strength' | 'cardio' | 'flexibility'>('strength');

  // Functions to handle workout actions
  const handleStartWorkout = (workoutId: string) => {
    dispatch(startWorkout(workoutId));
    setWorkoutNotes('');
    setExerciseNotesMap({});
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
    }
  };

  const handleCancelWorkout = () => {
    dispatch(cancelWorkout());
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

  // Helper to calculate calories burned (simplified)
  const calculateCaloriesBurned = (seconds: number) => {
    // Simplified calculation - in a real app, this would be more sophisticated
    return Math.round((seconds / 60) * 5); // ~5 calories per minute as a placeholder
  };

  // Render the active workout view
  const renderActiveWorkout = () => {
    if (!activeWorkout) return null;

    return (
      <View style={styles.activeWorkoutContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>{activeWorkout.name}</Text>
              <Chip style={styles.workoutChip}>In Progress</Chip>
            </View>

            <View style={styles.workoutStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primary} />
                <Text style={styles.statValue}>{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="fire" size={20} color={colors.warning} />
                <Text style={styles.statValue}>{calculateCaloriesBurned(timer)} kcal</Text>
              </View>
            </View>

            <ScrollView style={styles.exercisesContainer}>
              {activeWorkout.exercises.map((exercise) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  
                  <View style={styles.setsContainer}>
                    {exercise.sets.map((set, index) => (
                      <WorkoutSet
                        key={index}
                        exerciseId={exercise.id}
                        setIndex={index}
                        weight={set.weight}
                        reps={set.reps}
                        completed={set.completed}
                        onComplete={handleCompleteSet}
                      />
                    ))}
                  </View>
                  
                  <TextInput
                    style={styles.notesInput}
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
              style={[styles.notesInput, styles.workoutNotesInput]}
              placeholder="Add notes about your workout for AI analysis..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={workoutNotes}
              onChangeText={setWorkoutNotes}
            />

            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                style={styles.completeWorkoutButton}
                onPress={handleCompleteWorkout}
              >
                Complete Workout
              </Button>
              <Button 
                mode="outlined" 
                style={styles.cancelButton}
                onPress={handleCancelWorkout}
              >
                Cancel
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  // Render the workout selection view
  const renderWorkoutSelection = () => {
    return (
      <View style={styles.workoutSelectionContainer}>
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

        <ScrollView style={styles.workoutsScrollView}>
          {workouts
            .filter(workout => workout.type === tabView)
            .map(workout => (
              <Card key={workout.id} style={styles.workoutCard}>
                <View style={styles.workoutCardHeader}>
                  <View style={styles.workoutCardOverlay} />
                  <View style={styles.workoutCardContent}>
                    <Text style={styles.workoutCardTitle}>{workout.name}</Text>
                    <View style={styles.workoutCardInfo}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color={colors.text} style={styles.workoutCardIcon} />
                      <Text style={styles.workoutCardInfoText}>45 min</Text>
                      
                      <MaterialCommunityIcons name="dumbbell" size={16} color={colors.text} style={[styles.workoutCardIcon, styles.iconSpacing]} />
                      <Text style={styles.workoutCardInfoText}>
                        {workout.type === 'strength' ? 'Intermediate' : 
                         workout.type === 'cardio' ? 'High Intensity' : 'Beginner'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Card.Content style={styles.workoutCardBody}>
                  <View style={styles.targetMuscles}>
                    <MaterialCommunityIcons name="heart-pulse" size={16} color={colors.error} style={styles.workoutCardIcon} />
                    <Text style={styles.workoutCardDetailText}>
                      Targets {workout.type === 'strength' ? 'muscles' : 
                              workout.type === 'cardio' ? 'cardiovascular system' : 'flexibility'}
                    </Text>
                  </View>
                  
                  <ProgressBar 
                    progress={0.85} 
                    color={colors.primary} 
                    style={styles.workoutProgress} 
                  />
                  
                  <Button 
                    mode="contained" 
                    style={styles.startWorkoutButton}
                    onPress={() => handleStartWorkout(workout.id)}
                  >
                    Start Workout
                  </Button>
                </Card.Content>
              </Card>
            ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout Tracker</Text>
        <TouchableOpacity style={styles.historyButton}>
          <MaterialCommunityIcons name="history" size={20} color={colors.text} />
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      {workoutInProgress && activeWorkout ? renderActiveWorkout() : renderWorkoutSelection()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyButtonText: {
    color: colors.text,
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
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
  workoutSelectionContainer: {
    flex: 1,
  },
  workoutsScrollView: {
    flex: 1,
  },
  workoutCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  workoutCardHeader: {
    height: 120,
    position: 'relative',
    justifyContent: 'flex-end',
    backgroundColor: colors.cardLight,
  },
  workoutCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  workoutCardContent: {
    padding: spacing.md,
    zIndex: 2,
  },
  workoutCardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  workoutCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutCardIcon: {
    marginRight: spacing.xs,
  },
  iconSpacing: {
    marginLeft: spacing.sm,
  },
  workoutCardInfoText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  workoutCardBody: {
    paddingVertical: spacing.md,
  },
  targetMuscles: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  workoutCardDetailText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  workoutProgress: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: spacing.md,
  },
  startWorkoutButton: {
    backgroundColor: colors.primary,
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
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  setText: {
    width: 50,
    fontSize: fontSizes.sm,
    color: colors.text,
  },
  weightInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  repsInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 4,
    padding: spacing.xs,
    width: 60,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completedInput: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success + '40',
  },
  inputLabel: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  completeButton: {
    padding: spacing.xs,
  },
  completedButton: {
    opacity: 0.7,
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
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  completeWorkoutButton: {
    flex: 1,
    marginRight: spacing.sm,
    backgroundColor: colors.primary,
  },
  cancelButton: {
    borderColor: colors.border,
  },
});

export default WorkoutScreen; 