import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";

const apiUrl = "https://keep.kevindupas.com/api";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setDebug("Démarre la connexion...");

    try {
      setDebug((prev) => prev + `URL de l'API: ${apiUrl}/login`);

      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const rawText = await response.text();
      setDebug(
        (prev) => prev + `Réponse brute: ${rawText.substring(0, 50)}...\n`
      );

      let data;
      try {
        data = JSON.parse(rawText);
        setDebug((prev) => prev + `Réponse parsé avec succès\n`);
      } catch (error) {
        setDebug((prev) => prev + `Erreur: ${(error as Error).message}`);
        return;
      }

      setDebug((prev) => prev + `Connexion réussie\n`);

      await signIn(data.access_token, data.user);
    } catch (error) {
      setDebug((prev) => prev + `Erreur: ${(error as Error).message}`);
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white dark:bg-black`}>
      <Text style={tw`text-black dark:text-white text-center font-bold`}>
        Connexion
      </Text>

      <TextInput
        style={tw`p-3 bg-gray-200 dark:bg-gray-800 rounded-lg mt-4`}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={tw`p-3 bg-gray-200 dark:bg-gray-800 rounded-lg mt-4`}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={tw`p-3 bg-gray-200 dark:bg-gray-800 rounded-lg mt-4`}
      >
        <Text style={tw`text-black dark:text-white text-center font-bold`}>
          Connexion
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={tw`p-3 bg-blue-200 dark:bg-blue-800 rounded-lg mt-4`}
        onPress={() => router.push("/auth/qr-scan")}
      >
        <Text style={tw`text-black dark:text-white text-center font-bold`}>
          Scanner un QR Code
        </Text>
      </TouchableOpacity>

      {debug ? (
        <View style={tw`p-4 bg-gray-200 dark:bg-gray-800 rounded-lg mt-4`}>
          <Text style={tw`text-black dark:text-white text-center font-bold`}>
            {debug}
          </Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
