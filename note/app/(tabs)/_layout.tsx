import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarBackground: TabBarBackground,
                tabBarStyle: Platform.select({
                    ios: {
                        position: "absolute",
                    },
                    default: {},
                }),
            }}
        >

            <Tabs.Screen
                name="note"
                options={{
                    title: "Notes",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text-outline" size={size} color={color} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="tasks"
                options={{
                    title: "Tâches",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkmark-done-outline" size={size} color={color} />
                    ),
                }}
            />
            
            
            <Tabs.Screen name="index" options={{ href: null }} />
                       
            <Tabs.Screen name="notes" options={{ href: null }} />
            <Tabs.Screen name="taches" options={{ href: null }} />
                       
            <Tabs.Screen name="good" options={{ href: null }} />
            <Tabs.Screen name="secu" options={{ href: null }} />
        </Tabs>
    );
}