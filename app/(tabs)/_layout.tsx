import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,    // hides the header
        tabBarStyle: { display: "none" }, // hides the bottom tab bar
      }}
    />
  );
}
