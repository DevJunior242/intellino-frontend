import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield as ShieldIcon,
  Key as KeyIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";

// Variantes d'animation pour Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

export default function LeagueFederationAffiliation() {
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { updateAuth, currentLeague } = UseAuth();
  if (!currentLeague) return null;
  console.log("currentLeague", currentLeague);
  const handleJoin = async (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await Instance.post("/api/league/rejoindre-federation", {
        invitation_code: invitationCode,
      });

      if (response.data.success) {
        const { user, clubs, leagues, federations } = response.data;

        updateAuth({
          user,
          clubs,
          leagues,
          federations,
          activeContext: { type: "Ligue", id: user.current_league_id },
        });
        alert(response.data.message);
      }
    } catch (err) {
      console.log(err);
      setError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'affiliation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 650, mx: "auto", p: 2 }}>
      <AnimatePresence mode="wait">
        {currentLeague?.federation_id ? (
          /* =========================================================================
                       ÉTAT 1 : LA LIGUE EST DÉJÀ AFFILIÉE (Card avec motion)
                       ========================================================================= */
          <motion.div
            key="affiliated"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              elevation={2}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 48,
                      height: 48,
                      bgcolor: "success.soft", // Ajuste selon ton thème ou utilise 'success.light' avec opacité
                      color: "success.main",
                      borderRadius: "50%",
                    }}
                  >
                    <CheckCircleIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Structure Affiliée
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Votre ligue est officiellement rattachée au niveau
                      national.
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.disabled",
                        textTransform: "uppercase",
                      }}
                    >
                      Ligue Actuelle
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "text.primary", mt: 0.5 }}
                    >
                      {currentLeague.name}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      bgcolor: "action.hover",
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.disabled",
                        textTransform: "uppercase",
                      }}
                    >
                      Fédération Parente
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "primary.main", mt: 0.5 }}
                    >
                      {currentLeague.federation_name || "Fédération Nationale"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          /* =========================================================================
                       ÉTAT 2 : LA LIGUE DOIT REJOINDRE (Formulaire d'invitation)
                       ========================================================================= */
          <motion.div
            key="not-affiliated"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card
              elevation={3}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.100",
                overflow: "visible",
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                {/* En-tête Flex */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2.5,
                    mb: 4,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 54,
                      height: 54,
                      bgcolor: "primary.lighter", // ou use generic text/bg : alpha(theme.palette.primary.main, 0.1)
                      color: "primary.main",
                      borderRadius: 3,
                      flexShrink: 0,
                    }}
                  >
                    <ShieldIcon fontSize="large" />
                  </Box>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "grey.900" }}
                    >
                      Rattachement National de la Ligue
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      Pour lier cette ligue régionale à votre fédération
                      nationale, veuillez saisir le code d'invitation sécurisé
                      fourni par l'administration générale.
                    </Typography>
                  </Box>
                </Box>

                {/* Alerte d'avertissement MUI */}
                <Alert
                  severity="warning"
                  variant="outlined"
                  sx={{
                    mb: 4,
                    borderRadius: 2,
                    "& .MuiAlert-message": { fontSize: "13px" },
                  }}
                >
                  <strong>Attention :</strong> Cette action liera définitivement
                  l'historique de vos clubs et athlètes à la tarification et aux
                  règles de cette fédération.
                </Alert>

                {/* Formulaire */}
                <Box
                  component="form"
                  onSubmit={handleJoin}
                  sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                >
                  <TextField
                    label="Code d'invitation"
                    placeholder="EX: FED-KARATE-OUAGA-2026"
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                    error={!!error}
                    helperText={error}
                    value={invitationCode}
                    onChange={(e) =>
                      setInvitationCode(e.target.value.toUpperCase())
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <KeyIcon color={error ? "error" : "action"} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />

                  {/* Bouton de Soumission Interactif avec Motion */}
                  <motion.div
                    whileHover={{
                      scale: !invitationCode.trim() || loading ? 1 : 1.01,
                    }}
                    whileTap={{
                      scale: !invitationCode.trim() || loading ? 1 : 0.99,
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                      disabled={loading || !invitationCode.trim()}
                      endIcon={loading ? null : <ArrowForwardIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: "15px",
                        textTransform: "none",
                        boxShadow: 2,
                      }}
                    >
                      {loading ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <CircularProgress size={20} color="inherit" />
                          Vérification du code...
                        </Box>
                      ) : (
                        "Rejoindre la Fédération"
                      )}
                    </Button>
                  </motion.div>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
