import { useMemo } from "react";
import { Box } from "@mui/material";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import { dashboardSettingTheme } from "../../../../theme";
import ThemeToggle from "../../../../ThemeToggle";

// Écrans publics (projetés en salle pendant les combats/katas) : routes hors
// DashboardGeneralLayout, donc jamais exposées au thème FBK du dashboard par
// défaut. Ce wrapper leur applique la même palette (bleu/or FBK en clair,
// palette sombre théâtrale existante en sombre) + un bouton pour basculer.
export default function PublicDisplayThemeProvider({ children }) {
  const outerTheme = useTheme();
  const dashboardTheme = useMemo(
    () => createTheme(dashboardSettingTheme(outerTheme.palette.mode)),
    [outerTheme.palette.mode],
  );

  return (
    <ThemeProvider theme={dashboardTheme}>
      <Box sx={{ position: "relative" }}>
        <Box
          sx={{
            position: "fixed",
            top: 8,
            right: 8,
            zIndex: 2000,
            bgcolor: "background.paper",
            borderRadius: "50%",
            boxShadow: 3,
          }}
        >
          <ThemeToggle />
        </Box>
        {children}
      </Box>
    </ThemeProvider>
  );
}
