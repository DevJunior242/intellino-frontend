import { Box } from "@mui/material";

import Barcharts from "./Admin/Barcharts";
import { UseAuth } from "../../Api/AuthContext";
import Program from "../../Saas/pages/Program";
import AbsentList from "../../Saas/pages/AbsentList";
import LatestStudents from "../../Saas/pages/LatestStudents";
import QuickActions from "../../Saas/pages/QuickActions";
function InstructorDashboard() {
  const { activeClubId } = UseAuth();

  return (
    <Box>
      <Box
        component={"div"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        sx={{
          backgroundColor: "background.default",
          borderRadius: 4,
          p: 3,
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: "16px",
        }}
      >
        <Program activeClubId={activeClubId} role="instructeur" />
        <Barcharts activeClubId={activeClubId} />
      </Box>
      <Box
        component={"div"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        sx={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: "16px",
        }}
      >
        <LatestStudents />
        <AbsentList />
      </Box>
      <QuickActions role="instructeur" />
    </Box>
  );
}

export default InstructorDashboard;
