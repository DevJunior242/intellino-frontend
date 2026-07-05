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
  Chip,
  Alert,
  Skeleton,
  Stack,
} from "@mui/material";
import {
  Close as CloseIcon,
  GroupOutlined as GroupOutlinedIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Instance } from "../../../Api/Axios";

const SURFACE = "#1A1D29";
const BORDER = "rgba(255, 255, 255, 0.08)";
const TEXT = "#F5F5F7";
const MUTED = "rgba(245, 245, 247, 0.6)";
const ACCENT = "#5C6BC0";

const STATUS_LABELS = {
  0: { label: "En attente", bg: "rgba(245, 124, 0, 0.16)", fg: "#FFB74D" },
  1: { label: "Payé", bg: "rgba(46, 125, 50, 0.16)", fg: "#81C784" },
  2: { label: "Validé", bg: "rgba(92, 107, 192, 0.16)", fg: "#9FA8DA" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LicenciesDialog({ open, licenceType, onClose }) {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !licenceType) return;

    let active = true;
    setLoading(true);
    setError(null);

    Instance.get(`/api/licence-types/${licenceType.id}/licencies`)
      .then(({ data }) => {
        if (active) setLicences(data.data || []);
      })
      .catch((err) => {
        if (active)
          setError(
            err.response?.data?.message ||
              "Impossible de charger les licenciés.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, licenceType]);

  const handleExportPdf = () => {
    if (!licenceType || licences.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(licenceType.nom || "Type de licence", 14, 18);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100);
    doc.text(
      `${licences.length} licencié${licences.length > 1 ? "s" : ""}`,
      14,
      25,
    );

    const rows = licences.map((l) => [
      l.student?.fullname || "-",
      l.club?.name || "-",
      l.numero || "—",
      STATUS_LABELS[l.status]?.label || "En attente",
      formatDate(l.created_at),
    ]);

    autoTable(doc, {
      startY: 32,
      head: [["Élève", "Club", "N° licence", "Statut", "Date"]],
      body: rows,
      headStyles: { fillColor: [92, 107, 192] },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
    });

    const safeTitle = (licenceType.nom || "licencies")
      .replace(/[^a-z0-9]+/gi, "_")
      .toLowerCase();
    doc.save(`licencies_${safeTitle}.pdf`);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          Licenciés
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

        {loading && (
          <Stack spacing={1} sx={{ p: 2.5 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                height={44}
                sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.08)" }}
              />
            ))}
          </Stack>
        )}

        {!loading && !error && licences.length === 0 && (
          <Box sx={{ textAlign: "center", py: 6, color: MUTED }}>
            <GroupOutlinedIcon sx={{ fontSize: 32, mb: 1, opacity: 0.5 }} />
            <Typography variant="body2">
              Aucun licencié pour ce type pour le moment.
            </Typography>
          </Box>
        )}

        {!loading && licences.length > 0 && (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: 700, color: TEXT, borderColor: BORDER }}
                  >
                    Élève
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: TEXT, borderColor: BORDER }}
                  >
                    Club
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: TEXT, borderColor: BORDER }}
                  >
                    N° licence
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: 700, color: TEXT, borderColor: BORDER }}
                  >
                    Statut
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {licences.map((l) => {
                  const status = STATUS_LABELS[l.status] ?? STATUS_LABELS[0];
                  return (
                    <TableRow key={l.id} hover>
                      <TableCell sx={{ borderColor: BORDER }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: TEXT }}
                        >
                          {l.student?.fullname || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: BORDER }}>
                        <Typography variant="body2" sx={{ color: TEXT }}>
                          {l.club?.name || "—"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: BORDER }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            color: l.numero ? TEXT : MUTED,
                          }}
                        >
                          {l.numero || "En attente"}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderColor: BORDER }}>
                        <Chip
                          label={status.label}
                          size="small"
                          sx={{
                            bgcolor: status.bg,
                            color: status.fg,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            height: 22,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Typography variant="caption" sx={{ color: MUTED, flexGrow: 1 }}>
          {licences.length} licencié{licences.length > 1 ? "s" : ""}
        </Typography>
        {licences.length > 0 && (
          <Button
            onClick={handleExportPdf}
            startIcon={<FileDownloadIcon fontSize="small" />}
            sx={{ textTransform: "none", fontWeight: 600, color: ACCENT }}
          >
            Télécharger PDF
          </Button>
        )}
        <Button onClick={onClose} sx={{ color: MUTED, textTransform: "none" }}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
}
