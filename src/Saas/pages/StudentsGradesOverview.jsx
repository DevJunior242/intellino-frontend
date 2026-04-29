import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  Button,
  Drawer,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Visibility } from "@mui/icons-material";
import StudentGradeTimeline from "./StudentGradeTimeline";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";
import ErrorBlock from "./ErrorBlock";

function StudentsGradesOverview() {
  const [studentGrades, setStudentGrades] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { activeId, activeType } = UseAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const handleOpenDrawer = (data) => {
    setSelectedStudent(data);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedStudent(null);
  };

  //get Students Grades
  const getParcours = useCallback(async () => {
    if (!activeId) return;
    setLoading(true);
    setError("");
    try {
      const response = await Instance(
        `/api/student-grades?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log(response);
      setStudentGrades(response.data.studentGrades || []);
    } catch (error) {
      console.error(error);
      setError("Erreur lors de la récupération des notes");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    getParcours();
  }, [getParcours]);
  const gradeColorConfig = {
    "centure blanche": { color: "#f5f5f5" },
    "centure jaune": { color: "#FFEB3B" },
    "centure verte": { color: "#4CAF50" },
    "centure bleue": { color: "#2196F3" },
    "centure noire": { color: "#212121" },
    "centure rouge": { color: "#f44336" },
    "centure grise": { color: "#8884d8" },
    "centure orange": { color: "#ff9800" },
    "centure marron": { color: "#f44336" },
  };
  if (error)
    return (
      <ErrorBlock
        message="Impossible de charger les notes"
        onRetry={getParcours}
      />
    );
  return (
    <Box
      sx={{ p: 3, backgroundColor: "background.default", minHeight: "100vh" }}
    >
      <Typography variant="h4" gutterBottom>
        Historique des grades
      </Typography>

      {loading ? (
        <ConfigSkeleton />
      ) : studentGrades.length === 0 ? (
        <Typography color="error" align="center" py={2}>
          Aucun historique disponible
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{ borderRadius: 2, backgroundColor: "background.default" }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Élève</TableCell>
                <TableCell>Grade Actuel</TableCell>
                <TableCell>Obtenu le</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentGrades.map((grade) => (
                <TableRow key={grade.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={grade.photo} alt={grade.fullname} />
                      <Typography variant="body1" fontWeight="medium">
                        {grade?.student?.fullname || "Nom Inconnu"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={grade.current_grade.name}
                      sx={{
                        bgcolor: grade.current_grade.color,
                        color:
                          gradeColorConfig[grade?.current_grade?.name]?.color ||
                          "#000",
                        fontWeight: "bold",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(grade.awarded_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleOpenDrawer(grade.student)}
                    >
                      Historique
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Le Drawer (panneau latéral) */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        PaperProps={{ sx: { width: { xs: "100%", sm: 450 } } }}
      >
        <Box
          sx={{
            p: 2,
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            mb={3}
            sx={{ backgroundColor: "background.default" }}
          >
            <IconButton onClick={handleCloseDrawer} sx={{ mr: 1 }}>
              <ArrowBack />
            </IconButton>
            <Typography
              variant="h5"
              component="div"
              onClick={handleCloseDrawer}
            >
              Historique de {selectedStudent?.fullname}
            </Typography>
          </Box>

          {selectedStudent && (
            <StudentGradeTimeline
              activeId={activeId}
              studentId={selectedStudent.id}
              student={selectedStudent}
              onClose={handleCloseDrawer}
            />
          )}
        </Box>
      </Drawer>
    </Box>
  );
}

export default StudentsGradesOverview;
