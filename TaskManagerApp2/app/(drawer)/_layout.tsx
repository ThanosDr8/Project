import { Feather } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";

import { useColors } from "@/hooks/useColors";

export default function DrawerLayout() {
  const colors = useColors();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: colors.headerBackground },
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontWeight: "700", fontFamily: "Inter_600SemiBold" },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
        drawerStyle: { backgroundColor: colors.drawerBackground },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.mutedForeground,
        drawerActiveBackgroundColor: colors.accent,
        drawerLabelStyle: {
          fontWeight: "600",
          fontFamily: "Inter_500Medium",
          marginLeft: -8,
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Tasks",
          drawerLabel: "Tasks",
          drawerIcon: ({ color, size }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          drawerLabel: "Settings",
          drawerIcon: ({ color, size }) => (
            <Feather name="settings" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
