import { StyleSheet, Image, Platform, Button, View } from "react-native";
import { useRouter } from "expo-router";
import { useEffect } from "react";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useAuth } from "../_layout";

export default function Index() {
  const { user, userToken, signOut } = useAuth();
  const router = useRouter();
  
  // Rediriger vers note si on arrive sur index (qui est une route masquée)
  useEffect(() => {
    if (userToken) {
      console.log("Index: Redirection vers note");
      // Utiliser un timeout pour éviter les redirections immédiates qui peuvent causer des boucles
      const timer = setTimeout(() => {
        router.replace("/(tabs)/note");
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [userToken]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>
        {user ? `Welcome, ${user.name}!` : "Welcome to your new app!"}
      </ThemedText>
      <ThemedText>
        {userToken ? "You are authenticated." : "You are not authenticated."}
      </ThemedText>
      {userToken && (
        <View style={styles.buttonContainer}>
          <Button title="Voir les notes" onPress={() => router.replace("/(tabs)/note")} />
          <Button title="Se déconnecter" onPress={signOut} />
        </View>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  }
});