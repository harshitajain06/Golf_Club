// src/navigation/StackLayout.jsx
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import { signOut } from "firebase/auth";

import { auth } from "../../config/firebase";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

// Screens from App.js
import AuthScreen from "./index";
import HomeScreen from "./HomeScreen";
import PracticeScreen from "./PracticeScreen";
import RecordPerformanceScreen from "./RecordPerformanceScreen";
import BreatheScreen from "./BreatheScreen";
import StatsScreen from "./StatsScreen";

const Stack = createStackNavigator();
const Tabs = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ---------------- Practice Stack ----------------
function PracticeStack() {
  const uid = auth.currentUser?.uid;
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Practice"
        component={PracticeScreen}
        initialParams={{ uid }}
        options={{ title: "Practice" }}
      />
      <Stack.Screen
        name="RecordPerformance"
        component={RecordPerformanceScreen}
        initialParams={{ uid }}
        options={{ title: "Record Performance" }}
      />
    </Stack.Navigator>
  );
}

// ---------------- Bottom Tabs ----------------
function TabsContainer() {
  const colorScheme = useColorScheme();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { height: 64, paddingBottom: 10 },
        tabBarIcon: ({ focused, color }) => {
          if (route.name === "Home")
            return (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            );
          if (route.name === "PracticeFlow")
            return (
              <MaterialCommunityIcons name="golf" size={24} color={color} />
            );
          if (route.name === "Breathe")
            return (
              <Ionicons
                name={focused ? "leaf" : "leaf-outline"}
                size={24}
                color={color}
              />
            );
          if (route.name === "Stats")
            return (
              <Ionicons
                name={focused ? "stats-chart" : "stats-chart-outline"}
                size={24}
                color={color}
              />
            );
          return null;
        },
        tabBarLabel: () => null,
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen
        name="PracticeFlow"
        component={PracticeStack}
        options={{ title: "Practice" }}
      />
      {/* <Tabs.Screen name="Breathe" component={BreatheScreen} /> */}
      <Tabs.Screen name="Stats" component={StatsScreen} />
    </Tabs.Navigator>
  );
}

// ---------------- Drawer ----------------
function DrawerNavigator() {
  const navigation = useNavigation();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.replace("Auth");
      })
      .catch((err) => {
        console.error("Logout Error:", err);
        Alert.alert("Error", "Failed to logout. Please try again.");
      });
  };

  return (
    <Drawer.Navigator initialRouteName="MainTabs">
      <Drawer.Screen
        name="MainTabs"
        component={TabsContainer}
        options={{ title: "Dashboard" }}
      />
      <Drawer.Screen
        name="Logout"
        component={TabsContainer}
        options={{
          title: "Logout",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          ),
        }}
        listeners={{
          drawerItemPress: (e) => {
            e.preventDefault();
            handleLogout();
          },
        }}
      />
    </Drawer.Navigator>
  );
}

// ---------------- Main Stack ----------------
export default function StackLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}
