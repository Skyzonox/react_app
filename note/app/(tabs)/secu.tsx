import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Note: On importe ces modules mais on ne les utilisera pas intentionnellement
// Les étudiants devront modifier le code pour utiliser ces modules
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

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

  // Fonction non sécurisée pour générer des nombres aléatoires
  const generateInsecureRandomBytes = (length: number): Uint8Array => {
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      // Utilisation intentionnelle de Math.random() (non sécurisé)
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };

  const checkSecurity = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // Vérification intentionnellement incorrecte pour SecureStore
      // On vérifie si on utilise réellement SecureStore (ce qu'on ne fait pas ici)
      const usingSecureStorage = false; // À changer par les étudiants
      setSecureStoreAvailable(usingSecureStorage);

      // Vérification intentionnellement incorrecte pour Crypto
      // On vérifie si on utilise réellement Crypto (ce qu'on ne fait pas ici)
      const usingCrypto = false; // À changer par les étudiants
      setCryptoAvailable(usingCrypto);

      // Test utilisant AsyncStorage (non sécurisé) au lieu de SecureStore
      try {
        await AsyncStorage.setItem("securityTest", "ok");
        const testValue = await AsyncStorage.getItem("securityTest");
        setSecureStoreWorking(false); // On indique que SecureStore n'est pas utilisé correctement
        await AsyncStorage.removeItem("securityTest");
      } catch (error) {
        console.error("Erreur AsyncStorage:", error);
      }

      // Test utilisant Math.random() (non sécurisé) au lieu de Crypto
      try {
        const randomBytes = generateInsecureRandomBytes(4);
        setCryptoWorking(false); // On indique que Crypto n'est pas utilisé correctement
      } catch (error) {
        console.error("Erreur génération aléatoire:", error);
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
            {secureStoreAvailable ? "UTILISÉ ✓" : "NON UTILISÉ ✗"}
          </Text>

          <Text style={styles.checkTitle}>Test SecureStore:</Text>
          <Text style={secureStoreWorking ? styles.secure : styles.notSecure}>
            {secureStoreWorking ? "FONCTIONNEL ✓" : "NON FONCTIONNEL ✗"}
          </Text>

          <Text style={styles.checkTitle}>Module Crypto:</Text>
          <Text style={cryptoAvailable ? styles.secure : styles.notSecure}>
            {cryptoAvailable ? "UTILISÉ ✓" : "NON UTILISÉ ✗"}
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
            <Text>
              6. Modifier ce SecurityChecker pour utiliser les bonnes méthodes
              sécurisées
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

export default SecurityChecker;
