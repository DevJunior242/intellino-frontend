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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Pagination,
} from "@mui/material";
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  FilterAltOff as FilterAltOffIcon,
  Add as AddIcon,
  GroupOutlined,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import StageForm from "./StageForm";
import EditStageDialog from "./EditStageDialog";
import StageRegistrationsDialog from "./StageRegistrationsDialog";
import {
  PaymentsOutlined as PaymentsOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
// ---------------------------------------------------------------------------
// Config visuelle : palette sobre, un seul accent (indigo profond),
// pensée pour un dashboard fédéral / ligue — pas de gradient générique.
// ---------------------------------------------------------------------------
const ACCENT = "#3949AB";
const ACCENT_SOFT = "#E8EAF6";
const INK = "#E5E7EB";
const MUTED = "#6B7280";

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
// ---------------------------------------------------------------------------
// Carte d'un stage
// ---------------------------------------------------------------------------
function StageCard({ stage, onEdit, onDelete, onViewRegistrations }) {
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
            sx={{ fontWeight: 700, color: INK, lineHeight: 1.3, mb: 1 }}
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

        <CardActions sx={{ justifyContent: "flex-end", px: 1.5, py: 0.75 }}>
          <Tooltip title="Voir les inscrits">
            <IconButton
              size="small"
              onClick={() => onViewRegistrations(stage)}
              sx={{ color: "#00695C" }}
            >
              <GroupOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton
              size="small"
              onClick={() => onEdit(stage)}
              sx={{ color: ACCENT }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => onDelete(stage)}
              sx={{ color: "#D32F2F" }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton de chargement (grid)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Dialog de confirmation de suppression
// ---------------------------------------------------------------------------
function ConfirmDeleteDialog({ open, stage, onClose, onConfirm, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Supprimer ce stage ?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          Cette action est définitive. Le stage <strong>{stage?.title}</strong>{" "}
          sera supprimé.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const PROVIDER_LABELS = {
  orange_money: { label: "Orange Money", color: "#FF6600" },
  moov_money: { label: "Moov Money", color: "#0066B3" },
  wave: { label: "Wave", color: "#1DC8E0" },
  virement_bancaire: { label: "Virement", color: "#37474F" },
};

function StagePaymentLotCard({ lot, onConfirm, onReject, processing }) {
  const [expanded, setExpanded] = useState(false);
  const rawProvider = lot.payment_method?.provider ?? null;
  const provider = PROVIDER_LABELS[rawProvider] || {
    label: rawProvider || "Non renseigné",
    color: "#616161",
  };
  const nbInscrits = lot.items?.length || 0;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#E5E7EB" }}
            >
              {lot.club?.name || "Club"}
            </Typography>
            <Typography variant="caption" sx={{ color: "#6B7280" }}>
              {nbInscrits} participant{nbInscrits > 1 ? "s" : ""} · déclaré le{" "}
              {lot.declared_at
                ? new Date(lot.declared_at).toLocaleDateString("fr-FR")
                : "—"}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#E5E7EB" }}>
            {Number(lot.amount || 0).toLocaleString("fr-FR")}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: "#6B7280", ml: 0.5 }}
            >
              FCFA
            </Typography>
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mt: 1.5 }}
        >
          <Chip
            label={provider.label}
            size="small"
            sx={{
              bgcolor: provider.color,
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.7rem",
            }}
          />
          <Typography
            variant="body2"
            sx={{ color: "#6B7280", fontFamily: "monospace" }}
          >
            depuis {lot.sender_number}
          </Typography>
        </Stack>

        {lot.transaction_id && (
          <Typography
            variant="caption"
            sx={{ color: "#6B7280", display: "block", mt: 0.5 }}
          >
            Réf : {lot.transaction_id}
          </Typography>
        )}

        <Button
          size="small"
          onClick={() => setExpanded((e) => !e)}
          endIcon={
            <ExpandMoreIcon
              sx={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          }
          sx={{ textTransform: "none", color: "#5C6BC0", mt: 1, px: 0 }}
        >
          {expanded ? "Masquer" : "Voir"} les participants
        </Button>

        {expanded && (
          <Box sx={{ mt: 1 }}>
            {(lot.items || []).map((item) => (
              <Typography
                key={item.id}
                variant="body2"
                sx={{ color: "#E5E7EB", fontSize: "0.82rem", py: 0.25 }}
              >
                {item.stageRegistration?.user?.name || "Participant"}
              </Typography>
            ))}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <Button
          size="small"
          startIcon={<CheckCircleIcon fontSize="small" />}
          onClick={() => onConfirm(lot)}
          disabled={processing}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            bgcolor: "#2E7D32",
            color: "#fff",
            "&:hover": { bgcolor: "#1B5E20" },
          }}
        >
          Confirmer
        </Button>
        <Button
          size="small"
          startIcon={<CancelIcon fontSize="small" />}
          onClick={() => onReject(lot)}
          disabled={processing}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            color: "#EF5350",
          }}
        >
          Rejeter
        </Button>
      </CardActions>
    </Card>
  );
}

