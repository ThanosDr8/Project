import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  apiCreateTask,
  apiDeleteTask,
  apiGetTasks,
  apiLogin,
  apiUpdateTask,
} from "@/lib/api";
import {
  cancelTaskReminder,
  ensurePermissions,
  scheduleTaskReminder,
} from "@/lib/notifications";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "open" | "in progress" | "done";

export const TASK_CATEGORIES = [
  "Work",
  "House work",
  "School work",
  "Shopping",
  "Hobbies",
  "Other",
] as const;

export type Task = {
  id: string;
  serverId?: number;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: number;
  notificationId?: string | null;
};

export type ThemeMode = "dark" | "light";

export type CurrentUser = {
  id: number;
  username: string;
  token: string;
};

type AppState = {
  tasks: Task[];
  theme: ThemeMode;
  notificationsEnabled: boolean;
  currentUser: CurrentUser | null;
};

const STORAGE_KEY = "tasks-app:v2";

const DEFAULT_STATE: AppState = {
  tasks: [],
  theme: "dark",
  notificationsEnabled: true,
  currentUser: null,
};

type LoginResult = { success: true } | { success: false; error: string };

type AppContextValue = {
  ready: boolean;
  tasks: Task[];
  theme: ThemeMode;
  currentUser: CurrentUser | null;
  notificationsEnabled: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "notificationId" | "serverId">) => void;
  updateTask: (
    id: string,
    task: Omit<Task, "id" | "createdAt" | "notificationId" | "serverId">,
  ) => void;
  deleteTask: (id: string) => void;
  toggleTheme: () => void;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function makeId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

async function maybeSchedule(enabled: boolean, task: Task): Promise<string | null> {
  if (!enabled || task.status === "done" || !task.dueDate) return null;
  return await scheduleTaskReminder(task.id, task.title, task.dueDate);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load persisted state on mount
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState({ ...DEFAULT_STATE, ...parsed });
        }
      } catch {
        // ignore parse errors and start fresh
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  // Persist to AsyncStorage on state change
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  // Request notification permission on startup
  useEffect(() => {
    if (!ready || !state.notificationsEnabled) return;
    ensurePermissions().catch(() => {});
  }, [ready, state.notificationsEnabled]);

  // When user is set (restored from storage), refresh tasks from API
  useEffect(() => {
    if (!ready || !state.currentUser) return;
    (async () => {
      const serverTasks = await apiGetTasks(state.currentUser!.token);
      if (!serverTasks.length) return;
      setState((s) => ({
        ...s,
        tasks: serverTasks.map((t) => ({
          ...t,
          priority: t.priority as TaskPriority || "low",
          status: t.status as TaskStatus || "open",
          notificationId: null,
        })),
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const addTask = useCallback(
    (input: Omit<Task, "id" | "createdAt" | "notificationId" | "serverId">) => {
      const newTask: Task = {
        ...input,
        id: makeId(),
        createdAt: Date.now(),
        notificationId: null,
      };
      setState((s) => ({ ...s, tasks: [...s.tasks, newTask] }));

      // Sync to API
      const { currentUser, notificationsEnabled } = stateRef.current;
      if (currentUser) {
        apiCreateTask(currentUser.token, input).then((serverId) => {
          if (!serverId) return;
          setState((s) => ({
            ...s,
            tasks: s.tasks.map((t) =>
              t.id === newTask.id ? { ...t, serverId } : t,
            ),
          }));
        });
      }

      // Schedule notification
      maybeSchedule(notificationsEnabled, newTask).then((notificationId) => {
        if (!notificationId) return;
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === newTask.id ? { ...t, notificationId } : t,
          ),
        }));
      });
    },
    [],
  );

  const updateTask = useCallback(
    (id: string, input: Omit<Task, "id" | "createdAt" | "notificationId" | "serverId">) => {
      const previous = stateRef.current.tasks.find((t) => t.id === id);
      const merged: Task | null = previous ? { ...previous, ...input } : null;

      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, ...input, notificationId: null } : t,
        ),
      }));

      const { currentUser, notificationsEnabled } = stateRef.current;

      (async () => {
        if (previous?.notificationId) {
          await cancelTaskReminder(previous.notificationId);
        }

        if (currentUser && previous?.serverId) {
          await apiUpdateTask(currentUser.token, previous.serverId, input);
        }

        if (!merged) return;
        const notificationId = await maybeSchedule(notificationsEnabled, merged);
        if (!notificationId) return;
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, notificationId } : t,
          ),
        }));
      })();
    },
    [],
  );

  const deleteTask = useCallback((id: string) => {
    const previous = stateRef.current.tasks.find((t) => t.id === id);
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));

    if (previous?.notificationId) {
      cancelTaskReminder(previous.notificationId).catch(() => {});
    }
    const { currentUser } = stateRef.current;
    if (currentUser && previous?.serverId) {
      apiDeleteTask(currentUser.token, previous.serverId).catch(() => {});
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const result = await apiLogin(username, password);
      if (!result) return { success: false, error: "Could not reach the server" };
      if (result.error) return { success: false, error: result.error };

      const user: CurrentUser = { id: result.id, username: result.username, token: result.token };
      setState((s) => ({ ...s, currentUser: user }));

      // Fetch tasks from server and replace local ones
      const serverTasks = await apiGetTasks(result.token);
      setState((s) => ({
        ...s,
        tasks: serverTasks.map((t) => ({
          ...t,
          priority: t.priority as TaskPriority || "low",
          status: t.status as TaskStatus || "open",
          notificationId: null,
        })),
      }));

      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => {
    setState((s) => ({ ...s, currentUser: null, tasks: [] }));
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      const ok = await ensurePermissions();
      if (!ok) {
        setState((s) => ({ ...s, notificationsEnabled: false }));
        return;
      }
      setState((s) => ({ ...s, notificationsEnabled: true }));
    } else {
      const tasks = stateRef.current.tasks;
      setState((s) => ({
        ...s,
        notificationsEnabled: false,
        tasks: s.tasks.map((t) => ({ ...t, notificationId: null })),
      }));
      for (const task of tasks) {
        if (task.notificationId) await cancelTaskReminder(task.notificationId);
      }
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      tasks: state.tasks,
      theme: state.theme,
      currentUser: state.currentUser,
      notificationsEnabled: state.notificationsEnabled,
      addTask,
      updateTask,
      deleteTask,
      toggleTheme,
      login,
      logout,
      setNotificationsEnabled,
    }),
    [state, ready, addTask, updateTask, deleteTask, toggleTheme, login, logout, setNotificationsEnabled],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function useAppTheme() {
  const ctx = useContext(AppContext);
  return { theme: (ctx?.theme ?? "dark") as ThemeMode };
}
