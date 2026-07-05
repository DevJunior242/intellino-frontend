import React, { useCallback, useEffect, useState } from "react";
import { Box, Typography, Paper, Stack, Button, Chip } from "@mui/material";

import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import CreateEvenement from "./competion/CreateEvenement";
import EvenementsTable from "./competion/EvenementsTable.jsx";
import { UseAuth } from "../../../Api/AuthContext.jsx";
import ConfigSkeleton from "../ConfigSkeleton.jsx";
import EditEvenement from "./competion/EditEvenement.jsx";

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

export default function CompetitionManager() {
  const { auth, activeId, activeType, activeRole } = UseAuth();

  const [activeComp, setActiveComp] = useState({});
  const [evenements, setEvenements] = useState([]);

  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingEvenements, setLoadingEvenements] = useState(true);

  const [submittingId, setSubmittingId] = useState(null);
  const [submittingCompId, setSubmittingCompId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState({});
  const [errorEvent, setEVentError] = useState("");

  // Modale création
  const [open, setOpen] = useState(false);
  // Modale édition (composant séparé, distinct de CreateEvenement)
  const [openEditting, setOpenEditting] = useState(false);
  const [editingEvenement, setEditingEvenement] = useState(null);
  const [pagination, setPagination] = useState({});

  const arbitre = auth?.role?.includes("arbitre");
  const hasAccessRoles = ["admin"];
  const allowAccess = hasAccessRoles.includes(activeRole);

  // ── Fetchers ──────────────────────────────────────────────────────────────
  const getEventActive = useCallback(async (silent = false) => {
    if (!silent) setLoadingActive(true);
    try {
      const response = await Instance.get(`/api/evenements/getEventActive`);
      setActiveComp(response.data || {});
    } catch {
      setActiveComp({});
    } finally {
      if (!silent) setLoadingActive(false);
    }
  }, []);

  const getEvenements = useCallback(async (silent = false, page = 1) => {
    if (!silent) setLoadingEvenements(true);
    setEVentError("");
    try {
      const response = await Instance.get(
        `/api/evenements/evenements?page=${page}`,
      );
      setPagination({
        total: response.data.total,
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
      });
      setEvenements(response.data?.data || []);
      console.log("evenements", response);
    } catch {
      setEVentError("Erreur lors de la récupération des événements");
    } finally {
      if (!silent) setLoadingEvenements(false);
    }
  }, []);

  const handlePageChange = (event, newPage) => {
    getEvenements(false, newPage + 1);
  };

  useEffect(() => {
    if (!activeId) return;
    Promise.all([getEventActive(), getEvenements()]);
  }, [activeId, activeType, getEventActive, getEvenements]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, action) => {
    setSubmittingId(id);
    setSuccess("");
    setError({});
    try {
      const response = await Instance.post(`api/evenements/${action}/${id}`);
      setActiveComp(response.data);
      if (response.data.success) setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 3000);
      await Promise.all([getEvenements(true), getEventActive(true)]);
    } catch (error) {
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
      const response = await Instance.post(`api/competitions/${action}/${id}`);
      setActiveComp(response.data);
      if (response.data.success) setSuccess(response.data.message);
      setTimeout(() => setSuccess(""), 3000);
      await Promise.all([getEvenements(true), getEventActive(true)]);
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmittingCompId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError({});
    try {
      await Instance.delete(`/api/evenements/evenements/${id}`);
      setSuccess("Événement supprimé avec succès");
      setTimeout(() => setSuccess(""), 3000);
      await getEvenements(true);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setDeletingId(null);
    }
  };

  // ── Modale création ──────────────────────────────────────────────────────
  const handleOpenCreate = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // ── Modale édition ───────────────────────────────────────────────────────
  const handleOpenEdit = (evenement) => {
    setEditingEvenement(evenement);
    setOpenEditting(true);
  };

  const handleCloseEditting = () => {
    setEditingEvenement(null);
    setOpenEditting(false);
  };

  const totalInscriptions =
    activeComp?.competitions?.reduce(
      (sum, comp) => sum + (comp.inscriptions_count || 0),
      0,
    ) ?? 0;

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
            onClick={handleOpenCreate}
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
        evenements={evenements}
        loading={loadingEvenements}
        submittingId={submittingId}
        submittingCompId={submittingCompId}
        deletingId={deletingId}
        handleStatusChange={handleStatusChange}
        handleEpreuveStatusChange={handleEpreuveStatusChange}
        handleDelete={handleDelete}
        handleEdit={handleOpenEdit}
        success={success}
        errors={error}
        auth={auth}
        arbitre={arbitre}
        allAccess={allowAccess}
        pagination={pagination}
        handlePageChange={handlePageChange}
      />

      <CreateEvenement
        open={open}
        handleClose={handleClose}
        getEvenements={getEvenements}
      />

      {/* édition — composant distinct de CreateEvenement */}
      <EditEvenement
        open={openEditting}
        handleCloseEdit={handleCloseEditting}
        evenement={editingEvenement}
        getEvenements={getEvenements}
      />
    </Box>
  );
}
