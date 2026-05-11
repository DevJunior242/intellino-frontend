import React from "react";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import { Chip, TextField, Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const AdminPeseeTable = ({ rows, loading, onValidate }) => {
  console.log("rows", rows);
  // État local pour gérer les poids saisis avant validation
  const [poidsInput, setPoidsInput] = React.useState({});

  const handlePoidsChange = (id, val) => {
    setPoidsInput((prev) => ({ ...prev, [id]: val }));
  };
  const isKata =
    rows.length > 0 &&
    rows[0].competition?.discipline?.nom?.toLowerCase() === "kata";

  const allColumns = [
    {
      field: "organisateur",
      headerName: "Organisateur",
      width: 180,
      valueGetter: (value, row) =>
        row.organisateur?.name || "Sans organisateur",
      flex: 1,
    },
    {
      field: "athlete",
      headerName: "Athlète",
      width: 200,
      valueGetter: (value, row) => row.athlete?.fullname || "Inconnu",
    },
    {
      field: "category",
      headerName: "Catégorie",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={`${params.row?.competition?.category?.nom} (${params.row?.competition?.category?.sexe})`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "disciplineleague",
      headerName: "Discipline",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={`${params.row?.competition?.discipline?.nom}`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "poids_declare",
      headerName: "Prévu (kg)",
      width: 100,
      align: "center",
      hide: isKata, // Cacher pour le kata
    },
    {
      field: "poids_officiel",
      headerName: "Poids Réel",
      width: 160,
      renderCell: (params) => (
        <TextField
          size="small"
          type="number"
          placeholder="0.00"
          variant="standard"
          // On affiche soit ce qu'on tape, soit la valeur déjà en base
          value={
            poidsInput[params.row.id] !== undefined
              ? poidsInput[params.row.id]
              : params.row.poids_officiel || ""
          }
          onChange={(e) => handlePoidsChange(params.row.id, e.target.value)}
          disabled={params.row.statut_pesee !== 0} // Désactivé si déjà validé/refusé
        />
      ),
    },
    {
      field: "statut_pesee",
      headerName: "Statut",
      width: 130,
      renderCell: (params) => {
        const config = {
          0: { label: "À peser", color: "default" },
          1: { label: "Validé", color: "success" },
          2: { label: "Échoué", color: "error" },
        };
        const s = config[params.value] || config[0];
        return <Chip label={s.label} color={s.color} size="small" />;
      },
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Action",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<CheckCircleIcon color="success" />}
          label="Valider"
          onClick={() => onValidate(params.id, poidsInput[params.id], 1)}
          disabled={params.row.statut_pesee !== 0}
        />,
        <GridActionsCellItem
          icon={<CancelIcon color="error" />}
          label="Refuser"
          onClick={() => onValidate(params.id, poidsInput[params.id], 2)}
          disabled={params.row.statut_pesee !== 0}
        />,
      ],
    },
  ];

  const columns = isKata
    ? allColumns.filter(
        (col) =>
          col.field !== "poids_declare" &&
          col.field !== "poids_officiel" &&
          col.field !== "statut_pesee",
      )
    : allColumns;

  return (
    <Box
      sx={{
        height: 500,
        width: "100%",
        bgcolor: "white",
        p: 2,
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        disableSelectionOnClick
        autoPageSize
        columnVisibilityModel={{
          poids_declare: !isKata,
        }}
        density="comfortable"
        showToolbar
        localeText={{
          noRowsLabel: "Aucun enregistrement disponible",
          noResultsOverlayLabel: "Aucun résultat trouvé",
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
            backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1) !important",
            },
          },
          backgroundColor: "background.default",
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "blue !important",
          },
        }}
      />
    </Box>
  );
};

export default AdminPeseeTable;
