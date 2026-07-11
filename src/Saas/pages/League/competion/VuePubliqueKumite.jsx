import { useCallback, useEffect, useRef, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import echo from "../../../../echo";
import { Box, Skeleton } from "@mui/material";
import { useParams } from "react-router-dom";
import ProchainCombat from "./ProchainCombat";
import PenaliteDisplay from "./PenaliteDisplay";
import CombatEnCours from "./CombatEnCours";
import LoadingKumite from "./LoadingKumite";
import VainqueurOverlay from "./VainqueurOverlay";
import PodiumViewer from "./PodiumViewer";
import BracketViewer from "./BracketViewer";
import PublicDisplayThemeProvider from "./PublicDisplayThemeProvider";
import useCompetitionTheme from "./useCompetitionTheme";

function VuePubliqueKumiteContent() {
  const T = useCompetitionTheme();
  const [combat, setCombat] = useState(null);
  const [nextCombat, setNextCombat] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialLoadRef = useRef(true);

  const { configId } = useParams();

  const fetchData = useCallback(
    async (showLoading = false) => {
      if (!configId) return;
      if (showLoading) setLoading(true);
      try {
        if (isInitialLoadRef.current) setLoading(true);
        const [combatRes, nextRes] = await Promise.all([
          Instance.get(`/api/public/configs/${configId}/combat-en-cours`),
          Instance.get(`/api/public/configs/${configId}/next-combat`),
        ]);
        setCombat(combatRes.data?.combat || null);
        setNextCombat(nextRes.data?.combat || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
    },
    [configId],
  );
  useEffect(() => {
    fetchData(true);
  }, [configId, fetchData]);

  useEffect(() => {
    if (!configId) return;
    const channel = echo.channel(`tatami.${configId}`);
    const handler = () => fetchData();
    channel.listen(".tatami.updated", handler);
    return () => channel.stopListening(".tatami.updated", handler);
  }, [configId, fetchData]);

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh", p: 2 }}>
      {loading ? <LoadingKumite /> : null}
      {/* Combat en cours — AKA vs AO + scores */}
      <CombatEnCours config={combat?.config_notation} combat={combat} />
      <VainqueurOverlay combat={combat} onClose={fetchData} />
      {/* Prochain combat */}
      <ProchainCombat nextCombat={nextCombat} />
      <BracketViewer configId={configId} />
      {/* podium */}
      <PodiumViewer configId={configId} />
    </Box>
  );
}

export default function VuePubliqueKumite() {
  return (
    <PublicDisplayThemeProvider>
      <VuePubliqueKumiteContent />
    </PublicDisplayThemeProvider>
  );
}
