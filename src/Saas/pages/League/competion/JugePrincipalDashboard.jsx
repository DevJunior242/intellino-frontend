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

// ─── Skeleton sidebar ─────────────────────────────────────────────────────────
const SidebarSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 1 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: "#141720" }}>
        <Skeleton
          variant="text"
          width="70%"
          sx={{ bgcolor: "#1e2433", mb: 1 }}
        />
        <Skeleton
          variant="text"
          width="50%"
          sx={{ bgcolor: "#1e2433", mb: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={20}
          sx={{ bgcolor: "#1e2433", borderRadius: 1 }}
        />
      </Box>
    ))}
  </Stack>
);

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
  const isKumite = config.discipline?.toLowerCase() === "kumite";
  const lienPublic = `${window.location.origin}/public/tatami/${config.id}`;
  const enCours = data?.enCours;

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: "pointer",
        bgcolor: estSelecte ? "rgba(108, 99, 255, 0.12)" : "#141720",
        border: "1.5px solid",
        borderColor: estSelecte ? "#6c63ff" : "#1e2433",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: estSelecte ? "#6c63ff" : "#2e3550",
          bgcolor: estSelecte ? "rgba(108, 99, 255, 0.15)" : "#181c28",
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ... (le reste du code de ConfigCard) ... */}

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexWrap="wrap"
        gap={0.5}
      >
        <Chip
          label={config.discipline}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.62rem",
            bgcolor: isKumite ? "#ef444420" : "#00e5c020",
            color: isKumite ? "#ef4444" : "#00e5c0",
            fontWeight: 700,
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: "#636b88", fontSize: "0.62rem" }}
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
              bgcolor: "#22c55e20",
              color: "#22c55e",
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
            borderColor: "#6c63ff",
            color: "#6c63ff",
            "&:hover": { bgcolor: "rgba(108, 99, 255, 0.1)" },
          }}
        />
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
            borderColor: "#1e2433",
            color: "#636b88",
            "&:hover": { borderColor: "#6c63ff", color: "#6c63ff" },
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
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Box
      sx={{
        p: 2,
        bgcolor: "#ffb547",
        color: "#000",
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
        <IconButton size="small" onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>

    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: "#0e1118",
        borderBottom: "1px solid #1e2433",
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
            bgcolor: "#1e2433",
            color: "#8b90a0",
          }}
        />
        <Chip
          label={`${configs.filter((c) => c.est_valide).length} actifs`}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            bgcolor: "#22c55e20",
            color: "#22c55e",
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
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
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

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JugePrincipalDashboard({
  configs,
  handleValider,
  success,
  errors,
  submitId,
}) {
  const [tatamiData, setTatamiData] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingActif, setLoadingActif] = useState(false);
  const [polling, setPolling] = useState(false);
  const [configSelectee, setConfigSelectee] = useState(null);
  const [showRepartition, setShowRepartition] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);

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
          const [enCoursRes, arbitresRes] = await Promise.all([
            Instance.get(`/api/seances/competition/${config.id}/en-cours`),
            Instance.get(`/api/seances/configs/${config.id}/arbitres-rotation`),
          ]);

          const enCoursData =
            enCoursRes.data?.enCours || enCoursRes.data || null;

          results[config.id] = {
            enCours: enCoursData,
            arbitres: arbitresRes.data?.arbitres || [],
            superviseur: arbitresRes.data?.superviseur || null,
          };
        } catch (error) {
          console.error("Erreur pour le tatami", config.id, error);
          results[config.id] = {
            enCours: null,
            arbitres: [],
            superviseur: null,
          };
        }
      }),
    );

    setTatamiData(results);
    setIsDataReady(true);
    setLoadingInitial(false);

    // ✅ Sélectionner la config uniquement si les données sont prêtes
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

  // ✅ fetchTatamiActif corrigé
  const fetchTatamiActif = useCallback(async (configId, silent = false) => {
    if (!silent) setLoadingActif(true);
    else setPolling(true);

    try {
      const [enCoursRes, arbitresRes] = await Promise.all([
        Instance.get(`/api/seances/competition/${configId}/en-cours`),
        Instance.get(`/api/seances/configs/${configId}/arbitres-rotation`),
      ]);

      // ✅ Normaliser la réponse pour enCours
      const enCoursData = enCoursRes.data?.enCours || enCoursRes.data || null;

      setTatamiData((prev) => ({
        ...prev,
        [configId]: {
          enCours: enCoursData,
          arbitres: arbitresRes.data?.arbitres || [],
          superviseur: arbitresRes.data?.superviseur || null,
        },
      }));
    } catch (e) {
      console.log("Erreur:", e);
    } finally {
      if (!silent) setLoadingActif(false);
      else setPolling(false);
    }
  }, []);

  // ✅ Premier chargement
  useEffect(() => {
    if (configs.length > 0) fetchTousLesTatamis();
  }, [configs, fetchTousLesTatamis]);

  // ✅ Switch de tatami
  useEffect(() => {
    if (!configSelectee?.id) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchTatamiActif(configSelectee.id, false);
  }, [configSelectee?.id, fetchTatamiActif]);

  // ✅ Polling toutes les 3 secondes (au lieu de 5 minutes)
  // useEffect(() => {
  //   if (!configSelectee?.id) return;
  //   const interval = setInterval(() => {
  //     fetchTatamiActif(configSelectee.id, true);
  //   }, 3000); // ✅ 3 secondes
  //   return () => clearInterval(interval);
  // }, [configSelectee?.id, fetchTatamiActif]);
  useEffect(() => {
    if (!configSelectee?.id) return;

    const channel = echo.channel(`tatami.${configSelectee.id}`);

    channel.listen(".tatami.updated", () => {
      // Quand le serveur pousse un event → on refetch silencieusement
      fetchTatamiActif(configSelectee.id, true);
    });

    return () => {
      echo.leaveChannel(`tatami.${configSelectee.id}`);
    };
  }, [configSelectee?.id, fetchTatamiActif]);
  const handleDesignerSuperviseur = async (configId, arbitreCompetitionId) => {
    try {
      await Instance.patch(`/api/rotation-arbitres/${configId}/superviseur`, {
        config_notation_id: configId,
        arbitre_competition_id: arbitreCompetitionId,
      });
      fetchTatamiActif(configId, true);
    } catch (e) {
      console.log(e);
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
    const isKumite = configSelectee.discipline?.toLowerCase() === "kumite";

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
          success={success}
          errors={errors}
          submitId={submitId}
          onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
          onShowRepartition={() => setShowRepartition(true)}
        />
      );
    }
    return (
      <SeanceAdminPanelKata
        config={configSelectee}
        data={dataActive}
        handleValider={handleValider}
        handleDesignerSuperviseur={handleDesignerSuperviseur}
        success={success}
        errors={errors}
        submitId={submitId}
        onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
        onShowRepartition={() => setShowRepartition(true)}
      />
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#080a0f",
        color: "#dde1f0",
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
              bgcolor: "#ffb547",
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
            borderRight: "1px solid #1e2433",
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
              bgcolor: "#080a0f",
              borderRight: "1px solid #1e2433",
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
              bgcolor: "#0e1118",
              borderBottom: "1px solid #1e2433",
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: "#ffb547", bgcolor: "#ffb54715", borderRadius: 2 }}
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
                    color="white"
                    noWrap
                  >
                    {configSelectee.plateau_nom}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#636b88" }}>
                    {configSelectee.discipline} ·{" "}
                    {formatHeure(configSelectee?.heure_debut_prevu)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: "#636b88" }}>
                  Choisir un plateau
                </Typography>
              )}
            </Box>
            {configSelectee && (
              <FiberManualRecord
                sx={{
                  fontSize: 10,
                  color: configSelectee.est_valide ? "#22c55e" : "#636b88",
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
              <CircularProgress sx={{ color: "#ffb547" }} />
              <Typography variant="body2" sx={{ color: "#636b88" }}>
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
              <CircularProgress sx={{ color: "#6c63ff" }} size={32} />
              <Typography variant="body2" sx={{ color: "#636b88" }}>
                Chargement de{" "}
                <strong style={{ color: "#dde1f0" }}>
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
                  bgcolor: "#141720",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star sx={{ color: "#ffb547", fontSize: 32 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "#dde1f0", fontWeight: 600, textAlign: "center" }}
              >
                Sélectionnez un plateau
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#636b88", textAlign: "center", maxWidth: 280 }}
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
                    bgcolor: "#ffb547",
                    color: "#000",
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
