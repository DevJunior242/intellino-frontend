import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Instance } from "../../../../Api/Axios";

const STATUS_VALIDE = 1;

export default function InscribedAthletesTable({
  data,
  epreuve,
  loading,
  onDelete,
}) {
  const isKata = epreuve.discipline?.nom?.toLowerCase() === "kata";

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const requestDelete = (row) => {
    setError("");
    setToDelete(row);
  };
  const cancelDelete = () => setToDelete(null);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await Instance.delete(`/api/inscriptions/desinscrire/${toDelete.id}`);
      setToDelete(null);
      onDelete?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Impossible de retirer cette inscription.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      field: "athlete",
      headerName: "Athlète",
      width: 200,
      valueGetter: (value, row) => {
        if (!row || !row.athlete) return "Inconnu";
        return `${row.athlete.fullname || ""}`;
      },
      flex: 1,
    },

    {
      field: "poids_declare",
      headerName: "Poids (kg)",
      width: 110,
      hide: isKata,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Statut",
      width: 130,
      renderCell: (params) => {
        const config = {
          0: { label: "En attente", color: "default" },
          1: { label: "Validé", color: "success" },
          2: { label: "Échoué", color: "error" },
        };
        const s = config[params.value] || config[0];
        return <Chip label={s.label} color={s.color} size="small" />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 90,
      sortable: false,
      filterable: false,
      disableExport: true,
      renderCell: (params) => {
        const isValide = params.row.status === STATUS_VALIDE;
        return (
          <Tooltip
            title={
              isValide
                ? "Inscription déjà validée par la ligue"
                : "Retirer l'athlète"
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={isValide}
                onClick={() => requestDelete(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <DataGrid
        rows={data}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        loading={loading}
        checkboxSelection
        disableRowSelectionOnClick
        showToolbar
        localeText={{
          noRowsLabel: "Aucun enregistrement disponible",
          noResultsOverlayLabel: "Aucun résultat trouvé",
        }}
        autoPageSize
        columnVisibilityModel={{
          poids_declare: !isKata,
        }}
        sx={{
          "& .MuiDataGrid-columnHeader": {
            backgroundColor: "background.default",
            borderBottom: "1px solid",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            fontSize: { xs: 8, md: 16 },
          },
          "&.MuiDataGrid-root .MuiDataGrid-cell": {
            fontSize: { xs: 8, md: 16 },
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.08)"
                : "rgba(0, 0, 0, 0.04)",
            cursor: "pointer",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: (theme) =>
              `${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} !important`,
            "&:hover": {
              backgroundColor: (theme) =>
                `${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} !important`,
            },
          },

          backgroundColor: "background.default",
          borderRadius: 2,
          boxShadow: 1,
        }}
      />

      <Dialog open={Boolean(toDelete)} onClose={cancelDelete}>
        <DialogTitle>Retirer cet athlète ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {toDelete?.athlete?.fullname
              ? `${toDelete.athlete.fullname} sera désinscrit de cette épreuve.`
              : "Cet athlète sera désinscrit de cette épreuve."}{" "}
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cancelDelete} disabled={deleting}>
            Annuler
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Retirer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
