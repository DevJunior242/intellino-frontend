import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

function NotFound() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        p: 2,
        backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#f5f5f5",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ErrorOutlineIcon
          sx={{
            fontSize: 100,
            color: theme.palette.mode === "dark" ? "#fff" : "#1976d2",
            mb: 2,
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            color: theme.palette.mode === "dark" ? "#fff" : "#1976d2",
            mb: 1,
          }}
        >
          404
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.mode === "dark" ? "#fff" : "text.primary",
            mb: 3,
          }}
        >
          Oups ! Page non trouvée.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Typography
          variant="body1"
          sx={{
            color: theme.palette.mode === "dark" ? "#aaa" : "text.secondary",
            maxWidth: 500,
            mb: 4,
          }}
        >
          La page que vous cherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez à la page d'accueil.
        </Typography>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: theme.palette.mode === "dark" ? "#1976d2" : "#1976d2",
            color: "#fff",
          }}
        >
          Retour à l'accueil
        </Button>
      </motion.div>
    </Box>
  );
}

export default NotFound;