function StagePaymentsToVerifySection({
  lots,
  loading,
  onConfirm,
  onReject,
  processingId,
}) {
  if (loading)
    return (
      <Skeleton
        height={140}
        sx={{ borderRadius: 3, mb: 3, bgcolor: "rgba(255,255,255,0.08)" }}
      />
    );
  if (lots.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <PaymentsOutlinedIcon sx={{ fontSize: 18, color: "#5C6BC0" }} />
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#E5E7EB" }}
        >
          Paiements à vérifier
        </Typography>
        <Chip
          label={lots.length}
          size="small"
          sx={{
            bgcolor: "rgba(92,107,192,0.16)",
            color: "#5C6BC0",
            fontWeight: 700,
            height: 20,
            fontSize: "0.7rem",
          }}
        />
      </Stack>
      <Grid container spacing={2}>
        {lots.map((lot) => (
          <Grid item xs={12} sm={6} key={lot.id}>
            <StagePaymentLotCard
              lot={lot}
              onConfirm={onConfirm}
              onReject={onReject}
              processing={processingId === lot.id}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
export default function StageIndex() {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [registrationsTarget, setRegistrationsTarget] = useState(null);
  const [openEditting, setOpenEditting] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [pendingLots, setPendingLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [processingLotId, setProcessingLotId] = useState(null);
  //ouvrir la modale de modification
  const handleEdit = (stage) => {
    setOpenEditting(true);
    setEditing(stage);
  };
  const handleEditClose = () => setOpenEditting(false);
  // --- filtres (état brut des champs, synchronisés vers l'API) ---
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // --- delete dialog ---
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [pagination, setPagination] = useState({});

  // --- toast ---
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchStages = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search) params.search = search;
        if (type) params.type = type;
        if (startAt) params.start_at = startAt;
        if (endAt) params.end_at = endAt;

        const res = await Instance.get(`/api/stages?page=${page}`, { params });

        const save = res.data.data;
        setPagination({
          currentPage: save.current_page,
          lastPage: save.last_page,
          perPage: save.per_page,
          total: save.total,
        });
        setStages(save.data || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Impossible de charger les stages.",
        );
      } finally {
        setLoading(false);
      }
    },
    [search, type, startAt, endAt],
  );

  useEffect(() => {
    const timeout = setTimeout(fetchStages, 300); // debounce léger sur la recherche
    return () => clearTimeout(timeout);
  }, [fetchStages]);

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await Instance.delete(`/api/stages/${deleteTarget.id}`);
      setStages((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setToast({ open: true, message: "Stage supprimé.", severity: "success" });
    } catch (err) {
      setToast({
        open: true,
        message:
          err.response?.data?.message || "Erreur lors de la suppression.",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const fetchPendingLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const { data } = await Instance.get("/api/transactions/a-verifier", {
        params: { payable_type: "stage" },
      });
      setPendingLots(data.data || []);
    } catch {
      // silencieux
    } finally {
      setLoadingLots(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingLots();
  }, [fetchPendingLots]);

  const handleConfirmLot = async (lot) => {
    setProcessingLotId(lot.id);
    try {
      await Instance.patch(`/api/transactions/${lot.id}/confirmer`);
      setPendingLots((prev) => prev.filter((l) => l.id !== lot.id));
      setToast({
        open: true,
        message: "Paiement confirmé.",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur.",
        severity: "error",
      });
    } finally {
      setProcessingLotId(null);
    }
  };

  const handleRejectLot = async (lot) => {
    setProcessingLotId(lot.id);
    try {
      await Instance.patch(`/api/transactions/${lot.id}/rejeter`);
      setPendingLots((prev) => prev.filter((l) => l.id !== lot.id));
      setToast({
        open: true,
        message: "Déclaration rejetée.",
        severity: "success",
      });
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || "Erreur.",
        severity: "error",
      });
    } finally {
      setProcessingLotId(null);
    }
  };
  return (
    <Box>
      {/* En-tête */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            Stages
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>
            {loading
              ? "Chargement…"
              : `${stages.length} stage${stages.length > 1 ? "s" : ""}`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
          sx={{
            bgcolor: ACCENT,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#303F9F", boxShadow: "none" },
          }}
        >
          Nouveau stage
        </Button>
      </Stack>

      <StagePaymentsToVerifySection
        lots={pendingLots}
        loading={loadingLots}
        onConfirm={handleConfirmLot}
        onReject={handleRejectLot}
        processingId={processingLotId}
      />

      {/* Barre de filtres — réutilisable, basée sur query params /api/stages */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: "1px solid #E5E7EB",
          bgcolor: "#1a1d2",
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
                sx: { borderRadius: 2, bgcolor: "#1a1d2" },
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
                sx={{ borderRadius: 2, bgcolor: "#1a1d2" }}
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
                  bgcolor: "#1a1d2",
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
                  bgcolor: "#1a1d2",
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

      {/* Erreur */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Grid de stages */}
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
                  : "Créez votre premier stage pour le voir apparaître ici."}
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
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onViewRegistrations={setRegistrationsTarget}
                />
              </Grid>
            ))}
        </AnimatePresence>
      </Grid>

      {/* Dialog suppression */}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        stage={deleteTarget}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
      <StageRegistrationsDialog
        open={!!registrationsTarget}
        stage={registrationsTarget}
        onClose={() => setRegistrationsTarget(null)}
      />
      {/* Toast */}
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
      <StageForm
        open={open}
        handleClose={handleClose}
        onRefresh={fetchStages}
      />
      <EditStageDialog
        open={openEditting}
        onClose={handleEditClose}
        onRefresh={fetchStages}
        stage={editing}
        setToast={setToast}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        {pagination.lastPage > 1 && (
          <Pagination
            count={pagination.lastPage}
            page={pagination.currentPage}
            onChange={(e, value) => fetchStages(value)}
            color="primary"
          />
        )}
      </Box>
    </Box>
  );
}
