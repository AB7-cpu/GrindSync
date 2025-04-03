import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Exercise {
  id: string;
  name: string;
  sets: {
    weight: number;
    reps: number;
    completed: boolean;
  }[];
  targetSets: number;
  targetReps: number;
  notes: string;
}

export interface Workout {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility';
  exercises: Exercise[];
  duration: number;
  caloriesBurned: number;
  date: string;
  completed: boolean;
  notes: string;
}

interface WorkoutState {
  workouts: Workout[];
  workoutHistory: Workout[];
  activeWorkout: Workout | null;
  workoutInProgress: boolean;
}

const initialState: WorkoutState = {
  workouts: [
    {
      id: '1',
      name: 'Upper Body Strength',
      type: 'strength',
      exercises: [
        {
          id: '1',
          name: 'Bench Press',
          sets: [
            {
              weight: 60,
              reps: 10,
              completed: false,
            },
            {
              weight: 60,
              reps: 10,
              completed: false,
            },
            {
              weight: 60,
              reps: 10,
              completed: false,
            },
          ],
          targetSets: 3,
          targetReps: 10,
          notes: '',
        },
        {
          id: '2',
          name: 'Shoulder Press',
          sets: [
            {
              weight: 40,
              reps: 12,
              completed: false,
            },
            {
              weight: 40,
              reps: 12,
              completed: false,
            },
            {
              weight: 40,
              reps: 12,
              completed: false,
            },
          ],
          targetSets: 3,
          targetReps: 12,
          notes: '',
        },
        {
          id: '3',
          name: 'Bicep Curls',
          sets: [
            {
              weight: 15,
              reps: 15,
              completed: false,
            },
            {
              weight: 15,
              reps: 15,
              completed: false,
            },
            {
              weight: 15,
              reps: 15,
              completed: false,
            },
          ],
          targetSets: 3,
          targetReps: 15,
          notes: '',
        },
      ],
      duration: 0,
      caloriesBurned: 0,
      date: new Date().toISOString(),
      completed: false,
      notes: '',
    },
    {
      id: '2',
      name: 'Lower Body Power',
      type: 'strength',
      exercises: [
        {
          id: '1',
          name: 'Squats',
          sets: [
            {
              weight: 80,
              reps: 8,
              completed: false,
            },
            {
              weight: 80,
              reps: 8,
              completed: false,
            },
            {
              weight: 80,
              reps: 8,
              completed: false,
            },
          ],
          targetSets: 3,
          targetReps: 8,
          notes: '',
        },
        {
          id: '2',
          name: 'Deadlifts',
          sets: [
            {
              weight: 100,
              reps: 6,
              completed: false,
            },
            {
              weight: 100,
              reps: 6,
              completed: false,
            },
            {
              weight: 100,
              reps: 6,
              completed: false,
            },
          ],
          targetSets: 3,
          targetReps: 6,
          notes: '',
        },
      ],
      duration: 0,
      caloriesBurned: 0,
      date: new Date().toISOString(),
      completed: false,
      notes: '',
    },
  ],
  workoutHistory: [],
  activeWorkout: null,
  workoutInProgress: false,
};

const workoutSlice = createSlice({
  name: 'workout',
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<string>) => {
      const workout = state.workouts.find((w) => w.id === action.payload);
      if (workout) {
        state.activeWorkout = { ...workout, date: new Date().toISOString() };
        state.workoutInProgress = true;
      }
    },
    completeWorkout: (state, action: PayloadAction<{ duration: number; caloriesBurned: number; notes: string }>) => {
      if (state.activeWorkout) {
        const completedWorkout = {
          ...state.activeWorkout,
          duration: action.payload.duration,
          caloriesBurned: action.payload.caloriesBurned,
          notes: action.payload.notes,
          completed: true,
        };
        state.workoutHistory.unshift(completedWorkout);
        state.activeWorkout = null;
        state.workoutInProgress = false;
      }
    },
    cancelWorkout: (state) => {
      state.activeWorkout = null;
      state.workoutInProgress = false;
    },
    completeSet: (state, action: PayloadAction<{ exerciseId: string; setIndex: number; weight: number; reps: number }>) => {
      if (state.activeWorkout) {
        const exercise = state.activeWorkout.exercises.find((e) => e.id === action.payload.exerciseId);
        if (exercise && exercise.sets[action.payload.setIndex]) {
          exercise.sets[action.payload.setIndex] = {
            weight: action.payload.weight,
            reps: action.payload.reps,
            completed: true,
          };
        }
      }
    },
    addExerciseNote: (state, action: PayloadAction<{ exerciseId: string; note: string }>) => {
      if (state.activeWorkout) {
        const exercise = state.activeWorkout.exercises.find((e) => e.id === action.payload.exerciseId);
        if (exercise) {
          exercise.notes = action.payload.note;
        }
      }
    },
    addWorkoutNote: (state, action: PayloadAction<string>) => {
      if (state.activeWorkout) {
        state.activeWorkout.notes = action.payload;
      }
    },
    createWorkout: (state, action: PayloadAction<Omit<Workout, 'id'>>) => {
      const newId = `${state.workouts.length + 1}`;
      const newWorkout = {
        ...action.payload,
        id: newId,
      };
      state.workouts.push(newWorkout);
    },
    deleteWorkout: (state, action: PayloadAction<string>) => {
      state.workouts = state.workouts.filter((w) => w.id !== action.payload);
    },
  },
});

export const {
  startWorkout,
  completeWorkout,
  cancelWorkout,
  completeSet,
  addExerciseNote,
  addWorkoutNote,
  createWorkout,
  deleteWorkout,
} = workoutSlice.actions;

export default workoutSlice.reducer; 