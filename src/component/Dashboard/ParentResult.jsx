import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Instance } from "../../Api/Axios";
import PulseLoader from "react-spinners/PulseLoader";
import { Box, CircularProgress, Typography } from "@mui/material";

const columns = [
  { field: "tournamentName", headerName: "Tournoi", flex: 1 },
  { field: "studentFullName", headerName: "Étudiant", flex: 1 },
  { field: "medalName", headerName: "Médaille", flex: 1 },
  { field: "score", headerName: "Score", flex: 1 },
];

function ParentResult() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  console.log(results);
  const getMatchs = async () => {
    setIsLoading(true);
    try {
      const response = await Instance("/api/tournament/parent/results");
      console.log(response);
      const rawResults = response.data.results || [];

      const processResult = rawResults.map((result) => ({
        ...result,

        studentFullName: result.student ? result.student.fullname : "_",
        tournamentName: result.tournament ? result.tournament.name : "_",
        medalName: result.medal ? result.medal.name : "_",
      }));

      setResults(processResult);
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
        <CircularProgress />{" "}
      </Box>
    );
  }
  return (
    <Box style={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={results}
        getRowId={(row) => `${row.student_id}-${row.tournament_id}`}
        columns={columns}
        pageSizeOptions={[5, 10]}
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

export default ParentResult;
