import * as SecureStore from "expo-secure-store";
import { useRouter, useSegments } from "expo-router";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// Constantes pour les clés de stockage
const SECURE_TOKEN_KEY = "auth_token"; // Changé pour correspondre à ce qui est utilisé dans les autres composants
const SECURE_USER_DATA_KEY = "secure_user_data";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  signIn: (token: string, userData: User) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  userToken: string | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  userToken: null,
  user: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const segments = useSegments();
  
  // Fonction pour nettoyer les données d'authentification
  const cleanupAuth = async () => {
    try {
      await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      await SecureStore.deleteItemAsync(SECURE_USER_DATA_KEY);
    } catch (error) {
      console.error("Erreur lors du nettoyage de l'authentification:", error);
    } finally {
      setUserToken(null);
      setUser(null);
    }
  };

  // Utiliser un effet séparé pour charger les données au démarrage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
        const userData = await SecureStore.getItemAsync(SECURE_USER_DATA_KEY);

        if (token) {
          setUserToken(token);
        }

        if (userData) {
          try {
            const userInfo = JSON.parse(userData);
            if (userInfo && userInfo.id && userInfo.email) {
              setUser(userInfo);
            } else {
              await cleanupAuth();
            }
          } catch (error) {
            await cleanupAuth();
          }
        }
      } catch (error) {
        await cleanupAuth();
      } finally {
        // Marquer le chargement comme terminé une fois les données récupérées
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Gérer la navigation en fonction de l'état d'authentification
  useEffect(() => {
    if (isLoading) return; // Ne rien faire pendant le chargement

    const inAuthGroup = segments[0] === "auth";
    
    // Déboguer les segments de navigation
    console.log("Navigation check:", { 
      userToken: userToken ? "exist" : "null", 
      inAuthGroup, 
      segments: segments.join('/') 
    });

    // Redirection vers la page de connexion si non authentifié et pas dans le groupe auth
    if (!userToken && !inAuthGroup) {
      console.log("Redirection: Non authentifié -> login");
      router.replace("/auth/login");
      return;
    }
    
    // Redirection vers les notes si authentifié et dans le groupe auth
    if (userToken && inAuthGroup) {
      console.log("Redirection: Authentifié dans auth group -> notes");
      router.replace("/(tabs)/note");
      return;
    }
    
    // Redirection depuis index vers notes si authentifié et dans les tabs
    if (userToken && segments[0] === "(tabs)" && segments.length > 1) {
      const secondSegment = segments[1];
      
      // Utiliser une condition explicite pour éviter l'erreur de type
      if (secondSegment === "index") {
        console.log("Redirection: Sur index (masqué) -> note");
        router.replace("/(tabs)/note");
        return;
      }
    }
  }, [isLoading, userToken, segments]);

  const signIn = async (token: string, userData: User) => {
    try {
      if (!token || !userData || !userData.id || !userData.email) {
        throw new Error("Token ou données utilisateur manquants");
      }

      // Stocker les données dans le stockage sécurisé
      await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      await SecureStore.setItemAsync(SECURE_USER_DATA_KEY, JSON.stringify(userData));

      // Mettre à jour l'état
      setUserToken(token);
      setUser(userData);
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await cleanupAuth();
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        isLoading,
        userToken,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}