export const preferenceKey = "scu-linkin-preferences";

export type Preferences = {
  department: string;
  campus: string;
  interests: string;
  deadlineReminder: boolean;
};

export const defaultPreferences: Preferences = {
  department: "全部",
  campus: "全部",
  interests: "",
  deadlineReminder: true,
};

export function readPreferences(): Preferences {
  if (typeof window === "undefined") return defaultPreferences;
  try {
    const saved = localStorage.getItem(preferenceKey);
    return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}
