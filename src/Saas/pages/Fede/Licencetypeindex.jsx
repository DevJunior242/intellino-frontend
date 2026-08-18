import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  Pagination,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  BadgeOutlined as BadgeOutlinedIcon,
  Search as SearchIcon,
  FilterAltOff as FilterAltOffIcon,
  VerifiedOutlined as VerifiedOutlinedIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  GroupOutlined as GroupOutlinedIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { alpha, useTheme } from "@mui/material/styles";
import { Instance } from "../../../Api/Axios";
import LicenciesDialog from "./Licenciesdialog";
// ---------------------------------------------------------------------------
// Palette dérivée du thème actif (au lieu de valeurs fixes) pour s'adapter
// au clair/sombre des dashboards ligue/fédération.
// ---------------------------------------------------------------------------
const useLocalTheme = () => {
  const t = useTheme();
  return {
    ACCENT: t.palette.primary.main,
    ACCENT_SOFT: alpha(t.palette.primary.main, 0.16),
    SURFACE: t.palette.background.paper,
    SURFACE_HOVER: alpha(t.palette.text.primary, 0.06),
    BORDER: t.palette.divider,
    TEXT: t.palette.text.primary,
    MUTED: t.palette.text.secondary,
  };
};

const PAGE_SIZE = 9;

