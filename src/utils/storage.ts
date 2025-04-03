import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'userToken',
  USER_DATA: 'userData',
  SETTINGS: 'settings',
  WORKOUTS: 'workouts',
  WORKOUT_HISTORY: 'workoutHistory',
  NUTRITION: 'nutrition',
  FOOD_LOG: 'foodLog',
};

/**
 * Saves data to AsyncStorage
 * @param key The storage key
 * @param value The data to store (will be JSON stringified)
 */
export const saveData = async<T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
    throw error;
  }
};

/**
 * Retrieves data from AsyncStorage
 * @param key The storage key
 * @returns The parsed data or null if not found
 */
export const getData = async<T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) as T : null;
  } catch (error) {
    console.error(`Error reading data from ${key}:`, error);
    return null;
  }
};

/**
 * Removes data from AsyncStorage
 * @param key The storage key
 */
export const removeData = async(key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from ${key}:`, error);
    throw error;
  }
};

/**
 * Clears all app data from AsyncStorage
 */
export const clearAllData = async(): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

/**
 * Gets all storage keys
 * @returns Array of all keys in AsyncStorage
 */
export const getAllKeys = async (): Promise<string[]> => {
  const keys = await AsyncStorage.getAllKeys();
  return [...keys]; // Convert readonly string[] to string[]
};

/**
 * Merges an object with existing stored data
 * @param key The storage key
 * @param value Object to merge with existing data
 */
export const mergeData = async<T extends object>(key: string, value: Partial<T>): Promise<void> => {
  try {
    const existing = await getData<T>(key);
    if (existing) {
      await saveData(key, { ...existing, ...value });
    } else {
      await saveData(key, value);
    }
  } catch (error) {
    console.error(`Error merging data for ${key}:`, error);
    throw error;
  }
};

/**
 * Handles storing array data with proper merging and updating
 * @param key The storage key
 * @param item Item to add to the array
 * @param idField Field name to use as unique identifier
 */
export const addToArray = async<T extends { [key: string]: any }>(
  key: string, 
  item: T, 
  idField: keyof T = 'id'
): Promise<void> => {
  try {
    const existingItems = await getData<T[]>(key) || [];
    const itemIndex = existingItems.findIndex(i => i[idField] === item[idField]);
    
    if (itemIndex >= 0) {
      // Update existing item
      existingItems[itemIndex] = { ...existingItems[itemIndex], ...item };
    } else {
      // Add new item
      existingItems.push(item);
    }
    
    await saveData(key, existingItems);
  } catch (error) {
    console.error(`Error adding item to array for ${key}:`, error);
    throw error;
  }
};

/**
 * Removes an item from a stored array
 * @param key The storage key
 * @param id ID of the item to remove
 * @param idField Field name to use as unique identifier
 */
export const removeFromArray = async<T extends { [key: string]: any }>(
  key: string, 
  id: string | number, 
  idField: keyof T = 'id'
): Promise<void> => {
  try {
    const existingItems = await getData<T[]>(key) || [];
    const updatedItems = existingItems.filter(item => item[idField] !== id);
    
    if (existingItems.length !== updatedItems.length) {
      await saveData(key, updatedItems);
    }
  } catch (error) {
    console.error(`Error removing item from array for ${key}:`, error);
    throw error;
  }
};

/**
 * Storage class for caching and managing app data
 */
export class StorageCache {
  private cache: Map<string, any> = new Map();
  private initialized: boolean = false;
  
  /**
   * Initializes the cache with data from storage
   */
  async initialize(keys: string[] = Object.values(STORAGE_KEYS)): Promise<void> {
    try {
      await Promise.all(
        keys.map(async (key) => {
          const data = await getData(key);
          if (data) {
            this.cache.set(key, data);
          }
        })
      );
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing storage cache:', error);
    }
  }
  
  /**
   * Gets data from cache or storage
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.initialized) {
      await this.initialize([key]);
    }
    
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    } else {
      const data = await getData<T>(key);
      if (data) {
        this.cache.set(key, data);
      }
      return data;
    }
  }
  
  /**
   * Saves data to cache and storage
   */
  async set<T>(key: string, data: T): Promise<void> {
    this.cache.set(key, data);
    await saveData(key, data);
  }
  
  /**
   * Removes data from cache and storage
   */
  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    await removeData(key);
  }
  
  /**
   * Clears all cached data
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const storageCache = new StorageCache(); 