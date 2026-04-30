import { useContext } from "react";
import { Box, IconButton } from "@mui/material";
import { LightModeOutlined, DarkModeOutlined } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { ColorModeContext } from "./theme";
const ThemeToggle = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  return (
    <Box>
      <IconButton onClick={colorMode.toggleColorMode}>
        {theme.palette.mode === "dark" ? (
          <LightModeOutlined sx={{ color: "rgba(21, 8, 8, 0.88)" }} />
        ) : (
          <DarkModeOutlined />
        )}
      </IconButton>
    </Box>
  );
};

export default ThemeToggle;
