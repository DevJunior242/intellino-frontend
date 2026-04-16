import { useContext } from "react";
import { IconButton } from "@mui/material";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "./theme";
const ThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  return (
    <IconButton onClick={colorMode.toggleColorMode}>
      {theme.palette.mode === "dark" ? (
        <IconButton sx={{ color: "rgba(21, 8, 8, 0.88)" }}>
          <LightModeOutlined />
        </IconButton>
      ) : (
        <IconButton>
          <DarkModeOutlined />
        </IconButton>
      )}
    </IconButton>
  );
};

export default ThemeToggle;