function formatTarif(tarif) {
  const n = Number(tarif || 0);
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// ---------------------------------------------------------------------------
// Carte d'un type de licence
// ---------------------------------------------------------------------------
function LicenceTypeCard({ type, onEdit, onDelete, onViewLicencies }) {
  const { ACCENT, ACCENT_SOFT, SURFACE, SURFACE_HOVER, BORDER, TEXT, MUTED } =
    useLocalTheme();
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
          border: `1px solid ${BORDER}`,
          bgcolor: SURFACE,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.2s ease, border-color 0.2s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            borderColor: MUTED,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={1.5}
          >
            <Chip
              label={type.code}
              size="small"
              sx={{
                bgcolor: ACCENT_SOFT,
                color: ACCENT,
                fontWeight: 600,
                fontFamily: "monospace",
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Stack>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: TEXT, lineHeight: 1.3, mb: 1.5 }}
          >
            {type.nom}
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 800, color: TEXT }}>
            {formatTarif(type.tarif)}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, ml: 0.75 }}
            >
              FCFA
            </Typography>
          </Typography>
          <Typography variant="caption" sx={{ color: MUTED }}>
            par élève, pour la saison en cours
          </Typography>
        </CardContent>

        <CardActions
          sx={{
            justifyContent: "space-between",
            px: 1.5,
            py: 0.75,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Tooltip title="Voir les licenciés">
            <IconButton
              size="small"
              onClick={() => onViewLicencies(type)}
              sx={{ color: MUTED }}
            >
              <GroupOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Stack direction="row">
            <Tooltip title="Modifier">
              <IconButton
                size="small"
                onClick={() => onEdit(type)}
                sx={{ color: ACCENT }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer">
              <IconButton
                size="small"
                onClick={() => onDelete(type)}
                sx={{ color: "#EF5350" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </CardActions>
      </Card>
    </motion.div>
  );
}

function LicenceTypeSkeleton() {
  const { SURFACE, BORDER } = useLocalTheme();
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}
    >
      <CardContent>
        <Skeleton width={80} height={22} sx={{ borderRadius: 2, mb: 1.5 }} />
        <Skeleton width="70%" height={26} sx={{ mb: 1.5 }} />
        <Skeleton width="50%" height={36} />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Formulaire création/édition
// ---------------------------------------------------------------------------
const EMPTY_FORM = { code: "", nom: "", tarif: "" };

const getTextFieldDarkSx = ({ TEXT, BORDER, ACCENT, MUTED }) => ({
  "& .MuiOutlinedInput-root": {
    color: TEXT,
    borderRadius: 2,
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: MUTED },
    "&.Mui-focused fieldset": { borderColor: ACCENT },
  },
  "& .MuiInputLabel-root": { color: MUTED },
  "& .MuiFormHelperText-root": { color: MUTED },
});

function LicenceTypeFormDialog({ open, editing, onClose, onSuccess }) {
  const { ACCENT, ACCENT_SOFT, SURFACE, SURFACE_HOVER, BORDER, TEXT, MUTED } =
    useLocalTheme();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              code: editing.code,
              nom: editing.nom,
              tarif: String(editing.tarif),
            }
          : EMPTY_FORM,
      );
      setErrors({});
      setServerError(null);
    }
  }, [open, editing]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!editing && !form.code.trim()) next.code = "Le code est requis.";
    if (!editing && !/^[a-z0-9_-]+$/i.test(form.code.trim())) {
      next.code = "Lettres, chiffres, tirets et underscores uniquement.";
    }
    if (!form.nom.trim()) next.nom = "Le nom est requis.";
    if (form.tarif === "" || Number(form.tarif) < 0)
      next.tarif = "Indiquez un tarif valide.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setServerError(null);

    try {
      let response;
      if (editing) {
        response = await Instance.patch(`/api/licence-types/${editing.id}`, {
          nom: form.nom,
          tarif: Number(form.tarif),
        });
      } else {
        response = await Instance.post("/api/licence-types", {
          code: form.code.trim(),
          nom: form.nom,
          tarif: Number(form.tarif),
        });
      }
      onSuccess(response.data.data, !!editing);
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Une erreur est survenue. Réessayez.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { bgcolor: SURFACE, color: TEXT } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
        }}
      >
        {editing ? "Modifier le type de licence" : "Nouveau type de licence"}
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ borderColor: BORDER }}>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {serverError}
            </Alert>
          )}

          <TextField
            label="Code"
            placeholder="ex: competiteur, loisir, arbitre"
            fullWidth
            value={form.code}
            onChange={handleChange("code")}
            error={!!errors.code}
            helperText={
              errors.code ||
              (editing
                ? "Le code ne peut plus être modifié."
                : "Identifiant technique, sans espace.")
            }
            disabled={submitting || !!editing}
            sx={getTextFieldDarkSx({ TEXT, BORDER, ACCENT, MUTED })}
          />

          <TextField
            label="Nom affiché aux clubs"
            placeholder="ex: Licence Compétiteur"
            fullWidth
            value={form.nom}
            onChange={handleChange("nom")}
            error={!!errors.nom}
            helperText={errors.nom}
            disabled={submitting}
            sx={getTextFieldDarkSx({ TEXT, BORDER, ACCENT, MUTED })}
          />

          <TextField
            label="Tarif"
            type="number"
            fullWidth
            value={form.tarif}
            onChange={handleChange("tarif")}
            error={!!errors.tarif}
            helperText={
              errors.tarif || "Montant par élève, pour la saison en cours."
            }
            disabled={submitting}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ color: MUTED }}>
                  FCFA
                </InputAdornment>
              ),
            }}
            sx={getTextFieldDarkSx({ TEXT, BORDER, ACCENT, MUTED })}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED, textTransform: "none" }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          {submitting ? "Enregistrement..." : editing ? "Enregistrer" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Confirmation de suppression
// ---------------------------------------------------------------------------
function ConfirmDeleteDialog({ open, type, onClose, onConfirm, loading }) {
  const { SURFACE, BORDER, TEXT, MUTED } = useLocalTheme();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: SURFACE, color: TEXT } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Supprimer ce type de licence ?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: MUTED }}>
          <strong style={{ color: TEXT }}>{type?.nom}</strong> ne sera plus
          proposé aux clubs. Si des licences existent déjà avec ce type, la
          suppression sera refusée.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: MUTED, textTransform: "none" }}>
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

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Section "Paiements à vérifier" — lots déclarés par les clubs,
// en attente de confirmation/rejet par la fédération.
// ---------------------------------------------------------------------------
const PROVIDER_LABELS = {
  orange_money: { label: "Orange Money", color: "#FF6600" },
  moov_money: { label: "Moov Money", color: "#0066B3" },
  wave: { label: "Wave", color: "#1DC8E0" },
  virement_bancaire: { label: "Virement", color: "#37474F" },
};

