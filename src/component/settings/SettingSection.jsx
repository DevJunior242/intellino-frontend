import { Box, Container, Typography, useTheme } from "@mui/material";
import React from "react";
import { tokenTheme } from "../../theme";
 
function SettingSection({ title, icon: Icon, children }) {
  const colors = tokenTheme(useTheme().palette.mode);
  return (
    <Box sx={{ mt: 4, backgroundColor: colors.zinc[300],color:colors.zinc[100], p: 10,mx:5, boxShadow: 3,borderRadius: 2 }}>
      <Container
        sx={{
          display: "flex",
          justifyContent: "space-between",

          alignItems: "center",

          borderRadius: 2,
        }}
      >
        <Icon  />
        <Typography
          variant="h1"
         sx={{ fontSize:{xs:'12px', sm:'50px'} }}
          fontWeight="bold"
          zIndex={1}
        >
          {title}
        </Typography>
      </Container>
      {children}
    </Box>
  );
}

export default SettingSection;
