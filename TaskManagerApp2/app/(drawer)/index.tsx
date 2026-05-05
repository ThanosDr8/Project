import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { Task, TaskStatus, useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const STATUS_FILTERS: { label: string; value: "all" | TaskStatus }[] = [
  { label: "All", value: "all" },
  { label: "Open", value: "open" },
  { label: "In progress", value: "in progress" },
  { label: "Done", value: "done" },
];

export default function TasksScreen() {
  const colors = useColors();
  const { tasks, addTask, updateTask, deleteTask } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | TaskStatus>("all");

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => filter === "all" || t.status === filter)
      .filter((t) =>
        search.trim()
          ? (t.title + " " + t.description + " " + t.category)
              .toLowerCase()
              .includes(search.toLowerCase())
          : true,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, filter, search]);

  const counts = useMemo(() => {
    const c = { all: tasks.length, open: 0, "in progress": 0, done: 0 };
    tasks.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [tasks]);

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (Platform.OS === "web") {
      deleteTask(id);
    } else {
      Alert.alert("Delete task?", "This cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTask(id),
        },
      ]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search tasks"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
        </View>
        <Pressable
          onPress={openNew}
          style={({ pressed }) => [
            styles.addBtn,
            {
              backgroundColor: colors.primary,
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const active = f.value === filter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setFilter(f.value)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                  borderRadius: 999,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? colors.primaryForeground : colors.foreground,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {f.label}{" "}
                <Text
                  style={{
                    color: active
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                    fontWeight: "500",
                  }}
                >
                  {counts[f.value]}
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={36} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, fontWeight: "600" }}>
              No tasks yet
            </Text>
            <Text
              style={{
                color: colors.mutedForeground,
                textAlign: "center",
                fontSize: 13,
              }}
            >
              Tap the + button to create your first task.
            </Text>
          </View>
        }
        scrollEnabled={filtered.length > 0}
      />

      <TaskModal
        visible={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSave={(payload) => {
          if (editing) {
            updateTask(editing.id, payload);
          } else {
            addTask(payload);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 14, paddingTop: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  addBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: StyleSheet.hairlineWidth,
  },
  empty: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 30,
  },
});