function PaymentLotCard({ lot, onConfirm, onReject, processing }) {
  const { ACCENT, ACCENT_SOFT, SURFACE, SURFACE_HOVER, BORDER, TEXT, MUTED } =
    useLocalTheme();
  const [expanded, setExpanded] = useState(false);
  const rawProvider = lot.payment_method?.provider ?? null;
  const provider = PROVIDER_LABELS[rawProvider] || {
    label: rawProvider || "Non renseigné",
    color: "#616161",
  };

  const nbLicences = lot.items?.length || 0;

  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}
    >
      <CardContent sx={{ pb: expanded ? 1 : 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: TEXT }}>
              {lot.club?.name || "Club"}
            </Typography>
            <Typography variant="caption" sx={{ color: MUTED }}>
              {nbLicences} licence{nbLicences > 1 ? "s" : ""} · déclaré le{" "}
              {lot.declared_at
                ? new Date(lot.declared_at).toLocaleDateString("fr-FR")
                : "—"}
            </Typography>
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800, color: TEXT }}>
            {formatTarif(lot.amount)}
            <Typography
              component="span"
              variant="body2"
              sx={{ color: MUTED, ml: 0.5 }}
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
            sx={{ color: MUTED, fontFamily: "monospace" }}
          >
            depuis {lot.sender_number}
          </Typography>
        </Stack>

        {lot.transaction_id && (
          <Typography
            variant="caption"
            sx={{ color: MUTED, display: "block", mt: 0.5 }}
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
          sx={{ textTransform: "none", color: ACCENT, mt: 1, px: 0 }}
        >
          {expanded ? "Masquer" : "Voir"} les licences
        </Button>

        {expanded && (
          <List dense disablePadding sx={{ mt: 1 }}>
            {(lot.items || []).map((item) => (
              <ListItem key={item.id} disablePadding sx={{ py: 0.5 }}>
                <ListItemText
                  primary={item.licence?.student?.fullname || "Élève"}
                  primaryTypographyProps={{ fontSize: "0.82rem", color: TEXT }}
                />
              </ListItem>
            ))}
          </List>
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

function PaymentsToVerifySection({
  lots,
  loading,
  error,
  onConfirm,
  onReject,
  processingId,
}) {
  const { ACCENT, ACCENT_SOFT, TEXT, MUTED, BORDER, SURFACE } = useLocalTheme();
  if (loading) {
    return (
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Skeleton height={140} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <VerifiedOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEXT }}>
          Paiements à vérifier
        </Typography>
        {lots.length > 0 && (
          <Chip
            label={lots.length}
            size="small"
            sx={{
              bgcolor: ACCENT_SOFT,
              color: ACCENT,
              fontWeight: 700,
              height: 20,
              fontSize: "0.7rem",
            }}
          />
        )}
      </Stack>

      {error ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
          }}
        >
          <Typography variant="body2" sx={{ color: "error.main" }}>
            {error}
          </Typography>
        </Box>
      ) : lots.length === 0 ? (
        <Box
          sx={{
            p: 2,
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
          }}
        >
          <Typography variant="body2" sx={{ color: MUTED }}>
            Aucun paiement en attente de vérification pour le moment. Les
            paiements déclarés par les clubs apparaîtront ici.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {lots.map((lot) => (
            <Grid item xs={12} sm={6} key={lot.id}>
              <PaymentLotCard
                lot={lot}
                onConfirm={onConfirm}
                onReject={onReject}
                processing={processingId === lot.id}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default function LicenceTypeIndex() {
  const { ACCENT, ACCENT_SOFT, SURFACE, SURFACE_HOVER, BORDER, TEXT, MUTED } =
    useLocalTheme();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewLicenciesTarget, setViewLicenciesTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Paiements déclarés en attente de vérification
  const [pendingLots, setPendingLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [lotsError, setLotsError] = useState(null);
  const [processingLotId, setProcessingLotId] = useState(null);

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Instance.get("/api/licence-types");
      setTypes(data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de charger les types de licences.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingLots = useCallback(async () => {
    setLoadingLots(true);
    setLotsError(null);
    try {
      const { data } = await Instance.get("/api/transactions", {
        params: { status: "declared", payable_type: "licence_lot" },
      });
      setPendingLots(data.data || []);
    } catch (err) {
      setPendingLots([]);
      setLotsError(
        err.response?.data?.message ||
          "Impossible de charger les paiements à vérifier.",
      );
    } finally {
      setLoadingLots(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
    fetchPendingLots();
  }, [fetchTypes, fetchPendingLots]);

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
        message:
          err.response?.data?.message || "Erreur lors de la confirmation.",
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
        message: err.response?.data?.message || "Erreur lors du rejet.",
        severity: "error",
      });
    } finally {
      setProcessingLotId(null);
    }
  };

  // Recherche locale par nom ou code — pas de requête réseau à chaque frappe
  const filteredTypes = useMemo(() => {
    if (!search.trim()) return types;
    const q = search.trim().toLowerCase();
    return types.filter(
      (t) =>
        t.nom?.toLowerCase().includes(q) || t.code?.toLowerCase().includes(q),
    );
  }, [types, search]);

  // Pagination côté client sur le résultat déjà filtré
  const pageCount = Math.max(1, Math.ceil(filteredTypes.length / PAGE_SIZE));
  const paginatedTypes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTypes.slice(start, start + PAGE_SIZE);
  }, [filteredTypes, page]);

  // Revenir à la page 1 dès que la recherche change le résultat
  useEffect(() => {
    setPage(1);
  }, [search]);

  const resetFilters = () => setSearch("");
  const hasActiveFilters = !!search;

  const handleOpenCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (type) => {
    setEditing(type);
    setFormOpen(true);
  };

  const handleFormSuccess = (savedType, wasEditing) => {
    if (wasEditing) {
      setTypes((prev) =>
        prev.map((t) => (t.id === savedType.id ? savedType : t)),
      );
      setToast({
        open: true,
        message: "Type de licence mis à jour.",
        severity: "success",
      });
    } else {
      setTypes((prev) => [...prev, savedType]);
      setToast({
        open: true,
        message: "Type de licence créé.",
        severity: "success",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await Instance.delete(`/api/licence-types/${deleteTarget.id}`);
      setTypes((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setToast({
        open: true,
        message: "Type de licence supprimé.",
        severity: "success",
      });
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
          <Typography variant="h5" sx={{ fontWeight: 800, color: TEXT }}>
            Types de licences
          </Typography>
          <Typography variant="body2" sx={{ color: MUTED }}>
            {loading
              ? "Chargement…"
              : types.length === 0
                ? "Définissez les tarifs que verront vos clubs"
                : `${filteredTypes.length} type${filteredTypes.length > 1 ? "s" : ""} ${hasActiveFilters ? "trouvé" + (filteredTypes.length > 1 ? "s" : "") : "proposé" + (filteredTypes.length > 1 ? "s" : "")}`}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
          sx={{
            bgcolor: ACCENT,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          Nouveau type
        </Button>
      </Stack>

      <PaymentsToVerifySection
        lots={pendingLots}
        loading={loadingLots}
        error={lotsError}
        onConfirm={handleConfirmLot}
        onReject={handleRejectLot}
        processingId={processingLotId}
      />

      {/* Barre de recherche / filtre */}
      {!loading && types.length > 0 && (
        <Box
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: `1px solid ${BORDER}`,
            bgcolor: SURFACE,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              size="small"
              placeholder="Rechercher par nom ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: MUTED }} />
                  </InputAdornment>
                ),
              }}
              sx={{ ...getTextFieldDarkSx({ TEXT, BORDER, ACCENT, MUTED }), maxWidth: 420 }}
            />
            <Tooltip title="Réinitialiser la recherche">
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
          </Stack>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
              <LicenceTypeSkeleton />
            </Grid>
          ))}

        {!loading && types.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: MUTED,
                border: `1px dashed ${BORDER}`,
                borderRadius: 3,
              }}
            >
              <BadgeOutlinedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, mb: 0.5, color: TEXT }}
              >
                Aucun type de licence encore
              </Typography>
              <Typography variant="body2" sx={{ mb: 2.5 }}>
                Vos clubs ne pourront acheter de licence qu'une fois un premier
                tarif défini.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  color: TEXT,
                  borderColor: BORDER,
                  "&:hover": { borderColor: ACCENT, bgcolor: ACCENT_SOFT },
                }}
              >
                Créer le premier type
              </Button>
            </Box>
          </Grid>
        )}

        {!loading && types.length > 0 && filteredTypes.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: "center",
                py: 6,
                color: MUTED,
                border: `1px dashed ${BORDER}`,
                borderRadius: 3,
              }}
            >
              <SearchIcon sx={{ fontSize: 28, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">
                Aucun type ne correspond à "{search}".
              </Typography>
            </Box>
          </Grid>
        )}

        <AnimatePresence mode="popLayout">
          {!loading &&
            paginatedTypes.map((type) => (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <LicenceTypeCard
                  type={type}
                  onEdit={handleOpenEdit}
                  onDelete={setDeleteTarget}
                  onViewLicencies={setViewLicenciesTarget}
                />
              </Grid>
            ))}
        </AnimatePresence>
      </Grid>

      {/* Pagination MUI — seulement si plus d'une page */}
      {!loading && pageCount > 1 && (
        <Stack alignItems="center" sx={{ mt: 4 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            sx={{
              "& .MuiPaginationItem-root": {
                color: MUTED,
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                bgcolor: ACCENT,
                color: "#fff",
              },
            }}
          />
        </Stack>
      )}

      <LicenceTypeFormDialog
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        type={deleteTarget}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <LicenciesDialog
        open={!!viewLicenciesTarget}
        licenceType={viewLicenciesTarget}
        onClose={() => setViewLicenciesTarget(null)}
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
