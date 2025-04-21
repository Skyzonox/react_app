import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from "expo-status-bar";

interface Category {
  id: number;
  name: string;
  color: string;
}

const CreateTask: React.FC = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<string>("moyenne");
  const [showDateInput, setShowDateInput] = useState(false);
  const router = useRouter();

  // Nouvelles variables pour la saisie de date simplifiée
  const [inputDay, setInputDay] = useState("");
  const [inputMonth, setInputMonth] = useState("");
  const [inputYear, setInputYear] = useState("");

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

      const response = await fetch("https://keep.kevindupas.com/api/tasks", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
          priority: priority,
          status: "à faire",
          categories: selectedCategories,
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de créer la tâche");
      }

      Alert.alert("Succès", "Tâche créée avec succès");
      router.back();
    } catch (error) {
      console.error("Erreur lors de la création de la tâche:", error);
      Alert.alert("Erreur", "Impossible de créer la tâche");
    } finally {
      setLoading(false);
    }
  };

  // Fonction simplifiée pour formater la date en français
  const formatDateFr = (date: Date): string => {
    if (!date) return "";
    
    const jour = date.getDate().toString().padStart(2, '0');
    
    // Tableau des mois en français
    const moisFr = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const mois = moisFr[date.getMonth()];
    const annee = date.getFullYear();
    
    return `${jour} ${mois} ${annee}`;
  };

  // Nouvelle fonction pour valider et définir la date
  const confirmDate = () => {
    // Conversion des entrées en nombres
    const day = parseInt(inputDay);
    const month = parseInt(inputMonth) - 1; // Les mois commencent à 0 en JavaScript
    const year = parseInt(inputYear);
    
    // Validation basique
    if (isNaN(day) || isNaN(month) || isNaN(year) || 
        day < 1 || day > 31 || month < 0 || month > 11 || year < 2000) {
      Alert.alert("Erreur", "Date invalide");
      return;
    }
    
    // Vérification supplémentaire pour les mois avec moins de 31 jours
    const newDate = new Date(year, month, day);
    if (newDate.getDate() !== day) {
      Alert.alert("Erreur", "Cette date n'existe pas");
      return;
    }
    
    setDueDate(newDate);
    setShowDateInput(false);
  };

  // Nouvelle fonction pour ouvrir le modal avec les valeurs actuelles
  const openDateInput = () => {
    if (dueDate) {
      setInputDay(dueDate.getDate().toString());
      setInputMonth((dueDate.getMonth() + 1).toString());
      setInputYear(dueDate.getFullYear().toString());
    } else {
      const today = new Date();
      setInputDay(today.getDate().toString());
      setInputMonth((today.getMonth() + 1).toString());
      setInputYear(today.getFullYear().toString());
    }
    setShowDateInput(true);
  };

  // Modal simplifié pour saisir la date
  const SimpleDateInputModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDateInput}
        onRequestClose={() => setShowDateInput(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            width: 300,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
              Saisir une date
            </Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
              
              <View style={{ width: '30%' }}>
                <Text style={{ marginBottom: 5, color: '#555' }}>Jour</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                    textAlign: 'center'
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="JJ"
                  value={inputDay}
                  onChangeText={setInputDay}
                />
              </View>
              
              
              <View style={{ width: '30%' }}>
                <Text style={{ marginBottom: 5, color: '#555' }}>Mois</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                    textAlign: 'center'
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  value={inputMonth}
                  onChangeText={setInputMonth}
                />
              </View>
              
              {/* Année */}
              <View style={{ width: '30%' }}>
                <Text style={{ marginBottom: 5, color: '#555' }}>Année</Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderRadius: 5,
                    padding: 10,
                    textAlign: 'center'
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="AAAA"
                  value={inputYear}
                  onChangeText={setInputYear}
                />
              </View>
            </View>
            
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                onPress={() => setShowDateInput(false)}
                style={{
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor: '#f0f0f0',
                  minWidth: 100,
                  alignItems: 'center'
                }}
              >
                <Text>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDate}
                style={{
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor: '#007BFF',
                  minWidth: 100,
                  alignItems: 'center'
                }}
              >
                <Text style={{ color: 'white' }}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'haute':
        return '#ef4444'; // Rouge
      case 'moyenne':
        return '#f97316'; // Orange  
      case 'basse':
        return '#22c55e'; // Vert
      default:
        return '#6b7280'; // Gris
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
      <StatusBar style="auto" />
      
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Créer une tâche</Text>
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
            placeholder="Titre de la tâche..."
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Description</Text>
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
            placeholder="Description de la tâche..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Date</Text>
          <TouchableOpacity 
            onPress={openDateInput}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              padding: 10,
              borderRadius: 5,
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <Ionicons name="calendar-outline" size={20} color="#555" style={{ marginRight: 10 }} />
            <Text style={{ color: "#555" }}>
              {dueDate ? formatDateFr(dueDate) : "Sélectionner une date"}
            </Text>
          </TouchableOpacity>
          
          <SimpleDateInputModal />
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, marginBottom: 5, color: "#555" }}>Priorité</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {['basse', 'moyenne', 'haute'].map((priorityValue) => (
              <TouchableOpacity
                key={priorityValue}
                onPress={() => setPriority(priorityValue)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: getPriorityColor(priorityValue),
                  backgroundColor: priority === priorityValue ? getPriorityColor(priorityValue) : 'white',
                }}
              >
                <Ionicons 
                  name="flag" 
                  size={16} 
                  color={priority === priorityValue ? "white" : getPriorityColor(priorityValue)} 
                  style={{ marginRight: 5 }}
                />
                <Text 
                  style={{ 
                    color: priority === priorityValue ? "white" : getPriorityColor(priorityValue),
                    textTransform: 'capitalize'
                  }}
                >
                  {priorityValue}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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

export default CreateTask;