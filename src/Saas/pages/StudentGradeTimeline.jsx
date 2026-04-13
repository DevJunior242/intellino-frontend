import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
} from "@mui/material";
import { CheckCircle, Lock } from "@mui/icons-material";
import { Instance } from "../../Api/Axios";
import ConfigSkeleton from "./ConfigSkeleton";

function StudentGradeTimeline({ student, activeClubId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    all_club_grades: [],
    student_history: [],
  });
  useEffect(() => {
    if (!student || !activeClubId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await Instance.get(
          `/api/student-grades/${student.id}/history?club_id=${activeClubId}`,
        );
        setData(response.data);
      } catch (error) {
        setError("Erreur...");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student, activeClubId]);

  //definir le style de grade color config
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

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <ConfigSkeleton />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box
      sx={{
        px: 2,
        pb: 2,
        flexGrow: 1,
        overflowY: "auto",
        backgroundColor: "background.default",
      }}
    >
      <Stepper orientation="vertical">
        {data.all_club_grades.map((grade) => {
          const achievement = data.student_history.find(
            (h) => h.current_grade_id === grade.id,
          );
          console.log("Achievement for this grade:", achievement);

          const isAchieved = !!achievement;
          console.log("Is achieved:", isAchieved);
          const lastAwardedGradeId =
            data.student_history.length > 0
              ? data.student_history[0].current_grade_id
              : null;
          const isCurrent = grade.id === lastAwardedGradeId;

          const config = gradeColorConfig[grade.name.toLowerCase()];
          const displayColor = config ? config.color : "#bdbdbd";

          return (
            <Step key={grade.id} active={isAchieved} completed={isAchieved}>
              <StepLabel
                icon={
                  isAchieved ? (
                    <CheckCircle sx={{ color: displayColor }} />
                  ) : (
                    <Lock />
                  )
                }
                StepIconProps={{
                  sx: { color: isAchieved ? displayColor : "text.disabled" },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      color: isAchieved
                        ? gradeColorConfig[grade?.name]?.color
                        : "text.disabled",
                      fontWeight: isCurrent ? "bold" : "normal",
                    }}
                  >
                    {grade.name}
                  </Typography>
                  {isCurrent && (
                    <Chip
                      label="ACTUEL"
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: 10 }}
                    />
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                {isAchieved ? (
                  <Typography variant="body2" color="text.secondary">
                    Obtenu le{" "}
                    {new Date(achievement.awarded_at).toLocaleDateString()}
                    {achievement.instructor &&
                      ` par ${achievement.instructor.fullname}`}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.disabled">
                    À venir.
                  </Typography>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

export default StudentGradeTimeline;
