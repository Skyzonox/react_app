import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

interface Category {
  id: number;
  name: string;
  color: string;
}

const CreateNote: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
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
      Alert.alert("Erreur", "Impossible de charger les catégories");
    } finally {
      setLoading(false);
    }
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

  const handleSave = async () => {
    if (title.trim() === "") {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }

    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch("https://keep.kevindupas.com/api/notes", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          categories: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de créer la note");
      }

      Alert.alert("Succès", "Note créée avec succès");
      router.back();
    } catch (error) {
      console.error("Erreur lors de la création de la note:", error);
      Alert.alert("Erreur", "Impossible de créer la note");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Créer une note</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Titre</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 10,
              borderRadius: 5,
              fontSize: 16,
            }}
            placeholder="Titre de la note..."
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Contenu</Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 10,
              borderRadius: 5,
              fontSize: 16,
              minHeight: 200,
              textAlignVertical: "top",
            }}
            placeholder="Contenu de la note..."
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Catégories</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => toggleCategory(category.id)}
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
      </ScrollView>

      <TouchableOpacity
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          backgroundColor: "#007BFF",
          width: 50,
          height: 50,
          borderRadius: 25,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
        }}
        onPress={handleSave}
      >
        <Ionicons name="save" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default CreateNote;