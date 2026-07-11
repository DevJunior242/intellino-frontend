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
  Tooltip,
  Button,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ErrorBlock from "../../Saas/pages/ErrorBlock";
import AlertCard from "./Alerts";
import Alerts from "./Alerts";
import QuickActions from "../../Saas/pages/QuickActions";
import ActivityFeed from "../../Saas/pages/ActivityFeed";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import LeagueFederationAffiliation from "../../Saas/pages/Fede/LeagueFederationAffiliation";
import VitalityGauge from "../../Saas/pages/League/VitalityGauge";
import StageRevenueChart from "../../Saas/pages/League/StageRevenueChart";
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
const useLocalTheme = () => {
  const muiTheme = useTheme();
  return {
    bg: muiTheme.palette.background.default,
    paper: muiTheme.palette.background.paper,
    card: muiTheme.palette.background.paper,
    textMain: muiTheme.palette.text.primary,
    textSecondary: muiTheme.palette.text.secondary,
    accent: muiTheme.palette.primary.main,
    success: muiTheme.palette.success.main,
    warning: muiTheme.palette.error.main,
    info: muiTheme.palette.info.main,
  };
};

function StatCard({ label, value, sub, subColor, index }) {
  const theme = useLocalTheme();

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
          bgcolor: theme.paper,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
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
            color: theme.textMain,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: subColor || theme.textSecondary, fontWeight: 500 }}
        >
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

  const { activeId, invitationCode } = UseAuth();
  const navigate = useNavigate();
  const theme = useLocalTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [finance, setFinance] = useState({
    total_encaisse: 0,
    total_en_attente: 0,
  });
  const [aVerifierCount, setAVerifierCount] = useState(0);
  const [examStats, setExamStats] = useState({
    grades_decernes: 0,
    taux_reussite: 0,
  });

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      alert(
        "La copie automatique n'est pas disponible sur cette version du site. Elle sera disponible lorsque le site utilisera HTTPS.",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(invitationCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      alert("Impossible de copier le code. Veuillez réessayer.");
    }
  };
  const fetchStats = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(`/api/dashboard/league/stats`);
      setStats(response.data);
    } catch (error) {
      setError("Erreur lors de la récupération des statistiques");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  const fetchFinance = useCallback(async () => {
    if (!activeId) return;
    // Promise.allSettled : chaque section est indépendante, l'échec de l'une
    // ne doit pas empêcher l'affichage des deux autres.
    const [statsRes, aVerifierRes, examRes] = await Promise.allSettled([
      Instance.get("/api/stage-payments/statistiques"),
      Instance.get("/api/stage-payments/a-verifier"),
      Instance.get("/api/examens/vitality-stats"),
    ]);

    if (statsRes.status === "fulfilled") {
      setFinance(
        statsRes.value.data?.data || {
          total_encaisse: 0,
          total_en_attente: 0,
        },
      );
    } else {
      console.error("Erreur stats paiements stages:", statsRes.reason);
    }

    if (aVerifierRes.status === "fulfilled") {
      setAVerifierCount((aVerifierRes.value.data?.data || []).length);
    } else {
      console.error("Erreur paiements à vérifier:", aVerifierRes.reason);
    }

    if (examRes.status === "fulfilled") {
      setExamStats(
        examRes.value.data || { grades_decernes: 0, taux_reussite: 0 },
      );
    } else {
      console.error("Erreur stats examens:", examRes.reason);
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId) {
      fetchStats();
      fetchFinance();
    }
  }, [activeId, fetchStats, fetchFinance]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={fetchStats} />;
  return (
    <Box sx={{ bgcolor: theme.bg }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2,
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            Gérez vos clubs, vos compétitions et vos arbitres régionaux.
          </Typography>
        </Box>

        {/* LE BADGE DE COPIE SECURISÉ */}
        <Box display="flex" gap={1}>
          <TextField
            label="Code d'invitation"
            value={invitationCode}
            InputProps={{
              readOnly: true,
            }}
            size="small"
          />

          <Button
            onClick={handleCopy}
            startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
          >
            {copied ? "Copié" : "Copier"}
          </Button>
        </Box>
      </Box>
      {/* Stat Cards */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <StatCard
          label="Licenciés actifs"
          value={stats.total_students || 1000}
          // sub="+12% vs saison préc."
          subColor="#4caf50"
          index={0}
        />
        <StatCard
          label="Clubs affiliés"
          value={stats.total_afiliation || 30}
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
        <StatCard
          label="Recettes stages (encaissées)"
          value={`${Number(finance.total_encaisse || 1500000).toLocaleString("fr-FR")} F`}
          sub={`${Number(finance.total_en_attente || 500000).toLocaleString("fr-FR")} F en attente`}
          subColor="#ff9800"
          index={3}
        />
        <Box
          sx={{ flex: 1, cursor: "pointer" }}
          onClick={() => navigate("/dashboard/league/stage")}
        >
          <StatCard
            label="Paiements à vérifier"
            value={aVerifierCount}
            sub={
              aVerifierCount > 0
                ? "En attente de confirmation"
                : "Tout est à jour"
            }
            subColor={aVerifierCount > 0 ? "#ff9800" : "#4caf50"}
            index={4}
          />
        </Box>
      </Box>
      {/* Middle Row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {/* Alerts */}
        <Box sx={{ flex: 2, minWidth: 320 }}>
          <Alerts />
        </Box>

        {/* Vitalité examens */}
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <VitalityGauge />
        </Box>
      </Box>

      {/* Recettes stages par mois + examens */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 320 }}>
          <StageRevenueChart />
        </Box>
        <Box
          sx={{ flex: 1, minWidth: 260, cursor: "pointer" }}
          onClick={() => navigate("/dashboard/league/grades")}
        >
          <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
            <StatCard
              label="Grades décernés cette saison"
              value={examStats.grades_decernes || 200}
              sub="Voir le détail →"
              subColor="#8b90a0"
              index={5}
            />
            <StatCard
              label="Taux de réussite"
              value={`${examStats.taux_reussite || 50}%`}
              sub="Voir le détail →"
              subColor="#8b90a0"
              index={6}
            />
          </Box>
        </Box>
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
