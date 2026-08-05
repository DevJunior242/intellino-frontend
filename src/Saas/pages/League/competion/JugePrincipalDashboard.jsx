import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton,
  Fade,
  Badge,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Star,
  FiberManualRecord,
  Menu as MenuIcon,
  Close as CloseIcon,
  Schedule,
  OpenInNew,
  SwapHoriz,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";
import { Link } from "react-router-dom";
import RepartitionAthletes from "./RepartitionAthletes";
import SeanceAdminPanelKata from "./SeanceAdminPanelKata";
import echo from "../../../../echo";
import SeanceAdminPanelKumite from "./SeanceAdminPanelKumite";

// ─── Skeleton sidebar ─────────────────────────────────────────────────────────
const SidebarSkeleton = () => {
  const theme = useTheme();

  return (
    <Stack spacing={1.5} sx={{ p: 1 }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{ p: 2, borderRadius: 3, bgcolor: theme.palette.background.paper }}
        >
          <Skeleton
            variant="text"
            width="70%"
            sx={{ bgcolor: theme.palette.action.hover, mb: 1 }}
          />
          <Skeleton
            variant="text"
            width="50%"
            sx={{ bgcolor: theme.palette.action.hover, mb: 1 }}
          />
          <Skeleton
            variant="rectangular"
            height={20}
            sx={{ bgcolor: theme.palette.action.hover, borderRadius: 1 }}
          />
        </Box>
      ))}
    </Stack>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatHeure = (dt) =>
  dt
    ? new Date(dt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatDateCourte = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";

// ─── ConfigCard ───────────────────────────────────────────────────────────────

const ConfigCard = ({
  config,
  estSelecte,
  data,
  onClick,
  onShowRepartition,
}) => {
  const theme = useTheme();
  const isKumite = config.subDiscipline?.toLowerCase() === "kumite";
  const lienPublic = isKumite
    ? `${window.location.origin}/public/tatami/${config.id}/kumite`
    : `${window.location.origin}/public/tatami/${config.id}`;
  const enCours = data?.enCours;

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: "pointer",
        bgcolor: estSelecte ? alpha(theme.palette.primary.main, 0.12) : theme.palette.background.paper,
        border: "1.5px solid",
        borderColor: estSelecte ? theme.palette.primary.main : theme.palette.divider,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: estSelecte ? theme.palette.primary.main : theme.palette.action.hover,
          bgcolor: estSelecte ? alpha(theme.palette.primary.main, 0.15) : theme.palette.action.hover,
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
        {formatDateCourte(config?.date_debut)} ·
        {formatHeure(config?.heure_debut_prevu)}
      </Typography>
      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexWrap="wrap"
        gap={0.5}
      >
        <Chip
          label={config.subDiscipline}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.62rem",
            bgcolor: isKumite ? alpha(theme.palette.error.main, 0.2) : alpha(theme.palette.success.main, 0.2),
            color: isKumite ? theme.palette.error.main : theme.palette.success.main,
            fontWeight: 700,
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: theme.palette.text.secondary, fontSize: "0.62rem" }}
        >
          {isKumite ? config.format : `${config.juges_option || "N/A"} juges`}
        </Typography>
        {enCours && (
          <Chip
            label="● EN VIE"
            size="small"
            sx={{
              height: 16,
              fontSize: "0.58rem",
              bgcolor: alpha(theme.palette.success.main, 0.2),
              color: theme.palette.success.main,
              fontWeight: 700,
            }}
          />
        )}

        {/* Bouton pour voir la répartition */}
        <Chip
          label="Voir répartition"
          size="small"
          icon={<SwapHoriz sx={{ fontSize: "0.7rem !important" }} />}
          onClick={(e) => {
            e.stopPropagation();
            onShowRepartition(config.id);
          }}
          sx={{
            mt: 1,
            fontSize: "0.62rem",
            height: 20,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
          }}
        />
        <Typography variant="body2" fontWeight="bold" color={theme.palette.text.primary} noWrap>
          {config.plateau_nom}
        </Typography>
      </Stack>

      <Link
        to={lienPublic}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        style={{ textDecoration: "none" }}
      >
        <Chip
          label="Vue publique"
          icon={<OpenInNew sx={{ fontSize: "0.7rem !important" }} />}
          size="small"
          variant="outlined"
          sx={{
            mt: 1,
            fontSize: "0.62rem",
            height: 20,
            borderColor: theme.palette.divider,
            color: theme.palette.text.secondary,
            "&:hover": { borderColor: theme.palette.primary.main, color: theme.palette.primary.main },
          }}
        />
      </Link>
    </Paper>
  );
};
// ─── SidebarContent ───────────────────────────────────────────────────────────
const SidebarContent = ({
  configs,
  tatamiData,
  configSelectee,
  choisirConfig,
  loadingInitial,
  onClose,
  isMobile,
  onShowRepartition,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.warning.main,
          color: theme.palette.getContrastText(theme.palette.warning.main),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Star fontSize="small" />
          <Typography fontWeight="bold" fontSize="0.85rem">
            JUGE PRINCIPAL
          </Typography>
        </Stack>
        {isMobile && (
          <IconButton size="small" onClick={onClose} sx={{ color: theme.palette.getContrastText(theme.palette.warning.main) }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.default,
          borderBottom: "1px solid",
          borderColor: theme.palette.divider,
          flexShrink: 0,
        }}
      >
        <Stack direction="row" gap={1}>
          <Chip
            label={`${configs.length} plateau${configs.length > 1 ? "x" : ""}`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              bgcolor: theme.palette.action.hover,
              color: theme.palette.text.secondary,
            }}
          />
          <Chip
            label={`${configs.filter((c) => c.est_valide).length} actifs`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.65rem",
              bgcolor: alpha(theme.palette.success.main, 0.16),
              color: theme.palette.success.main,
            }}
          />
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: theme.palette.divider, borderRadius: 2 },
        }}
      >
        {loadingInitial ? (
          <SidebarSkeleton />
        ) : (
          <Stack spacing={1.5}>
            {configs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                estSelecte={configSelectee?.id === config.id}
                data={tatamiData[config.id]}
                onClick={() => {
                  choisirConfig(config);
                  if (isMobile && onClose) onClose();
                }}
                onShowRepartition={onShowRepartition}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JugePrincipalDashboard({ configs }) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState({});
  const [submitId, setSubmitId] = useState(null);
  const [tatamiData, setTatamiData] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingActif, setLoadingActif] = useState(false);
  const [polling, setPolling] = useState(false);
  const [configSelectee, setConfigSelectee] = useState(null);
  const [showRepartition, setShowRepartition] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const configSelecteeRef = useRef(null);
  const isFirstLoad = useRef(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const choisirConfig = (config) => {
    configSelecteeRef.current = config;
    setConfigSelectee(config);
  };

  const fetchTousLesTatamis = useCallback(async () => {
    setLoadingInitial(true);
    setIsDataReady(false);

    const results = {};
    await Promise.all(
      configs.map(async (config) => {
        try {
          const [enCoursRes, arbitresRes, nextAthleteRes] = await Promise.all([
            Instance.get(`/api/seances/competition/${config.id}/en-cours`),
            Instance.get(`/api/seances/configs/${config.id}/arbitres-rotation`),
            Instance.get(`/api/configs/${config.id}/next-athlete`),
          ]);

          const enCoursData =
            enCoursRes.data?.enCours || enCoursRes.data || null;
          const nextAthleteData =
            nextAthleteRes.data?.prochain || nextAthleteRes.data || null;

          results[config.id] = {
            enCours: enCoursData,
            arbitres: arbitresRes.data?.arbitres || [],
            superviseur: arbitresRes.data?.superviseur || null,
            nextAthlete: nextAthleteData,
          };
        } catch (error) {
          results[config.id] = {
            enCours: null,
            arbitres: [],
            superviseur: null,
            nextAthlete: null,
          };
        }
      }),
    );

    setTatamiData(results);
    setIsDataReady(true);
    setLoadingInitial(false);

    //  Sélectionner la config uniquement si les données sont prêtes
    if (!configSelecteeRef.current && configs.length > 0) {
      const premier =
        configs.find((c) => {
          return (
            results[c.id]?.enCours !== null && results[c.id]?.enCours !== ""
          );
        }) ||
        configs.find((c) => c.est_valide) ||
        configs[0];

      isFirstLoad.current = true;
      choisirConfig(premier);
    }
  }, [configs]);

  //  fetchTatamiActif
  const fetchTatamiActif = useCallback(async (configId, silent = false) => {
    if (!silent) setLoadingActif(true);
    else setPolling(true);

    try {
      const [enCoursRes, arbitresRes, nextAthleteRes] = await Promise.all([
        Instance.get(`/api/seances/competition/${configId}/en-cours`),
        Instance.get(`/api/seances/configs/${configId}/arbitres-rotation`),
        Instance.get(`/api/configs/${configId}/next-athlete`),
      ]);

      //  Normaliser la réponse pour enCours
      const enCoursData = enCoursRes.data?.enCours || enCoursRes.data || null;
      const nextAthleteData =
        nextAthleteRes.data?.prochain || nextAthleteRes.data || null;

      setTatamiData((prev) => ({
        ...prev,
        [configId]: {
          enCours: enCoursData,
          arbitres: arbitresRes.data?.arbitres || [],
          superviseur: arbitresRes.data?.superviseur || null,
          nextAthlete: nextAthleteData,
        },
      }));
    } catch (e) {
      console.log("Erreur:", e);
    } finally {
      if (!silent) setLoadingActif(false);
      else setPolling(false);
    }
  }, []);

  //  Premier chargement
  useEffect(() => {
    if (configs.length > 0) fetchTousLesTatamis();
  }, [configs, fetchTousLesTatamis]);

  // Switch de tatami
  useEffect(() => {
    if (!configSelectee?.id) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchTatamiActif(configSelectee.id, false);
  }, [configSelectee?.id, fetchTatamiActif]);

  useEffect(() => {
    if (!configSelectee?.id) return;

    const channel = echo.channel(`tatami.${configSelectee.id}`);

    channel.listen(".tatami.updated", () => {
      fetchTatamiActif(configSelectee.id, true);
    });

    return () => {
      echo.leaveChannel(`tatami.${configSelectee.id}`);
    };
  }, [configSelectee?.id, fetchTatamiActif]);

  // const handleValider
  const handleValider = async (configId) => {
    setSubmitId(configId);
    setSuccess((prev) => ({ ...prev, [configId]: null }));
    setError((prev) => ({ ...prev, [configId]: [] }));
    try {
      await Instance.post(`/api/seances/configs/${configId}/valider`);
      setSubmitId(null);

      // Mettre à jour configSelectee localement
      setConfigSelectee((prev) => ({ ...prev, est_valide: true }));
      configSelecteeRef.current = {
        ...configSelecteeRef.current,
        est_valide: true,
      };

      // Refresh le tatami actif pour les autres données
      await fetchTatamiActif(configId, true);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.problemes ||
        err.response?.data?.message || ["Une erreur est survenue."];
      setError((prev) => ({ ...prev, [configId]: msg }));
      setSubmitId(null);
    }
  };

  const handleDesignerSuperviseur = async (configId, arbitreCompetitionId) => {
    setLoadingAction({ id: arbitreCompetitionId, type: "chef" });
    try {
      const dataSend = {
        config_notation_id: configId,
        arbitre_competition_id: arbitreCompetitionId,
      };
      await Instance.patch(
        `/api/rotation-arbitres/${configId}/superviseur`,
        dataSend,
      );
      fetchTatamiActif(configId, true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingAction(null);
    }
  };
  const handleRetirerSuperviseur = async (configId, arbitreCompetitionId) => {
    setLoadingAction({ id: arbitreCompetitionId, type: "chef" });
    try {
      const dataSend = {
        config_notation_id: configId,
        arbitre_competition_id: arbitreCompetitionId,
      };
      await Instance.patch(
        `/api/rotation-arbitres/${configId}/superviseur/retirer`,
        dataSend,
      );
      fetchTatamiActif(configId, true);
    } catch (e) {
      console.log(e);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleShowRepartition = (configId) => {
    const config = configs.find((c) => c.id === configId);
    if (config) {
      setConfigSelectee(config);
      setShowRepartition(true);
    }
  };
  const renderRightPanel = () => {
    if (!configSelectee || !tatamiData[configSelectee.id]) return null;
    const dataActive = tatamiData[configSelectee.id];
    const isKumite = configSelectee.subDiscipline?.toLowerCase() === "kumite";
    console.log("RenderRightPanel", { configSelectee, dataActive, isKumite });

    if (showRepartition) {
      return (
        <RepartitionAthletes
          competition={configSelectee.competition_id}
          configs={[configSelectee]}
          onBack={() => setShowRepartition(false)}
        />
      );
    }

    if (isKumite) {
      return (
        <SeanceAdminPanelKumite
          config={configSelectee}
          data={dataActive}
          handleValider={handleValider}
          handleDesignerSuperviseur={handleDesignerSuperviseur}
          handleRetirerSuperviseur={handleRetirerSuperviseur}
          success={success}
          errors={error}
          submitId={submitId}
          onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
          onValidated={() => {
            setConfigSelectee((prev) =>
              prev ? { ...prev, est_valide: true } : prev,
            );
            configSelecteeRef.current = configSelecteeRef.current
              ? { ...configSelecteeRef.current, est_valide: true }
              : configSelecteeRef.current;
          }}
          onShowRepartition={() => setShowRepartition(false)}
        />
      );
    }
    return (
      <SeanceAdminPanelKata
        config={configSelectee}
        data={dataActive}
        loadingAction={loadingAction}
        handleValider={handleValider}
        handleDesignerSuperviseur={handleDesignerSuperviseur}
        handleRetirerSuperviseur={handleRetirerSuperviseur}
        success={success}
        errors={error}
        submitId={submitId}
        onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
        onValidated={() => {
          setConfigSelectee((prev) =>
            prev ? { ...prev, est_valide: true } : prev,
          );
          configSelecteeRef.current = configSelecteeRef.current
            ? { ...configSelecteeRef.current, est_valide: true }
            : configSelecteeRef.current;
        }}
        onShowRepartition={() => setShowRepartition(false)}
      />
    );
  };

  console.log("Render JugePrincipalDashboard", {
    configSelectee,
    data: tatamiData[configSelectee?.id],
  });

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: muiTheme.palette.background.default,
        color: muiTheme.palette.text.primary,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {polling && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 2,
          }}
        >
          <Box
            sx={{
              height: "100%",
              bgcolor: muiTheme.palette.warning.main,
              animation: "pollingBar 1s ease-in-out infinite",
              "@keyframes pollingBar": {
                "0%,100%": { opacity: 0.4 },
                "50%": { opacity: 1 },
              },
            }}
          />
        </Box>
      )}

      {!isMobile && (
        <Box
          sx={{
            width: 270,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <SidebarContent
            configs={configs}
            tatamiData={tatamiData}
            configSelectee={configSelectee}
            choisirConfig={choisirConfig}
            loadingInitial={loadingInitial}
            isMobile={false}
            onShowRepartition={handleShowRepartition}
          />
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 280,
              bgcolor: muiTheme.palette.background.default,
              borderRight: "1px solid",
              borderColor: muiTheme.palette.divider,
            },
          }}
        >
          <SidebarContent
            configs={configs}
            tatamiData={tatamiData}
            configSelectee={configSelectee}
            choisirConfig={choisirConfig}
            loadingInitial={loadingInitial}
            isMobile={true}
            onClose={() => setDrawerOpen(false)}
            onShowRepartition={handleShowRepartition}
          />
        </Drawer>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: muiTheme.palette.background.paper,
              borderBottom: "1px solid",
              borderColor: muiTheme.palette.divider,
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: muiTheme.palette.warning.main, bgcolor: alpha(muiTheme.palette.warning.main, 0.1), borderRadius: 2 }}
            >
              <Badge
                badgeContent={configs.filter((c) => c.est_valide).length}
                color="success"
                max={9}
              >
                <MenuIcon fontSize="small" />
              </Badge>
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {configSelectee ? (
                <>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={muiTheme.palette.text.primary}
                    noWrap
                  >
                    {configSelectee.plateau_nom}
                  </Typography>
                  <Typography variant="caption" sx={{ color: muiTheme.palette.text.secondary }}>
                    {configSelectee.subDiscipline} ·{" "}
                    {formatHeure(configSelectee?.heure_debut_prevu)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: muiTheme.palette.text.secondary }}>
                  Choisir un plateau
                </Typography>
              )}
            </Box>
            {configSelectee && (
              <FiberManualRecord
                sx={{
                  fontSize: 10,
                  color: configSelectee.est_valide ? muiTheme.palette.success.main : muiTheme.palette.text.secondary,
                }}
              />
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loadingInitial ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: muiTheme.palette.warning.main }} />
              <Typography variant="body2" sx={{ color: muiTheme.palette.text.secondary }}>
                Chargement des plateaux...
              </Typography>
            </Box>
          ) : loadingActif ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: muiTheme.palette.primary.main }} size={32} />
              <Typography variant="body2" sx={{ color: muiTheme.palette.text.secondary }}>
                Chargement de{" "}
                <strong style={{ color: muiTheme.palette.text.primary }}>
                  {configSelectee?.plateau_nom}
                </strong>
                ...
              </Typography>
            </Box>
          ) : configSelectee ? (
            <Fade in key={configSelectee.id} timeout={300}>
              <Box sx={{ height: "100%" }}>{renderRightPanel()}</Box>
            </Fade>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                p: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star sx={{ color: "warning.main", fontSize: 32 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ color: muiTheme.palette.text.primary, fontWeight: 600, textAlign: "center" }}
              >
                Sélectionnez un plateau
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: muiTheme.palette.text.secondary, textAlign: "center", maxWidth: 280 }}
              >
                {isMobile
                  ? "Appuyez sur le menu pour voir les plateaux disponibles"
                  : "Choisissez un plateau dans la liste à gauche pour gérer la séance"}
              </Typography>
              {isMobile && (
                <Box
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    mt: 1,
                    px: 3,
                    py: 1.5,
                    bgcolor: muiTheme.palette.warning.main,
                    color: muiTheme.palette.getContrastText(muiTheme.palette.warning.main),
                    borderRadius: 3,
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Voir les plateaux
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
