import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Card, Chip, SegmentedButtons, Button, useTheme } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootState } from '../store';
import { spacing, fontSizes } from '../utils/theme';
import { workoutAnalysisService } from '../services/workoutAnalysisService';

// Mock chart component - in a real app, you'd use a library like Victory or react-native-chart-kit
const Chart = ({ data, type }: { data: any[], type: string }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.chartPlaceholder, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={[styles.chartPlaceholderText, { color: theme.colors.onSurfaceVariant }]}>
        {type.charAt(0).toUpperCase() + type.slice(1)} Chart
      </Text>
      <Text style={[styles.chartPlaceholderSubtext, { color: theme.colors.onSurfaceVariant }]}>
        (Visualization would render here using actual chart library)
      </Text>
    </View>
  );
};

const ProgressScreen: React.FC = () => {
  // Time range for progress viewing
  const [timeRange, setTimeRange] = useState('week');
  
  // Tab selection for progress type
  const [activeTab, setActiveTab] = useState('workouts');
  
  // State for AI analysis visibility
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Get theme
  const theme = useTheme();
  
  // Get data from Redux store with safe fallbacks
  const workout = useSelector((state: RootState) => state.workout || {});
  const workoutHistory = workout.workoutHistory || [];
  
  const nutrition = useSelector((state: RootState) => state.nutrition || {});
  const foodEntries = nutrition.foodEntries || [];
  
  // Mock workout progress calculation
  const calculateWorkoutProgress = () => {
    // In a real app, this would be calculated from actual data
    return {
      totalWorkouts: workoutHistory.length,
      totalTime: workoutHistory.reduce((acc, workout) => acc + (workout.duration || 0), 0),
      totalCaloriesBurned: workoutHistory.reduce((acc, workout) => acc + (workout.caloriesBurned || 0), 0),
      strongestLift: {
        exercise: 'Bench Press',
        weight: 185,
        date: '2023-03-01',
      },
      frequentExercise: {
        name: 'Squat',
        count: 8,
      }
    };
  };
  
  // Mock nutrition progress calculation
  const calculateNutritionProgress = () => {
    // In a real app, this would be calculated from actual data
    return {
      averageCalories: 2100,
      averageProtein: 120,
      averageCarbs: 200,
      averageFat: 70,
      bestDay: {
        date: '2023-03-02',
        proteinGoalMet: true,
        caloriesWithinRange: true
      }
    };
  };
  
  // Mock AI analysis of progress
  const generateAiInsights = () => {
    // In a real app, this would call our AI service
    if (activeTab === 'workouts') {
      return {
        title: "Your Workout Progress Insights",
        insights: [
          "You're consistently increasing your squat weight by 5lbs each week. Great progressive overload!",
          "Your workout consistency has improved by 20% compared to last month.",
          "Consider adding more back exercises for better muscle balance.",
          "Your strength has improved most in compound lifts, particularly deadlifts."
        ]
      };
    } else {
      return {
        title: "Your Nutrition Progress Insights",
        insights: [
          "Your protein intake has been consistently above 100g daily, supporting muscle growth.",
          "You tend to consume more carbs on workout days, which is good for energy.",
          "Weekend calorie intake is 25% higher than weekdays. Consider more consistency.",
          "Your water intake has improved by 30% in the last two weeks."
        ]
      };
    }
  };
  
  const workoutProgress = calculateWorkoutProgress();
  const nutritionProgress = calculateNutritionProgress();
  const aiInsights = generateAiInsights();
  
  // Generate mock chart data based on selected time range and tab
  const generateChartData = () => {
    // In a real app, this would process actual data for the charts
    if (activeTab === 'workouts') {
      return [
        { date: '2023-02-25', value: 320 },
        { date: '2023-02-27', value: 350 },
        { date: '2023-03-01', value: 375 },
        { date: '2023-03-02', value: 390 },
        { date: '2023-03-04', value: 400 },
      ];
    } else {
      return [
        { date: '2023-02-25', value: 2200 },
        { date: '2023-02-26', value: 1950 },
        { date: '2023-02-27', value: 2100 },
        { date: '2023-03-01', value: 2050 },
        { date: '2023-03-02', value: 2150 },
        { date: '2023-03-03', value: 2300 },
        { date: '2023-03-04', value: 2000 },
      ];
    }
  };
  
  const chartData = generateChartData();
  
  // Render workout progress content
  const renderWorkoutsContent = () => {
    return (
      <>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Workout Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{workoutProgress.totalWorkouts}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Total Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{Math.round(workoutProgress.totalTime / 60)}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Hours Active</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{workoutProgress.totalCaloriesBurned}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Calories Burned</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Strength Progress</Text>
            <Chart data={chartData} type="strength" />
            <View style={styles.exerciseHighlights}>
              <View style={styles.exerciseHighlight}>
                <MaterialCommunityIcons name="trophy" size={20} color={theme.colors.primary} style={styles.highlightIcon} />
                <View>
                  <Text style={[styles.highlightTitle, { color: theme.colors.onSurfaceVariant }]}>Strongest Lift</Text>
                  <Text style={[styles.highlightValue, { color: theme.colors.onSurface }]}>
                    {workoutProgress.strongestLift.exercise}: {workoutProgress.strongestLift.weight} lbs
                  </Text>
                </View>
              </View>
              <View style={styles.exerciseHighlight}>
                <MaterialCommunityIcons name="repeat" size={20} color={theme.colors.primary} style={styles.highlightIcon} />
                <View>
                  <Text style={[styles.highlightTitle, { color: theme.colors.onSurfaceVariant }]}>Most Frequent Exercise</Text>
                  <Text style={[styles.highlightValue, { color: theme.colors.onSurface }]}>
                    {workoutProgress.frequentExercise.name} ({workoutProgress.frequentExercise.count} times)
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Workout Frequency</Text>
            <Chart data={chartData} type="frequency" />
          </Card.Content>
        </Card>
      </>
    );
  };
  
  // Render nutrition progress content
  const renderNutritionContent = () => {
    return (
      <>
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Nutrition Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionProgress.averageCalories}</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Avg Calories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionProgress.averageProtein}g</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Avg Protein</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionProgress.averageCarbs}g</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Avg Carbs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.onSurface }]}>{nutritionProgress.averageFat}g</Text>
                <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Avg Fat</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Calorie Intake</Text>
            <Chart data={chartData} type="calories" />
          </Card.Content>
        </Card>
        
        <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
          <Card.Content>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurfaceVariant }]}>Macronutrient Balance</Text>
            <Chart data={chartData} type="macros" />
            <View style={styles.macroLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Protein</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: theme.colors.secondary }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Carbs</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: theme.colors.tertiary || theme.colors.error }]} />
                <Text style={[styles.legendText, { color: theme.colors.onSurfaceVariant }]}>Fat</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </>
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Progress</Text>
        <TouchableOpacity 
          style={[styles.analysisButton, { 
            backgroundColor: theme.colors.surface, 
            borderColor: showAnalysis ? theme.colors.primary : theme.colors.outline 
          }]}
          onPress={() => setShowAnalysis(!showAnalysis)}
        >
          <MaterialCommunityIcons 
            name="brain" 
            size={20} 
            color={showAnalysis ? theme.colors.primary : theme.colors.onSurfaceVariant} 
          />
          <Text 
            style={[
              styles.analysisButtonText, 
              { color: showAnalysis ? theme.colors.primary : theme.colors.onSurfaceVariant }
            ]}
          >
            AI Analysis
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.timeRangeSelector}>
        <SegmentedButtons
          value={timeRange}
          onValueChange={setTimeRange}
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
            { value: 'year', label: 'Year' },
            { value: 'all', label: 'All Time' },
          ]}
          style={[styles.segmentedButtons, { backgroundColor: theme.colors.surface }]}
        />
      </View>
      
      <View style={[styles.tabSelector, { 
        backgroundColor: theme.colors.surface, 
        borderColor: theme.colors.outline 
      }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'workouts' && [styles.activeTab, { 
              backgroundColor: theme.colors.primary + '15', 
              borderBottomColor: theme.colors.primary 
            }]
          ]}
          onPress={() => setActiveTab('workouts')}
        >
          <MaterialCommunityIcons
            name="dumbbell"
            size={20}
            color={activeTab === 'workouts' ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'workouts' ? theme.colors.primary : theme.colors.onSurfaceVariant },
              activeTab === 'workouts' && styles.activeTabText
            ]}
          >
            Workouts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'nutrition' && [styles.activeTab, { 
              backgroundColor: theme.colors.primary + '15', 
              borderBottomColor: theme.colors.primary 
            }]
          ]}
          onPress={() => setActiveTab('nutrition')}
        >
          <MaterialCommunityIcons
            name="food-apple"
            size={20}
            color={activeTab === 'nutrition' ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'nutrition' ? theme.colors.primary : theme.colors.onSurfaceVariant },
              activeTab === 'nutrition' && styles.activeTabText
            ]}
          >
            Nutrition
          </Text>
        </TouchableOpacity>
      </View>
      
      {showAnalysis && (
        <Card style={[styles.aiCard, { 
          backgroundColor: theme.colors.surface, 
          borderColor: theme.colors.primary + '30' 
        }]}>
          <Card.Content>
            <View style={styles.aiHeaderRow}>
              <MaterialCommunityIcons name="brain" size={20} color={theme.colors.primary} />
              <Text style={[styles.aiCardTitle, { color: theme.colors.primary }]}>{aiInsights.title}</Text>
            </View>
            
            {aiInsights.insights.map((insight, index) => (
              <View key={index} style={styles.insightItem}>
                <MaterialCommunityIcons name="lightbulb-on" size={16} color={theme.colors.primary} style={styles.insightIcon} />
                <Text style={[styles.insightText, { color: theme.colors.onSurface }]}>{insight}</Text>
              </View>
            ))}
            
            <Button 
              mode="outlined" 
              onPress={() => {/* Request more detailed analysis */}}
              style={[styles.aiButton, { borderColor: theme.colors.primary }]}
              icon="chart-line"
              textColor={theme.colors.primary}
            >
              Get More Detailed Analysis
            </Button>
          </Card.Content>
        </Card>
      )}
      
      <ScrollView style={styles.scrollView}>
        {activeTab === 'workouts' ? renderWorkoutsContent() : renderNutritionContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  analysisButtonText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
  },
  timeRangeSelector: {
    marginBottom: spacing.md,
  },
  segmentedButtons: {
  },
  tabSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
  },
  activeTabText: {
    fontWeight: '500',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '30%',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  chartPlaceholder: {
    height: 200,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  chartPlaceholderText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  chartPlaceholderSubtext: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  exerciseHighlights: {
    marginTop: spacing.sm,
  },
  exerciseHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  highlightIcon: {
    marginRight: spacing.sm,
  },
  highlightTitle: {
    fontSize: fontSizes.sm,
  },
  highlightValue: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  macroLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: fontSizes.xs,
  },
  aiCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  aiCardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  insightIcon: {
    marginRight: spacing.xs,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  aiButton: {
    marginTop: spacing.sm,
  },
});

export default ProgressScreen; 