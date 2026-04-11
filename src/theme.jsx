import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

export const tokenTheme = (mode) => ({
  ...(mode === "dark"
    ? {
        primary: {
          100: "#d1d1f5",
          200: "#a3a3eb",
          300: "#7474e0",
          400: "#4646d6",
          500: "#1818cc",
          600: "#1313a3",
          700: "#0e0e7a",
          800: "rgba(1, 1, 48, 1)",
          900: "#050529",
        },

        gray: {
          100: "#ececec",
          200: "#d8d8d8",
          300: "#c5c5c5",
          400: "#b1b1b1",
          500: "#9e9e9e",
          600: "#7e7e7e",
          700: "#5f5f5f",
          800: "#3f3f3f",
          900: "#202020",
        },

        zinc: {
          100: "#e3e3e4",
          200: "#c6c6ca",
          300: "#060608e7",
          400: "#8d8d95",
          500: "#71717a",
          600: "#5a5a62",
          700: "#444449",
          800: "#2d2d31",
          900: "#d8d8dfff",
        },

        indigo: {
          100: "#e0e0fc",
          200: "#c1c2f9",
          300: "#a1a3f7",
          400: "#8285f4",
          500: "#6366f1",
          600: "#4f52c1",
          700: "#3b3d91",
          800: "#282960",
          900: "#141430",
        },
        orange: {
          100: "#fce6e0ff",
          200: "#c1c2f9",
          300: "#a1a3f7",
          400: "#8285f4",
          500: "#6366f1",
          600: "rgba(223, 95, 10, 1)",
          700: "#3b3d91",
          800: "#282960",
          900: "#141430",
        },
      }
    : {
        primary: {
          900: "#050529",
          800: "rgba(1, 1, 10, 0.94)",
          700: "#b1b1b8ff",
          600: "#1313a3",
          500: "#1818cc",
          400: "#4646d6",
          300: "#7d7dc4ff",
          200: "#a3a3eb",
          100: "#d1d1f5",
        },

        gray: {
          900: "#202020",
          800: "#3f3f3f",
          700: "#5f5f5f",
          600: "#7e7e7e",
          500: "#9e9e9e",
          400: "#b1b1b1",
          300: "#c5c5c5",
          200: "#d8d8d8",
          100: "rgba(10, 9, 9, 0.45)",
        },

        zinc: {
          800: "#2d2d31",
          700: "#444449",
          600: "#5a5a62",
          500: "#71717a",
          400: "#8d8d95",
          300: "#aaaaaf",
          200: "#c6c6ca",
          100: "#010107ff",
          900: "#171718",
        },

        indigo: {
          900: "#141430",
          800: "#282960",
          700: "#3b3d91",
          600: "#4f52c1",
          500: "#6366f1",
          400: "#8285f4",
          300: "#a1a3f7",
          200: "#c1c2f9",
          100: "#e0e0fc",
        },
        orange: {
          100: "#fce6e0ff",
          200: "#c1c2f9",
          300: "#a1a3f7",
          400: "#8285f4",
          500: "#6366f1",
          600: "rgba(223, 95, 10, 1)",
          700: "#3b3d91",
          800: "#282960",
          900: "#141430",
        },
      }),
});

export const settingTheme = (mode) => {
  const colors = tokenTheme(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.gray[500],
            },
            neutral: {
              main: colors.zinc[500],
              dark: colors.zinc[900],
              light: colors.zinc[100],
            },
            background: {
              default: colors.zinc[800],
              paper: colors.zinc[900],
            },
          }
        : {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.gray[500],
            },
            neutral: {
              main: colors.zinc[900],
              dark: colors.zinc[900],
              light: colors.zinc[100],
            },
            background: {
              default: "#fcfcfc",
            },
          }),
    },
  };
};

export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("light");
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    [],
  );
  const theme = useMemo(() => createTheme(settingTheme(mode)), [mode]);

  return [theme, colorMode];
};
