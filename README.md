# AI Fitness App

A React Native mobile application that leverages AI to provide personalized fitness coaching, workout tracking, and nutrition analysis.

## Features

- **AI-Powered Coaching**: Get personalized workout and nutrition recommendations based on your progress and goals
- **Workout Tracking**: Log and track your workouts with detailed exercise information
- **Nutrition Management**: Track your daily food intake with AI-assisted calorie and macronutrient calculations
- **Progress Visualization**: View your fitness progress over time with detailed charts and metrics
- **Personalized Goals**: Set and track your fitness goals with AI assistance

## Technology Stack

- **Frontend**: React Native, Expo
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **AI Processing**: TensorFlow.js for on-device AI, with cloud API fallback
- **Data Persistence**: AsyncStorage

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ai-fitness-app.git
   cd ai-fitness-app
   ```

2. Install dependencies
   ```
   npm install
   # or
   yarn install
   ```

3. Start the development server
   ```
   npm start
   # or
   yarn start
   ```

4. Open the app on your device using the Expo Go app, or run in a simulator/emulator

## Project Structure

```
src/
  ├── components/       # Reusable UI components
  ├── navigation/       # Navigation configuration
  ├── screens/          # Application screens
  ├── services/         # AI and API services
  ├── store/            # Redux store and slices
  │    └── slices/      # Redux slices for state management
  └── utils/            # Utility functions and constants
```

## AI Features

The app integrates AI in several ways:

1. **Workout Analysis**: AI analyzes your workout performance to suggest progressive overload strategies
2. **Nutrition Analysis**: Text-based food descriptions are analyzed to estimate calories and macronutrients
3. **Progress Insights**: AI generates insights based on your fitness trends and patterns

## Contributors

- [Ayyub](https://github.com/AB7-cpu)

## License

This project is licensed under the MIT License - see the LICENSE file for details. 