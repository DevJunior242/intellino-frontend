import { Box } from "@mui/material";
import { UseAuth } from "../../Api/AuthContext";
import Program from "../../Saas/pages/Program";
import StudentsGradesOverview from "../../Saas/pages/StudentsGradesOverview";

function StudentDashboard() {
  const { activeId } = UseAuth();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Box>
        <Program activeId={activeId} role="karateka" />

        <StudentsGradesOverview />
      </Box>
    </Box>
  );
}

export default StudentDashboard;
