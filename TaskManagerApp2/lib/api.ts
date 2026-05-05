import { Platform } from "react-native";
import { Task } from "@/contexts/AppContext";

// On web/native the shared proxy routes /api → the API server.
// In Expo Go on a physical device we need to reach the server via the
// Replit dev domain exposed through the environment variable injected at
// build time. Falls back to relative /api for web.
const BASE =
  Platform.OS === "web"
    ? "/api"
    : (process.env["EXPO_PUBLIC_DOMAIN"]
        ? `https://${process.env["EXPO_PUBLIC_DOMAIN"]}/api`
        : "/api");

type ApiTask = {
  id: number;
  userId: number;
  name: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

function toAppTask(t: ApiTask): Omit<Task, "notificationId"> & { serverId: number } {
  return {
    id: String(t.id),
    serverId: t.id,
    title: t.name,
    description: t.description,
    category: t.category,
    priority: (t.priority as Task["priority"]) || "low",
    status: (t.status as Task["status"]) || "open",
    dueDate: t.dueDate,
    createdAt: new Date(t.createdAt).getTime(),
  };
}

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
    });
    if (res.status === 204) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Auth
export async function apiLogin(
  username: string,
  password: string,
): Promise<{ id: number; username: string; token: string; error?: string } | null> {
  try {
    const res = await fetch(`${BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// Tasks
export async function apiGetTasks(token: string): Promise<ReturnType<typeof toAppTask>[]> {
  const data = await request<ApiTask[]>("/tasks", token);
  return data ? data.map(toAppTask) : [];
}

export async function apiCreateTask(
  token: string,
  task: Omit<Task, "id" | "createdAt" | "notificationId">,
): Promise<number | null> {
  const data = await request<ApiTask>("/tasks", token, {
    method: "POST",
    body: JSON.stringify({
      name: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    }),
  });
  return data ? data.id : null;
}

export async function apiUpdateTask(
  token: string,
  serverId: number,
  task: Omit<Task, "id" | "createdAt" | "notificationId">,
): Promise<boolean> {
  const data = await request<ApiTask>(`/tasks/${serverId}`, token, {
    method: "PUT",
    body: JSON.stringify({
      name: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    }),
  });
  return data !== null;
}

export async function apiDeleteTask(
  token: string,
  serverId: number,
): Promise<void> {
  await request(`/tasks/${serverId}`, token, { method: "DELETE" });
}
