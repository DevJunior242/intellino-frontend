import React from "react";
import { Box, Typography, Button, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";

function Forbidden() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

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
      {/* Animation pour l'icône */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LockIcon
          sx={{
            fontSize: 100,
            color: theme.palette.error.main,
            mb: 2,
          }}
        />
      </motion.div>

      {/* Animation pour le code 403 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: "bold",
            color: theme.palette.error.main,
            mb: 1,
          }}
        >
          403
        </Typography>
      </motion.div>

      {/* Animation pour le titre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.mode === "dark" ? "#fff" : "text.primary",
            mb: 1,
          }}
        >
          Accès refusé
        </Typography>
      </motion.div>

      {/* Animation pour la description */}
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
          {message ||
            "Vous n'avez pas la permission d'accéder à cette page. Veuillez contacter l'administrateur si vous pensez qu'il s'agit d'une erreur."}
        </Typography>
      </motion.div>

      {/* Bouton avec animation */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/")}
          sx={{
            backgroundColor: theme.palette.error.main,
            color: "#fff",
          }}
        >
          Retour à l'accueil
        </Button>
      </motion.div>
    </Box>
  );
}

export default Forbidden;
