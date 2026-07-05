import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import {
  Avatar,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  IconButton,
  TablePagination,
} from "@mui/material";
import { motion } from "framer-motion";
import { Search, Download, PictureAsPdf } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ErrorBlock from "../ErrorBlock";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { generateLicenceCardPdf } from "./licenceCardPdf";

// ---------------------------------------------------------------------------
// Helpers PDF
// ---------------------------------------------------------------------------

// Convertit une URL image en base64 pour jsPDF
const toBase64 = (url) =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });

const statusLabels = { 0: "En attente", 1: "Payée", 2: "Validée" };

// ---------------------------------------------------------------------------
// PDF individuel — carte licence soignée
// ---------------------------------------------------------------------------
const exportLicenceIndividuelle = (licence, currentLeague, currentFederation) =>
  generateLicenceCardPdf({
    licence,
    federationName: currentFederation?.name,
    leagueName: currentLeague?.name,
    clubName: licence.club?.name,
    logoUrl: currentFederation?.logo_url || currentLeague?.logo_url,
  });

// ---------------------------------------------------------------------------
// PDF export toutes licences — tableau
// ---------------------------------------------------------------------------
const exportToutesLicences = async (
  licences,
  currentLeague,
  currentFederation,
) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // En-tête
  doc.setFillColor(22, 26, 35);
  doc.rect(0, 0, 297, 30, "F");

  const logoUrl = currentFederation?.logo_url || currentLeague?.logo_url;
  if (logoUrl) {
    try {
      const base64 = await toBase64(logoUrl);
      if (base64) doc.addImage(base64, "PNG", 8, 4, 18, 18);
    } catch {
      /* silencieux */
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(232, 200, 74);
  doc.text(
    (currentFederation?.name || "Fédération").toUpperCase(),
    297 / 2,
    12,
    { align: "center" },
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(180, 190, 220);
  doc.text(`Ligue : ${currentLeague?.name || "—"}`, 297 / 2, 19, {
    align: "center",
  });

  doc.setFontSize(7);
  doc.setTextColor(139, 144, 160);
  doc.text(
    `Exporté le ${new Date().toLocaleDateString("fr-FR")}`,
    297 / 2,
    25,
    { align: "center" },
  );

  // Tableau
  autoTable(doc, {
    startY: 34,
    head: [
      ["Licencié", "N° Licence", "Club", "Type", "Grade", "Saison", "Statut"],
    ],
    body: licences.map((l) => [
      l.student?.fullname || "—",
      l.numero || "—",
      l.club?.name || "—",
      l.type || "—",
      l.grade_au_moment || "—",
      l.saison?.libele || "—",
      statusLabels[l.status] || "—",
    ]),
    styles: {
      fontSize: 8,
      cellPadding: 3,
      fillColor: [30, 34, 45],
      textColor: [232, 234, 240],
      lineColor: [50, 55, 70],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [57, 73, 171],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [22, 26, 35],
    },
    didDrawPage: (data) => {
      // Footer sur chaque page
      doc.setFontSize(6);
      doc.setTextColor(100, 105, 120);
      doc.text(`Page ${data.pageNumber}`, 297 - 10, 205, { align: "right" });
    },
  });

  doc.save(
    `licences-${currentLeague?.name || "export"}-${new Date().toLocaleDateString("fr-FR")}.pdf`,
  );
};

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------
function LicenceTable() {
  const [licences, setLicences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [exportingAll, setExportingAll] = useState(false);
  const { activeId, currentLeague, currentFederation } = UseAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const statusConfig = {
    0: { color: "warning", label: "En attente" },
    1: { color: "info", label: "Payée" },
    2: { color: "success", label: "Validée" },
  };

  const getLicences = useCallback(
    async (searchVal = "", statusVal = "", page = 1) => {
      if (!activeId) return;
      setError("");
      setLoading(true);
      try {
        const response = await Instance.get(
          `api/licences?page=${page}&search=${searchVal}&status=${statusVal}`,
        );
        setPagination({
          total: response.data.total,
          current_page: response.data.current_page,
          last_page: response.data.last_page,
          per_page: response.data.per_page,
        });
        setLicences(response.data.data || []);
      } catch {
        setError(
          "Une erreur est survenue lors de la récupération des licences",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeId],
  );

  useEffect(() => {
    getLicences();
  }, [getLicences]);

  const handlePageChange = (event, newPage) => {
    getLicences(search, status, newPage + 1);
  };

  // Export toutes licences — récupère TOUTES les pages avant d'exporter
  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const response = await Instance.get(
        `api/licences?page=1&per_page=9999&search=${search}&status=${status}`,
      );
      const toutes = response.data.data || [];
      await exportToutesLicences(toutes, currentLeague, currentFederation);
    } catch {
      // silencieux
    } finally {
      setExportingAll(false);
    }
  };

  if (error) return <ErrorBlock message={error} onRetry={getLicences} />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Stack spacing={3}>
        {/* Barre de recherche */}
        <Paper
          sx={{
            p: 2,
            bgcolor: "#22262f",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Rechercher une licence par nom, numéro..."
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              getLicences(value, status);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(255,255,255,0.03)",
                borderRadius: 2,
              },
            }}
          />
        </Paper>

        {/* Filtres + Export */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <select
            value={status}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Number(e.target.value);
              setStatus(value);
              getLicences(search, value);
            }}
            style={{
              background: "#22262f",
              color: "#e8eaf0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.85rem",
            }}
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <Button
            variant="outlined"
            startIcon={<Download fontSize="small" />}
            onClick={handleExportAll}
            disabled={exportingAll || loading}
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "#e8eaf0",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { borderColor: "#e8c84a", color: "#e8c84a" },
            }}
          >
            {exportingAll ? "Export en cours..." : "Exporter tout"}
          </Button>
        </Box>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: "#22262f",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    color: "#555a6b",
                    fontWeight: 700,
                    borderBottom: "1px solid rgba(255,255,255,0.07)",
                  },
                }}
              >
                <TableCell>Licencié</TableCell>
                <TableCell>N° de licence</TableCell>
                <TableCell>Club</TableCell>
                {/* <TableCell>Type</TableCell>
                <TableCell>Grade</TableCell> */}
                <TableCell>Validité</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography sx={{ color: "#8b90a0" }}>
                      Chargement...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : licences.length > 0 ? (
                licences.map((licence) => (
                  <TableRow
                    key={licence.id}
                    hover
                    sx={{
                      "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.03)",
                        color: "#e8eaf0",
                      },
                    }}
                  >
                    <TableCell
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "rgba(232, 200, 74, 0.12)",
                          color: "#e8c84a",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                          borderRadius: 2,
                          border: "1px solid rgba(232, 200, 74, 0.2)",
                        }}
                      >
                        {(licence.student?.fullname || "??")
                          .substring(0, 2)
                          .toUpperCase()}
                      </Avatar>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#e8eaf0",
                          fontSize: "0.85rem",
                        }}
                      >
                        {licence.student?.fullname}
                      </Typography>
                    </TableCell>
                    <TableCell>{licence.numero}</TableCell>
                    <TableCell>{licence.club?.name}</TableCell>
                    {/* <TableCell>{licence.type}</TableCell>
                    <TableCell>{licence.grade_au_moment}</TableCell> */}
                    <TableCell>{licence.saison?.libele}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusConfig[licence.status]?.label}
                        color={statusConfig[licence.status]?.color}
                        size="small"
                        sx={{ fontSize: "0.7rem", fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() =>
                          exportLicenceIndividuelle(
                            licence,
                            currentLeague,
                            currentFederation,
                          )
                        }
                        sx={{
                          color: "#8b90a0",
                          "&:hover": { color: "#e8c84a" },
                        }}
                      >
                        <PictureAsPdf fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography sx={{ color: "#8b90a0" }}>
                      Aucune licence trouvée
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={pagination.total || 0}
            page={(pagination.current_page || 1) - 1}
            rowsPerPage={pagination.per_page || 10}
            onPageChange={handlePageChange}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count}`
            }
          />
        </TableContainer>
      </Stack>
    </motion.div>
  );
}

export default LicenceTable;
