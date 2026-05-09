import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
  Skeleton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  PlayArrow,
  InfoOutlined,
  TimerOutlined,
  TabletMac,
  PeopleAlt,
  LockOpen,
} from "@mui/icons-material";
import { motion, AnimatePresence, AnimateSharedLayout } from "framer-motion";

import Message from "../../Message";

export default function ConfigNotationCard({
  configs,
  loading,

  errors,
  success,
  estArbitre,
  onConnecterJuge,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        p: { xs: 1, sm: 2 },
        justifyContent: { xs: "center", md: "flex-start" },
      }}
    >
      {" "}
      {loading ? (
        // 1. ÉTAT CHARGEMENT (SKELETONS)
        [1, 2].map((i) => (
          <Paper
            key={i}
            sx={{
              p: 3,
              borderRadius: 4,
              width: {
                xs: "100%",
                sm: 400,
              },
              maxWidth: 400,
              border: "1px solid #eee",
            }}
          >
            <Skeleton
              variant="rectangular"
              height={40}
              sx={{ mb: 2, borderRadius: 1 }}
            />
            <Skeleton variant="text" width="70%" height={30} />
            <Stack spacing={2} sx={{ my: 3 }}>
              <Skeleton variant="rounded" height={40} />
              <Skeleton variant="rounded" height={40} />
            </Stack>
            <Skeleton
              variant="rectangular"
              height={50}
              sx={{ borderRadius: 3 }}
            />
          </Paper>
        ))
      ) : configs.length > 0 ? (
        // 2. ÉTAT AVEC DONNÉES (MAP)
        configs?.map((config) => {
          const isValidated = config.est_valide;
          return (
            <motion.div
              key={config.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  width: {
                    xs: "100%",
                    sm: 400,
                  },
                  maxWidth: 400,
                  border: "1px solid",
                  borderColor: isValidated ? "success.light" : "divider",
                }}
              >
                {/* Status Bar */}
                <Box
                  sx={{
                    bgcolor: isValidated ? "success.main" : "grey.200",
                    p: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color={isValidated ? "white" : "text.secondary"}
                  >
                    {isValidated ? "SÉANCE PRÊTE" : "BROUILLON / À CONFIGURER"}
                  </Typography>
                </Box>

                <Box sx={{ p: 3 }}>
                  {success[config.id] && (
                    <Alert
                      severity="success"
                      variant="filled"
                      sx={{ mb: 2, borderRadius: 2 }}
                    >
                      {success[config.id]}
                    </Alert>
                  )}
                  {/* Affichage des erreurs spécifiques à cette carte (si besoin) */}
                  {errors[config.id]?.length > 0 && (
                    <Alert
                      severity="error"
                      variant="filled"
                      sx={{ mb: 2, borderRadius: 2 }}
                    >
                      <ul style={{ margin: 0, paddingLeft: 15 }}>
                        {errors[config.id].map((err, i) => (
                          <li key={i} style={{ fontSize: "0.8rem" }}>
                            {err}
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  )}

                  <Typography variant="h6" fontWeight="800" gutterBottom>
                    {config.plateau_nom}
                  </Typography>

                  <Stack spacing={2} sx={{ my: 3 }}>
                    <DetailRow
                      icon={<TabletMac color="primary" />}
                      label="Saisie"
                      value={config.mode_saisie}
                    />
                    <DetailRow
                      icon={<PeopleAlt color="primary" />}
                      label="Juges"
                      value={config.juges_option}
                    />
                    <DetailRow
                      icon={<TimerOutlined color="primary" />}
                      label="Rotations"
                      value={config.nb_rotation}
                    />
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Boutons selon rôle */}
                  {estArbitre && isValidated && (
                    // ARBITRE — bouton connexion
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      disabled={!isValidated}
                      startIcon={<LockOpen />}
                      onClick={() => onConnecterJuge(config)}
                      sx={{ py: 2, borderRadius: 3, fontWeight: "bold" }}
                    >
                      {isValidated
                        ? "Se connecter comme juge"
                        : "Séance pas encore prête"}
                    </Button>
                  )}
                </Box>
              </Paper>
            </motion.div>
          );
        })
      ) : (
        // 3. ÉTAT VIDE
        <Box sx={{ textAlign: "center", width: "100%", mt: 4 }}>
          <InfoOutlined sx={{ fontSize: 50, color: "text.disabled" }} />
          <Typography color="text.secondary">
            Aucune configuration trouvée pour cette ligue.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between">
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            bgcolor: "grey.50",
            p: 1,
            borderRadius: 2,
            display: "flex",
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          {icon}
        </Box>
        <Typography variant="body2" color="text.secondary" fontWeight="500">
          {label}
        </Typography>
      </Stack>
      <Typography variant="body2" fontWeight="700">
        {value}
      </Typography>
    </Stack>
  );
}
