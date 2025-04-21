import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import tw from "twrnc";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "../_layout";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";

export default function QRScanScreen() {
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState("");
  const { signIn } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const handleBarCodeScanned = async ({
    type,
    data,
  }: BarcodeScanningResult) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setDebug(`QR Code scanné: ${data.substring(0, 50)}...\n`);

    // Vérifier si le QR code contient un URL avec le token
    if (!data.includes("/auth/qr-login/")) {
      setDebug((prev) => prev + "Format de QR code invalide!\n");
      Alert.alert(
        "QR Code invalide",
        "Ce QR code n'est pas valide pour l'authentification."
      );
      setLoading(false);
      setScanned(false);
      return;
    }

    try {
      setDebug((prev) => prev + `Tentative de connexion avec le QR code...\n`);

      // Faire la requête à l'API
      const response = await fetch(data, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      setDebug((prev) => prev + `Statut HTTP: ${response.status}\n`);

      // Récupérer d'abord la réponse en texte brut
      const rawText = await response.text();
      setDebug(
        (prev) =>
          prev +
          `Réponse brute (50 premiers caractères): ${rawText.substring(
            0,
            50
          )}...\n`
      );

      let responseData;
      try {
        // Essayer de parser le texte en JSON
        responseData = JSON.parse(rawText);
      } catch (parseError) {
        setDebug((prev) => prev + `Erreur de parsing JSON: ${parseError}\n`);
        throw new Error("Format de réponse invalide");
      }

      if (!response.ok) {
        const errorMessage =
          responseData.message || "Erreur lors de l'authentification";
        setDebug((prev) => prev + `Erreur API: ${errorMessage}\n`);
        throw new Error(errorMessage);
      }

      setDebug((prev) => prev + "Authentification par QR code réussie!\n");

      // Connexion avec les données reçues
      await signIn(responseData.access_token, responseData.user);

      // La redirection sera gérée par le contexte d'authentification
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Une erreur est survenue";

      setDebug((prev) => prev + `ERREUR: ${errorMessage}\n`);
      Alert.alert("Erreur d'authentification", errorMessage);
      setScanned(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setScanned(false);
    setDebug("");
  };

  if (!permission) {
    // Les permissions de caméra sont en cours de chargement
    return (
      <View style={tw`flex-1 bg-white justify-center p-5`}>
        <Text>Vérification des permissions caméra...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // Les permissions de caméra ne sont pas accordées
    return (
      <View style={tw`flex-1 bg-white justify-center p-5`}>
        <Text style={tw`text-red-500 text-lg text-center`}>
          Nous avons besoin de votre permission pour utiliser la caméra
        </Text>
        <Button title="Autoriser l'accès" onPress={requestPermission} />
        <TouchableOpacity
          style={tw`bg-gray-500 p-3 rounded-md mt-3`}
          onPress={() => router.back()}
        >
          <Text style={tw`text-white text-center font-bold text-base`}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-white justify-center p-5`}>
      <StatusBar style="light" />

      {!scanned && (
        <View style={tw`flex-1 overflow-hidden`}>
          <CameraView
            ref={cameraRef}
            style={tw`flex-1`}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          >
            <View style={tw`flex-1 justify-center items-center`}>
              <View
                style={tw`w-64 h-64 border-2 border-white rounded-2xl bg-transparent`}
              />
            </View>
            <View
              style={tw`absolute bottom-20 left-0 right-0 items-center px-5`}
            >
              <Text
                style={tw`text-white text-lg text-center bg-black bg-opacity-70 p-3 rounded-lg`}
              >
                Placez le QR code dans le cadre
              </Text>
            </View>
          </CameraView>
        </View>
      )}

      {(scanned || debug) && (
        <ScrollView style={tw`flex-1 bg-white`} contentContainerStyle={tw`p-5`}>
          <Text style={tw`text-2xl font-bold mb-5 text-center`}>
            Scan QR code
          </Text>

          {loading && (
            <View style={tw`items-center justify-center my-5`}>
              <ActivityIndicator size="large" color="#007BFF" />
              <Text style={tw`mt-2.5 text-base`}>Connexion en cours...</Text>
            </View>
          )}

          {debug ? (
            <View style={tw`mt-5 p-2.5 bg-gray-100 rounded-md`}>
              <Text style={tw`font-bold mb-1`}>Informations de débogage:</Text>
              <Text style={tw`font-mono text-xs`}>{debug}</Text>
            </View>
          ) : null}

          {scanned && !loading && (
            <View style={tw`mt-5`}>
              <TouchableOpacity
                style={tw`bg-blue-500 p-3 rounded-md mb-3`}
                onPress={handleRetry}
              >
                <Text style={tw`text-white text-center font-bold text-base`}>
                  Scanner un autre QR code
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={tw`bg-gray-500 p-3 rounded-md`}
                onPress={() => router.back()}
              >
                <Text style={tw`text-white text-center font-bold text-base`}>
                  Retour
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
