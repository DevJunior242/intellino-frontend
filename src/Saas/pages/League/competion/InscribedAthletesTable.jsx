import { DataGrid } from "@mui/x-data-grid";
import { Chip } from "@mui/material";

const columns = [
  {
    field: "athlete",
    headerName: "Athlète",
    width: 200,
    // Correction : params.row contient les données de la ligne
    valueGetter: (value, row) => {
      if (!row || !row.athlete) return "Inconnu";
      return `${row.athlete.fullname || ""}`;
    },
  },
  {
    field: "category",
    headerName: "Catégorie",
    width: 150,
    renderCell: (params) => (
      <Chip
        label={
          params.row.category
            ? `${params.row.category.nom} (${params.row.category.sexe})`
            : "N/A"
        }
        size="small"
        variant="outlined"
      />
    ),
  },
  {
    field: "discipline",
    headerName: "Discipline",
    width: 120,
    valueGetter: (value, row) => row.disciplineleague?.nom || "N/A",
  },
  {
    field: "poids_declare",
    headerName: "Poids (kg)",
    width: 110,
  },
  {
    field: "statut_pesee",
    headerName: "Statut",
    width: 130,
    renderCell: (params) => {
      const isValide = params.row.statut_pesee === 1;
      return (
        <Chip
          label={isValide ? "Validé" : "En attente"}
          color={isValide ? "success" : "warning"}
          size="small"
        />
      );
    },
  },
];

export default function InscribedAthletesTable({ data, loading }) {
  return (
    <div style={{ height: 400, width: 700 }}>
      <DataGrid
        rows={data}
        columns={columns}
        loading={loading}
        pageSize={5}
        getRowId={(row) => row.id}
        disableSelectionOnClick
      />
    </div>
  );
}
