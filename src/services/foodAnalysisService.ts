import aiService, { AiProcessingResult } from './aiService';

// Types for food analysis
export interface FoodNutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodAnalysisRequest {
  description: string;
  quantity: string;
}

export interface FoodAnalysisResponse extends FoodNutritionInfo {
  confidence: number;
  possibleAlternatives?: FoodNutritionInfo[];
}

// URLs for models
const FOOD_MODEL_URL = 'https://storage.googleapis.com/tfjs-models/savedmodel/mobilenet_v2_1.0_224/model.json';

class FoodAnalysisService {
  // Analyze food from text description
  public async analyzeFoodText(
    description: string,
    quantity: string
  ): Promise<AiProcessingResult<FoodAnalysisResponse>> {
    const request: FoodAnalysisRequest = {
      description,
      quantity,
    };

    // In a real implementation, we would have a proper TensorFlow model for analyzing food
    // For this demo, we'll mostly rely on the cloud API simulation

    return aiService.process<FoodAnalysisResponse>(
      request,
      'food-nutrition-analysis',
      FOOD_MODEL_URL,
      this.processWithLocalModel,
      'food/analyze'
    );
  }

  // Process food analysis with a local TensorFlow model
  // This is a placeholder for the real implementation
  private async processWithLocalModel(model: any, request: FoodAnalysisRequest): Promise<FoodAnalysisResponse> {
    // This is just a placeholder. In a real app, we would:
    // 1. Preprocess the text (tokenize, normalize)
    // 2. Run it through the model
    // 3. Parse the model output
    
    // For this demo, we'll just return some placeholder values
    // In a real app, this would use the actual model to make predictions
    
    console.log('Processing food analysis locally with TensorFlow');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Return some simple calculations
    // In a real app, this would be based on model output
    return {
      calories: 200,
      protein: 10,
      carbs: 20,
      fat: 8,
      confidence: 0.85
    };
  }

  // A simple heuristic function to estimate calories from text
  // This is just for demonstration - a real system would use a much more sophisticated approach
  public estimateCaloriesFromText(description: string, quantity: string): FoodNutritionInfo {
    // This is an extremely simplified approach just for demo purposes
    // In reality, we would use a much more sophisticated NLP approach
    
    const descLower = description.toLowerCase();
    const qtyLower = quantity.toLowerCase();
    
    // Very crude estimation logic
    let baseCalories = 100;
    let protein = 5;
    let carbs = 10;
    let fat = 5;
    
    // Check for common high-calorie foods
    if (descLower.includes('burger') || descLower.includes('pizza')) {
      baseCalories = 300;
      protein = 15;
      carbs = 30;
      fat = 15;
    } else if (descLower.includes('salad') || descLower.includes('vegetable')) {
      baseCalories = 50;
      protein = 2;
      carbs = 5;
      fat = 2;
    } else if (descLower.includes('chicken') || descLower.includes('fish')) {
      baseCalories = 120;
      protein = 20;
      carbs = 0;
      fat = 5;
    } else if (descLower.includes('rice') || descLower.includes('pasta')) {
      baseCalories = 200;
      protein = 5;
      carbs = 40;
      fat = 1;
    } else if (descLower.includes('fruit') || descLower.includes('apple') || descLower.includes('banana')) {
      baseCalories = 80;
      protein = 1;
      carbs = 20;
      fat = 0;
    }
    
    // Adjust for quantity
    let quantityMultiplier = 1;
    if (qtyLower.includes('large') || qtyLower.includes('big')) {
      quantityMultiplier = 1.5;
    } else if (qtyLower.includes('small')) {
      quantityMultiplier = 0.6;
    } else if (qtyLower.includes('medium')) {
      quantityMultiplier = 1;
    }
    
    // Try to extract number
    const numberMatch = qtyLower.match(/\d+/);
    if (numberMatch) {
      const number = parseInt(numberMatch[0], 10);
      if (number > 0) {
        quantityMultiplier = number;
      }
    }
    
    return {
      calories: Math.round(baseCalories * quantityMultiplier),
      protein: Math.round(protein * quantityMultiplier),
      carbs: Math.round(carbs * quantityMultiplier),
      fat: Math.round(fat * quantityMultiplier),
    };
  }
}

export const foodAnalysisService = new FoodAnalysisService();
export default foodAnalysisService; 