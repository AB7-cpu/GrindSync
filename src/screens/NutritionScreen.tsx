import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Card, Button, ProgressBar, Chip, Divider, IconButton, Dialog, Portal, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { colors, spacing, fontSizes } from '../utils/theme';
import { RootState } from '../store';
import { 
  updateFoodEntry, 
  deleteFoodEntry, 
  updateWaterIntake,
  processTextFoodEntry
} from '../store/slices/nutritionSlice';
import { foodAnalysisService } from '../services/foodAnalysisService';

const NutritionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { foodEntries, dailyGoals, water, activeDate } = useSelector((state: RootState) => state.nutrition);
  
  // Local state for the food entry form
  const [showFoodEntryDialog, setShowFoodEntryDialog] = useState(false);
  const [foodDescription, setFoodDescription] = useState('');
  const [foodQuantity, setFoodQuantity] = useState('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [foodNotes, setFoodNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // State for water tracking
  const [showWaterDialog, setShowWaterDialog] = useState(false);
  const [waterAmount, setWaterAmount] = useState(water.current.toString());

  // State for editing food entries
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Use theme from React Native Paper
  const theme = useTheme();

  // Filter entries by date and meal type
  const getEntriesByMeal = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return foodEntries.filter(entry => entry.date === activeDate && entry.mealType === meal);
  };

  // Calculate daily totals
  const calculateTotals = () => {
    const todayEntries = foodEntries.filter(entry => entry.date === activeDate);
    
    return todayEntries.reduce((acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  // Handle submitting a new food entry
  const handleAddFood = async () => {
    if (!foodDescription.trim() || !foodQuantity.trim()) {
      return; // Don't submit empty entries
    }

    setIsProcessing(true);
    
    try {
      // In a real app, we would use our AI service here
      // For now, we'll use the simpler estimator from our service
      const aiCalculated = foodAnalysisService.estimateCaloriesFromText(
        foodDescription, 
        foodQuantity
      );
      
      dispatch(processTextFoodEntry({
        description: foodDescription,
        quantity: foodQuantity,
        mealType: mealType,
        aiCalculated: {
          calories: aiCalculated.calories,
          protein: aiCalculated.protein,
          carbs: aiCalculated.carbs,
          fat: aiCalculated.fat,
        },
        notes: foodNotes,
      }));
      
      // Reset form
      setFoodDescription('');
      setFoodQuantity('');
      setFoodNotes('');
      setShowFoodEntryDialog(false);
    } catch (error) {
      console.error('Error processing food entry:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle updating water intake
  const handleUpdateWater = () => {
    const amount = parseFloat(waterAmount);
    if (!isNaN(amount) && amount >= 0) {
      dispatch(updateWaterIntake(amount));
    }
    setShowWaterDialog(false);
  };

  // Handle editing a food entry
  const handleEditEntry = (id: string) => {
    const entry = foodEntries.find(e => e.id === id);
    if (entry) {
      setEditingEntry(id);
      setEditDescription(entry.description);
      setEditQuantity(entry.quantity);
      setEditNotes(entry.notes);
      setShowEditDialog(true);
    }
  };

  // Handle saving edits to a food entry
  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    
    setIsProcessing(true);
    
    try {
      // Recalculate nutrition with AI
      const aiCalculated = foodAnalysisService.estimateCaloriesFromText(
        editDescription, 
        editQuantity
      );
      
      dispatch(updateFoodEntry({
        id: editingEntry,
        updates: {
          description: editDescription,
          quantity: editQuantity,
          calories: aiCalculated.calories,
          protein: aiCalculated.protein,
          carbs: aiCalculated.carbs,
          fat: aiCalculated.fat,
          notes: editNotes,
        }
      }));
      
      setShowEditDialog(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Error updating food entry:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle deleting a food entry
  const handleDeleteEntry = (id: string) => {
    dispatch(deleteFoodEntry(id));
  };

  // Render a meal section
  const renderMealSection = (title: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const entries = getEntriesByMeal(mealType);
    const mealCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
    
    // Icons for meal types with proper typing
    const mealIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      breakfast: 'coffee',
      lunch: 'food-variant',
      dinner: 'food-turkey',
      snack: 'cookie',
    };

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Card.Content>
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleContainer}>
              <MaterialCommunityIcons 
                name={mealIcons[mealType]} 
                size={24} 
                color={theme.colors.primary} 
                style={styles.mealIcon} 
              />
              <Text style={[styles.mealTitle, { color: theme.colors.onSurface }]}>{title}</Text>
            </View>
            <Text style={[styles.mealCalories, { color: theme.colors.onSurfaceVariant }]}>{mealCalories} kcal</Text>
          </View>
          
          {entries.length > 0 ? (
            <View style={styles.foodList}>
              {entries.map(entry => (
                <View key={entry.id} style={[styles.foodItem, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <View style={styles.foodItemContent}>
                    <View style={styles.foodItemMain}>
                      <Text style={[styles.foodName, { color: theme.colors.onSurface }]}>{entry.description}</Text>
                      <Text style={[styles.foodCalories, { color: theme.colors.onSurface }]}>{entry.calories} kcal</Text>
                    </View>
                    <Text style={[styles.foodQuantity, { color: theme.colors.onSurfaceVariant }]}>{entry.quantity}</Text>
                    <View style={styles.macros}>
                      <Text style={[styles.macroText, { color: theme.colors.onSurfaceVariant }]}>P: {entry.protein}g</Text>
                      <Text style={[styles.macroText, { color: theme.colors.onSurfaceVariant }]}>C: {entry.carbs}g</Text>
                      <Text style={[styles.macroText, { color: theme.colors.onSurfaceVariant }]}>F: {entry.fat}g</Text>
                    </View>
                  </View>
                  <View style={styles.foodItemActions}>
                    <IconButton
                      icon="pencil"
                      size={20}
                      onPress={() => handleEditEntry(entry.id)}
                      iconColor={theme.colors.primary}
                    />
                    <IconButton
                      icon="delete"
                      size={20}
                      onPress={() => handleDeleteEntry(entry.id)}
                      iconColor={theme.colors.error}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyMealText, { color: theme.colors.onSurfaceVariant }]}>No foods added yet</Text>
          )}
          
          <Button 
            mode="outlined" 
            onPress={() => {
              setMealType(mealType);
              setShowFoodEntryDialog(true);
            }}
            style={[styles.addFoodButton, { borderColor: theme.colors.primary }]}
            icon="plus"
            textColor={theme.colors.primary}
          >
            Add Food
          </Button>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>Nutrition</Text>
        <TouchableOpacity 
          style={[styles.waterButton, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.outline 
          }]}
          onPress={() => setShowWaterDialog(true)}
        >
          <MaterialCommunityIcons name="cup-water" size={24} color={theme.colors.primary} />
          <Text style={[styles.waterText, { color: theme.colors.primary }]}>
            {water.current} / {water.goal} ml
          </Text>
        </TouchableOpacity>
      </View>

      <Card style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
        <Card.Content>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: theme.colors.onSurfaceVariant }]}>Daily Nutrition</Text>
            <Chip style={[styles.calorieChip, { 
              backgroundColor: theme.colors.primary + '15', 
              borderColor: theme.colors.primary + '30' 
            }]}>
              {totals.calories} / {dailyGoals.calories} kcal
            </Chip>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressItem}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.colors.onSurface }]}>Calories</Text>
                <Text style={[styles.progressValue, { color: theme.colors.onSurfaceVariant }]}>
                  {Math.round((totals.calories / dailyGoals.calories) * 100)}%
                </Text>
              </View>
              <ProgressBar 
                progress={Math.min(totals.calories / dailyGoals.calories, 1)} 
                color={theme.colors.primary} 
                style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]} 
              />
            </View>

            <View style={styles.macroGrid}>
              <View style={styles.macroItem}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.colors.onSurface }]}>Protein</Text>
                  <Text style={[styles.progressValue, { color: theme.colors.onSurfaceVariant }]}>
                    {Math.round((totals.protein / dailyGoals.protein) * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={Math.min(totals.protein / dailyGoals.protein, 1)} 
                  color={theme.colors.primary} 
                  style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]} 
                />
                <Text style={[styles.macroValue, { color: theme.colors.onSurfaceVariant }]}>
                  {totals.protein}g / {dailyGoals.protein}g
                </Text>
              </View>

              <View style={styles.macroItem}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.colors.onSurface }]}>Carbs</Text>
                  <Text style={[styles.progressValue, { color: theme.colors.onSurfaceVariant }]}>
                    {Math.round((totals.carbs / dailyGoals.carbs) * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={Math.min(totals.carbs / dailyGoals.carbs, 1)} 
                  color={theme.colors.primary} 
                  style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]} 
                />
                <Text style={[styles.macroValue, { color: theme.colors.onSurfaceVariant }]}>
                  {totals.carbs}g / {dailyGoals.carbs}g
                </Text>
              </View>

              <View style={styles.macroItem}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: theme.colors.onSurface }]}>Fat</Text>
                  <Text style={[styles.progressValue, { color: theme.colors.onSurfaceVariant }]}>
                    {Math.round((totals.fat / dailyGoals.fat) * 100)}%
                  </Text>
                </View>
                <ProgressBar 
                  progress={Math.min(totals.fat / dailyGoals.fat, 1)} 
                  color={theme.colors.primary} 
                  style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]} 
                />
                <Text style={[styles.macroValue, { color: theme.colors.onSurfaceVariant }]}>
                  {totals.fat}g / {dailyGoals.fat}g
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      <ScrollView style={styles.mealsContainer}>
        {renderMealSection('Breakfast', 'breakfast')}
        {renderMealSection('Lunch', 'lunch')}
        {renderMealSection('Dinner', 'dinner')}
        {renderMealSection('Snacks', 'snack')}
      </ScrollView>

      {/* Food Entry Dialog */}
      <Portal>
        <Dialog visible={showFoodEntryDialog} onDismiss={() => setShowFoodEntryDialog(false)}>
          <Dialog.Title>Add Food</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Food Description</Text>
            <TextInput
              style={[styles.dialogInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              placeholder="e.g. Grilled chicken with rice"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={foodDescription}
              onChangeText={setFoodDescription}
              editable={!isProcessing}
            />
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Quantity/Serving Size</Text>
            <TextInput
              style={[styles.dialogInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              placeholder="e.g. 1 medium bowl, 200g"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={foodQuantity}
              onChangeText={setFoodQuantity}
              editable={!isProcessing}
            />
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Meal Type</Text>
            <View style={styles.mealTypeContainer}>
              <Chip 
                selected={mealType === 'breakfast'} 
                onPress={() => setMealType('breakfast')}
                style={[
                  styles.mealTypeChip,
                  mealType === 'breakfast' && { backgroundColor: theme.colors.primary + '20' }
                ]}
                textStyle={{ 
                  color: mealType === 'breakfast' ? theme.colors.primary : theme.colors.onSurface
                }}
              >
                Breakfast
              </Chip>
              <Chip 
                selected={mealType === 'lunch'} 
                onPress={() => setMealType('lunch')}
                style={[
                  styles.mealTypeChip,
                  mealType === 'lunch' && { backgroundColor: theme.colors.primary + '20' }
                ]}
                textStyle={{ 
                  color: mealType === 'lunch' ? theme.colors.primary : theme.colors.onSurface
                }}
              >
                Lunch
              </Chip>
              <Chip 
                selected={mealType === 'dinner'} 
                onPress={() => setMealType('dinner')}
                style={[
                  styles.mealTypeChip,
                  mealType === 'dinner' && { backgroundColor: theme.colors.primary + '20' }
                ]}
                textStyle={{ 
                  color: mealType === 'dinner' ? theme.colors.primary : theme.colors.onSurface
                }}
              >
                Dinner
              </Chip>
              <Chip 
                selected={mealType === 'snack'} 
                onPress={() => setMealType('snack')}
                style={[
                  styles.mealTypeChip,
                  mealType === 'snack' && { backgroundColor: theme.colors.primary + '20' }
                ]}
                textStyle={{ 
                  color: mealType === 'snack' ? theme.colors.primary : theme.colors.onSurface
                }}
              >
                Snack
              </Chip>
            </View>
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.dialogInput, styles.notesInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              placeholder="Any details about this food..."
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={foodNotes}
              onChangeText={setFoodNotes}
              multiline
              editable={!isProcessing}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setShowFoodEntryDialog(false)} 
              disabled={isProcessing}
              textColor={theme.colors.onSurface}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleAddFood} 
              loading={isProcessing}
              disabled={!foodDescription.trim() || !foodQuantity.trim() || isProcessing}
              textColor={theme.colors.primary}
            >
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Water Dialog */}
      <Portal>
        <Dialog visible={showWaterDialog} onDismiss={() => setShowWaterDialog(false)}>
          <Dialog.Title>Update Water Intake</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Water Amount (ml)</Text>
            <TextInput
              style={[styles.dialogInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              placeholder="e.g. 500"
              placeholderTextColor={theme.colors.onSurfaceVariant}
              value={waterAmount}
              onChangeText={setWaterAmount}
              keyboardType="numeric"
            />
            <Text style={[styles.dialogHelp, { color: theme.colors.onSurfaceVariant }]}>Enter amount in milliliters</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowWaterDialog(false)} textColor={theme.colors.onSurface}>Cancel</Button>
            <Button onPress={handleUpdateWater} textColor={theme.colors.primary}>Update</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Food Dialog */}
      <Portal>
        <Dialog visible={showEditDialog} onDismiss={() => setShowEditDialog(false)}>
          <Dialog.Title>Edit Food Entry</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Food Description</Text>
            <TextInput
              style={[styles.dialogInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              value={editDescription}
              onChangeText={setEditDescription}
              editable={!isProcessing}
            />
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Quantity/Serving Size</Text>
            <TextInput
              style={[styles.dialogInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              value={editQuantity}
              onChangeText={setEditQuantity}
              editable={!isProcessing}
            />
            
            <Text style={[styles.dialogLabel, { color: theme.colors.onSurface }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.dialogInput, styles.notesInput, { color: theme.colors.onSurface, borderColor: theme.colors.outline }]}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              editable={!isProcessing}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setShowEditDialog(false)} 
              disabled={isProcessing}
              textColor={theme.colors.onSurface}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleSaveEdit} 
              loading={isProcessing}
              disabled={!editDescription.trim() || !editQuantity.trim() || isProcessing}
              textColor={theme.colors.primary}
            >
              Save
            </Button>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
  },
  waterText: {
    marginLeft: spacing.xs,
    fontSize: fontSizes.sm,
  },
  summaryCard: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  calorieChip: {
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
  },
  progressSection: {
    marginTop: spacing.md,
  },
  progressItem: {
    marginBottom: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  progressLabel: {
    fontSize: fontSizes.sm,
    color: colors.text,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(39, 39, 42, 0.7)',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  macroItem: {
    flex: 1,
  },
  macroValue: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mealsContainer: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    marginRight: spacing.xs,
  },
  mealTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  mealCalories: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  foodList: {
    marginBottom: spacing.md,
  },
  foodItem: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    justifyContent: 'space-between',
  },
  foodItemContent: {
    flex: 1,
  },
  foodItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  foodCalories: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  foodQuantity: {
    fontSize: fontSizes.xs,
  },
  macros: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  macroText: {
    fontSize: fontSizes.xs,
    marginRight: spacing.sm,
  },
  foodItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyMealText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  addFoodButton: {
    borderColor: colors.border,
  },
  dialogInput: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  dialogLabel: {
    marginBottom: spacing.xs,
    fontSize: fontSizes.sm,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dialogHelp: {
    fontSize: fontSizes.xs,
    marginTop: -spacing.sm,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  mealTypeChip: {
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
    backgroundColor: colors.card,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});

export default NutritionScreen; 