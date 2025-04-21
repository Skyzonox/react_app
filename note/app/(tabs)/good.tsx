import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const SecurityChecker: React.FC = () => {
  const [secureStoreAvailable, setSecureStoreAvailable] =
    useState<boolean>(false);
  const [cryptoAvailable, setCryptoAvailable] = useState<boolean>(false);
  const [secureStoreWorking, setSecureStoreWorking] = useState<boolean>(false);
  const [cryptoWorking, setCryptoWorking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkSecurity();
  }, []);

  const checkSecurity = async (): Promise<void> => {
    setIsLoading(true);

    // 1. Vérifier si les modules sont disponibles
    try {
      // Vérifier si SecureStore est disponible
      setSecureStoreAvailable(typeof SecureStore.getItemAsync === "function");

      // Vérifier si Crypto est disponible
      setCryptoAvailable(typeof Crypto.getRandomBytesAsync === "function");

      // 2. Tester les fonctionnalités

      // Test de SecureStore
      if (typeof SecureStore.getItemAsync === "function") {
        await SecureStore.setItemAsync("securityTest", "ok");
        const testValue = await SecureStore.getItemAsync("securityTest");
        setSecureStoreWorking(testValue === "ok");
        await SecureStore.deleteItemAsync("securityTest");
      }

      // Test de Crypto
      if (typeof Crypto.getRandomBytesAsync === "function") {
        const randomBytes = await Crypto.getRandomBytesAsync(4);
        setCryptoWorking(randomBytes.length === 4);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      console.error(
        "Erreur lors de la vérification de sécurité:",
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour réexécuter les tests
  const runTestsAgain = (): void => {
    checkSecurity();
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Vérification des modules de sécurité...</Text>
      </View>
    );
  }

  const allSecure: boolean =
    secureStoreAvailable &&
    cryptoAvailable &&
    secureStoreWorking &&
    cryptoWorking;

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <View style={styles.container}>
        <Text style={styles.title}>Vérification des modules de sécurité</Text>

        <View style={styles.resultContainer}>
          <Text style={styles.checkTitle}>Module SecureStore:</Text>
          <Text style={secureStoreAvailable ? styles.secure : styles.notSecure}>
            {secureStoreAvailable ? "DISPONIBLE ✓" : "NON DISPONIBLE ✗"}
          </Text>

          <Text style={styles.checkTitle}>Test SecureStore:</Text>
          <Text style={secureStoreWorking ? styles.secure : styles.notSecure}>
            {secureStoreWorking ? "FONCTIONNEL ✓" : "NON FONCTIONNEL ✗"}
          </Text>

          <Text style={styles.checkTitle}>Module Crypto:</Text>
          <Text style={cryptoAvailable ? styles.secure : styles.notSecure}>
            {cryptoAvailable ? "DISPONIBLE ✓" : "NON DISPONIBLE ✗"}
          </Text>

          <Text style={styles.checkTitle}>Test Crypto:</Text>
          <Text style={cryptoWorking ? styles.secure : styles.notSecure}>
            {cryptoWorking ? "FONCTIONNEL ✓" : "NON FONCTIONNEL ✗"}
          </Text>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Résultat global:</Text>
          <Text style={allSecure ? styles.allSecure : styles.notAllSecure}>
            {allSecure
              ? "APPLICATION SÉCURISÉE ✓"
              : "APPLICATION NON SÉCURISÉE ✗"}
          </Text>
        </View>

        <Button title="Relancer les tests" onPress={runTestsAgain} />

        {!allSecure && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructions}>
              Pour sécuriser l'application, assurez-vous de:
            </Text>
            <Text>
              1. Installer expo-secure-store: npx expo install expo-secure-store
            </Text>
            <Text>2. Installer expo-crypto: npx expo install expo-crypto</Text>
            <Text>3. Les importer correctement dans votre code</Text>
            <Text>
              4. Remplacer AsyncStorage par SecureStore pour les données
              sensibles
            </Text>
            <Text>
              5. Utiliser Crypto.getRandomBytesAsync() au lieu de Math.random()
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  resultContainer: {
    marginBottom: 20,
  },
  checkTitle: {
    fontWeight: "bold",
    marginTop: 10,
  },
  secure: {
    color: "green",
    fontWeight: "bold",
  },
  notSecure: {
    color: "red",
    fontWeight: "bold",
  },
  summaryContainer: {
    marginVertical: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  allSecure: {
    color: "green",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
  notAllSecure: {
    color: "red",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 5,
  },
  instructionsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 5,
  },
  instructions: {
    fontWeight: "bold",
    marginBottom: 5,
  },
});



export const options = {
  tabBarButton: () => null,
};


export default SecurityChecker;
