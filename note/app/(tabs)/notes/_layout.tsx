import { Stack } from "expo-router";

export default function NotesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="[id]" />
      <Stack.Screen name="create_note" />
    </Stack>
  );
}