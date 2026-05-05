import colors from "@/constants/colors";
import { useAppTheme } from "@/contexts/AppContext";

/**
 * Returns the design tokens for the current theme. Theme is controlled
 * by the user through the Settings screen via AppContext.
 */
export function useColors() {
  const { theme } = useAppTheme();
  const palette = theme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
