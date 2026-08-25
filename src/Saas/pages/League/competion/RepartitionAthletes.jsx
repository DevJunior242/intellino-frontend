import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Button,
  IconButton,
  Skeleton,
  Tooltip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import {
  SwapHoriz,
  AddCircle,
  RemoveCircle,
  PersonOff,
  CheckCircle,
  Refresh,
  PersonAddAlt1,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";
import InscriptionForm from "./InscriptionForm";

// ─── Skeleton carte athlète ───────────────────────────────────────────────────
const AthleteSkeleton = () => (
  <Stack spacing={1}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: "grey.100" }}>
        <Skeleton variant="text" width="60%" height={16} />
        <Skeleton variant="text" width="40%" height={12} />
      </Box>
    ))}
  </Stack>
);

// ─── Carte athlète non assigné ────────────────────────────────────────────────
const CarteNonAssigne = ({ inscription, configs, onAssigner, submitId }) => {
  const isLoading = submitId === inscription.id;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        gap={1}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {inscription.athlete?.fullname ?? "Inconnu"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {inscription?.organisateur?.name ?? "—"}
            {inscription?.kata ?? "_"}
          </Typography>
        </Box>

        {/* Boutons assigner vers chaque tatami */}
        <Stack
          direction="row"
          gap={0.5}
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ flexShrink: 0 }}
        >
          {configs.map((config) => (
            <Tooltip
              key={config.id}
              title={
                config.est_valide
                  ? `Tableau déjà généré sur ${config.plateau_nom} — assignation impossible`
                  : `Assigner → ${config.plateau_nom}`
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="success"
                  disabled={isLoading || config.est_valide}
                  onClick={() => onAssigner(inscription.id, config.id)}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "success.50",
                    "&:hover": { bgcolor: "success.100" },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={12} color="inherit" />
                  ) : (
                    <AddCircle sx={{ fontSize: 16 }} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Stack>
      </Stack>

      {/* Labels tatamis si plusieurs configs */}
      {configs.length > 1 && (
        <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
          {configs.map((config) => (
            <Chip
              key={config.id}
              label={config?.plateau_nom}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.6rem",
                cursor: config.est_valide ? "not-allowed" : "pointer",
                opacity: config.est_valide ? 0.5 : 1,
              }}
              onClick={() =>
                !isLoading &&
                !config.est_valide &&
                onAssigner(inscription.id, config.id)
              }
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
};

// ─── Carte athlète assigné ────────────────────────────────────────────────────
const CarteAssigne = ({ ordre, index, onRetirer, submitId }) => {
  const inscriptionId = ordre.inscription?.id;
  const isLoading = submitId === inscriptionId;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        opacity: isLoading ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        {/* Numéro de passage */}
        <Chip
          label={index + 1}
          size="small"
          color="primary"
          sx={{
            width: 28,
            height: 22,
            fontSize: "0.7rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        />

        {/* Infos athlète */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {ordre.inscription?.athlete?.fullname ?? "Inconnu"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {ordre.inscription?.organisateur?.name ?? "—"}
            {ordre.inscription?.kata ?? "_"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            noWrap
          >
            {ordre.inscription?.competition?.category?.nom ?? "—"} (
            {ordre.inscription?.competition?.category?.sexe ?? "—"})
          </Typography>
        </Box>

        {/* Bouton retirer */}
        <Tooltip title="Retirer du tatami">
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={isLoading}
              onClick={() => onRetirer(inscriptionId)}
              sx={{
                width: 28,
                height: 28,
                bgcolor: "error.50",
                "&:hover": { bgcolor: "error.100" },
                flexShrink: 0,
              }}
            >
              {isLoading ? (
                <CircularProgress size={12} color="inherit" />
              ) : (
                <RemoveCircle sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RepartitionAthletes({ competition, configs, onBack }) {
  const [groupesNonAssignes, setGroupesNonAssignes] = useState([]);
  const [parTatami, setParTatami] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState(null);
  const [erreur, setErreur] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [inscriptionOpen, setInscriptionOpen] = useState(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      try {
        const [nonAssRes, ...tatamisRes] = await Promise.all([
          Instance.get(`/api/ordre-passages/${competition}/non-assign`),
          ...configs.map((config) =>
            Instance.get(`/api/ordre-passages/${config.id}`),
          ),
        ]);

        setGroupesNonAssignes(nonAssRes.data?.groups || []);

        const newParTatami = {};
        configs.forEach((config, i) => {
          newParTatami[config.id] = tatamisRes[i]?.data || [];
        });
        setParTatami(newParTatami);
      } catch (err) {
        setErreur("Erreur lors du chargement des données");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [competition, configs],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleAssigner = async (inscriptionId, configId) => {
    //  Vérification — déjà assigné quelque part ?
    const dejaAssigne = Object.values(parTatami)
      .flat()
      .some((o) => o.inscription?.id === inscriptionId);

    if (dejaAssigne) {
      setErreur("Cet athlète est déjà assigné à un tatami.");
      return;
    }

    // Le tableau de ce tatami a déjà été généré — une nouvelle affectation
    // ne serait jamais intégrée au tableau (voir OrdrePassageController::assigner).
    const config = configs.find((c) => c.id === configId);
    if (config?.est_valide) {
      setErreur(
        `Le tableau a déjà été généré sur ${config.plateau_nom} — impossible d'y assigner un nouvel athlète.`,
      );
      return;
    }

    setSubmitId(inscriptionId);
    try {
      await Instance.post(`/api/ordre-passages/assigner`, {
        inscription_id: inscriptionId,
        config_notation_id: configId,
      });
      await fetchData(true);
      showSuccess(`Athlète assigné à ${config?.plateau_nom ?? "tatami"}`);
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur d'assignation");
    } finally {
      setSubmitId(null);
    }
  };

  const handleRetirer = async (inscriptionId) => {
    // Vérification — bien assigné ?
    const estAssigne = Object.values(parTatami)
      .flat()
      .some((o) => o.inscription?.id === inscriptionId);

    if (!estAssigne) {
      setErreur("Cet athlète n'est pas assigné.");
      return;
    }

    setSubmitId(inscriptionId);
    try {
      await Instance.delete(`/api/ordre-passages/inscription/${inscriptionId}`);
      await fetchData(true);
      showSuccess("Athlète retiré du tatami");
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors du retrait");
    } finally {
      setSubmitId(null);
    }
  };

  const handleResetAll = async () => {
    if (!window.confirm("Réinitialiser toutes les affectations ?")) return;
    setLoading(true);
    try {
      await Instance.post(`/api/ordre-passages/${competition}/reset`);
      await fetchData();
      showSuccess("Toutes les affectations ont été réinitialisées");
    } catch {
      setErreur("Erreur lors de la réinitialisation");
      setLoading(false);
    }
  };

  const totalAssignes = Object.values(parTatami).reduce(
    (sum, t) => sum + t.length,
    0,
  );
  const totalNonAssignes = groupesNonAssignes.reduce(
    (sum, g) => sum + g.inscriptions.length,
    0,
  );
  const totalAthletes = totalAssignes + totalNonAssignes;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={2}
        gap={1.5}
      >
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<SwapHoriz />}
            sx={{ borderRadius: 2 }}
          >
            Retour
          </Button>
          <Tooltip title="Rafraîchir">
            <IconButton
              size="small"
              onClick={() => fetchData()}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={16} />
              ) : (
                <Refresh fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddAlt1 />}
            onClick={() => setInscriptionOpen(true)}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Inscrire un athlète
          </Button>
        </Stack>

        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Chip
            label={`${totalAthletes} athlètes`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<CheckCircle sx={{ fontSize: 14 }} />}
            label={`${totalAssignes} assignés`}
            size="small"
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<PersonOff sx={{ fontSize: 14 }} />}
            label={`${totalNonAssignes} non assignés`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* Messages */}
      {erreur && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setErreur(null)}
        >
          {erreur}
        </Alert>
      )}
      {successMsg && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {successMsg}
          </Alert>
        </Fade>
      )}

      {/* Bouton reset */}
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={handleResetAll}
        // disabled={loading || totalAssignes === 0}
        disabled
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Réinitialiser toutes les affectations
      </Button>

      <Grid container spacing={2}>
        {/* ── Colonne Non assignés ── */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "warning.light",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <Box sx={{ p: 1.5, bgcolor: "warning.main" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight="bold" color="white" fontSize="0.9rem">
                  Non assignés
                </Typography>
                <Chip
                  label={totalNonAssignes}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              </Stack>
              {configs.length > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    mt: 0.5,
                    display: "block",
                  }}
                >
                  Cliquez sur + pour assigner au tatami souhaité
                </Typography>
              )}
            </Box>

            {/* Liste */}
            <Stack
              spacing={1}
              sx={{
                p: 1.5,
                flex: 1,
                overflowY: "auto",
                maxHeight: { xs: 300, md: "calc(100vh - 280px)" },
              }}
            >
              {loading ? (
                <AthleteSkeleton />
              ) : totalNonAssignes === 0 ? (
                <Stack alignItems="center" gap={1} py={3}>
                  <CheckCircle sx={{ color: "success.main", fontSize: 32 }} />
                  <Typography variant="body2" color="text.secondary">
                    Tous assignés ✓
                  </Typography>
                </Stack>
              ) : (
                groupesNonAssignes
                  .filter((groupe) => groupe.inscriptions.length > 0)
                  .map((groupe, i) => (
                    <Box key={groupe.label ?? i}>
                      {groupe.label && (
                        <Chip
                          label={`${groupe.label} (${groupe.inscriptions.length})`}
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ mb: 0.75, fontWeight: 700 }}
                        />
                      )}
                      <Stack spacing={1} sx={{ mb: 1 }}>
                        {groupe.inscriptions.map((inscription) => (
                          <CarteNonAssigne
                            key={inscription.id}
                            inscription={inscription}
                            configs={configs}
                            onAssigner={handleAssigner}
                            submitId={submitId}
                          />
                        ))}
                      </Stack>
                    </Box>
                  ))
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* ── Colonnes Tatamis ── */}
        {configs.map((config) => (
          <Grid item xs={12} md={4} key={config.id}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "success.light",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <Box sx={{ p: 1.5, bgcolor: "success.main" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    fontWeight="bold"
                    color="white"
                    noWrap
                    fontSize="0.9rem"
                  >
                    {config.plateau_nom}
                  </Typography>
                  <Chip
                    label={loading ? "…" : parTatami[config.id]?.length || 0}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.3)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.8)",
                    display: "block",
                    mt: 0.3,
                  }}
                >
                  {config.discipline} · {config.niveau}
                </Typography>
                {config.est_valide && (
                  <Chip
                    label="Tableau généré — assignation fermée"
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 18,
                      fontSize: "0.6rem",
                      bgcolor: "rgba(255,255,255,0.25)",
                      color: "white",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>

              {/* Liste */}
              <Stack
                spacing={1}
                sx={{
                  p: 1.5,
                  flex: 1,
                  overflowY: "auto",
                  maxHeight: { xs: 300, md: "calc(100vh - 280px)" },
                }}
              >
                {loading ? (
                  <AthleteSkeleton />
                ) : (parTatami[config.id] || []).length === 0 ? (
                  <Stack alignItems="center" gap={1} py={3}>
                    <PersonOff sx={{ color: "text.disabled", fontSize: 28 }} />
                    <Typography variant="body2" color="text.secondary">
                      Aucun athlète
                    </Typography>
                  </Stack>
                ) : (
                  (parTatami[config.id] || []).map((ordre, index) => (
                    <CarteAssigne
                      key={ordre.id}
                      ordre={ordre}
                      index={index}
                      onRetirer={handleRetirer}
                      submitId={submitId}
                    />
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={inscriptionOpen}
        onClose={() => setInscriptionOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Inscrire un athlète (arrivée tardive)</DialogTitle>
        <DialogContent dividers>
          <InscriptionForm
            competitionId={competition}
            subdiscipline="Kata"
            onSuccess={() => {
              setInscriptionOpen(false);
              showSuccess("Athlète inscrit — visible dans « Non assignés ».");
              fetchData(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
