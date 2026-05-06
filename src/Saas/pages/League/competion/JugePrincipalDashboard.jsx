import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  LinearProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  Star,
  FiberManualRecord,
  People,
  SportsMartialArts,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

import SeanceAdminPanelKata from "./SeanceAdminPanelKata";
import { Link } from "react-router-dom";
import SeanceAdminPanelKumite from "./SeanceAdminPanelKumite";
import ConfigSkeleton from "../../ConfigSkeleton";
export default function JugePrincipalDashboard({
  configs,
  handleValider,
  success,
  errors,
  submitId,
}) {
  const [tatamiData, setTatamiData] = useState({});
  const [loading, setLoading] = useState(true);
  const configSelecteeRef = useRef(null);
  const [configSelectee, setConfigSelectee] = useState(null);

  // Override setter pour sync ref et state ensemble
  const choisirConfig = (config) => {
    configSelecteeRef.current = config;
    setConfigSelectee(config);
  };
  // fetchTousLesTatamis
  const fetchTousLesTatamis = useCallback(async () => {
    const results = {};
    await Promise.all(
      configs.map(async (config) => {
        setLoading(true);
        try {
          const [enCoursRes, arbitresRes] = await Promise.all([
            Instance.get(`/api/seances/competition/${config.id}/en-cours`),
            Instance.get(`/api/seances/configs/${config.id}/arbitres-rotation`),
          ]);
          results[config.id] = {
            enCours: enCoursRes.data.enCours,
            arbitres: arbitresRes.data.arbitres,
            superviseur: arbitresRes.data.superviseur,
          };
        } catch {
          results[config.id] = {
            enCours: null,
            arbitres: [],
            superviseur: null,
          };
        }
      }),
    );
    setTatamiData(results);
    setLoading(false);

    // Sélection initiale via REF — pas touché au state directement
    if (!configSelecteeRef.current && configs.length > 0) {
      const premier =
        configs.find((c) => c.configuration_validee) || configs[0];
      choisirConfig(premier);
    }
  }, [configs]);

  const handleDesignerSuperviseur = async (configId, arbitreCompetitionId) => {
    try {
      const dataSend = {
        config_notation_id: configId,
        arbitre_competition_id: arbitreCompetitionId,
      };
      const res = await Instance.patch(
        `/api/rotation-arbitres/${configId}/superviseur`,
        dataSend,
      );
      console.log("designer superviseur res", res);
      fetchTousLesTatamis();
    } catch (e) {
      console.log(e);
    }
  };

  // Polling
  useEffect(() => {
    fetchTousLesTatamis();
    const interval = setInterval(fetchTousLesTatamis, 30000);
    return () => clearInterval(interval);
  }, [fetchTousLesTatamis]);

  // Déterminer quel panel afficher à droite
  const renderRightPanel = () => {
    if (!configSelectee || !tatamiData[configSelectee.id]) return null;

    const dataActive = tatamiData[configSelectee.id];
    const isKumite = configSelectee.discipline?.toLowerCase() === "kumite";

    // On switch selon la discipline
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
          onRefresh={fetchTousLesTatamis}
        />
      );
    } else {
      return (
        <SeanceAdminPanelKata
          config={configSelectee}
          data={dataActive}
          handleValider={handleValider}
          handleDesignerSuperviseur={handleDesignerSuperviseur}
          success={success}
          errors={errors}
          submitId={submitId}
          onRefresh={fetchTousLesTatamis}
        />
      );
    }
  };

  if (loading && configs.length === 0) return <ConfigSkeleton />;

  const dataActive = configSelectee ? tatamiData[configSelectee.id] : null;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#080a0f",
        color: "#dde1f0",
      }}
    >
      {/* SIDEBAR GAUCHE */}
      <Box
        sx={{
          width: 260,
          borderRight: "1px solid #1e2433",
          display: "flex",
          flexDirection: "column",
          height: "700px",
        }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: "#ffb547",
            color: "#000",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Star fontSize="small" /> JUGE PRINCIPAL
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          <Stack spacing={1.5}>
            {configs.map((config) => {
              const estSelecte = configSelectee?.id === config.id;
              const data = tatamiData[config.id] || {};
              const isKumite = config.discipline?.toLowerCase() === "kumite";
              const lienPublic = `${window.location.origin}/public/tatami/${config.id}`;

              const formatHeure = (dt) =>
                dt
                  ? new Date(dt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";
              return (
                <Paper
                  key={config.id}
                  onClick={() => choisirConfig(config)}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    bgcolor: estSelecte ? "rgba(108, 99, 255, 0.1)" : "#141720",
                    border: "1px solid",
                    borderColor: estSelecte ? "#6c63ff" : "#1e2433",
                    transition: "0.3s",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: estSelecte ? "#6c63ff" : "#fff",
                      }}
                    >
                      {config.plateau_nom}({config.niveau})
                    </Typography>
                    <FiberManualRecord
                      sx={{
                        fontSize: 10,
                        color: config.est_valide ? "#22c55e" : "#636b88",
                      }}
                    />
                  </Stack>
                  {/* date */}
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography variant="body2" sx={{ color: "grey.100" }}>
                      {formatHeure(config?.heure_debut_prevu)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      →
                    </Typography>
                    <Typography variant="body2" sx={{ color: "grey.100" }}>
                      {formatHeure(config?.heure_fin_prevue)}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{ color: "grey.100" }}>
                    {config?.heure_debut_prevu
                      ? new Date(config?.heure_debut_prevu).toLocaleDateString(
                          "fr-FR",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          },
                        )
                      : "—"}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={config.discipline}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9,
                        bgcolor: isKumite ? "#ef444420" : "#00e5c020",
                        color: isKumite ? "#ef4444" : "#00e5c0",
                      }}
                    />
                    <Typography variant="caption" sx={{ color: "#636b88" }}>
                      {isKumite
                        ? config.format
                        : `${config.juges_option || "N/A"} juges`}
                    </Typography>
                  </Stack>
                  <Link to={lienPublic} target="_blank">
                    <Chip
                      label="Voir la vue publique"
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mt: 0.5, fontSize: "0.65rem" }}
                    />
                  </Link>
                </Paper>
              );
            })}
          </Stack>
        </Box>
      </Box>

      {/* ZONE DROITE DYNAMIQUE */}
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {configSelectee ? (
          renderRightPanel()
        ) : (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="textSecondary">
              Sélectionnez un plateau pour gérer la séance
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
