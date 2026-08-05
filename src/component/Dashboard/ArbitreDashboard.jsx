import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Avatar,
  LinearProgress,
} from "@mui/material";
import {
  EmojiEvents,
  Groups,
  Edit,
  EventNote,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Star,
  Gavel,
} from "@mui/icons-material";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const PURPLE = "#6c63ff";
const PURPLE_LIGHT = "rgba(108,99,255,0.10)";
const PURPLE_BDR = "rgba(108,99,255,0.22)";
const BG_SURFACE = "#141720";
const BORDER = "#1e2433";
const TEXT_PRI = "#dde1f0";
const TEXT_SEC = "#8b90a0";
const TEXT_MUT = "#636b88";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const CYAN = "#06b6d4";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data = [] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data.map((d) => d.nb), 1);
  const W = 140,
    H = 32,
    pad = 3;
  const pts = data
    .map((d, i) => {
      const x = pad + (i / (data.length - 1)) * (W - pad * 2);
      const y = H - pad - (d.nb / max) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={W} height={H} style={{ display: "block", flexShrink: 0 }}>
      <polyline
        points={pts}
        fill="none"
        stroke={PURPLE}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => {
        const x = pad + (i / (data.length - 1)) * (W - pad * 2);
        const y = H - pad - (d.nb / max) * (H - pad * 2);
        return (
          <circle
            key={i}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r="3"
            fill={PURPLE}
          />
        );
      })}
    </svg>
  );
}

// ─── MetricCard ───────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color = PURPLE }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        bgcolor: BG_SURFACE,
        border: `1px solid ${BORDER}`,
        flex: "1 1 120px",
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ fontSize: 15, color }} />
        </Box>
        <Typography
          sx={{
            fontSize: "0.65rem",
            color: TEXT_MUT,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontSize: { xs: "1.35rem", sm: "1.6rem" },
          fontWeight: 700,
          color: TEXT_PRI,
          lineHeight: 1,
        }}
      >
        {value ?? "—"}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: "0.65rem", color: TEXT_MUT, mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

