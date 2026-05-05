import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Task } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "#4caf50",
  medium: "#ffaa00",
  high: "#ff5a5f",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#36A2EB",
  "in progress": "#FFCE56",
  done: "#4BC0C0",
};

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const colors = useColors();
  const overdue =
    task.status !== "done" &&
    task.dueDate &&
    new Date(task.dueDate) < new Date(new Date().toDateString());

  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          {!!task.description && (
            <Text
              style={[styles.desc, { color: colors.mutedForeground }]}
              numberOfLines={2}
            >
              {task.description}
            </Text>
          )}
        </View>

        <Pressable
          onPress={onDelete}
          hitSlop={10}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
        >
          <Feather name="trash-2" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Badge label={task.category || "Uncategorized"} color={colors.primary} />
        <Badge
          label={task.priority}
          color={PRIORITY_COLORS[task.priority] || colors.muted}
        />
        <Badge
          label={task.status}
          color={STATUS_COLORS[task.status] || colors.muted}
        />
        {!!task.dueDate && (
          <View style={styles.dueRow}>
            <Feather
              name="calendar"
              size={12}
              color={overdue ? colors.destructive : colors.mutedForeground}
            />
            <Text
              style={{
                color: overdue ? colors.destructive : colors.mutedForeground,
                fontSize: 12,
                fontWeight: "500",
              }}
            >
              {task.dueDate}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + "22" }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  title: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 13, marginTop: 2 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
});
