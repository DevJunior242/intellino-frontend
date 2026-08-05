import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Modal,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  IconButton,
  Skeleton,
  Fade,
  Tooltip,
  ListItemButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import NotesProgress from "./NotesProgress";
import {
  AddCircle,
  Chair,
  Logout,
  PersonAdd,
  Star,
  CheckCircle,
  Warning,
  Close,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { Instance } from "../../../../Api/Axios";
import ProchainAthlete from "./ProchainAthlete";
import useCompetitionTheme from "./useCompetitionTheme";
import DuelKataEnCours from "./DuelKataEnCours";
import BracketViewer from "./BracketViewer";
import VainqueurOverlay from "./VainqueurOverlay";
import echo from "../../../../echo";

const AthleteCard = ({ enCours, config, notes }) => {
  const T = useCompetitionTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 8, sm: 10 },
        mb: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(T.accent, 0.08)} 0%, ${alpha(T.accent, 0.03)} 100%)`,
        border: "1px solid",
        borderColor: alpha(T.accent, 0.25),
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Décoration */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(T.accent, 0.05),
        }}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={1}
        mt={-6}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: T.success,
                animation: "blink 1.5s ease-in-out infinite",
                "@keyframes blink": {
                  "0%,100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: T.success,
                fontWeight: 700,
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              Passage en cours
            </Typography>
          </Stack>

          <Typography variant="h6" fontWeight="bold">
            {enCours?.inscription?.athlete?.fullname ?? "—"}{" "}
          </Typography>

          {/* ✅ Affichage des détails (passage, catégorie, sexe) */}
          <Typography
            variant="body2"
            sx={{
              color: T.textMuted,
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              mt: 1,
            }}
          >
            Passage N°{enCours?.ordre ?? "—"} ·{" "}
            {enCours?.inscription?.competition?.category?.nom ?? "—"} (
            {enCours?.inscription?.competition?.category?.sexe ?? "—"})
          </Typography>
        </Box>

        {/* ✅ Chip pour les notes */}
        <Chip
          label={`${notes.length}/${config?.juges_option} notes`}
          color={notes.length === config?.juges_option ? "success" : "warning"}
          size="small"
          sx={{ fontWeight: 700, flexShrink: 0 }}
        />
      </Stack>
    </Paper>
  );
};
// ─── Carte arbitre ────────────────────────────────────────────────────────────
const ArbitreItem = ({
  arbitre,
  config,
  loadingAction,
  posteAction,
  onDesignerSuperviseur,
  onRetirerSuperviseur,
  onLibérerPoste,
  onOuvrirMenuPostes,
}) => {
  const T = useCompetitionTheme();
  const aUnPoste = arbitre.poste !== null;
  const isLoadingChef =
    loadingAction?.id === arbitre.arbitre_competition_id &&
    loadingAction?.type === "chef";
  const isLoadingPoste =
    posteAction?.id === arbitre.id && posteAction?.type === "poste";
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: arbitre.est_superviseur
          ? alpha(T.warning, 0.06)
          : T.surfaceHigh,
        border: "1px solid",
        borderColor: arbitre.est_superviseur
          ? alpha(T.warning, 0.2)
          : T.border,
        transition: "border-color 0.2s",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={1}
        flexWrap="wrap"
      >
        {/* Infos arbitre */}
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          sx={{ minWidth: 0, flex: 1 }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: arbitre.est_superviseur
                ? alpha(T.warning, 0.15)
                : T.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                color: arbitre.est_superviseur ? T.warning : T.textMuted,
                fontSize: "0.7rem",
              }}
            >
              {arbitre.nom?.charAt(0)?.toUpperCase()}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: T.text }}
              noWrap
            >
              {arbitre.nom}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: arbitre.est_superviseur ? T.warning : T.textMuted,
                fontSize: "0.65rem",
              }}
            >
              {arbitre.est_superviseur ? "⭐ Superviseur" : "Arbitre"}
            </Typography>
          </Box>
        </Stack>

        {/* Actions */}
        <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
          {aUnPoste ? (
            <>
              <Chip
                label={`Juge ${arbitre.poste}`}
                color="primary"
                size="small"
                sx={{ fontWeight: "bold", height: 22, fontSize: "0.65rem" }}
              />
              <Tooltip title="Remettre au banc">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onLibérerPoste(arbitre.id)}
                  sx={{ width: 26, height: 26 }}
                  disabled={isLoadingPoste}
                >
                  {isLoadingPoste ? (
                    <CircularProgress size={10} />
                  ) : (
                    <Logout sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.65rem" }}
              >
                Au banc
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Chair sx={{ fontSize: "0.7rem !important" }} />}
                onClick={(e) => onOuvrirMenuPostes(e, arbitre)}
                sx={{
                  fontSize: "0.65rem",
                  py: 0.3,
                  px: 1,
                  height: 26,
                  borderColor: T.border,
                  color: T.textMuted,
                  minWidth: "auto",
                }}
                disabled={isLoadingPoste}
              >
                {isLoadingPoste ? <CircularProgress size={10} /> : "Poste"}
              </Button>
            </>
          )}
          {!arbitre.est_superviseur && (
            <Tooltip title="Désigner superviseur">
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  onDesignerSuperviseur(
                    config.id,
                    arbitre.arbitre_competition_id,
                  )
                }
                sx={{
                  fontSize: "0.65rem",
                  py: 0.3,
                  px: 1,
                  height: 26,
                  borderColor: T.border,
                  color: T.textMuted,
                  minWidth: "auto",
                }}
                disabled={isLoadingChef}
                startIcon={
                  isLoadingChef ? (
                    <CircularProgress size={10} />
                  ) : (
                    <Star sx={{ fontSize: "0.7rem !important" }} />
                  )
                }
              >
                {isLoadingChef ? "..." : "Chef"}{" "}
              </Button>
            </Tooltip>
          )}
          {arbitre.est_superviseur && (
            <Tooltip title="Retirer le rôle de superviseur">
              <IconButton
                size="small"
                color="warning"
                onClick={() =>
                  onRetirerSuperviseur(
                    config.id,
                    arbitre.arbitre_competition_id,
                  )
                }
                sx={{ width: 26, height: 26 }}
                disabled={isLoadingChef}
              >
                {isLoadingChef ? (
                  <CircularProgress size={10} />
                ) : (
                  <Close sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
};

// ─── Modal arbitres disponibles ───────────────────────────────────────────────
const ModalArbitresDispos = ({ open, onClose, arbitresDispos, onAssigner }) => (
  <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92vw", sm: 400 },
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          p: 3,
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 700, fontSize: "1rem" }}
          >
            Arbitres disponibles
          </Typography>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "text.secondary" }}
          >
            ✕
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <List sx={{ overflow: "auto", flex: 1 }}>
          {arbitresDispos.length > 0 ? (
            arbitresDispos.map((arb) => (
              <ListItem disablePadding sx={{ mb: 1 }} key={arb.id}>
                <ListItemButton
                  onClick={() => onAssigner(arb.id)}
                  sx={{
                    borderRadius: 2,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: "divider",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      {arb.user?.fullname?.charAt(0)?.toUpperCase()}
                    </Typography>
                  </Box>

                  <ListItemText
                    primary={arb.user?.fullname || "Nom inconnu"}
                    secondary={arb.grade || "Arbitre Officiel"}
                    primaryTypographyProps={{
                      color: "text.primary",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                    }}
                    secondaryTypographyProps={{
                      color: "text.secondary",
                      fontSize: "0.72rem",
                    }}
                  />

                  <AddCircle sx={{ color: "primary.main", fontSize: 20 }} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                Aucun arbitre disponible pour cet événement.
              </Typography>
            </Box>
          )}
        </List>
    </Box>
  </Modal>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SeanceAdminPanelKata({
  config,
  data,
  handleLaunchSeance,
  handleValider,
  loadingAction,
  handleDesignerSuperviseur,
  handleRetirerSuperviseur,
  success,
  errors,
  submitId,
  onRefresh,
  onValidated,
}) {
  const T = useCompetitionTheme();
  const [openModal, setOpenModal] = useState(false);
  const [arbitresDispos, setArbitresDispos] = useState([]);
  const [loadingArbitres, setLoadingArbitres] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [arbitreEnCours, setArbitreEnCours] = useState(null);
  const [notes, setNotes] = useState([]);
  const [posteAction, setPostAction] = useState(null);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { enCours, arbitres, superviseur, nextAthlete } = data;

  const isValidated = config.est_valide;
  const actifs = useMemo(
    () => arbitres?.filter((a) => a.actif) ?? [],
    [arbitres],
  );

  // Combat du duel en cours (Aka/Ao) — pour le tableau/vainqueur, distinct de
  // `enCours` (l'OrdrePassage d'un seul camp que le juge est en train de noter).
  const [combat, setCombat] = useState(null);
  const fetchCombat = useCallback(async () => {
    if (!config?.id || !isValidated) return;
    try {
      const res = await Instance.get(
        `/api/public/configs/${config.id}/combat-en-cours`,
      );
      setCombat(res.data?.combat || null);
    } catch (err) {
      console.error(err);
    }
  }, [config?.id, isValidated]);

  useEffect(() => {
    fetchCombat();
  }, [fetchCombat]);

  useEffect(() => {
    if (!config?.id) return;
    const channel = echo.channel(`tatami.${config.id}`);
    const handler = () => fetchCombat();
    channel.listen(".tatami.updated", handler);
    return () => channel.stopListening(".tatami.updated", handler);
  }, [config?.id, fetchCombat]);

  const handleLocalValider = async (id) => {
    if (!id) return;
    setLocalSubmitting(true);
    try {
      await Instance.post(`/api/seances/configs/${id}/valider`);
      setLocalError(null);
      onValidated?.();
      onRefresh?.();
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.error === "missing_kumite_format") {
        setAvailableFormats(errData.formats || []);
        setFormatModalOpen(true);
      } else {
        const msg =
          errData?.problemes || errData?.message || "Une erreur est survenue.";
        setLocalError(msg);
      }
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleConfirmFormat = async () => {
    if (!selectedFormat || !config?.id) return;
    setLocalSubmitting(true);
    try {
      await Instance.post(`/api/seances/configs/${config.id}/valider`, {
        kumite_format_id: selectedFormat,
      });
      setFormatModalOpen(false);
      setSelectedFormat(null);
      setLocalError(null);
      onValidated?.();
      onRefresh?.();
    } catch (err) {
      const errData = err.response?.data;
      const msg =
        errData?.problemes || errData?.message || "Erreur lors de la validation";
      setLocalError(msg);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const chargerArbitresDispos = async () => {
    if (!config?.evenement_id) return;
    setLoadingArbitres(true);
    try {
      const res = await Instance.get(
        `/api/arbitres/disponibles/${config.evenement_id}`,
      );
      console.log("arbitres dispononibles", res.data);
      setArbitresDispos(res.data);
      setOpenModal(true);
    } catch (error) {
      console.error("Erreur chargement arbitres", error);
    } finally {
      setLoadingArbitres(false);
    }
  };

  const assignerArbitre = async (arbitreCompId) => {
    try {
      const res = await Instance.post(`/api/rotation-arbitres`, {
        config_notation_id: config.id,
        arbitre_competition_id: arbitreCompId,
      });
    } catch (error) {
      console.log(error);
    }

    //setOpenModal(false);
    onRefresh();
    chargerArbitresDispos();
  };

  const handleOuvrirMenuPostes = (event, arbitre) => {
    setAnchorEl(event.currentTarget);
    setArbitreEnCours(arbitre);
  };

  const handleAssignerPoste = async (rotationId, numeroPoste) => {
    if (!rotationId || !numeroPoste) return;
    setPostAction({ id: rotationId, type: "poste" });
    try {
      const response = await Instance.patch(`/api/rotation-arbitres/update`, {
        rotation_id: rotationId,
        poste: numeroPoste,
      });
      if (response.data.success) onRefresh();
    } catch (error) {
      alert(error.response?.data?.message || "Erreur lors de l'assignation");
    } finally {
      setPostAction(null);
    }
  };

  const handleLibérerPoste = async (rotationId) => {
    setPostAction({ id: rotationId, type: "poste" });
    try {
      await Instance.patch(`/api/rotation-arbitres/assigner`, {
        rotation_id: rotationId,
        poste: null,
      });
      onRefresh();
    } catch (error) {
      console.error(error);
    } finally {
      setPostAction(null);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "divider", borderRadius: 2 },
      }}
    >
      {/* ── Header ── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        gap={1.5}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="text.primary"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {config.evenement_nom}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {config?.plateau_nom ?? "Tatami"}
          </Typography>
          <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
            <Chip
              label={config?.mode_saisie ?? "—"}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
            <Chip
              label={`${config?.juges_option} juges`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
            <Chip
              label={isValidated ? "● Actif" : "○ En attente"}
              size="small"
              color={isValidated ? "success" : "default"}
              sx={{ height: 20, fontSize: "0.65rem" }}
            />
          </Stack>
        </Box>

        {/* Superviseur badge */}
        {superviseur ? (
          <Alert
            severity="warning"
            icon={<Star fontSize="small" />}
            sx={{
              borderRadius: 2,
              py: 0.5,
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            <strong>Superviseur :</strong> {superviseur?.nom}
          </Alert>
        ) : (
          <Alert
            severity="error"
            icon={<Warning fontSize="small" />}
            sx={{
              borderRadius: 2,
              py: 0.5,
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            Aucun superviseur
          </Alert>
        )}
      </Stack>

      {/* ── Messages ── */}
      {success[config.id] && (
        <Fade in>
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
            {success[config.id]}
          </Alert>
        </Fade>
      )}
      {errors[config.id]?.length > 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {Array.isArray(errors[config.id]) ? (
            errors[config.id].map((err, i) => (
              <p key={i} style={{ margin: 0 }}>
                {err}
              </p>
            ))
          ) : (
            <p style={{ margin: 0 }}>{errors[config.id]}</p>
          )}
        </Alert>
      )}
      {localError && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setLocalError(null)}
        >
          {Array.isArray(localError) ? (
            localError.map((err, i) => (
              <p key={i} style={{ margin: 0 }}>
                {err}
              </p>
            ))
          ) : (
            <p style={{ margin: 0 }}>{localError}</p>
          )}
        </Alert>
      )}

      {/* ── CTA principal ── */}
      {!isValidated ? (
        <Button
          fullWidth
          variant="contained"
          disabled={submitId !== null || localSubmitting}
          onClick={() => handleLocalValider(config.id)}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", sm: "1rem" },
          }}
        >
          {submitId === config.id || localSubmitting ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress size={18} color="inherit" />
              <span>Validation en cours...</span>
            </Stack>
          ) : (
            "Valider la configuration"
          )}
        </Button>
      ) : !enCours && handleLaunchSeance ? (
        <Button
          fullWidth
          variant="contained"
          color="success"
          disabled={!superviseur}
          onClick={() => handleLaunchSeance(config.id)}
          sx={{
            mb: 3,
            py: 1.5,
            borderRadius: 3,
            fontWeight: "bold",
            fontSize: { xs: "0.85rem", sm: "1rem" },
          }}
        >
          {superviseur
            ? "▶ Lancer la séance"
            : "⚠️ Désignez un superviseur d'abord"}
        </Button>
      ) : null}

      {/* ── Athlète en cours ── */}
      {enCours ? (
        <>
          <DuelKataEnCours passage={enCours} />
          <AthleteCard enCours={enCours} config={config} notes={notes} />
          <NotesProgress
            ordrePassageId={enCours?.id ?? null}
            nbJuges={config?.juges_option}
            onNotesChange={setNotes}
            configId={config.id}
          />
        </>
      ) : (
        <Typography color="text.secondary">Aucun athlète en cours</Typography>
      )}
      <VainqueurOverlay combat={combat} onClose={fetchCombat} />
      {/* ── Prochain athlète ── */}
      <Divider sx={{ my: 2.5 }}>
        <Chip
          label={`Prochain athlète · ${nextAthlete?.inscription?.athlete?.fullname ?? "—"}`}
          size="small"
          sx={{ bgcolor: "background.paper", color: "text.secondary", fontSize: "0.65rem" }}
        />
      </Divider>
      {nextAthlete ? (
        <ProchainAthlete nextAthlete={nextAthlete} compact />
      ) : (
        <Typography color="text.secondary">Aucun athlète en attente</Typography>
      )}
      {/* ── Tableau éliminatoire ── */}
      {isValidated && (
        <>
          <Divider sx={{ my: 2.5 }}>
            <Chip
              label="Tableau"
              size="small"
              sx={{ bgcolor: "background.paper", color: "text.secondary", fontSize: "0.65rem" }}
            />
          </Divider>
          <BracketViewer configId={config.id} />
        </>
      )}
      {/* ── Arbitres ── */}
      <Divider sx={{ my: 2.5 }}>
        <Chip
          label={`Arbitres · ${Array.isArray(arbitres) ? arbitres.length : 0} affectés`}
          size="small"
          sx={{ bgcolor: "background.paper", color: "text.secondary", fontSize: "0.65rem" }}
        />
      </Divider>

      {!isValidated && arbitres.length === 0 ? (
        <Stack
          spacing={2}
          sx={{
            p: 3,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Aucun arbitre affecté au{" "}
            <strong style={{ color: T.text }}>{config?.plateau_nom}</strong>
          </Typography>
          <Button
            variant="contained"
            onClick={chargerArbitresDispos}
            sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
          >
            Assigner des arbitres
          </Button>
        </Stack>
      ) : (
        <Stack spacing={1}>
          {arbitres.map((arbitre) => (
            <ArbitreItem
              key={arbitre.id}
              arbitre={arbitre}
              config={config}
              loadingAction={loadingAction}
              posteAction={posteAction}
              onDesignerSuperviseur={handleDesignerSuperviseur}
              onRetirerSuperviseur={handleRetirerSuperviseur}
              onLibérerPoste={handleLibérerPoste}
              onOuvrirMenuPostes={handleOuvrirMenuPostes}
            />
          ))}
          <Button
            fullWidth
            variant="outlined"
            onClick={chargerArbitresDispos}
            sx={{
              mt: 1,
              borderColor: "divider",
              color: "text.secondary",
              "&:hover": { borderColor: "primary.main", color: "primary.main" },
            }}
          >
            {loadingArbitres ? "Chargement..." : "+ Ajouter un arbitre"}
          </Button>
        </Stack>
      )}

      {/* ── Menu postes ── */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            borderRadius: 2,
          },
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const estPris = arbitres?.some((a) => a.poste === num);
          return (
            <MenuItem
              key={num}
              disabled={estPris}
              onClick={() => {
                handleAssignerPoste(arbitreEnCours.id, num);
                setAnchorEl(null);
              }}
              sx={{
                fontSize: "0.82rem",
                "&:hover": { bgcolor: "action.hover" },
                color: estPris ? "text.secondary" : "text.primary",
              }}
            >
              Poste {num}{" "}
              {estPris && (
                <Chip
                  label="Occupé"
                  size="small"
                  sx={{
                    ml: 1,
                    height: 16,
                    fontSize: "0.6rem",
                    bgcolor: "divider",
                    color: "text.secondary",
                  }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>

      {/* ── Modal ── */}
      <ModalArbitresDispos
        open={openModal}
        onClose={() => setOpenModal(false)}
        arbitresDispos={arbitresDispos}
        onAssigner={assignerArbitre}
      />

      {/* ── Format tableau (poules/éliminatoire, WKF Art. 3.3.1 a/b) ── */}
      <Dialog open={formatModalOpen} onClose={() => setFormatModalOpen(false)}>
        <DialogTitle>Choisir le format du tableau</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
          >
            {availableFormats.map((f) => (
              <FormControlLabel
                key={f.id}
                value={f.id}
                control={<Radio />}
                label={f.code}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormatModalOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={!selectedFormat || localSubmitting}
            onClick={handleConfirmFormat}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