// ─── StatRow ──────────────────────────────────────────────────────────────────
function StatRow({ label, value, bar, barColor = PURPLE }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontSize: "0.78rem", color: TEXT_SEC }}>
          {label}
        </Typography>
        <Typography
          sx={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT_PRI }}
        >
          {value}
        </Typography>
      </Stack>
      {bar !== undefined && (
        <LinearProgress
          variant="determinate"
          value={Math.min(bar, 100)}
          sx={{
            mt: 0.75,
            height: 4,
            borderRadius: 99,
            bgcolor: BORDER,
            "& .MuiLinearProgress-bar": { bgcolor: barColor, borderRadius: 99 },
          }}
        />
      )}
    </Box>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <Typography
      sx={{
        fontSize: "0.62rem",
        fontWeight: 700,
        color: TEXT_MUT,
        textTransform: "uppercase",
        letterSpacing: "0.09em",
        mb: 1,
        mt: 2.5,
      }}
    >
      {children}
    </Typography>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function SCard({ children, sx = {} }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: BG_SURFACE,
        border: `1px solid ${BORDER}`,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ArbitreDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { auth } = UseAuth();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await Instance.get("api/arbitre/stats");
      setStats(res.data.stats);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress size={30} sx={{ color: PURPLE }} />
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography sx={{ color: TEXT_MUT, fontSize: "0.85rem" }}>
          Impossible de charger les statistiques.
        </Typography>
      </Box>
    );
  }

  const {
    global: g,
    qualite: q,
    roles: r,
    kata_duel: kd,
    par_annee = [],
    derniere_comp: dc,
  } = stats;
  const totalRoles = (r?.juge ?? 0) + (r?.superviseur ?? 0) || 1;
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 700, mx: "auto" }}>
      {/* ── Header profil ── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: 0.5,
          borderRadius: 3,
          bgcolor: BG_SURFACE,
          border: `1px solid ${PURPLE_BDR}`,
          background: `linear-gradient(135deg, ${PURPLE_LIGHT} 0%, rgba(108,99,255,0.02) 100%)`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 110,
            height: 110,
            borderRadius: "50%",
            bgcolor: PURPLE_LIGHT,
            pointerEvents: "none",
          }}
        />
        <Stack direction="row" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: PURPLE_LIGHT,
              color: PURPLE,
              fontWeight: 700,
              fontSize: "1rem",
              border: `1.5px solid ${PURPLE_BDR}`,
            }}
          >
            {/* Remplacez par les initiales dynamiques de l'user connecté */}
            OK
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Remplacez par le fullname de l'user connecté */}
            <Typography
              sx={{
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
                fontWeight: 700,
                color: TEXT_PRI,
              }}
            >
              {auth?.user?.fullname ?? "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: TEXT_SEC, mt: 0.25 }}>
              Arbitre officiel · Karaté Burkina Faso
            </Typography>
            <Stack direction="row" gap={0.75} mt={0.75} flexWrap="wrap">
              <Chip
                icon={<EventNote sx={{ fontSize: "0.65rem !important" }} />}
                label={`Depuis ${g?.depuis ?? "—"}`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  bgcolor: PURPLE_LIGHT,
                  color: PURPLE,
                  border: `1px solid ${PURPLE_BDR}`,
                }}
              />
              <Chip
                icon={
                  <Star
                    sx={{
                      fontSize: "0.65rem !important",
                      color: `${AMBER} !important`,
                    }}
                  />
                }
                label="Grade 2"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  bgcolor: "rgba(245,158,11,0.10)",
                  color: AMBER,
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* ── Métriques globales ── */}
      <SectionLabel>Vue d'ensemble</SectionLabel>
      <Stack direction="row" gap={1.25} flexWrap="wrap">
        <MetricCard
          icon={EmojiEvents}
          label="Compétitions"
          value={g?.competitions}
          sub="toutes éditions"
          color={PURPLE}
        />
        <MetricCard
          icon={Groups}
          label="Athlètes jugés"
          value={g?.athletes_juges}
          sub="passages notés"
          color={CYAN}
        />
        <MetricCard
          icon={Edit}
          label="Notes données"
          value={g?.notes_donnees?.toLocaleString()}
          sub="toutes séances"
          color={GREEN}
        />
        <MetricCard
          icon={EventNote}
          label="Séances"
          value={g?.seances}
          sub="configs arbitrées"
          color={AMBER}
        />
      </Stack>

      {/* ── Qualité de notation ── */}
      <SectionLabel>Qualité de notation</SectionLabel>
      <SCard>
        <Stack gap={1.75}>
          <StatRow
            label="Note moyenne donnée"
            value={parseFloat(q?.note_moyenne) ?? "—"}
          />
          <Divider sx={{ bgcolor: BORDER }} />
          <StatRow
            label="Écart-type (constance)"
            value={q?.ecart_type?.toFixed(2) ?? "—"}
          />
          <Divider sx={{ bgcolor: BORDER }} />
          <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography sx={{ fontSize: "0.78rem", color: TEXT_SEC }}>
                  Note max
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.4}>
                  <TrendingUp sx={{ fontSize: 14, color: GREEN }} />
                  <Typography
                    sx={{ fontSize: "0.82rem", fontWeight: 600, color: GREEN }}
                  >
                    {q?.note_max?.toFixed(2) ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography sx={{ fontSize: "0.78rem", color: TEXT_SEC }}>
                  Note min
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.4}>
                  <TrendingDown sx={{ fontSize: 14, color: "#f87171" }} />
                  <Typography
                    sx={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#f87171",
                    }}
                  >
                    {q?.note_min?.toFixed(2) ?? "—"}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
          <Divider sx={{ bgcolor: BORDER }} />
          <StatRow
            label="Taux de complétion"
            value={`${q?.taux_completion ?? 0}%`}
            bar={q?.taux_completion ?? 0}
            barColor={GREEN}
          />
        </Stack>
      </SCard>

      {/* ── Répartition par rôle ── */}
      <SectionLabel>Répartition par rôle</SectionLabel>
      <SCard>
        <Stack gap={1.75}>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.75}
            >
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Gavel sx={{ fontSize: 15, color: PURPLE }} />
                <Typography sx={{ fontSize: "0.78rem", color: TEXT_SEC }}>
                  Juge de table
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT_PRI }}
              >
                {r?.juge ?? 0}{" "}
                <Typography
                  component="span"
                  sx={{ fontSize: "0.65rem", color: TEXT_MUT }}
                >
                  fois
                </Typography>
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(r?.juge / totalRoles) * 100}
              sx={{
                height: 4,
                borderRadius: 99,
                bgcolor: BORDER,
                "& .MuiLinearProgress-bar": {
                  bgcolor: PURPLE,
                  borderRadius: 99,
                },
              }}
            />
          </Box>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={0.75}
            >
              <Stack direction="row" alignItems="center" gap={0.75}>
                <Star sx={{ fontSize: 15, color: AMBER }} />
                <Typography sx={{ fontSize: "0.78rem", color: TEXT_SEC }}>
                  Superviseur
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: "0.82rem", fontWeight: 600, color: TEXT_PRI }}
              >
                {r?.superviseur ?? 0}{" "}
                <Typography
                  component="span"
                  sx={{ fontSize: "0.65rem", color: TEXT_MUT }}
                >
                  fois
                </Typography>
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={(r?.superviseur / totalRoles) * 100}
              sx={{
                height: 4,
                borderRadius: 99,
                bgcolor: BORDER,
                "& .MuiLinearProgress-bar": {
                  bgcolor: AMBER,
                  borderRadius: 99,
                },
              }}
            />
          </Box>
        </Stack>
      </SCard>

      {/* ── Décisions de superviseur (duel Kata, Art. 10/3.5 WKF) ── */}
      {(r?.superviseur ?? 0) > 0 && (
        <>
          <SectionLabel>Décisions en tant que superviseur (Kata)</SectionLabel>
          <Stack direction="row" gap={1.25} flexWrap="wrap">
            <MetricCard
              icon={Gavel}
              label="Égalités tranchées"
              value={kd?.hantei_tranches ?? 0}
              sub="votes des juges à égalité"
              color={AMBER}
            />
            <MetricCard
              icon={Gavel}
              label="Disqualifications Bunkai"
              value={kd?.disqualifications_bunkai ?? 0}
              sub="finales d'équipe"
              color="#f87171"
            />
          </Stack>
        </>
      )}

      {/* ── Activité par année ── */}
      {par_annee.length > 0 && (
        <>
          <SectionLabel>Activité par année</SectionLabel>
          <SCard>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
            >
              <Typography sx={{ fontSize: "0.72rem", color: TEXT_MUT }}>
                Compétitions arbitrées
              </Typography>
              <Sparkline data={par_annee} />
            </Stack>
            <Stack direction="row" gap={1.5} flexWrap="wrap">
              {par_annee.map((d) => (
                <Box key={d.annee} sx={{ textAlign: "center", minWidth: 30 }}>
                  <Typography
                    sx={{ fontSize: "1rem", fontWeight: 700, color: TEXT_PRI }}
                  >
                    {d.nb}
                  </Typography>
                  <Typography sx={{ fontSize: "0.62rem", color: TEXT_MUT }}>
                    {d.annee}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </SCard>
        </>
      )}

      {/* ── Dernière compétition ── */}
      {dc && (
        <>
          <SectionLabel>Dernière compétition</SectionLabel>
          <SCard>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={1.5}
            >
              <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                <Typography
                  sx={{ fontSize: "0.88rem", fontWeight: 700, color: TEXT_PRI }}
                  noWrap
                >
                  {dc.nom}
                </Typography>
                <Typography
                  sx={{ fontSize: "0.7rem", color: TEXT_MUT, mt: 0.25 }}
                >
                  {dc.date} · {dc.plateau}
                </Typography>
              </Box>
              <Chip
                icon={
                  <CheckCircle
                    sx={{
                      fontSize: "0.65rem !important",
                      color: `${GREEN} !important`,
                    }}
                  />
                }
                label={dc.role}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  bgcolor: "rgba(34,197,94,0.10)",
                  color: GREEN,
                  border: "1px solid rgba(34,197,94,0.2)",
                  flexShrink: 0,
                }}
              />
            </Stack>
            <Stack gap={1.25}>
              <StatRow label="Passages jugés" value={dc.passages_juges} />
              <Divider sx={{ bgcolor: BORDER }} />
              <StatRow label="Notes saisies" value={dc.notes_saisies} />
              <Divider sx={{ bgcolor: BORDER }} />
              <StatRow
                label="Note moyenne"
                value={parseFloat(dc.note_moyenne) ?? "—"}
              />
            </Stack>
          </SCard>
        </>
      )}
    </Box>
  );
}
