import { Feather } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DateInput } from "@/components/DateInput";
import {
  Task,
  TASK_CATEGORIES,
  TaskPriority,
  TaskStatus,
} from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  editing: Task | null;
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
};

const PRIORITIES: { label: string; value: TaskPriority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const STATUSES: { label: string; value: TaskStatus }[] = [
  { label: "Open", value: "open" },
  { label: "In progress", value: "in progress" },
  { label: "Done", value: "done" },
];

export function TaskModal({ visible, editing, onClose, onSave }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("low");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [category, setCategory] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (editing) {
      setTitle(editing.title);
      setDescription(editing.description || "");
      setPriority(editing.priority);
      setStatus(editing.status);
      setCategory(editing.category || "");
      setDueDate(editing.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setPriority("low");
      setStatus("open");
      setCategory("");
      setDueDate("");
    }
    setError(null);
  }, [visible, editing]);

  const handleSave = () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!category) {
      setError("Category is required");
      return;
    }
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      category,
      dueDate,
    });
    onClose();
  };

  const inputStyle = useMemo(
    () => ({
      backgroundColor: colors.input,
      color: colors.foreground,
      borderColor: colors.border,
      borderRadius: colors.radius,
    }),
    [colors],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              borderRadius: colors.radius * 1.4,
              paddingBottom: 16 + (Platform.OS === "web" ? 0 : insets.bottom),
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {editing ? "Edit task" : "New task"}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            >
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 14, paddingTop: 4 }}
            showsVerticalScrollIndicator={false}
          >
            <Field label="Title" colors={colors}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What needs doing?"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, inputStyle]}
              />
            </Field>

            <Field label="Description" colors={colors}>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Add notes (optional)"
                placeholderTextColor={colors.mutedForeground}
                multiline
                maxLength={300}
                style={[
                  styles.input,
                  inputStyle,
                  { height: 90, textAlignVertical: "top" },
                ]}
              />
            </Field>

            <Field label="Due date" colors={colors}>
              <DateInput value={dueDate} onChange={setDueDate} />
            </Field>

            <Field label="Category" colors={colors}>
              <View style={styles.chipRow}>
                {TASK_CATEGORIES.map((c) => {
                  const active = c === category;
                  return (
                    <Pressable
                      key={c}
                      onPress={() => setCategory(c)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: active
                            ? colors.primary
                            : colors.input,
                          borderColor: active
                            ? colors.primary
                            : colors.border,
                          borderRadius: colors.radius,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: active
                            ? colors.primaryForeground
                            : colors.foreground,
                          fontWeight: "500",
                          fontSize: 13,
                        }}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            <Field label="Priority" colors={colors}>
              <SegmentedControl
                options={PRIORITIES}
                value={priority}
                onChange={setPriority}
              />
            </Field>

            <Field label="Status" colors={colors}>
              <SegmentedControl
                options={STATUSES}
                value={status}
                onChange={setStatus}
              />
            </Field>

            {error && (
              <Text style={{ color: colors.destructive, fontSize: 13 }}>
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.saveBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text style={styles.saveText}>
                {editing ? "Save changes" : "Create task"}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.segment,
        { backgroundColor: colors.input, borderRadius: colors.radius },
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.segmentItem,
              {
                backgroundColor: active ? colors.primary : "transparent",
                borderRadius: colors.radius - 2,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text
              style={{
                color: active ? colors.primaryForeground : colors.foreground,
                fontWeight: "500",
                fontSize: 13,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  sheet: {
    padding: 18,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700" },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
