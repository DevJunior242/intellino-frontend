import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  FilterAltOff as FilterAltOffIcon,
  HowToReg as HowToRegIcon,
  CheckCircle as CheckCircleIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import SubscribeStageDialog from "./Subscribestagedialog";
import MyRegistrationsDialog from "./Myregistrationsdialog";
import PaymentDeclarationDialog from "./Paiement/Paymentdeclarationdialog";

const ACCENT = "#3949AB";
const ACCENT_SOFT = "#E8EAF6";
const INK = "#E5E7EB";
const MUTED = "#6B7280";
const SURFACE = "#1a1d2a";

const TYPE_COLORS = {
  technique: { bg: "#E8EAF6", fg: "#3949AB" },
  arbitrage: { bg: "#FFF3E0", fg: "#E65100" },
  perfectionnement: { bg: "#E0F2F1", fg: "#00695C" },
  default: { bg: "#F3F4F6", fg: "#374151" },
};

function getTypeColor(type) {
  const key = (type || "").toLowerCase();
  return TYPE_COLORS[key] || TYPE_COLORS.default;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusTag({ start_at, end_at }) {
  const now = new Date();
  const start = new Date(start_at);
  const end = end_at ? new Date(end_at) : start;

  let label = "À venir";
  let color = { bg: "#FFF8E1", fg: "#F57F17" };

  if (now > end) {
    label = "Terminé";
    color = { bg: "#F3F4F6", fg: "#6B7280" };
  } else if (now >= start && now <= end) {
    label = "En cours";
    color = { bg: "#E8F5E9", fg: "#2E7D32" };
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: color.bg,
        color: color.fg,
        fontWeight: 600,
        fontSize: "0.7rem",
        height: 22,
      }}
    />
  );
}

function StageCard({
  stage,
  onSubscribe,
  subscribing,
  isSubscribed,
  onViewMyRegistrations,
}) {
  const typeColor = getTypeColor(stage.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -4 }}
    >
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: "background.default",
          border: "1px solid #E5E7EB",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(26, 28, 42, 0.08)",
            borderColor: "#D1D5DB",
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <Chip
              label={stage.type}
              size="small"
              sx={{
                bgcolor: typeColor.bg,
                color: typeColor.fg,
                fontWeight: 600,
                textTransform: "capitalize",
                fontSize: "0.7rem",
                height: 22,
              }}
            />
            <StatusTag start_at={stage.start_at} end_at={stage.end_at} />
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1 }}
          >
            {stage.title}
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ color: MUTED }}
          >
            <CalendarIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
              {formatDate(stage.start_at)}
              {stage.end_at ? ` → ${formatDate(stage.end_at)}` : ""}
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#F1F2F4" }} />

        <CardActions sx={{ px: 1.5, py: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => onSubscribe(stage)}
            startIcon={
              isSubscribed ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <HowToRegIcon fontSize="small" />
              )
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              bgcolor: isSubscribed ? "#E8F5E9" : ACCENT,
              color: isSubscribed ? "#2E7D32" : "#fff",
              boxShadow: "none",
              "&:hover": {
                bgcolor: isSubscribed ? "#E8F5E9" : "#303F9F",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: isSubscribed ? "#E8F5E9" : "#E5E7EB",
                color: isSubscribed ? "#2E7D32" : "#9CA3AF",
              },
            }}
          >
            {isSubscribed
              ? "Déjà inscrit"
              : subscribing
                ? "Ouverture..."
                : "S'inscrire"}
          </Button>
          <Button
            size="small"
            onClick={() => onViewMyRegistrations(stage)}
            startIcon={<VisibilityIcon fontSize="small" />}
          >
            voir
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
}

function StageCardSkeleton() {
  return (
    <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #E5E7EB" }}>
      <CardContent>
        <Skeleton width={90} height={24} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton width="80%" height={28} sx={{ mb: 1 }} />
        <Skeleton width="60%" height={20} />
      </CardContent>
    </Card>
  );
}

const LOT_STATUS = {
  pending: { label: "À payer", fg: "#FFB74D", Icon: HourglassEmptyIcon },
  declared: {
    label: "Vérification en cours",
    fg: "#9FA8DA",
    Icon: HourglassEmptyIcon,
  },
  paid: { label: "Payé", fg: "#81C784", Icon: CheckCircleIcon },
};

