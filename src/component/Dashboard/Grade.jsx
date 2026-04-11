import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";

const Grade = () => {
  const [studentGrades, setStudentGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { activeClubId } = UseAuth();
  const getParcours = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance(
        `/api/student-grades?club_id=${activeClubId}`,
      );
      console.log(response);
      setStudentGrades(response.data.studentGrades || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    getParcours();
  }, [getParcours]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper
      sx={{
        width: "100%",
        overflow: "hidden",
        backgroundColor: "background.default",
      }}
    >
      <Typography variant="h6" gutterBottom component="div" sx={{ p: 2 }}>
        historique de Grade
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" py={5}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center" py={2}>
          Erreur lors du chargement des données.
        </Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="student grades table">
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Awarded At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentGrades.length > 0 ? (
                studentGrades.map((grade) => (
                  <TableRow
                    key={grade.id}
                    hover
                    sx={{
                      backgroundColor:
                        grade.current_grade.name === "centure blanc"
                          ? "#e80046"
                          : "#007bff",
                    }}
                  >
                    <TableCell>{grade.student.fullname}</TableCell>
                    <TableCell>{grade.current_grade.name}</TableCell>
                    <TableCell>
                      {new Date(grade.awarded_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Vous n'avez aucun enfant enregistré.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default Grade;
