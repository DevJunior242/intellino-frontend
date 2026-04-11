import React from "react";
import { Box, Switch, Typography, useTheme } from "@mui/material";
import { tokenTheme } from "./theme";
 
function ToggleSwitch({ isOn, label, onToggle }) {
  const colors = tokenTheme(useTheme().palette.mode);
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",

        alignItems: "center",
      }}
    >
      <Typography variant="body1" sx={{   fontWeight: "bold" }}>
        {label}
      </Typography>

      <Switch checked={isOn} onChange={onToggle} />
    </Box>
  );
}

export default ToggleSwitch;