function PendingStagePaymentsSection({ lots, loading, onPay }) {
  const unpaid = lots.filter((l) => l.status !== "paid");

  if (loading) {
    return (
      <Skeleton
        height={80}
        sx={{ borderRadius: 3, mb: 3, bgcolor: "rgba(255,255,255,0.08)" }}
      />
    );
  }

  if (unpaid.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <PaymentsOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: INK }}>
          Paiements en attente
        </Typography>
        <Chip
          label={unpaid.length}
          size="small"
          sx={{
            bgcolor: ACCENT_SOFT,
            color: ACCENT,
            fontWeight: 700,
            height: 20,
            fontSize: "0.7rem",
          }}
        />
      </Stack>

      <Stack spacing={1.5}>
        {unpaid.map((lot) => {
          const status = LOT_STATUS[lot.status] || LOT_STATUS.pending;
          const nbInscrits = lot.items?.length || 0;
          return (
            <Card
              key={lot.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.08)",
                bgcolor: SURFACE,
              }}
            >
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: INK }}
                    >
                      {lot.stage?.title || "Stage"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: MUTED }}>
                      {nbInscrits} participant{nbInscrits > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: INK }}
                    >
                      {Number(lot.amount || 0).toLocaleString("fr-FR")}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: MUTED, ml: 0.5 }}
                      >
                        FCFA
                      </Typography>
                    </Typography>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        color: status.fg,
                        bgcolor: "rgba(255,255,255,0.06)",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                    {lot.status === "pending" && (
                      <Button
                        size="small"
                        onClick={() => onPay(lot)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: 2,
                          bgcolor: ACCENT,
                          color: "#fff",
                          "&:hover": { bgcolor: "#303F9F" },
                        }}
                      >
                        Payer
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
export default function StageSubscribeIndex() {
  const { activeId, activeType } = UseAuth();

  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const [subscribeTarget, setSubscribeTarget] = useState(null);
  const [viewRegistrationsTarget, setViewRegistrationsTarget] = useState(null);

  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ✅ subscribedIds déduit des lots — pas de fetch séparé
  const subscribedIds = useMemo(() => {
    return lots.map((lot) => lot.payable_id).filter(Boolean);
  }, [lots]);

  const fetchLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const { data } = await Instance.get("/api/transactions/mes-lots", {
        params: { payable_type: "stage" },
      });
      setLots(data.data || []);
    } catch {
      // silencieux
    } finally {
      setLoadingLots(false);
    }
  }, []);

  const fetchStages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (type) params.type = type;
      if (startAt) params.start_at = startAt;
      if (endAt) params.end_at = endAt;

      const res = await Instance.get("/api/stages/ma-ligue", { params });
      setStages(res.data?.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les stages.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, type, startAt, endAt]);

  useEffect(() => {
    const timeout = setTimeout(fetchStages, 300);
    return () => clearTimeout(timeout);
  }, [fetchStages]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const availableTypes = useMemo(() => {
    const list = Array.isArray(stages) ? stages : [];
    const set = new Set(list.map((s) => s.type).filter(Boolean));
    return Array.from(set);
  }, [stages]);

  const resetFilters = () => {
    setSearch("");
    setType("");
    setStartAt("");
    setEndAt("");
  };

  const hasActiveFilters = search || type || startAt || endAt;

  const handleOpenSubscribe = (stage) => setSubscribeTarget(stage);

  const handleSubscribeSuccess = (inscription, payment) => {
    fetchLots(); // ✅ lots se rafraîchit → subscribedIds se met à jour automatiquement
    if (payment) setPaymentTarget(payment);
  };

  const handlePay = (lot) => setPaymentTarget(lot);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: INK }}>
            Stages de ma ligue
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>
            {loading
              ? "Chargement…"
              : `${stages.length} stage${stages.length > 1 ? "s" : ""} disponible${stages.length > 1 ? "s" : ""}`}
          </Typography>
        </Box>
      </Stack>

      {/* ✅ Paiements en attente — EN HAUT */}
      <PendingStagePaymentsSection
        lots={lots}
        loading={loadingLots}
        onPay={handlePay}
      />

      {/* Filtres */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "background.default",
        }}
      >
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher un stage..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: MUTED }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2, bgcolor: "background.default" },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value)}
                sx={{ borderRadius: 2, bgcolor: "background.default" }}
              >
                <MenuItem value="">Tous</MenuItem>
                {availableTypes.map((t) => (
                  <MenuItem
                    key={t}
                    value={t}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2.25}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Du"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                },
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2.25}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Au"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "background.default",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={1}>
            <Tooltip title="Réinitialiser les filtres">
              <span>
                <IconButton
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  sx={{
                    bgcolor: hasActiveFilters ? ACCENT_SOFT : "transparent",
                    color: hasActiveFilters ? ACCENT : MUTED,
                    borderRadius: 2,
                  }}
                >
                  <FilterAltOffIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid stages */}
      <Grid container spacing={2.5}>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
              <StageCardSkeleton />
            </Grid>
          ))}

        {!loading && stages.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: MUTED,
                border: "1px dashed #D1D5DB",
                borderRadius: 3,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                Aucun stage trouvé
              </Typography>
              <Typography variant="body2">
                {hasActiveFilters
                  ? "Essayez d'ajuster vos filtres."
                  : "Votre ligue n'a pas encore publié de stage."}
              </Typography>
            </Box>
          </Grid>
        )}

        <AnimatePresence mode="popLayout">
          {!loading &&
            stages.map((stage) => (
              <Grid item xs={12} sm={6} md={4} key={stage.id}>
                <StageCard
                  stage={stage}
                  onSubscribe={handleOpenSubscribe}
                  subscribing={false}
                  isSubscribed={subscribedIds.includes(stage.id)}
                  onViewMyRegistrations={setViewRegistrationsTarget}
                />
              </Grid>
            ))}
        </AnimatePresence>
      </Grid>

      {/* Dialogs — hors de la boucle map */}
      <MyRegistrationsDialog
        open={!!viewRegistrationsTarget}
        stage={viewRegistrationsTarget}
        onClose={() => setViewRegistrationsTarget(null)}
        onCancelled={fetchLots}
        setToast={setToast}
      />

      <SubscribeStageDialog
        open={!!subscribeTarget}
        stage={subscribeTarget}
        onClose={() => setSubscribeTarget(null)}
        onSuccess={handleSubscribeSuccess}
        setToast={setToast}
      />

      <PaymentDeclarationDialog
        open={!!paymentTarget}
        payment={paymentTarget}
        declarerEndpoint={
          paymentTarget
            ? `/api/transactions/${paymentTarget.id}/declarer`
            : null
        }
        organisateurId={paymentTarget?.organisateur_id}
        organisateurType={paymentTarget?.organisateur_type}
        onClose={() => setPaymentTarget(null)}
        onSuccess={() => {
          setPaymentTarget(null);
          fetchLots();
        }}
        setToast={setToast}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
