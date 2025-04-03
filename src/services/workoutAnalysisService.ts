import aiService, { AiProcessingResult } from './aiService';
import { Exercise, Workout } from '../store/slices/workoutSlice';

// Types for workout analysis
export interface ExerciseAnalysis {
  exerciseId: string;
  exerciseName: string;
  performance: 'improving' | 'plateauing' | 'declining';
  progressiveOverloadRecommendation: string;
  weightRecommendation: number | null;
  repRecommendation: number | null;
  notes: string;
}

export interface WorkoutAnalysisResponse {
  overallPerformance: string;
  exerciseAnalyses: ExerciseAnalysis[];
  insights: string[];
}

export interface WorkoutHistoryRequest {
  workouts: Workout[];
  currentWorkout: Workout | null;
  exerciseNotes: Record<string, string>;
}

// URLs for models
const WORKOUT_MODEL_URL = 'https://storage.googleapis.com/example/workout-analysis-model.json';

class WorkoutAnalysisService {
  // Analyze workout history and provide recommendations
  public async analyzeWorkoutHistory(
    workoutHistory: Workout[],
    currentWorkout: Workout | null
  ): Promise<AiProcessingResult<WorkoutAnalysisResponse>> {
    const request: WorkoutHistoryRequest = {
      workouts: workoutHistory,
      currentWorkout,
      exerciseNotes: {}, // In a real app, we would include notes from the user
    };

    return aiService.process<WorkoutAnalysisResponse>(
      request,
      'workout-analysis',
      WORKOUT_MODEL_URL,
      this.processWithLocalModel,
      'workout/analyze'
    );
  }

  // Process workout analysis with a local TensorFlow model
  private async processWithLocalModel(model: any, request: WorkoutHistoryRequest): Promise<WorkoutAnalysisResponse> {
    // This is just a placeholder. In a real app, we would:
    // 1. Extract features from workout history
    // 2. Run it through the model
    // 3. Parse the model output
    
    console.log('Processing workout analysis locally with TensorFlow');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return some placeholder analysis
    // In a real app, this would be based on model output
    return {
      overallPerformance: "Your strength is improving in most exercises. Keep up the good work!",
      exerciseAnalyses: [
        {
          exerciseId: "1",
          exerciseName: "Bench Press",
          performance: "improving",
          progressiveOverloadRecommendation: "Increase weight by 2.5kg",
          weightRecommendation: 62.5,
          repRecommendation: null,
          notes: "Your form has been consistent and you've completed all sets successfully for the last 3 workouts."
        },
        {
          exerciseId: "2",
          exerciseName: "Shoulder Press",
          performance: "plateauing",
          progressiveOverloadRecommendation: "Try increasing reps before adding weight",
          weightRecommendation: null,
          repRecommendation: 14,
          notes: "You've been using the same weight for 5 sessions. Try to push for 1-2 more reps before increasing weight."
        }
      ],
      insights: [
        "Your overall strength is increasing at a steady pace.",
        "Recovery between upper body workouts seems optimal.",
        "Consider adding more volume to shoulder exercises to break through your plateau."
      ]
    };
  }

  // Analyze the notes from a workout to extract insights
  public analyzeWorkoutNotes(notes: string): string[] {
    // In a real app, this would use NLP to analyze the notes
    // For this demo, we'll return some static insights
    if (!notes || notes.trim() === '') {
      return [];
    }

    const lowerNotes = notes.toLowerCase();
    const insights: string[] = [];

    // Simple pattern matching to extract insights
    if (lowerNotes.includes('tired') || lowerNotes.includes('exhausted') || lowerNotes.includes('fatigue')) {
      insights.push("You mentioned feeling tired. Consider adding an extra rest day or improving sleep quality.");
    }

    if (lowerNotes.includes('pain') || lowerNotes.includes('hurt') || lowerNotes.includes('injury')) {
      insights.push("You mentioned pain or discomfort. Consider consulting with a fitness professional or doctor.");
    }

    if (lowerNotes.includes('easy') || lowerNotes.includes('light') || lowerNotes.includes('too simple')) {
      insights.push("The workout seemed too easy for you. Consider increasing weight or intensity next time.");
    }

    if (lowerNotes.includes('hard') || lowerNotes.includes('difficult') || lowerNotes.includes('challenging')) {
      insights.push("You found the workout challenging. Keep at this level until it feels more manageable.");
    }

    if (lowerNotes.includes('form') || lowerNotes.includes('technique')) {
      insights.push("You mentioned form or technique. Focus on proper form before increasing weights.");
    }

    // If no specific insights were found, provide a generic one
    if (insights.length === 0) {
      insights.push("Thanks for your notes. Keep tracking your workout experiences for more personalized insights.");
    }

    return insights;
  }

  // Analyze exercise history to detect plateaus and recommend progressive overload
  public analyzeExerciseProgression(
    exerciseName: string,
    exerciseHistory: { weight: number; reps: number; date: string }[]
  ): { recommendation: string; targetWeight: number; targetReps: number } {
    // Simple analysis of exercise progression
    if (exerciseHistory.length < 3) {
      return {
        recommendation: "Need more data to provide recommendations. Keep tracking your workouts.",
        targetWeight: exerciseHistory.length > 0 ? exerciseHistory[0].weight : 0,
        targetReps: exerciseHistory.length > 0 ? exerciseHistory[0].reps : 0,
      };
    }

    // Sort history by date, most recent first
    const sortedHistory = [...exerciseHistory].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Check for plateau (same weight and reps for last 3 workouts)
    const recentWorkouts = sortedHistory.slice(0, 3);
    const isPlateau = recentWorkouts.every(
      workout => workout.weight === recentWorkouts[0].weight && workout.reps === recentWorkouts[0].reps
    );

    // Current weight and reps
    const currentWeight = recentWorkouts[0].weight;
    const currentReps = recentWorkouts[0].reps;

    if (isPlateau) {
      // If reps are low, recommend increasing reps first
      if (currentReps < 8) {
        return {
          recommendation: `You've plateaued at ${currentWeight}kg for ${currentReps} reps. Try increasing to ${currentReps + 2} reps before adding weight.`,
          targetWeight: currentWeight,
          targetReps: currentReps + 2,
        };
      } else {
        // If reps are high enough, recommend increasing weight
        const incrementAmount = currentWeight < 10 ? 1 : (currentWeight < 20 ? 2.5 : 5);
        return {
          recommendation: `You've plateaued at ${currentWeight}kg for ${currentReps} reps. Time to increase weight to ${currentWeight + incrementAmount}kg and aim for ${Math.max(currentReps - 2, 6)} reps.`,
          targetWeight: currentWeight + incrementAmount,
          targetReps: Math.max(currentReps - 2, 6),
        };
      }
    }

    // Check if performance is improving
    const isImproving = (
      recentWorkouts[0].weight > recentWorkouts[1].weight || 
      (recentWorkouts[0].weight === recentWorkouts[1].weight && recentWorkouts[0].reps > recentWorkouts[1].reps)
    );

    if (isImproving) {
      return {
        recommendation: `Great progress! Keep following your current progression plan.`,
        targetWeight: currentWeight,
        targetReps: currentReps + 1,
      };
    }

    // Default recommendation
    return {
      recommendation: `Maintain your current weight of ${currentWeight}kg and aim for consistent form.`,
      targetWeight: currentWeight,
      targetReps: currentReps,
    };
  }
}

export const workoutAnalysisService = new WorkoutAnalysisService();
export default workoutAnalysisService; 