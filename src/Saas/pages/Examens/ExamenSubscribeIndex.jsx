import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Stack,
  Skeleton,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  HowToReg as HowToRegIcon,
  CheckCircle as CheckCircleIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Instance } from "../../../Api/Axios";
import SubscribeExamenDialog from "./SubscribeExamenDialog";
import PaymentDeclarationDialog from "../Paiement/Paymentdeclarationdialog";

const ACCENT = "#3949AB";
const ACCENT_SOFT = "#E8EAF6";
const INK = "#E5E7EB";
const MUTED = "#6B7280";
const SURFACE = "#1a1d2a";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ExamenCard({ examen, onSubscribe, isSubscribed }) {
  const free = !examen.price || Number(examen.price) <= 0;

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
              label={free ? "Gratuit" : `${Number(examen.price).toLocaleString("fr-FR")} FCFA`}
              size="small"
              sx={{
                bgcolor: free ? "#E8F5E9" : "#FFF3E0",
                color: free ? "#2E7D32" : "#E65100",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
            <Chip
              label={examen.organisateur_type}
              size="small"
              sx={{
                bgcolor: "#F3F4F6",
                color: "#374151",
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, lineHeight: 1.3, mb: 1 }}
          >
            Passage : {examen.currentGrade?.name || "—"} → {examen.nextGrade?.name || "—"}
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ color: MUTED }}
          >
            <CalendarIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
              {formatDate(examen.start_date)}
            </Typography>
          </Stack>
        </CardContent>

        <Divider sx={{ borderColor: "#F1F2F4" }} />

        <CardActions sx={{ px: 1.5, py: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => onSubscribe(examen)}
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
            }}
          >
            {isSubscribed ? "Déjà inscrit(s)" : "Inscrire des élèves"}
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );
}

function ExamenCardSkeleton() {
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
  pending: { label: "À payer", fg: "#FFB74D" },
  declared: { label: "Vérification en cours", fg: "#9FA8DA" },
  paid: { label: "Payé", fg: "#81C784" },
};

function PendingExamenPaymentsSection({ lots, loading, onPay }) {
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
                      Passage : {lot.examen?.nextGrade?.name || "Examen"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: MUTED }}>
                      {nbInscrits} candidat{nbInscrits > 1 ? "s" : ""}
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
// Composant principal — inscription/paiement des examens (Club → Club/Ligue/Fédération)
// Accessible aux karateka majeurs pour l'auto-paiement, pas seulement au staff.
// ---------------------------------------------------------------------------
export default function ExamenSubscribeIndex() {
  const [examens, setExamens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const [subscribeTarget, setSubscribeTarget] = useState(null);

  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [paymentTarget, setPaymentTarget] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const subscribedIds = useMemo(() => {
    return lots.map((lot) => lot.examen_id).filter(Boolean);
  }, [lots]);

  const fetchLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const { data } = await Instance.get("/api/examen-payments/mes-lots");
      setLots(data.data || []);
    } catch {
      // silencieux
    } finally {
      setLoadingLots(false);
    }
  }, []);

  const fetchExamens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;

      const res = await Instance.get("/api/examens/disponibles-club", {
        params,
      });
      setExamens(res.data?.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les examens.",
      );
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(fetchExamens, 300);
    return () => clearTimeout(timeout);
  }, [fetchExamens]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const handleOpenSubscribe = (examen) => setSubscribeTarget(examen);

  const handleSubscribeSuccess = (candidats, payment) => {
    fetchLots();
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
            Examens disponibles
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>
            {loading
              ? "Chargement…"
              : `${examens.length} examen${examens.length > 1 ? "s" : ""} disponible${examens.length > 1 ? "s" : ""}`}
          </Typography>
        </Box>
      </Stack>

      <PendingExamenPaymentsSection
        lots={lots}
        loading={loadingLots}
        onPay={handlePay}
      />

      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "background.default",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher un grade..."
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
              <ExamenCardSkeleton />
            </Grid>
          ))}

        {!loading && examens.length === 0 && (
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
                Aucun examen disponible
              </Typography>
              <Typography variant="body2">
                Votre club, votre ligue ou votre fédération n'a pas encore
                programmé d'examen ouvert.
              </Typography>
            </Box>
          </Grid>
        )}

        <AnimatePresence mode="popLayout">
          {!loading &&
            examens.map((examen) => (
              <Grid item xs={12} sm={6} md={4} key={examen.id}>
                <ExamenCard
                  examen={examen}
                  onSubscribe={handleOpenSubscribe}
                  isSubscribed={subscribedIds.includes(examen.id)}
                />
              </Grid>
            ))}
        </AnimatePresence>
      </Grid>

      <SubscribeExamenDialog
        open={!!subscribeTarget}
        examen={subscribeTarget}
        onClose={() => setSubscribeTarget(null)}
        onSuccess={handleSubscribeSuccess}
        setToast={setToast}
      />

      <PaymentDeclarationDialog
        open={!!paymentTarget}
        payment={paymentTarget}
        declarerEndpoint={
          paymentTarget
            ? `/api/examen-payments/${paymentTarget.id}/declarer`
            : null
        }
        organisateurId={paymentTarget?.examen?.organisateur_id}
        organisateurType={paymentTarget?.examen?.organisateur_type}
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
