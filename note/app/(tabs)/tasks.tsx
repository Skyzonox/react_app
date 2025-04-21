import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';

interface Task {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const response = await fetch("https://keep.kevindupas.com/api/tasks", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossible de charger les tâches");
      }

      const data = await response.json();
      const tasksData = Array.isArray(data.data) ? data.data : [];
      
      setTasks(tasksData);
      setFilteredTasks(tasksData);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      Alert.alert('Erreur', 'Impossible de charger les tâches');
      setTasks([]);
      setFilteredTasks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, []);

  const handleSearch = () => {
    let filtered = [...tasks];
    
    if (searchKeyword.trim() !== '') {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    if (statusFilter !== null) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }
    
    setFilteredTasks(filtered);
  };

  const filterByStatus = (status: string | null) => {
    setStatusFilter(status);
    
    let filtered = [...tasks];
    
    if (status !== null) {
      filtered = filtered.filter(task => task.status === status);
    }
    
    if (searchKeyword.trim() !== '') {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    setFilteredTasks(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'à faire':
        return '#f97316'; 
      case 'en cours':
        return '#3b82f6'; 
      case 'terminé':
        return '#22c55e';
      default:
        return '#6b7280'; 
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'haute':
        return <Ionicons name="flag" size={16} color="#ef4444" />;
      case 'moyenne':
        return <Ionicons name="flag" size={16} color="#f97316" />;
      case 'basse':
        return <Ionicons name="flag" size={16} color="#22c55e" />;
      default:
        return null;
    }
  };

  const handleEditTask = (taskId: number) => {
    router.push(`../taches/${taskId}`);
  };

  const toggleTaskStatus = async (taskId: number, currentStatus: string) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      let newStatus;
      switch (currentStatus) {
        case 'à faire':
          newStatus = 'en cours';
          break;
        case 'en cours':
          newStatus = 'terminé';
          break;
        case 'terminé':
          newStatus = 'à faire';
          break;
        default:
          newStatus = 'à faire';
      }

      const response = await fetch(`https://keep.kevindupas.com/api/tasks/${taskId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (!response.ok) {
        throw new Error("Impossible de mettre à jour le statut de la tâche");
      }

      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      setFilteredTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut de la tâche');
    }
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
        <Text style={{ fontSize: 24, fontWeight: "bold", marginRight: 10 }}>Tâches</Text>
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
          placeholder="Rechercher une tâche..."
          value={searchKeyword}
          onChangeText={(text) => {
            setSearchKeyword(text);
            if (text.trim() === '') {
              filterByStatus(statusFilter);
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
            backgroundColor: statusFilter === null ? "#007BFF" : "#f0f0f0",
          }}
          onPress={() => filterByStatus(null)}
        >
          <Text style={{ color: statusFilter === null ? "#ffffff" : "#000000" }}>
            Toutes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginRight: 8,
            borderRadius: 20,
            backgroundColor: statusFilter === "en cours" ? "#3b82f6" : "#f0f0f0",
          }}
          onPress={() => filterByStatus("en cours")}
        >
          <Text style={{ color: statusFilter === "en cours" ? "#ffffff" : "#000000" }}>
            En cours
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginRight: 8,
            borderRadius: 20,
            backgroundColor: statusFilter === "terminé" ? "#22c55e" : "#f0f0f0",
          }}
          onPress={() => filterByStatus("terminé")}
        >
          <Text style={{ color: statusFilter === "terminé" ? "#ffffff" : "#000000" }}>
            Terminé
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            paddingHorizontal: 15,
            paddingVertical: 8,
            marginRight: 8,
            borderRadius: 20,
            backgroundColor: statusFilter === "à faire" ? "#f97316" : "#f0f0f0",
          }}
          onPress={() => filterByStatus("à faire")}
        >
          <Text style={{ color: statusFilter === "à faire" ? "#ffffff" : "#000000" }}>
            À faire
          </Text>
        </TouchableOpacity>
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
        {!filteredTasks || filteredTasks.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", padding: 20 }}>Aucune tâche pour le moment</Text>
        ) : (
          filteredTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
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
              onPress={() => handleEditTask(task.id)}
            >
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>{task.title}</Text>
              <Text style={{ color: "#555", marginTop: 5 }} numberOfLines={2} ellipsizeMode="tail">
                {task.description || ''}
              </Text>
              
              
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleTaskStatus(task.id, task.status);
                  }}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 12,
                    backgroundColor: getStatusColor(task.status),
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 10 }}>{task.status}</Text>
                </TouchableOpacity>
                
                {task.priority && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {getPriorityIcon(task.priority)}
                    <Text style={{ color: "#555", fontSize: 10, marginLeft: 2 }}>{task.priority}</Text>
                  </View>
                )}
              </View>
              
              
              {task.due_date && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                  <Ionicons name="calendar-outline" size={14} color="#888888" style={{ marginRight: 4 }} />
                  <Text style={{ color: "#888", fontSize: 10 }}>
                    Échéance: {new Date(task.due_date).toLocaleDateString("fr-FR")}
                  </Text>
                </View>
              )}
              
              
              <Text style={{ color: "#aaa", marginTop: 5, fontSize: 12 }}>
                {new Date(task.updated_at).toLocaleDateString("fr-FR")}
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
          router.push("../taches/create_task");
        }}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default Tasks;