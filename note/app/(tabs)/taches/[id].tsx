import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from "@expo/vector-icons";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

const EditTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("moyenne");
  const [status, setStatus] = useState("à faire");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    loadTask();
    loadCategories();
  }, [id]);

  const loadCategories = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch("https://keep.kevindupas.com/api/categories", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les catégories");
      }

      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const loadTask = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(`https://keep.kevindupas.com/api/tasks/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger la tâche");
      }

      const data = await response.json();
      const task = data.data;
      
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority || "moyenne");
      setStatus(task.status || "à faire");
      
      if (task.categories) {
        setSelectedCategories(task.categories.map((cat: Category) => cat.id));
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la tâche:", error);
      Alert.alert("Erreur", "Impossible de charger la tâche");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }

    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(`https://keep.kevindupas.com/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          priority: priority,
          status: status,
          categories: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de mettre à jour la tâche");
      }

      Alert.alert("Succès", "Tâche mise à jour avec succès");
      router.back();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la tâche");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette tâche ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Supprimer", 
          style: "destructive",
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync("auth_token");
              if (!token) {
                router.replace("/auth/login");
                return;
              }

              const response = await fetch(`https://keep.kevindupas.com/api/tasks/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                throw new Error("Impossible de supprimer la tâche");
              }

              Alert.alert("Succès", "Tâche supprimée avec succès");
              router.back();
            } catch (error) {
              console.error("Erreur lors de la suppression de la tâche:", error);
              Alert.alert("Erreur", "Impossible de supprimer la tâche");
            }
          }
        }
      ]
    );
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prevCategories => {
      if (prevCategories.includes(categoryId)) {
        return prevCategories.filter(id => id !== categoryId);
      } else {
        return [...prevCategories, categoryId];
      }
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ddd" }}>
        <TouchableOpacity
          style={{ padding: 4 }}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Modifier la tâche</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            style={{ marginRight: 16, padding: 4 }}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: "#007BFF", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 5 }}
            onPress={handleSave}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <TextInput
          style={{ fontSize: 18, fontWeight: "bold", padding: 12, marginBottom: 16, borderWidth: 1, borderColor: "#ddd", borderRadius: 5 }}
          placeholder="Titre"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={{ fontSize: 16, padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, marginBottom: 16, minHeight: 100, textAlignVertical: "top" }}
          placeholder="Description de la tâche..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Priorité</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                marginRight: 8, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: priority === 'basse' ? '#22c55e' : '#f0f0f0'
              }}
              onPress={() => setPriority('basse')}
            >
              <Text style={{ color: priority === 'basse' ? 'white' : 'black' }}>Basse</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                marginRight: 8, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: priority === 'moyenne' ? '#f97316' : '#f0f0f0'
              }}
              onPress={() => setPriority('moyenne')}
            >
              <Text style={{ color: priority === 'moyenne' ? 'white' : 'black' }}>Moyenne</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: priority === 'haute' ? '#ef4444' : '#f0f0f0'
              }}
              onPress={() => setPriority('haute')}
            >
              <Text style={{ color: priority === 'haute' ? 'white' : 'black' }}>Haute</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Statut</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                marginRight: 8, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: status === 'à faire' ? '#f97316' : '#f0f0f0'
              }}
              onPress={() => setStatus('à faire')}
            >
              <Text style={{ color: status === 'à faire' ? 'white' : 'black' }}>À faire</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                marginRight: 8, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: status === 'en cours' ? '#3b82f6' : '#f0f0f0'
              }}
              onPress={() => setStatus('en cours')}
            >
              <Text style={{ color: status === 'en cours' ? 'white' : 'black' }}>En cours</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ 
                flex: 1, 
                padding: 12, 
                borderRadius: 5, 
                alignItems: "center",
                backgroundColor: status === 'terminé' ? '#22c55e' : '#f0f0f0'
              }}
              onPress={() => setStatus('terminé')}
            >
              <Text style={{ color: status === 'terminé' ? 'white' : 'black' }}>Terminé</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 8 }}>Catégories</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={{
                  marginRight: 8,
                  marginBottom: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: selectedCategories.includes(category.id) ? category.color : '#ffffff',
                  borderWidth: 1,
                  borderColor: category.color,
                }}
                onPress={() => toggleCategory(category.id)}
              >
                <Text 
                  style={{
                    color: selectedCategories.includes(category.id) ? '#ffffff' : '#000000'
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditTask;