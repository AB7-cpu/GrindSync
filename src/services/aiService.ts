// Base AI service for handling on-device and cloud-based AI processing
// This is a hybrid approach that tries on-device first and falls back to cloud

import * as tf from '@tensorflow/tfjs';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface AiServiceConfig {
  useLocalModelWhenAvailable: boolean;
  apiEndpoint?: string;
  apiKey?: string;
}

export interface AiProcessingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  source: 'local' | 'cloud';
}

// Default configuration
const defaultConfig: AiServiceConfig = {
  useLocalModelWhenAvailable: true,
  apiEndpoint: 'https://api.example.com/ai', // Replace with actual API endpoint
};

// Initialize service and TensorFlow
class AiService {
  private config: AiServiceConfig;
  private modelCache: Record<string, tf.LayersModel> = {};
  private isInitialized = false;

  constructor(config: Partial<AiServiceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // Initialize TensorFlow.js
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Initialize TensorFlow.js
      await tf.ready();
      console.log('TensorFlow.js initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
      return false;
    }
  }

  // Generic AI processing method that implements the hybrid approach
  public async process<T>(
    inputData: any,
    modelType: string,
    modelUrl: string,
    processFunction: (model: tf.LayersModel, data: any) => Promise<T>,
    cloudApiPath: string
  ): Promise<AiProcessingResult<T>> {
    // Check if we should try local processing first
    if (this.config.useLocalModelWhenAvailable) {
      try {
        // Initialize if needed
        if (!this.isInitialized) {
          await this.initialize();
        }

        // Try to get or load the model
        const model = await this.getOrLoadModel(modelType, modelUrl);
        
        // Process locally
        const result = await processFunction(model, inputData);
        return {
          success: true,
          data: result,
          source: 'local',
        };
      } catch (error) {
        console.log('Local AI processing failed, falling back to cloud:', error);
        // Fall back to cloud processing
      }
    }

    // Use cloud API if local processing failed or isn't configured
    return this.processWithCloudApi<T>(inputData, cloudApiPath);
  }

  // Get a cached model or load it from URL
  private async getOrLoadModel(modelType: string, modelUrl: string): Promise<tf.LayersModel> {
    // Check if model is in memory cache
    if (this.modelCache[modelType]) {
      return this.modelCache[modelType];
    }

    // Check if model is in AsyncStorage
    try {
      const localModelInfo = await AsyncStorage.getItem(`ai_model_${modelType}`);
      if (localModelInfo) {
        const modelInfo = JSON.parse(localModelInfo);
        // Load model from local storage
        const model = await tf.loadLayersModel(`indexeddb://${modelType}`);
        this.modelCache[modelType] = model;
        return model;
      }
    } catch (error) {
      console.log('Error checking local model:', error);
    }

    // Download and save the model
    try {
      const model = await tf.loadLayersModel(modelUrl);
      this.modelCache[modelType] = model;
      
      // Save model to indexeddb
      await model.save(`indexeddb://${modelType}`);
      
      // Save metadata to AsyncStorage
      await AsyncStorage.setItem(`ai_model_${modelType}`, JSON.stringify({
        savedAt: new Date().toISOString(),
        modelType,
      }));
      
      return model;
    } catch (error) {
      throw new Error(`Failed to load model: ${error}`);
    }
  }

  // Process with cloud API
  private async processWithCloudApi<T>(inputData: any, apiPath: string): Promise<AiProcessingResult<T>> {
    if (!this.config.apiEndpoint || !this.config.apiKey) {
      return {
        success: false,
        error: 'Cloud API not configured',
        source: 'cloud',
      };
    }

    try {
      // In a real app, this would make an actual API call
      // For this demo, we'll simulate cloud processing
      
      // Simulating API call - in actual implementation, use fetch or axios
      // const response = await fetch(`${this.config.apiEndpoint}/${apiPath}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.config.apiKey}`,
      //   },
      //   body: JSON.stringify(inputData),
      // });
      
      // const data = await response.json();
      // return {
      //   success: true,
      //   data: data as T,
      //   source: 'cloud',
      // };
      
      // For demo, simulate a response
      console.log(`Simulating cloud API call to ${apiPath} with data:`, inputData);
      
      // Wait to simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: this.simulateCloudResponse<T>(inputData, apiPath),
        source: 'cloud',
      };
    } catch (error) {
      return {
        success: false,
        error: `Cloud API error: ${error}`,
        source: 'cloud',
      };
    }
  }

  // Simulate cloud API response (for demo purposes)
  private simulateCloudResponse<T>(inputData: any, apiPath: string): T {
    // This is just a placeholder for demo purposes
    // In a real app, this would be an actual API call
    
    // Just a simple simulation - in real world, we'd use a proper API
    if (apiPath.includes('food')) {
      return {
        calories: Math.floor(Math.random() * 300) + 100,
        protein: Math.floor(Math.random() * 20) + 5,
        carbs: Math.floor(Math.random() * 30) + 10,
        fat: Math.floor(Math.random() * 15) + 2,
      } as unknown as T;
    } else {
      return {
        recommendation: "Increase weight by 5kg for progressive overload",
        insights: ["Strength improving", "Good form detected"],
      } as unknown as T;
    }
  }
}

export const aiService = new AiService();
export default aiService; 