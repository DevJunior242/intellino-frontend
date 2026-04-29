import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Skeleton,
  CircularProgress,
} from "@mui/material";

import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import CreateEvenement from "./competion/CreateEvenement";
import EvenementsTable from "./competion/EvenementsTable.jsx";
import { UseAuth } from "../../../Api/AuthContext.jsx";

// --- COULEURS DU THÈME EXACT (Dark Mode de l'image) ---
const theme = {
  bg: "#1a1d21", // Fond principal
  paper: "#212529", // Fond des grands blocs
  card: "#2c3035", // Fond des stats cards (Date, Lieu, etc.)
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a", // Jaune Karaté
  success: "#4caf50", // Vert
  warning: "#f44336", // Rouge
};

// --- COMPOSANT : Carte d'Info Principale ---
const InfoCard = ({ title, value, detail, color }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      bgcolor: theme.card,
      borderRadius: 2,
      flexGrow: 1,
      minWidth: { xs: "100%", sm: "180px" },
      border: "1px solid rgba(255,255,255,0.03)",
    }}
  >
    <Typography
      variant="body2"
      sx={{ color: theme.textSecondary, mb: 1, fontWeight: 500 }}
    >
      {title}
    </Typography>
    <Typography
      variant="h5"
      sx={{ color: color || theme.textMain, fontWeight: 700, lineHeight: 1.2 }}
    >
      {value}
    </Typography>
    {detail && (
      <Typography
        variant="caption"
        sx={{ color: color || theme.textSecondary, display: "block", mt: 0.5 }}
      >
        {detail}
      </Typography>
    )}
  </Paper>
);

// --- COMPOSANT : Badge de Statut coloré ---
const StatusBadge = ({ label, type }) => {
  const getColors = () => {
    switch (type) {
      case "open":
        return { bgcolor: "rgba(76, 175, 80, 0.08)", color: "#4caf50" }; // Vert clair
      case "close":
        return { bgcolor: theme.warning, color: "#ffffff" }; // Rouge
      case "done":
        return {
          bgcolor: "rgba(255,255,255,0.05)",
          color: theme.textSecondary,
        }; // Gris
      default:
        return { bgcolor: theme.card, color: theme.textMain };
    }
  };

  const colors = getColors();

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: colors.bgcolor,
        color: colors.color,
        fontWeight: 600,
        fontSize: "0.7rem",
        px: 1,
        borderRadius: 2,
      }}
    />
  );
};

// --- COMPOSANT PRINCIPAL : Page de Gestion des Compétitions ---
export default function CompetitionManager() {
  const [activeComp, setActiveComp] = useState({});
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingEvenements, setLoadingEvenements] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evenements, setEvenements] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const { auth } = UseAuth();
  const arbitre =
    auth?.role?.includes("arbitre_league") ||
    auth?.role?.includes("admin_league");

  //auh
  // Récupération l'evenement actif (celui avec statut "ouverte" ou "en_cours")
  const getEventActive = useCallback(async () => {
    setLoadingActive(true);
    try {
      const response = await Instance.get("/api/evenements/getEventActive");
      console.log("activeComp", response);
      setActiveComp(response.data || []);
    } catch (error) {
      console.log(error);
      setActiveComp({});
    } finally {
      setLoadingActive(false);
    }
  }, []);

  useEffect(() => {
    getEventActive();
  }, [getEventActive]);

  // Récupération des compétitions
  const getEvenements = useCallback(async () => {
    setLoadingEvenements(true);
    try {
      const response = await Instance.get(`/api/evenements/evenements`);
      console.log(response);
      setEvenements(response.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingEvenements(false);
    }
  }, []);

  useEffect(() => {
    getEvenements();
  }, [getEvenements]);

  const handleStatusChange = async (id, action) => {
    setSubmitting(true);
    setSuccess("");
    setError({});
    try {
      // Action peut être 'ouvrir' ou 'cloturer'
      const response = await Instance.post(`api/evenements/${action}/${id}`);
      setActiveComp(response.data);
      if (response.data.success) setSuccess(response.data.message);
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      console.log(response);
      getEvenements();
      getEventActive();
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const totalInscriptions =
    activeComp?.competitions?.reduce(
      (sum, comp) => sum + (comp.inscriptions_count || 0),
      0,
    ) ?? 0;
  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bg, minHeight: "100vh" }}>
      {/* --- BOUTONS D'ACTION SUPÉRIEURS --- */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          sx={{
            color: "#fff",
            borderColor: "rgba(255,255,255,0.2)",
            textTransform: "none",
            px: 3,
            borderRadius: 2,
          }}
          onClick={handleOpen}
        >
          + Créer compétition
        </Button>
      </Stack>

      {/* --- BLOC ÉVÉNEMENT PRINCIPAL (Featured Competition) --- */}

      {loadingActive ? (
        // spinner
        <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        activeComp?.id && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              bgcolor: theme.paper,
              borderRadius: 4,
              mb: 4,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ color: theme.textMain, fontWeight: 600, mb: 3 }}
            >
              {activeComp.nom} — {activeComp.lieu}
            </Typography>

            <Stack
              direction="row"
              spacing={2}
              sx={{ mb: 4, overflowX: "auto", pb: 1 }}
            >
              <InfoCard title="Lieu" value={activeComp.lieu} />
              <InfoCard
                title="Taux d'inscription"
                value={`${totalInscriptions} / 40`}
                color={theme.success}
              />
              <StatusBadge
                label={activeComp.statut}
                type={activeComp.statut}
              />{" "}
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                disabled={submitting}
                variant="outlined"
                color="warning"
                onClick={() => handleStatusChange(activeComp.id, "cloturer")}
              >
                {submitting ? "Clotur..." : "Clôturer les inscriptions"}
              </Button>
            </Stack>
          </Paper>
        )
      )}
      {/* --- TABLEAU DE TOUTES LES COMPÉTITIONS --- */}

      <EvenementsTable
        handleStatusChange={handleStatusChange}
        evenements={evenements}
        loading={loadingEvenements}
        submitting={submitting}
        success={success}
        errors={error}
        auth={auth}
        arbitre={arbitre}
      />
      <CreateEvenement
        open={open}
        handleClose={handleClose}
        getEvenements={getEvenements}
      />
    </Box>
  );
}
