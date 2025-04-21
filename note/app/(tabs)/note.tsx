import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

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

const Note: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadNotes();
    loadCategories();
  }, []);

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

  const loadNotes = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch("https://keep.kevindupas.com/api/notes", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les notes");
      }

      const data = await response.json();
      setNotes(data.data);
      setFilteredNotes(data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des notes:', error);
      Alert.alert('Erreur', 'Impossible de charger les notes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadNotes();
  }, []);

 
  const handleSearch = () => {
    let filtered = [...notes];
    
    if (searchKeyword.trim() !== '') {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        (note.content && note.content.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    if (selectedCategory !== null) {
      filtered = filtered.filter(note => 
        note.categories.some(cat => cat.id === selectedCategory)
      );
    }
    
    setFilteredNotes(filtered);
  };

  const filterByCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === null) {
      // Si aucune catégorie n'est sélectionnée, appliquer seulement le filtre de recherche
      handleSearch();
      return;
    }
    
    let filtered = [...notes];
    
    // Appliquer le filtre de catégorie
    filtered = filtered.filter(note => 
      note.categories.some(cat => cat.id === categoryId)
    );
    
    
    if (searchKeyword.trim() !== '') {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        (note.content && note.content.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    setFilteredNotes(filtered);
  };

  
  const handleEditNote = (noteId: number) => {
    router.push(`../notes/${noteId}`);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginRight: 10 }}>Notes</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ddd",
            padding: 10,
            borderRadius: 5,
            marginRight: 10,
          }}
          placeholder="Rechercher une note..."
          value={searchKeyword}
          onChangeText={(text) => {
            setSearchKeyword(text);
            if (text.trim() === '') {
              filterByCategory(selectedCategory);
            }
          }}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          onPress={handleSearch}
          style={{
            backgroundColor: "#f0f0f0",
            padding: 10,
            borderRadius: 5,
          }}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50, marginBottom: 10 }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginRight: 8,
            borderRadius: 20,
            backgroundColor: selectedCategory === null ? "#007BFF" : "#f0f0f0",
          }}
          onPress={() => filterByCategory(null)}
        >
          <Text style={{ color: selectedCategory === null ? "#ffffff" : "#000000" }}>
            Toutes
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={{
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor: selectedCategory === category.id ? category.color : "#f0f0f0",
            }}
            onPress={() => filterByCategory(category.id)}
          >
            <Text style={{ color: selectedCategory === category.id ? "#ffffff" : "#000000" }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={{ backgroundColor: "#f9f9f9", borderRadius: 5, padding: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      >
        {filteredNotes.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", padding: 20 }}>Aucune note pour le moment</Text>
        ) : (
          filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={{
                padding: 15,
                backgroundColor: "#fff",
                borderRadius: 5,
                marginBottom: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2,
              }}
              onPress={() => handleEditNote(note.id)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{note.title}</Text>
              <Text style={{ color: "#555", marginTop: 5 }} numberOfLines={2} ellipsizeMode="tail">
                {note.content?.replace(/<[^>]*>/g, '') || ''}
              </Text>
              
              
              {note.categories.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
                  {note.categories.map((category) => (
                    <View
                      key={category.id}
                      style={{
                        backgroundColor: category.color,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 12,
                        marginRight: 5,
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10 }}>{category.name}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              <Text style={{ color: "#aaa", marginTop: 5, fontSize: 12 }}>
                {new Date(note.updated_at).toLocaleDateString("fr-FR")}
              </Text>
            </TouchableOpacity>
          ))
        )}
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
        onPress={() => {
          router.push("../notes/create_note");
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Note;