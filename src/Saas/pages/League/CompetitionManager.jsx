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
import ConfigSkeleton from "../ConfigSkeleton.jsx";

const theme = {
  bg: "#1a1d21",
  paper: "#212529",
  card: "#2c3035",
  textMain: "#ffffff",
  textSecondary: "#8b90a0",
  accent: "#e8c84a",
  success: "#4caf50",
  warning: "#f44336",
};

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

const StatusBadge = ({ label, type }) => {
  const getColors = () => {
    switch (type) {
      case "open":
        return { bgcolor: "rgba(76, 175, 80, 0.08)", color: "#4caf50" };
      case "close":
        return { bgcolor: theme.warning, color: "#ffffff" };
      case "done":
        return {
          bgcolor: "rgba(255,255,255,0.05)",
          color: theme.textSecondary,
        };
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

export default function CompetitionManager() {
  const [activeComp, setActiveComp] = useState({});
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingEvenements, setLoadingEvenements] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [submittingCompId, setSubmittingCompId] = useState(null);
  const [evenements, setEvenements] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const { auth, activeId, activeType, activeRole } = UseAuth();
  const arbitre = auth?.role?.includes("arbitre_league");

  const hasAccessRoles = ["admin_league"];
  const allowAccess = hasAccessRoles.includes(activeRole);

  const getEventActive = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingActive(true);
      try {
        const response = await Instance.get(
          `/api/evenements/getEventActive?organisateur_id=${activeId}&organisateur_type=${activeType}`,
        );
        setActiveComp(response.data || {});
      } catch (error) {
        console.log(error);
        setActiveComp({});
      } finally {
        if (!silent) setLoadingActive(false);
      }
    },
    [activeId, activeType],
  );

  const getEvenements = useCallback(
    async (silent = false) => {
      if (!silent) setLoadingEvenements(true);
      try {
        const response = await Instance.get(
          `/api/evenements/evenements?organisateur_id=${activeId}&organisateur_type=${activeType}`,
        );
        setEvenements(response.data || []);
      } catch (error) {
        console.log(error);
      } finally {
        if (!silent) setLoadingEvenements(false);
      }
    },
    [activeId, activeType],
  );

  useEffect(() => {
    if (!activeId) return;
    Promise.all([getEventActive(), getEvenements()]);
  }, [activeId, activeType, getEventActive, getEvenements]);

  const handleStatusChange = async (id, action) => {
    setSubmittingId(id);
    setSuccess("");
    setError({});
    try {
      const response = await Instance.post(`api/evenements/${action}/${id}`, {
        organisateur_id: activeId,
        organisateur_type: activeType,
      });
      setActiveComp(response.data);
      if (response.data.success) setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 3000);
      await Promise.all([getEvenements(true), getEventActive(true)]);
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleEpreuveStatusChange = async (id, action) => {
    setSubmittingCompId(id);
    setSuccess("");
    setError({});
    try {
      const response = await Instance.post(`api/competitions/${action}/${id}`, {
        organisateur_id: activeId,
        organisateur_type: activeType,
      });
      setActiveComp(response.data);
      if (response.data.success) setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 3000);
      await Promise.all([getEvenements(true), getEventActive(true)]);
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setSubmittingCompId(null);
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

  const STATUT_CONFIG = {
    0: { label: "Brouillon", color: "default" },
    1: { label: "En cours", color: "warning" },
    2: { label: "Terminé", color: "success" },
    brouillon: { label: "Brouillon", color: "default" },
    en_attente: { label: "En attente", color: "info" },
    en_cours: { label: "En cours", color: "warning" },
    termine: { label: "Terminé", color: "success" },
  };

  const getStatut = (status) =>
    STATUT_CONFIG[status] ?? { label: String(status), color: "default" };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.bg, minHeight: "100vh" }}>
      {allowAccess && (
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
      )}

      {loadingActive ? (
        <ConfigSkeleton />
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
                label={getStatut(activeComp.status).label}
                type={getStatut(activeComp.status).color}
              />
            </Stack>
            {allowAccess && (
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  disabled={submittingId !== null}
                  variant="outlined"
                  color="warning"
                  onClick={() => handleStatusChange(activeComp.id, "cloturer")}
                >
                  {submittingId ? "Clotur..." : "Clôturer les inscriptions"}
                </Button>
              </Stack>
            )}
          </Paper>
        )
      )}

      <EvenementsTable
        handleStatusChange={handleStatusChange}
        evenements={evenements}
        loading={loadingEvenements}
        submittingId={submittingId}
        submittingCompId={submittingCompId}
        handleEpreuveStatusChange={handleEpreuveStatusChange}
        success={success}
        errors={error}
        auth={auth}
        arbitre={arbitre}
        allAccess={allowAccess}
      />
      <CreateEvenement
        open={open}
        handleClose={handleClose}
        getEvenements={getEvenements}
      />
    </Box>
  );
}
