import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
};

function formatLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocal(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map((p) => Number(p));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function nextSaturday(base: Date): Date {
  const day = base.getDay();
  const offset = (6 - day + 7) % 7 || 7;
  return addDays(base, offset);
}

type Preset = {
  key: string;
  label: string;
  compute: () => string;
};

const PRESETS: Preset[] = [
  { key: "today", label: "Today", compute: () => formatLocal(startOfToday()) },
  {
    key: "tomorrow",
    label: "Tomorrow",
    compute: () => formatLocal(addDays(startOfToday(), 1)),
  },
  {
    key: "weekend",
    label: "This weekend",
    compute: () => formatLocal(nextSaturday(startOfToday())),
  },
  {
    key: "next-week",
    label: "Next week",
    compute: () => formatLocal(addDays(startOfToday(), 7)),
  },
  {
    key: "two-weeks",
    label: "In 2 weeks",
    compute: () => formatLocal(addDays(startOfToday(), 14)),
  },
];

function describe(value: string): string {
  if (!value) return "";
  for (const preset of PRESETS) {
    if (preset.compute() === value) return `${preset.label} · ${value}`;
  }
  const parsed = parseLocal(value);
  if (!parsed) return value;
  const today = formatLocal(startOfToday());
  if (value < today) return `${value} · overdue`;
  return value;
}

export function DateInput({ value, onChange, placeholder }: Props) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  const [showNativePicker, setShowNativePicker] = useState(false);

  const display = useMemo(() => describe(value), [value]);

  const handlePreset = (preset: Preset) => {
    onChange(preset.compute());
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  const handleCustom = () => {
    setOpen(false);
    if (Platform.OS === "web") return;
    setTimeout(() => setShowNativePicker(true), 80);
  };

  const handleNativeChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") {
      setShowNativePicker(false);
    }
    if (event.type === "set" && selected) {
      onChange(formatLocal(selected));
    } else if (event.type === "dismissed") {
      // no-op
    }
  };

  const trigger = (
    <Pressable
      onPress={() => setOpen(true)}
      style={({ pressed }) => [
        styles.input,
        styles.inputRow,
        {
          backgroundColor: colors.input,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: value ? colors.foreground : colors.mutedForeground,
          flex: 1,
          fontSize: 15,
        }}
        numberOfLines={1}
      >
        {display || placeholder || "Select due date"}
      </Text>
      <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
    </Pressable>
  );

  // On web, the "Custom date" choice swaps to a real <input type="date">
  // briefly so users get the native HTML calendar.
  const [webCustom, setWebCustom] = useState(false);

  return (
    <View style={styles.wrapper}>
      {webCustom && Platform.OS === "web" ? (
        <TextInput
          // @ts-expect-error react-native-web supports DOM type prop
          type="date"
          value={value}
          autoFocus
          onChangeText={(v) => onChange(v)}
          onBlur={() => setWebCustom(false)}
          placeholder={placeholder ?? "YYYY-MM-DD"}
          placeholderTextColor={colors.mutedForeground}
          style={[
            styles.input,
            {
              backgroundColor: colors.input,
              color: colors.foreground,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        />
      ) : (
        trigger
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.menu,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderRadius: colors.radius * 1.4,
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.menuTitle, { color: colors.mutedForeground }]}>
              Due date
            </Text>
            {PRESETS.map((preset) => {
              const presetValue = preset.compute();
              const active = presetValue === value;
              return (
                <Pressable
                  key={preset.key}
                  onPress={() => handlePreset(preset)}
                  style={({ pressed }) => [
                    styles.menuItem,
                    {
                      backgroundColor: active
                        ? colors.primary + "22"
                        : pressed
                          ? colors.input
                          : "transparent",
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? colors.primary : colors.foreground,
                      fontSize: 15,
                      fontWeight: active ? "600" : "400",
                    }}
                  >
                    {preset.label}
                  </Text>
                  <Text
                    style={{ color: colors.mutedForeground, fontSize: 13 }}
                  >
                    {presetValue}
                  </Text>
                </Pressable>
              );
            })}

            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />

            <Pressable
              onPress={() => {
                if (Platform.OS === "web") {
                  setOpen(false);
                  setTimeout(() => setWebCustom(true), 60);
                } else {
                  handleCustom();
                }
              }}
              style={({ pressed }) => [
                styles.menuItem,
                {
                  backgroundColor: pressed ? colors.input : "transparent",
                  borderRadius: colors.radius,
                },
              ]}
            >
              <Text style={{ color: colors.foreground, fontSize: 15 }}>
                Custom date…
              </Text>
              <Feather
                name="calendar"
                size={16}
                color={colors.mutedForeground}
              />
            </Pressable>

            {value ? (
              <Pressable
                onPress={handleClear}
                style={({ pressed }) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed ? colors.input : "transparent",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <Text style={{ color: colors.destructive, fontSize: 15 }}>
                  Clear date
                </Text>
                <Feather
                  name="x"
                  size={16}
                  color={colors.destructive}
                />
              </Pressable>
            ) : null}
          </View>
        </Pressable>
      </Modal>

      {showNativePicker && Platform.OS !== "web" && (
        <DateTimePicker
          value={parseLocal(value) ?? new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "calendar"}
          onChange={handleNativeChange}
          themeVariant="dark"
        />
      )}

      {Platform.OS === "ios" && showNativePicker && (
        <Pressable
          onPress={() => setShowNativePicker(false)}
          style={[
            styles.doneBtn,
            { backgroundColor: colors.primary, borderRadius: colors.radius },
          ]}
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  menu: {
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  menuTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  doneBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  doneText: { color: "#fff", fontWeight: "600" },
});
