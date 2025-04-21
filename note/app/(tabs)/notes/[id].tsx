import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import tw from "twrnc"; 
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from "@expo/vector-icons";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

const EditNote: React.FC = () => {
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    loadNote();
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

  const loadNote = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch(`https://keep.kevindupas.com/api/notes/${id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger la note");
      }

      const data = await response.json();
      const note = data.data;
      
      setTitle(note.title);
      setContent(note.content);
      setSelectedCategories(note.categories.map((cat: Category) => cat.id));
    } catch (error) {
      console.error("Erreur lors du chargement de la note:", error);
      Alert.alert("Erreur", "Impossible de charger la note");
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

      const response = await fetch(`https://keep.kevindupas.com/api/notes/${id}`, {
        method: "PUT",
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
        throw new Error("Impossible de mettre à jour la note");
      }

      Alert.alert("Succès", "Note mise à jour avec succès");
      router.back();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la note:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour la note");
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cette note ?",
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

              const response = await fetch(`https://keep.kevindupas.com/api/notes/${id}`, {
                method: "DELETE",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });

              if (!response.ok) {
                throw new Error("Impossible de supprimer la note");
              }

              Alert.alert("Succès", "Note supprimée avec succès");
              router.back();
            } catch (error) {
              console.error("Erreur lors de la suppression de la note:", error);
              Alert.alert("Erreur", "Impossible de supprimer la note");
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
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center justify-between p-4 border-b border-gray-300`}>
        <TouchableOpacity
          style={tw`p-1`}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold`}>Modifier la note</Text>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={tw`mr-4 p-1`}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`bg-blue-500 py-2 px-4 rounded`}
            onPress={handleSave}
          >
            <Text style={tw`text-white font-bold`}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={tw`p-4`}>
        <TextInput
          style={tw`text-lg font-bold p-3 mb-4 border border-gray-300 rounded`}
          placeholder="Titre"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          style={[tw`text-base p-3 border border-gray-300 rounded`, { minHeight: 200, textAlignVertical: "top" }]}
          placeholder="Contenu de la note..."
          value={content}
          onChangeText={setContent}
          multiline
        />

        <View style={tw`mt-4`}>
          <Text style={tw`text-lg font-bold mb-2`}>Catégories</Text>
          <View style={tw`flex-row flex-wrap`}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  tw`mr-2 mb-2 px-3 py-1 rounded-full ${selectedCategories.includes(category.id) ? 'border-2' : 'border'}`,
                  {
                    marginRight: 8,
                    marginBottom: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: selectedCategories.includes(category.id) ? category.color : '#ffffff',
                    borderWidth: 1,
                    borderColor: category.color,
                  }
                ]}
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

export default EditNote;