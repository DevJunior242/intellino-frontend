import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import { Box, CircularProgress, Typography } from "@mui/material";

import Chip from "@mui/material/Chip";
const columns = [
  { field: "category", headerName: "Catégorie", flex: 1 },
  { field: "round", headerName: "Round", flex: 1 },
  { field: "opponent", headerName: "Adversaire", flex: 1 },
  {
    field: "studentFullName",
    headerName: "Étudiant",
    flex: 1,
  },
  {
    field: "tournamentName",
    headerName: "Tournoi",
    flex: 1,
  },
  {
    field: "result",
    headerName: "Résultat",
    flex: 1,
    renderCell: (params) => {
      const value = params.value;

      let color = "default";
      if (value === "win") color = "success";
      if (value === "lose") color = "error";
      if (value === "draw") color = "warning";

      return (
        <Chip
          label={value ? value : "En attente"}
          color={color}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      );
    },
  },
];

function ParentMatch() {
  const [matchs, setMatch] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log(matchs);
  const getMatchs = async () => {
    setIsLoading(true);
    try {
      const response = await Instance("/api/tournament/parent/matches");
      console.log(response);
      const rawMatches = response.data.matches || [];

      const processedMatches = rawMatches.map((match) => ({
        ...match,

        studentFullName: match.student ? match.student.fullname : "_",
        tournamentName: match.tournament ? match.tournament.name : "_",
      }));

      setMatch(processedMatches);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMatchs();
  }, []);
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box style={{ height: 500, width: "100%" }}>
      <Typography variant="h4" sx={{ mb: 6, fontWeight: "bold" }}>
        Liste des matchs
      </Typography>
      <DataGrid
        rows={matchs}
        getRowId={(row) => row.id}
        columns={columns}
        pageSizeOptions={[5, 10, 20]}
        loading={isLoading}
        checkboxSelection
        disableRowSelectionOnClick
        showToolbar
        localeText={{
          noRowsLabel: "Aucun enregistrement disponible",
          noResultsOverlayLabel: "Aucun résultat trouvé",
        }}
          sx={{
            backgroundColor: "background.default",
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "blue !important",
            },
          }}
      />
    </Box>
  );
}

export default ParentMatch;
