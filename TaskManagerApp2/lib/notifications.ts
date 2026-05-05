import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

// expo-notifications auto-registers a push token listener the moment it is
// imported, which throws in Expo Go (SDK 53+). We must NOT import it at the
// top level. Instead we load it dynamically, and only after confirming we are
// NOT in Expo Go.

function isExpoGo(): boolean {
  try {
    return (
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as unknown as { appOwnership?: string }).appOwnership ===
        "expo"
    );
  } catch {
    return true; // assume Expo Go if we can't tell
  }
}

function notSupported(): boolean {
  return Platform.OS === "web" || isExpoGo();
}

let configured = false;
let permissionRequested = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadNotifications(): Promise<any | null> {
  if (notSupported()) return null;
  try {
    return await import("expo-notifications");
  } catch {
    return null;
  }
}

export async function ensurePermissions(): Promise<boolean> {
  const N = await loadNotifications();
  if (!N) return false;
  if (!configured) {
    configured = true;
    try {
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch {
      // ignore
    }
  }
  try {
    const current = await N.getPermissionsAsync();
    if (current.granted) return true;
    if (permissionRequested && !current.canAskAgain) return false;
    permissionRequested = true;
    const next = await N.requestPermissionsAsync();
    return !!next.granted;
  } catch {
    return false;
  }
}

function parseLocalDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map((p) => Number(p));
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d, 9, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function scheduleTaskReminder(
  taskId: string,
  title: string,
  dueDate: string,
): Promise<string | null> {
  const N = await loadNotifications();
  if (!N) return null;
  const target = parseLocalDate(dueDate);
  if (!target || target.getTime() <= Date.now()) return null;
  const ok = await ensurePermissions();
  if (!ok) return null;
  try {
    return await N.scheduleNotificationAsync({
      content: { title: "Task due today", body: title, data: { taskId } },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DATE,
        date: target,
      },
    });
  } catch {
    return null;
  }
}

export async function cancelTaskReminder(
  notificationId: string | undefined | null,
): Promise<void> {
  if (!notificationId) return;
  const N = await loadNotifications();
  if (!N) return;
  try {
    await N.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore — may have already fired
  }
}
