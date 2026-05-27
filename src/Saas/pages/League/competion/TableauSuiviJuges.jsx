import React, { useState, useEffect, useCallback } from "react";
import { Instance } from "../../../../Api/Axios";
import echo from "../../../../echo";

import {
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Button,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import WifiIcon from "@mui/icons-material/Wifi";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import LogoutIcon from "@mui/icons-material/Logout";

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const CHAISE_COLORS = ["#1565C0", "#C62828", "#2E7D32", "#6A1B9A"];

const TableauSuiviJuges = ({ configNotationId }) => {
  const [jugesConnectes, setJugesConnectes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Récupérer l'état des juges depuis le serveur
  const chargerJuges = useCallback(async () => {
    try {
      const res = await Instance.get(`/api/config/${configNotationId}/judges`);
      setJugesConnectes(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des juges", err);
    }
  }, [configNotationId]);

  useEffect(() => {
    if (!configNotationId) return;
    chargerJuges();
  }, [configNotationId]);

  useEffect(() => {
    if (!configNotationId) return;
    const channel = echo.channel(`tatami.${configNotationId}`);

    const handlerUpdated = () => chargerJuges();
    const handlerNote = () => chargerJuges();

    channel.listen(".tatami.updated", handlerUpdated);
    channel.listen(".note.ajoutee", handlerNote);

    return () => {
      channel.stopListening(".tatami.updated", handlerUpdated);
      channel.stopListening(".note.ajoutee", handlerNote);
    };
  }, [chargerJuges, configNotationId]);

  // 2. Réinitialiser un juge spécifique
  const handleResetSpecifique = async (numero) => {
    if (!window.confirm(`Libérer la chaise du Juge ${numero} ?`)) return;
    setLoading(true);
    try {
      await Instance.delete(`/api/reset-judge/${configNotationId}/${numero}`);
      await chargerJuges();
    } catch {
      alert("Erreur lors de la réinitialisation du juge");
    } finally {
      setLoading(false);
    }
  };

  // 3. Réinitialiser tout le tatami
  const handleResetAll = async () => {
    if (!window.confirm("⚠️ Déconnecter TOUS les juges de ce tatami ?")) return;
    setLoading(true);
    try {
      await Instance.delete(`/api/reset-all-judges/${configNotationId}`);
      await chargerJuges();
    } catch {
      alert("Erreur lors de la réinitialisation complète");
    } finally {
      setLoading(false);
    }
  };

  // Générer l'état des 4 chaises
  const chaises = [1, 2, 3, 4].map((numero) => {
    const infosJuge = jugesConnectes.find((j) => j.juge_numero === numero);
    return {
      numero,
      estConnecte: !!infosJuge,
      ip: infosJuge?.ip_address ?? null,
    };
  });

  return (
    <MotionPaper
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "grey.200",
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          display="flex"
          alignItems="center"
          gap={1}
          fontSize={{ xs: "0.4rem", sm: "1.2rem" }}
        >
          📡 Statut des Tablettes Juges
        </Typography>

        <Button
          variant="contained"
          color="error"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={handleResetAll}
          disabled={loading}
          component={motion.button}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            textTransform: "none",
            fontSize: { xs: "0.4rem", sm: "1rem" },
          }}
        >
          Réinitialiser tout le tatami
        </Button>
      </Box>

      {/* Grille des 4 chaises */}
      <Grid container spacing={2}>
        {chaises.map((chaise, index) => {
          const couleur = CHAISE_COLORS[chaise.numero - 1];
          return (
            <Grid item xs={6} md={3} key={chaise.numero}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <Paper
                  elevation={chaise.estConnecte ? 4 : 1}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    textAlign: "center",
                    border: "2px solid",
                    borderColor: chaise.estConnecte ? couleur : "grey.200",
                    bgcolor: chaise.estConnecte ? `${couleur}08` : "grey.50",
                    transition: "all 0.3s ease",
                  }}
                >
                  {/* Label chaise */}
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    letterSpacing={1}
                    display="block"
                    mb={1}
                  >
                    CHAISE {chaise.numero}
                  </Typography>

                  {/* Carré coloré avec numéro */}
                  <MotionBox
                    animate={
                      chaise.estConnecte
                        ? { scale: [1, 1.07, 1] }
                        : { scale: 1 }
                    }
                    transition={{
                      duration: 1.5,
                      repeat: chaise.estConnecte ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2,
                      bgcolor: chaise.estConnecte ? couleur : "grey.300",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1.5,
                      boxShadow: chaise.estConnecte
                        ? `0 4px 16px ${couleur}55`
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Typography variant="h6" fontWeight={800} color="white">
                      {chaise.numero}
                    </Typography>
                  </MotionBox>

                  {/* Statut + IP */}
                  <AnimatePresence mode="wait">
                    {chaise.estConnecte ? (
                      <MotionBox
                        key="connecte"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Chip
                          icon={<WifiIcon sx={{ fontSize: 14 }} />}
                          label="Connecté"
                          size="small"
                          sx={{
                            bgcolor: `${couleur}18`,
                            color: couleur,
                            fontWeight: 700,
                            fontSize: 11,
                            mb: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.disabled"
                          fontFamily="monospace"
                          fontSize={10}
                        >
                          {chaise.ip}
                        </Typography>
                      </MotionBox>
                    ) : (
                      <MotionBox
                        key="vide"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <Chip
                          icon={<WifiOffIcon sx={{ fontSize: 14 }} />}
                          label="Vide"
                          size="small"
                          sx={{
                            bgcolor: "grey.200",
                            color: "grey.600",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        />
                      </MotionBox>
                    )}
                  </AnimatePresence>

                  {/* Bouton libérer */}
                  <Box mt={1.5} minHeight={32}>
                    <AnimatePresence>
                      {chaise.estConnecte && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Tooltip title={`Libérer la chaise ${chaise.numero}`}>
                            <span>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<LogoutIcon fontSize="small" />}
                                onClick={() =>
                                  handleResetSpecifique(chaise.numero)
                                }
                                disabled={loading}
                                component={motion.button}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  textTransform: "none",
                                  borderRadius: 2,
                                }}
                              >
                                Libérer
                              </Button>
                            </span>
                          </Tooltip>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                </Paper>
              </MotionBox>
            </Grid>
          );
        })}
      </Grid>
    </MotionPaper>
  );
};

export default TableauSuiviJuges;
