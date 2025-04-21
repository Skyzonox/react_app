import { Stack } from "expo-router";

export default function TachesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[id]" />
      <Stack.Screen name="create_task" />
    </Stack>
  );
}