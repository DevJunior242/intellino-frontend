import {
  Box,
  Tab,
  Tabs,
  Button,
  Typography,
  Paper,
  IconButton,
  Skeleton,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import CandidatsGrid from "./CandidatsGrid";
import StoreEnchainement from "./StoreEnchainement";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import Note from "./Note";
import ExamenManage from "./ExamenManage";
import ExamenInfos from "./ExamenInfos";
import { Instance } from "../../../Api/Axios";
import ConfigSkeleton from "../ConfigSkeleton";

function ExamenDetails() {
  const { examenId } = useParams();
  const { activeId, activeType } = UseAuth();
  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  //rediriger back en function du type d'utilisateur
  const redirectBack = () => {
    let routeRedirect;
    if (activeType === "Ligue") {
      routeRedirect = "/dashboard/league/examen";
    } else {
      routeRedirect = "/dashboard/examen";
    }
    navigate(routeRedirect);
  };

  // Récupération de l'examen au chargement

  const fetchExamenData = useCallback(
    async (isRefresh = false) => {
      try {
        if (!isRefresh) setLoading(true);
        // On récupère les détails complets de la examen
        const response = await Instance.get(`/api/examens/${examenId}/show`);
        setExamen(response.data.examen);
      } catch (error) {
        console.error("Erreur chargement examen", error);
        setError({
          general: "Impossible de charger les données de la examen.",
        });
      } finally {
        setLoading(false);
      }
    },
    [examenId],
  );
  useEffect(() => {
    fetchExamenData();
  }, [fetchExamenData]);

  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les détails de la examen"
        onRetry={fetchExamenData}
      />
    );
  // Logique de permission dynamique
  const isOwner =
    examen?.organisateur_id === activeId &&
    examen?.organisateur_type === activeType;

  // Configuration des onglets selon les droits
  const tabs = [
    ...(isOwner
      ? [
          { label: "Gestion", key: "examens" },
          { label: "Enchaînements", key: "enchainements" },
        ]
      : []),
    { label: "Infos", key: "infos" },
    { label: "Candidats", key: "candidats" },
    { label: "Notes", key: "notes" },
  ];

  return (
    <Box>
      <Box sx={{ p: 3, mt: 0 }}>
        <Button
          // component={Link}
          onClick={redirectBack}
          startIcon={<ArrowBackIcon />}
          sx={{ fontSize: { xs: 8, md: 16 }, textTransform: "none" }}
        >
          retour
        </Button>

        {/* TABS */}
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: 2,
            backgroundColor: "#020224",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={48}
              sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1 }}
            />
          ) : (
            <Tabs
              value={tab}
              onChange={(e, newValue) => setTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="scrollable tabs"
              sx={{
                width: "100%",
                "& .MuiTabs-flexContainer": {
                  justifyContent: "center",
                },
                "& .MuiTabs-indicator": { height: 3 },
                "& .MuiTab-root": {
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 500,
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "#fff",
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.key} label={tab.label} />
              ))}
            </Tabs>
          )}
        </Box>

        {/* ACTIONS */}
        {isOwner && (
          <Box
            sx={{
              mb: 2,
              display: "flex",
              gap: 2,
              backgroundColor: "background.default",
            }}
          >
            {tab === 1 && (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  mt: 0,
                  display: "flex",
                  backgroundColor: "background.default",
                }}
              >
                <IconButton>
                  <WarningAmberOutlinedIcon
                    sx={{ color: "warning.main", fontSize: 50 }}
                  />
                </IconButton>

                <Typography
                  variant="body1"
                  component="p"
                  gutterBottom
                  sx={{
                    textAlign: "center",
                    fontSize: { xs: 8, md: 16 },
                  }}
                >
                  Les enchaînements représentent les éléments qui seront évalués
                  lors de cet examen. Nous vous conseillons de les créer avant
                  toute notation, afin d’assurer une évaluation claire et
                  équitable pour tous les candidats
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* CONTENU */}
        {loading ? (
          <ConfigSkeleton />
        ) : (
          <Box>
            {tabs[tab]?.key === "examens" && (
              <ExamenManage examen={examen} fetchExamenData={fetchExamenData} />
            )}
            {tabs[tab]?.key === "infos" && <ExamenInfos examen={examen} />}
            {tabs[tab]?.key === "enchainements" && (
              <StoreEnchainement
                examenId={examenId}
                organisateurId={activeId}
              />
            )}
            {tabs[tab]?.key === "candidats" && (
              <CandidatsGrid examen={examen} />
            )}
            {tabs[tab]?.key === "notes" && <Note />}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ExamenDetails;
