import { useContext } from "react";
import { Box, IconButton } from "@mui/material";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "./theme";
// `iconColor` : à ne fournir que pour un fond qui ne suit PAS le thème
// (ex: Navbar public, toujours blanc). Par défaut l'icône suit le thème
// (text.primary), pour rester lisible sur un fond qui bascule clair/sombre
// (TopBar, dashboards).
const ThemeToggle = ({ iconColor } = {}) => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const color = iconColor ?? "text.primary";
  return (
    <Box>
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === "dark" ? (
          <LightModeOutlined sx={{ color }} />
        ) : (
          <DarkModeOutlined sx={{ color }} />
        )}
      </IconButton>
    </Box>
  );
};

export default ThemeToggle;
