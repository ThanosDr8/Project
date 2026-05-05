import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function SettingsScreen() {
  const colors = useColors();
  const {
    theme,
    toggleTheme,
    currentUser,
    login,
    logout,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Enter a username and password");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(username.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setUsername("");
      setPassword("");
    }
  };

  const inputStyle = {
    backgroundColor: colors.input,
    color: colors.foreground,
    borderColor: colors.border,
    borderRadius: colors.radius,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Section title="Appearance" colors={colors}>
        <Row colors={colors}>
          <View style={styles.rowLeft}>
            <IconBox colors={colors} name={theme === "dark" ? "moon" : "sun"} />
            <View>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                Dark mode
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                Switch between light and dark themes.
              </Text>
            </View>
          </View>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </Row>
      </Section>

      <Section title="Notifications" colors={colors}>
        <Row colors={colors}>
          <View style={styles.rowLeft}>
            <IconBox colors={colors} name="bell" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                Due-date reminders
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {Platform.OS === "web"
                  ? "Reminders are only available in the mobile app."
                  : "Notified at 9am on the day a task is due. Requires a dev build."}
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled && Platform.OS !== "web"}
            onValueChange={(v) => setNotificationsEnabled(v).catch(() => {})}
            disabled={Platform.OS === "web"}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </Row>
      </Section>

      <Section title="Account" colors={colors}>
        {currentUser ? (
          <View style={{ gap: 14 }}>
            <View style={styles.rowLeft}>
              <IconBox colors={colors} name="user" />
              <View>
                <Text style={[styles.rowTitle, { color: colors.foreground }]}>
                  {currentUser.username}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  Tasks are syncing to the server.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={logout}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: colors.destructive,
                  borderRadius: colors.radius,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather name="log-out" size={16} color="#fff" />
              <Text style={styles.btnText}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              Sign in to sync your tasks across devices. New accounts are
              created automatically on first sign-in.
            </Text>

            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Your username"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.input, inputStyle]}
              />
            </View>

            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                style={[styles.input, inputStyle]}
              />
            </View>

            {error && (
              <Text style={{ color: colors.destructive, fontSize: 13 }}>
                {error}
              </Text>
            )}

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: colors.radius,
                  opacity: pressed || loading ? 0.75 : 1,
                },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="log-in" size={16} color="#fff" />
              )}
              <Text style={styles.btnText}>
                {loading ? "Signing in…" : "Sign in / Register"}
              </Text>
            </Pressable>
          </View>
        )}
      </Section>

      <Section title="About" colors={colors}>
        <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
          Tasks keeps your todos on this device and optionally syncs them to
          the server when you sign in.
        </Text>
      </Section>
    </ScrollView>
  );
}

function IconBox({
  colors,
  name,
}: {
  colors: ReturnType<typeof useColors>;
  name: React.ComponentProps<typeof Feather>["name"];
}) {
  return (
    <View style={[styles.iconBox, { backgroundColor: colors.accent }]}>
      <Feather name={name} size={16} color={colors.primary} />
    </View>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            borderRadius: colors.radius,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function Row({
  children,
  colors,
}: {
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.row, { borderColor: colors.border }]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 14, gap: 18, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: { padding: 14, borderWidth: StyleSheet.hairlineWidth },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { fontSize: 14, fontWeight: "600" },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  btn: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
