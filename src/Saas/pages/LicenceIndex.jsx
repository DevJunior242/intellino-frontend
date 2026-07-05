import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Chip,
  Snackbar,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  BadgeOutlined as BadgeOutlinedIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  PersonOutline as PersonOutlineIcon,
  ShoppingCartOutlined as ShoppingCartOutlinedIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
  PaymentsOutlined as PaymentsOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import PaymentDeclarationDialog from "./Paiement/Paymentdeclarationdialog";
import ConfigSkeleton from "./ConfigSkeleton";
import { generateLicenceCardPdf } from "./League/licenceCardPdf";

const ACCENT = "#5C6BC0";
const ACCENT_SOFT = "rgba(92, 107, 192, 0.16)";
const SURFACE = "#1A1D29";
const BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "#F5F5F7";
const MUTED = "rgba(245, 245, 247, 0.6)";

const STATUS_LABELS = {
  0: { label: "En attente", bg: "rgba(245, 124, 0, 0.16)", fg: "#FFB74D" },
  1: { label: "Payé", bg: "rgba(46, 125, 50, 0.16)", fg: "#81C784" },
  2: { label: "Validé", bg: "rgba(92, 107, 192, 0.16)", fg: "#9FA8DA" },
};

function formatTarif(tarif) {
  const n = Number(tarif || 0);
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function TypeCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}
    >
      <CardContent>
        <Skeleton
          width="60%"
          height={26}
          sx={{ mb: 1.5, bgcolor: "rgba(255,255,255,0.08)" }}
        />
        <Skeleton
          width="40%"
          height={36}
          sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
        />
      </CardContent>
    </Card>
  );
}

const darkInputSx = {
  "& .MuiOutlinedInput-root": {
    color: TEXT,
    bgcolor: "rgba(255,255,255,0.04)",
    borderRadius: 2,
    "& fieldset": { borderColor: BORDER },
  },
};

