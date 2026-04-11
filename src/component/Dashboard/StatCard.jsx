import React from "react";
import { Paper, Typography, Box, Avatar } from "@mui/material";
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      //  background: `linear-gradient(135deg, ${color?.[50] || "#f5f5f5"} 0%, #ffffff 100%)`,
      borderColor: color?.[100] || "#e0e0e0",
      border: "1px solid",
      transition: "transform 0.2s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: 2 },
      backgroundColor: "background.default",
    }}
  >
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight="600"
        gutterBottom
      >
        {title.toUpperCase()}
      </Typography>
      <Typography variant="h4" fontWeight="800" color="text.primary">
        {value.toLocaleString()}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.5 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
    <Avatar
      sx={{
        bgcolor: color[500],
        width: 56,
        height: 56,
        boxShadow: `0 4px 12px ${color[200]}`,
      }}
    >
      {icon}
    </Avatar>
  </Paper>
);

export default StatCard;
