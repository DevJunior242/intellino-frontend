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
  handleValider,
  handleLaunchSeance,
  errors,
  success,
  submitId,
  estArbitre,
  onConnecterJuge,
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, p: 2 }}>
      {loading ? (
        // 1. ÉTAT CHARGEMENT (SKELETONS)
        [1, 2].map((i) => (
          <Paper
            key={i}
            sx={{ p: 3, borderRadius: 4, width: 400, border: "1px solid #eee" }}
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
          console.log("config pour valider", config);
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
                  width: 400,
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

{
  /* <AnimatePresence mode="wait">
          {errors.length > 0 && (
            <motion.div
              key="error-alert"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert
                severity="error"
                variant="filled"
                onClose={() => setErrors([])}
                sx={{
                  borderRadius: 3,
                  "& .MuiAlert-message": { width: "100%" },
                }}
              >
                <p variant="subtitle2" fontWeight="bold" gutterBottom>
                  Action Impossible
                </p>
                {errors.map((err, index) => (
                  <p
                    key={index}
                    variant="caption"
                    component="p"
                    sx={{
                      whiteSpace: "pre-line", // Important for your \n
                      lineHeight: 1.4,
                      opacity: 0.9,
                    }}
                  >
                    {err.replace(/\s+/g, " ").replace("— ", "— \n")}
                  </p>
                ))}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence> */
}

{
  /* message succès */
}
{
  /* {success && (
          <div className="flex gap-2 animate-in fade-in zoom-in duration-200">
            <div className="flex-[2] py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          </div>
        )} */
}
