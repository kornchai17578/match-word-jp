import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  GameSettings,
  WordItem,
  SentenceItem,
  GameResult,
} from "../types/types";
import HomeScreen from "../screens/HomeScreen";
import GameSettingsScreen from "../screens/GameSettingsScreen";
import WordSelectionScreen from "../screens/WordSelectionScreen";
import GameScreen from "../screens/GameScreen";
import ResultScreen from "../screens/ResultScreen";
import ManageWordsScreen from "../screens/ManageWordsScreen";
import BrowseAllScreen from "../screens/BrowseAllScreen";

export type RootStackParamList = {
  Home: undefined;
  GameSettings: undefined;
  WordSelection: {
    settings: GameSettings;
  };
  Game: {
    settings: GameSettings;
  };
  Result: {
    result: GameResult;
    settings: GameSettings;
  };
  ManageWords: undefined;
  BrowseAll: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          contentStyle: { backgroundColor: "#0F0F1A" },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GameSettings" component={GameSettingsScreen} />
        <Stack.Screen name="WordSelection" component={WordSelectionScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="ManageWords" component={ManageWordsScreen} />
        <Stack.Screen name="BrowseAll" component={BrowseAllScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
