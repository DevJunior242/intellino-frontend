import { DataGrid } from "@mui/x-data-grid";
import { Box, Chip } from "@mui/material";

export default function InscribedAthletesTable({ data, epreuve, loading }) {
  console.log("data", data);
  const isKata = epreuve.discipline?.nom?.toLowerCase() === "kata";

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
  ];

  return (
    <Box sx={{ height: 400, width: "100%" }}>
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
            backgroundColor: "rgba(255, 255, 255, 0.05) !important",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1) !important",
            },
          },

          backgroundColor: "background.default",
          borderRadius: 2,
          boxShadow: 1,
        }}
      />
    </Box>
  );
}
