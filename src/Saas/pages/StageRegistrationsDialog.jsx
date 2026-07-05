import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Alert,
  Skeleton,
  Stack,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Close as CloseIcon,
  GroupOutlined as GroupOutlinedIcon,
  FileDownload as FileDownloadIcon,
  Payments as PaymentsIcon,
  DeleteOutline as DeleteOutlineIcon,
} from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const MUTED = "#6B7280";
const ACCENT = "#3949AB";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount) {
  const n = Number(amount || 0);
  return n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const PAYMENT_LABELS = {
  pending: { label: "En attente", bg: "#FFF8E1", fg: "#F57F17" },
  paid: { label: "Payé", bg: "#E8F5E9", fg: "#2E7D32" },
};

export default function StageRegistrationsDialog({ open, stage, onClose }) {
  const [registrations, setRegistrations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingPresenceId, setUpdatingPresenceId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open || !stage) return;

    let active = true;
    setLoading(true);
    setError(null);

    Instance.get(`/api/stages/${stage.id}/inscriptions`)
      .then((regRes) => {
        if (active) {
          setRegistrations(regRes.data.data || []);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.response?.data?.message || "Impossible de charger les données.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, stage]);

  const handleTogglePresence = async (registration) => {
    setUpdatingPresenceId(registration.id);
    try {
      const { data } = await Instance.patch(
        `/api/inscriptions/${registration.id}/presence`,
      );
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === registration.id
            ? { ...r, is_present: data.data.is_present }
            : r,
        ),
      );
    } catch {
      // silencieux : la checkbox reste dans son état précédent
    } finally {
      setUpdatingPresenceId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await Instance.delete(`/api/inscriptions/${deleteTarget.id}`);
      setRegistrations((prev) => prev.filter((r) => r.id !== deleteTarget.id));

      // Le montant dû peut avoir changé pour ce club, on relit les paiements à jour
      const { data } = await Instance.get(`/api/stages/${stage.id}/paiements`);
      setPayments(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleExportPdf = () => {
    if (!stage || registrations.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(stage.title || "Stage", 14, 18);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100);
    const periode = stage.end_at
      ? `${formatDate(stage.start_at)} -> ${formatDate(stage.end_at)}`
      : formatDate(stage.start_at);
    doc.text(periode, 14, 25);
    doc.text(
      `${registrations.length} inscrit${registrations.length > 1 ? "s" : ""}`,
      14,
      31,
    );

    const rows = registrations.map((r) => [
      r.user?.fullname || "-",
      r.club?.name || "-",
      r.is_present ? "Présent" : "—",
    ]);

    autoTable(doc, {
      startY: 38,
      head: [["Pratiquant", "Club", "Présence"]],
      body: rows,
      headStyles: { fillColor: [57, 73, 171] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    const safeTitle = (stage.title || "stage")
      .replace(/[^a-z0-9]+/gi, "_")
      .toLowerCase();
    doc.save(`inscrits_${safeTitle}.pdf`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: 800,
        }}
      >
        <Box>
          Inscrits au stage
          {stage?.title && (
            <Typography
              variant="body2"
              sx={{ color: MUTED, fontWeight: 500, mt: 0.25 }}
            >
              {stage.title}
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, m: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={44} sx={{ borderRadius: 1 }} />
            ))}
          </Stack>
        )}

        {!loading && !error && registrations.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: MUTED }}>
            <GroupOutlinedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Aucune inscription pour ce stage.
            </Typography>
          </Box>
        )}

        {!loading && registrations.length > 0 && (
          <>
            {/* Tableau des pratiquants — plus de paiement individuel ici */}
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Pratiquant</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Club</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Présent
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {registrations.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.user?.fullname || "—"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: MUTED }}>
                          {r.user?.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {r.club?.name || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={!!r.is_present}
                          disabled={updatingPresenceId === r.id}
                          onChange={() => handleTogglePresence(r)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Retirer cet inscrit">
                          <IconButton
                            size="small"
                            onClick={() => setDeleteTarget(r)}
                            sx={{ color: "#D32F2F" }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: MUTED, flexGrow: 1 }}>
          {registrations.length} inscrit{registrations.length > 1 ? "s" : ""}
        </Typography>
        {registrations.length > 0 && (
          <Button
            onClick={handleExportPdf}
            startIcon={<FileDownloadIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 600, color: ACCENT }}
          >
            Télécharger PDF
          </Button>
        )}
        <Button onClick={onClose} color="inherit">
          Fermer
        </Button>
      </DialogActions>

      {/* Confirmation de retrait d'un inscrit par la ligue */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Retirer cet inscrit ?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            <strong>{deleteTarget?.user?.fullname}</strong> (
            {deleteTarget?.club?.name}) sera retiré du stage. Cette action est
            définitive.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit">
            Annuler
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Retirer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
