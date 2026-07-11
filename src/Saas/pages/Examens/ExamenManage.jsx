import React, { useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  EventNote,
  Cancel,
  Person,
  Schedule,
  History,
  SettingsSuggest,
} from "@mui/icons-material";

import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import CancelExamenModal from "./CancelExamenModal";
import ReportExamenModal from "./ReportExamenModal";
import ConfigSkeleton from "../ConfigSkeleton";

function ExamenManage({ examen, fetchExamenData }) {
   const [openModal, setOpenModal] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");

  const [reportLoading, setReportLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const { activeId } = UseAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  const handleOpenReportModal = () => {
    setOpenReportModal(true);
  };
  const handleCloseReportModal = () => {
    setOpenReportModal(false);
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Couleurs dynamiques selon le statut
  const statusConfig = {
    0: { color: "primary", label: "Planifié" },
    1: { color: "warning", label: "En Cours" },
    2: { color: "success", label: "Terminé" },
    3: { color: "error", label: "Annulé" },
  };

  const currentStatus = statusConfig[examen.status] || statusConfig[0];

  //start / stop

  // Cette fonction ouvre le modal au lieu d'appeler l'API directement
  const triggerConfirm = (action) => {
    setPendingAction(action);
    setConfirmOpen(true);
  };

  const handleConfirmFinal = async (e) => {
    setConfirmSubmitting(true);
    try {
      if (pendingAction === "start") await handleStart(e);
      if (pendingAction === "stop") await handleStop(e);
    } finally {
      setConfirmSubmitting(false);
      setConfirmOpen(false);
    }
  };
  const handleStart = async (e) => {
    e.preventDefault();

    setError({});
    try {
      const response = await Instance.post(
        `/api/examens/${examen?.id}/start?organisateur_id=${activeId}`,
      );
      console.log("Réponse API après démarrage :", response.data);
      if (response.data.success) {
        fetchExamenData();
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };
  const handleStop = async (e) => {
    e.preventDefault();

    setError({});
    try {
      const response = await Instance.post(
        `/api/examens/${examen?.id}/stop?organisateur_id=${activeId}`,
      );
      // console.log(response);

      if (response.data.success) {
        fetchExamenData();
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, m: 3 }}>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
      </Box>
      <Grid container spacing={3}>
        {/* 1. ACTIONS DE PILOTAGE (Démarrer / Terminer) */}
        <Grid item xs={12} md={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              height: "100%",
              backdropFilter: "blur(5px)",
              backgroundColor: "background.default",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
              <SettingsSuggest color="primary" />
              <Typography variant="h6" fontWeight="700">
                Contrôle du Flux
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => triggerConfirm("start")}
                  sx={{ py: 2, borderRadius: 2 }}
                  disabled={examen.status !== 0 || confirmSubmitting}
                >
                  {confirmSubmitting && pendingAction === "start" ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Démarrer"
                  )}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  size="large"
                  startIcon={<Stop />}
                  onClick={() => triggerConfirm("stop")}
                  sx={{ py: 2, borderRadius: 2 }}
                  disabled={examen.status !== 1 || confirmSubmitting}
                >
                  {confirmSubmitting && pendingAction === "stop" ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Terminer"
                  )}
                </Button>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="700"
              >
                PLANIFICATION
              </Typography>
            </Divider>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<EventNote />}
                onClick={handleOpenReportModal}
                disabled={examen.status === 2 || examen.status === 3}
              >
                Reporter
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<Cancel />}
                onClick={handleOpenModal}
                disabled={examen.status === 2 || examen.status === 3}
              >
                Annuler
              </Button>
            </Stack>
          </Paper>
        </Grid>

        {/* 2. ÉTAT DU COURS & INSTRUCTEUR */}
        <Grid item xs={12} md={5}>
          <Stack spacing={2}>
            {/* Statut actuel */}
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                borderLeft: `6px solid`,
                borderColor: `${currentStatus.color}.main`,
                backdropFilter: "blur(5px)",
                backgroundColor: "background.default",
              }}
            >
              <CardContent>
                <Typography variant="overline" color="text.secondary">
                  Statut Actuel
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="800"
                    color={`${currentStatus.color}.main`}
                  >
                    {currentStatus.label}
                  </Typography>
                  <Chip
                    label={currentStatus.label}
                    size="small"
                    variant="outlined"
                    color={currentStatus.color}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Détails Instructeur */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                backdropFilter: "blur(5px)",
                backgroundColor: "background.default",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 700, display: "block", mb: 1.5 }}
              >
                INSTRUCTEUR ASSIGNÉ
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: "white",
                    borderRadius: 2,
                    display: "flex",
                  }}
                >
                  <Person color="primary" />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="700">
                    {Array.isArray(examen.club?.users) &&
                    examen.club.users.length > 0
                      ? examen.club.users[0].fullname
                      : "Non défini"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {examen.next_grade?.name}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Heures & Temps */}
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                backdropFilter: "blur(5px)",
                backgroundColor: "background.default",
              }}
            >
              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Schedule sx={{ fontSize: 14 }} /> DATE
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {examen.start_date}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Schedule sx={{ fontSize: 14 }} /> FIN
                  </Typography>
                  <Typography variant="body2" fontWeight="700">
                    {examen.end_date}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
      {/* modal */}
      <CancelExamenModal
        open={openModal}
        onClose={handleCloseModal}
        examenId={examen.id}
        fetchExamenData={fetchExamenData}
        cancelLoading={cancelLoading}
        setCancelLoading={setCancelLoading}
      />
      <ReportExamenModal
        open={openReportModal}
        onClose={handleCloseReportModal}
        examenId={examen.id}
        examen={examen}
        fetchExamenData={fetchExamenData}
        reportLoading={reportLoading}
        setReportLoading={setReportLoading}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => !confirmSubmitting && setConfirmOpen(false)}
        sx={{
          "& .MuiDialog-paper": {
            p: 3,
            borderRadius: 3,
            backgroundColor: "background.default",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {pendingAction === "start"
            ? "Démarrer l'examen ?"
            : "Terminer l'examen ?"}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {pendingAction === "start"
              ? "Le cours va être marqué comme 'En cours' et l'heure de début sera enregistrée."
              : "Attention : Terminer l'examen verrouillera les listes de présences. Cette action est irréversible."}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            disabled={confirmSubmitting}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            color={pendingAction === "start" ? "success" : "warning"}
            onClick={handleConfirmFinal}
            disabled={confirmSubmitting}
            startIcon={
              confirmSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : pendingAction === "start" ? (
                <PlayArrow />
              ) : (
                <Stop />
              )
            }
          >
            {confirmSubmitting ? "Traitement..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExamenManage;
