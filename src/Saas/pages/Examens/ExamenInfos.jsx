import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  School,
  Place,
  CalendarToday,
  EventBusy,
  Update,
} from "@mui/icons-material";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";

const ExamenStatusAlert = ({ examen }) => {
  if (!examen) return null;
   // 1. CAS : EXAMEN ANNULÉE
  if (examen.status === 3) {
    return (
      <Alert
        severity="error"
        icon={<EventBusy fontSize="large" />}
        sx={{ mb: 3, borderRadius: 2, border: "1px solid #ffa39e" }}
      >
        <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          Session Annulée
        </AlertTitle>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            <strong>Motif de l'annulation :</strong>{" "}
            {examen.cancel_reason || "Non spécifié"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", mt: 0.5, opacity: 0.8 }}
          >
            Annulé le :{" "}
            {examen.cancelled_at
              ? new Date(examen.cancelled_at).toLocaleString()
              : "Date inconnue"}
          </Typography>
        </Box>
      </Alert>
    );
  }

  // 2. CAS : EXAMEN REPORTÉE
  // (On détecte le report si la date/heure actuelle est différente de la date de création ou via un flag 'is_rescheduled')
  if (examen.parent_examen_id || examen.old_start_date) {
    return (
      <Alert
        severity="info"
        icon={<Update fontSize="large" />}
        sx={{ mb: 3, borderRadius: 2, border: "1px solid #91d5ff" }}
      >
        <AlertTitle sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          Examen Reporté
        </AlertTitle>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2">
            Cet examen a été déplacé vers une nouvelle plage horaire.
          </Typography>
          <Divider sx={{ my: 1, opacity: 0.2 }} />
          <Box sx={{ display: "flex", gap: 4 }}>
            {/* <Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: "bold",
                  color: "text.secondary",
                }}
              >
                    ANCIENNE DATE
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {examen.old_examen_date}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: "bold",
                  color: "text.secondary",
                }}
              >
                ANCIEN HORAIRE
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {examen.replacement_start_time?.slice(0, 5)} -{" "}
                {examen.replacement_end_time?.slice(0, 5)}
              </Typography>
            </Box> */}
            <Box sx={{ backgroundColor: "background.default" }}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: "bold",
                  color: "text.secondary",
                }}
              >
                NOUVELLE DATE
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {examen?.start_date}
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: "bold",
                  color: "text.secondary",
                }}
              >
                NOUVEL HORAIRE
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {examen.start_time.slice(0, 5)} - {examen.end_time.slice(0, 5)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Alert>
    );
  }

  return null;
};

const ExamenInfos = ({ examen }) => {
 
  return (
    <Box sx={{ backgroundColor: "Background.default" }}>
      <ExamenStatusAlert examen={examen} />
      <Grid container spacing={3}>
        {/* Colonne Gauche : Académique */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backdropFilter: "blur(5px)",
              backgroundColor: "background.default",
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <School color="primary" /> Programme Académique
            </Typography>
            <Box sx={{ ml: 4 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Examen pour la {examen?.next_grade?.name}
              </Typography>
              <Chip
                label={examen?.next_grade?.name}
                size="small"
                color="error"
                sx={{ mt: 1, fontWeight: "bold" }}
              />
              <Typography
                variant="body2"
                sx={{ mt: 2, color: "text.secondary", fontStyle: "italic" }}
              >
                {examen.description ||
                  "Aucune description spécifique pour cette séance."}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Colonne Droite : Logistique */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backdropFilter: "blur(5px)",
              backgroundColor: "background.default",
            }}
          >
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
            >
              <Place color="primary" /> Détails Logistiques
            </Typography>
            <Box sx={{ ml: 4 }}>
              <Typography variant="body1">
                <b>{examen?.organisateur?.name}</b>{" "}
              </Typography>
              <Typography variant="body1">
                {/* <b>Lieu :</b> {examen?.club?.country} */}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography
                variant="body1"
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <CalendarToday fontSize="small" /> {examen.start_date}
              </Typography>
              <Typography variant="body1">
                <b>Horaire :</b> {examen.start_time.slice(0, 5)} -{" "}
                {examen.end_time.slice(0, 5)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Full Width : Historique/Admin */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              bgcolor: "#f8f9fa",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backdropFilter: "blur(5px)",
              backgroundColor: "background.default",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              ID Examen : {examen?.id.substr(0, 5)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Créé le : {new Date(examen.created_at).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExamenInfos;
