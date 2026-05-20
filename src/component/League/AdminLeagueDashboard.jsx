import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Table,
  Paper,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ErrorBlock from "../../Saas/pages/ErrorBlock";
import AlertCard from "./Alerts";
import Alerts from "./Alerts";
import QuickActions from "../../Saas/pages/QuickActions";
import ActivityFeed from "../../Saas/pages/ActivityFeed";

// ─── Icons (inline SVG via MUI SvgIcon approach, using emoji fallback) ───────
const icons = {
  dashboard: "⊞",
  clubs: "🏠",
  licences: "🪪",
  categories: "⊞",
  bureau: "👤",
  competitions: "★",
  grades: "▲",
  notation: "▣",
  athletes: "👥",
  paiements: "▣",
  bell: "🔔",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const activities = [
  {
    date: "16 mars 2025",
    action: "Licence émise…",
    user: "Club Tigre FC",
    status: "Validée",
    color: "#4caf50",
  },
  {
    date: "15 mars 2025",
    action: "Inscription co…",
    user: "Dragon Noir",
    status: "En attente",
    color: "#ff9800",
  },
  {
    date: "14 mars 2025",
    action: "Paiement coti…",
    user: "Bushido Abidj…",
    status: "Reçu",
    color: "#2196f3",
  },
  {
    date: "13 mars 2025",
    action: "Grade 1er Da…",
    user: "Ligue (examen)",
    status: "Admise",
    color: "#4caf50",
  },
  {
    date: "12 mars 2025",
    action: "Nouveau club…",
    user: "Secrétariat",
    status: "En cours",
    color: "#9c27b0",
  },
];
// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subColor, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      style={{ flex: 1 }}
    >
      <Paper
        sx={{
          p: 2.5,
          bgcolor: "#22262f",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
          height: "100%",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.75rem", mb: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.5px",
            color: "#e8eaf0",
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography variant="caption" sx={{ color: subColor, fontWeight: 500 }}>
          {sub}
        </Typography>
      </Paper>
    </motion.div>
  );
}

function AdminLeagueDashboard() {
  const [stats, setStats] = useState({
    total_students: 0,
    total_afiliation: 0,
    total_competitions: 0,
  });

  const { activeId } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetchStats = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(
        `/api/dashboard/league/stats?organisateur_id=${activeId}`,
      );
      console.log(response);
      setStats(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques :", error);
      setError("Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchStats();
    }
  }, [activeId, fetchStats]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={fetchStats} />;
  return (
    <Box>
      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <StatCard
          label="Licenciés actifs"
          value={stats.total_students}
          // sub="+12% vs saison préc."
          subColor="#4caf50"
          index={0}
        />
        <StatCard
          label="Clubs affiliés"
          value={stats.total_afiliation}
          // sub="+3 nouveaux"
          subColor="#4caf50"
          index={1}
        />
        <StatCard
          label="Compétitions cette saison"
          value={stats.total_competitions}
          // sub="8 à venir"
          subColor="#8b90a0"
          index={2}
        />
        {/* <StatCard
          label="Recettes (FCFA)"
          value="18,4M"
          // sub="-4% objectif"
          subColor="#f44336"
          index={3}
        /> */}
      </Box>
      {/* Middle Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        {/* Alerts */}
        <Alerts />

        {/* Categories */}
        {/* <LicenceProgress /> */}
      </Box>
      {/* Activity Table */}
      <motion.div
        variants={fadeUp}
        custom={2}
        initial="hidden"
        animate="visible"
      >
        <ActivityFeed />

        <QuickActions />
      </motion.div>
    </Box>
  );
}

export default AdminLeagueDashboard;