// ---------------------------------------------------------------------------
// Formulaire d'achat — sélection multiple d'élèves pour un type donné
// ---------------------------------------------------------------------------
function PurchaseDialog({ open, licenceType, onClose, onSuccess, setToast }) {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    setLoadingStudents(true);
    setLoadError(null);

    Instance.get("/api/licences/mes-etudiants")
      .then(({ data }) => {
        if (active) setStudents(data.data || []);
      })
      .catch((err) => {
        if (active)
          setLoadError(
            err.response?.data?.message || "Impossible de charger les élèves.",
          );
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });

    return () => {
      active = false;
    };
  }, [open]);

  const resetForm = () => {
    setSelectedIds([]);
    setSearch("");
    setServerError(null);
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((s) => s.fullname?.toLowerCase().includes(q));
  }, [students, search]);

  const total = selectedIds.length * Number(licenceType?.tarif || 0);

  const handleSubmit = async () => {
    if (!licenceType || selectedIds.length === 0) {
      setServerError("Sélectionnez au moins un élève.");
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const { data } = await Instance.post("/api/licences", {
        items: selectedIds.map((studentId) => ({
          student_id: studentId,
          licence_type_id: licenceType.id,
        })),
      });

      setToast?.({
        open: true,
        message: "Licence(s) créée(s) avec succès !",
        severity: "success",
      });
      onSuccess?.(data.data, data.payment);
      resetForm();
      onClose();
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
          "Une erreur est survenue lors de l'achat.",
      );
    } finally {
      setSubmitting(false);
    }
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
        <Box>
          Acheter des licences
          {licenceType?.nom && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              {licenceType.nom} — {formatTarif(licenceType.tarif)} FCFA / élève
            </Typography>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={handleClose}
          disabled={submitting}
          sx={{ color: MUTED }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, borderColor: BORDER }}>
        <Box sx={{ p: 2.5, pb: 1.5 }}>
          {serverError && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {serverError}
            </Alert>
          )}
          {loadError && (
            <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>
              {loadError}
            </Alert>
          )}

          <Typography variant="body2" sx={{ color: MUTED, mb: 2 }}>
            Sélectionnez les élèves à licencier.
          </Typography>

          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loadingStudents}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: MUTED }} />
                </InputAdornment>
              ),
            }}
            sx={darkInputSx}
          />

          {selectedIds.length > 0 && (
            <Chip
              label={`${selectedIds.length} sélectionné${selectedIds.length > 1 ? "s" : ""}`}
              size="small"
              onDelete={() => setSelectedIds([])}
              sx={{
                bgcolor: ACCENT_SOFT,
                color: ACCENT,
                fontWeight: 600,
                mt: 1.5,
              }}
            />
          )}
        </Box>

        <Box sx={{ maxHeight: 320, overflowY: "auto", px: 1 }}>
          {loadingStudents && <ConfigSkeleton />}

          {!loadingStudents && !loadError && filteredStudents.length === 0 && (
            <Box sx={{ textAlign: "center", py: 5, color: MUTED }}>
              <PersonOutlineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">
                {search
                  ? "Aucun élève ne correspond à votre recherche."
                  : "Aucun élève trouvé dans votre club."}
              </Typography>
            </Box>
          )}

          {!loadingStudents && filteredStudents.length > 0 && (
            <List dense disablePadding>
              {filteredStudents.map((s) => {
                const checked = selectedIds.includes(s.id);
                return (
                  <ListItem key={s.id} disablePadding>
                    <ListItemButton
                      onClick={() => toggleSelected(s.id)}
                      disabled={submitting}
                      sx={{ borderRadius: 2, mb: 0.5 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={checked}
                          tabIndex={-1}
                          disableRipple
                          size="small"
                          sx={{
                            color: MUTED,
                            "&.Mui-checked": { color: ACCENT },
                          }}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={s.fullname}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          color: TEXT,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {selectedIds.length > 0 && (
          <>
            <Divider sx={{ borderColor: BORDER }} />
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ color: MUTED }}>
                Total à payer
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: TEXT }}>
                {formatTarif(total)}{" "}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: MUTED }}
                >
                  FCFA
                </Typography>
              </Typography>
            </Box>
          </>
        )}
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
          disabled={submitting || selectedIds.length === 0}
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4A5AB8", boxShadow: "none" },
          }}
        >
          {submitting
            ? "Envoi..."
            : `Confirmer l'achat${selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Modal "Voir mes licences" — pour UN type précis
// ---------------------------------------------------------------------------
function MyLicencesDialog({
  open,
  licenceType,
  onClose,
  onCancelled,
  setToast,
}) {
  const { currentClub } = UseAuth();
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!open || !licenceType) return;

    let active = true;
    setLoading(true);
    setError(null);

    Instance.get("/api/licences/mes-licences", {
      params: { licence_type_id: licenceType.id },
    })
      .then(({ data }) => {
        if (active) setLicences(data.data || []);
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.message ||
              "Impossible de charger vos licences.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, licenceType]);

  const handleDownloadPdf = (licence) => {
    generateLicenceCardPdf({
      licence,
      federationName: currentClub?.federation_name,
      leagueName: currentClub?.league_name,
      clubName: currentClub?.name,
    });
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await Instance.delete(`/api/licences/${cancelTarget.id}`);
      setLicences((prev) => prev.filter((l) => l.id !== cancelTarget.id));
      setToast?.({
        open: true,
        message: "Licence annulée.",
        severity: "success",
      });
      onCancelled?.(cancelTarget, licenceType);
    } catch (err) {
      setToast?.({
        open: true,
        message: err.response?.data?.message || "Erreur lors de l'annulation.",
        severity: "error",
      });
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
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
          <Box>
            Mes licences
            {licenceType?.nom && (
              <Typography
                variant="body2"
                sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
              >
                {licenceType.nom}
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: MUTED }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0, borderColor: BORDER }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2, m: 2 }}>
              {error}
            </Alert>
          )}

          {loading && <ConfigSkeleton />}

          {!loading && !error && licences.length === 0 && (
            <Box sx={{ textAlign: "center", py: 6, color: MUTED }}>
              <PersonOutlineIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
              <Typography variant="body2">
                Vous n'avez encore licencié aucun élève avec ce type.
              </Typography>
            </Box>
          )}

          {!loading && licences.length > 0 && (
            <List disablePadding sx={{ px: 1, py: 1 }}>
              {licences.map((l) => {
                const status = STATUS_LABELS[l.status] ?? STATUS_LABELS[0];
                const cancellable = Number(l.status) !== 2;
                return (
                  <ListItem
                    key={l.id}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                    }}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip
                          title={
                            l.numero
                              ? "Télécharger la carte de licence"
                              : "Numéro pas encore attribué"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadPdf(l)}
                              disabled={!l.numero}
                              sx={{ color: ACCENT }}
                            >
                              <FileDownloadIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            cancellable ? "Annuler la licence" : "Déjà validée"
                          }
                        >
                          <span>
                            <IconButton
                              edge="end"
                              size="small"
                              onClick={() => setCancelTarget(l)}
                              disabled={!cancellable}
                              sx={{ color: "#EF5350" }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={l.student?.fullname}
                      secondary={`N° ${l.numero || "En attente"}`}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: TEXT,
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.75rem",
                        color: MUTED,
                        fontFamily: "monospace",
                      }}
                    />
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{
                        bgcolor: status.bg,
                        color: status.fg,
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        height: 22,
                        mr: 8.5,
                      }}
                    />
                  </ListItem>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" sx={{ color: MUTED, flexGrow: 1 }}>
            {licences.length} licence{licences.length > 1 ? "s" : ""}
          </Typography>
          <Button
            onClick={onClose}
            sx={{ color: MUTED, textTransform: "none" }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { bgcolor: SURFACE, color: TEXT } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Annuler cette licence ?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: MUTED }}>
            La licence de{" "}
            <strong style={{ color: TEXT }}>
              {cancelTarget?.student?.fullname}
            </strong>{" "}
            sera annulée. Cette action est définitive.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setCancelTarget(null)}
            sx={{ color: MUTED, textTransform: "none" }}
          >
            Retour
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={cancelling}
          >
            {cancelling ? "Annulation..." : "Annuler la licence"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// Section "Paiements en attente" — liste les lots non payés du club,
// avec bouton "Payer" sur chaque lot pour ouvrir la déclaration.
// ---------------------------------------------------------------------------
const LOT_STATUS_LABELS = {
  pending: {
    label: "À payer",
    bg: "rgba(245, 124, 0, 0.16)",
    fg: "#FFB74D",
    Icon: HourglassEmptyIcon,
  },
  declared: {
    label: "Vérification en cours",
    bg: "rgba(92, 107, 192, 0.16)",
    fg: "#9FA8DA",
    Icon: HourglassEmptyIcon,
  },
  paid: {
    label: "Payé",
    bg: "rgba(46, 125, 50, 0.16)",
    fg: "#81C784",
    Icon: CheckCircleOutlineIcon,
  },
};

function PendingPaymentsSection({ lots, loading, onPay }) {
  const unpaidLots = lots.filter((l) => l.status !== "paid");

  if (loading) {
    return <ConfigSkeleton />;
  }

  if (unpaidLots.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <PaymentsOutlinedIcon sx={{ fontSize: 18, color: ACCENT }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: TEXT }}>
          Paiements en attente
        </Typography>
        <Chip
          label={unpaidLots.length}
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
        {unpaidLots.map((lot) => {
          const status =
            LOT_STATUS_LABELS[lot.status] || LOT_STATUS_LABELS.pending;
          const nbLicences = lot.items?.length || 0;

          return (
            <Card
              key={lot.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${BORDER}`,
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
                      sx={{ fontWeight: 700, color: TEXT }}
                    >
                      {nbLicences} licence{nbLicences > 1 ? "s" : ""}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: TEXT }}
                    >
                      {formatTarif(lot.amount)}
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{ color: MUTED, ml: 0.5 }}
                      >
                        FCFA
                      </Typography>
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                      icon={
                        <status.Icon
                          sx={{
                            fontSize: 14,
                            color: `${status.fg} !important`,
                          }}
                        />
                      }
                      label={status.label}
                      size="small"
                      sx={{
                        bgcolor: status.bg,
                        color: status.fg,
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
                          "&:hover": { bgcolor: "#4A5AB8" },
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
// Composant principal — un seul écran : grid des types + actions par carte
// ---------------------------------------------------------------------------
export default function LicenceIndex() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState(null);

  // Compteur "déjà licenciés" par type, pour affichage sur la carte sans ouvrir le modal
  const [licenceCounts, setLicenceCounts] = useState({});

  const [purchaseTarget, setPurchaseTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  // Lots de paiement du club (section "Paiements en attente")
  const [lots, setLots] = useState([]);
  const [loadingLots, setLoadingLots] = useState(true);
  const [paymentTarget, setPaymentTarget] = useState(null);
 
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await Instance.get("/api/licences/types-disponibles");
      setTypes(data.data || []);
      setInfoMessage(data.message || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Impossible de charger les licences.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCounts = useCallback(async () => {
    try {
      const { data } = await Instance.get("/api/licences/mes-licences");
      const counts = {};
      (data.data || []).forEach((l) => {
        const typeId = l.licence_type_id;
        counts[typeId] = (counts[typeId] || 0) + 1;
      });
      setLicenceCounts(counts);
    } catch {
      // silencieux : l'affichage du compteur est secondaire, pas bloquant
    }
  }, []);

  const fetchLots = useCallback(async () => {
    setLoadingLots(true);
    try {
      const { data } = await Instance.get("/api/licence-payments/mes-lots");
      setLots(data.data || []);
    } catch {
      // silencieux : section secondaire, ne bloque pas le reste de la page
    } finally {
      setLoadingLots(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
    fetchCounts();
    fetchLots();
  }, [fetchTypes, fetchCounts, fetchLots]);

  const handlePurchaseSuccess = (licences, lot) => {
    fetchCounts(); // recharge les compteurs après un achat
    fetchLots(); // recharge la liste des lots (le nouveau lot apparaît)
  };

  const handleCancelled = () => {
    fetchCounts(); // recharge les compteurs après une annulation
    fetchLots(); // le montant du lot concerné a pu changer
  };

  const handlePaymentSuccess = () => {
    setPaymentTarget(null);
    fetchLots(); // le lot passe en "Vérification en cours"
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: "primary" }}>
          Licences
        </Typography>
        <Typography variant="body2" sx={{ color: "secondary" }}>
          {loading
            ? "Chargement…"
            : "Licenciez vos élèves et suivez vos achats"}
        </Typography>
      </Box>

      <PendingPaymentsSection
        lots={lots}
        loading={loadingLots}
        onPay={setPaymentTarget}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}
      {loading && <ConfigSkeleton />}

      <Grid container spacing={2.5}>
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
                Aucune licence disponible
              </Typography>
              <Typography variant="body2">
                {infoMessage ||
                  "Votre fédération n'a pas encore défini de tarif pour cette saison."}
              </Typography>
            </Box>
          </Grid>
        )}

        {!loading &&
          types.map((type) => {
            const count = licenceCounts[type.id] || 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={type.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${BORDER}`,
                    bgcolor: SURFACE,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
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
                      {count > 0 && (
                        <Chip
                          label={`${count} licencié${count > 1 ? "s" : ""}`}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.06)",
                            color: MUTED,
                            fontSize: "0.7rem",
                            height: 22,
                          }}
                        />
                      )}
                    </Stack>

                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700, color: TEXT, mb: 1.5 }}
                    >
                      {type.nom}
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: TEXT }}
                    >
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
                      par élève
                    </Typography>
                  </CardContent>

                  <CardActions
                    sx={{ p: 1.5, gap: 1, borderTop: `1px solid ${BORDER}` }}
                  >
                    <Button
                      fullWidth
                      size="small"
                      startIcon={<ShoppingCartOutlinedIcon fontSize="small" />}
                      onClick={() => setPurchaseTarget(type)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        bgcolor: ACCENT,
                        color: "#fff",
                        "&:hover": { bgcolor: "#4A5AB8" },
                      }}
                    >
                      Acheter
                    </Button>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon fontSize="small" />}
                      onClick={() => setViewTarget(type)}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        whiteSpace: "nowrap",
                        color: TEXT,
                      }}
                    >
                      Mes licences
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
      </Grid>

      <PurchaseDialog
        open={!!purchaseTarget}
        licenceType={purchaseTarget}
        onClose={() => setPurchaseTarget(null)}
        onSuccess={handlePurchaseSuccess}
        setToast={setToast}
      />

      <MyLicencesDialog
        open={!!viewTarget}
        licenceType={viewTarget}
        onClose={() => setViewTarget(null)}
        onCancelled={handleCancelled}
        setToast={setToast}
      />

      <PaymentDeclarationDialog
        open={!!paymentTarget}
        payment={paymentTarget}
        declarerEndpoint={
          paymentTarget
            ? `/api/licence-payments/${paymentTarget.id}/declarer`
            : null
        }
        organisateurId={paymentTarget?.federation_id}
        organisateurType="Federation"
        onClose={() => setPaymentTarget(null)}
        onSuccess={handlePaymentSuccess}
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
