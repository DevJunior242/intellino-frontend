import { Box, Grid } from "@mui/material";

import Barcharts from "./Admin/Barcharts";
import { UseAuth } from "../../Api/AuthContext";
import Program from "../../Saas/pages/Program";
import LatestStudents from "../../Saas/pages/LatestStudents";
import QuickActions from "../../Saas/pages/QuickActions";
import PaymentStat from "../../Saas/pages/PaymentStat";
import PendingPaymentsWidget from "./PendingPaymentsWidget";
import DebtorsWidget from "./DebtorsWidget";
function SecretaireDashboard() {
  const { activeId } = UseAuth();

  return (
    <Box
      component={"div"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      sx={{
        backgroundColor: "background.default",
        borderRadius: 4,
        mt: 0,
      }}
    >
      <PaymentStat activeId={activeId} />

      <Grid container spacing={3} sx={{ px: { xs: 1.5, sm: 3 }, mb: 3 }}>
        <Grid item xs={12} md={6}>
          <DebtorsWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <PendingPaymentsWidget />
        </Grid>
      </Grid>

      <Box
        sx={{
          gap: 3,
          display: "flex",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
        }}
      >
        <Program activeId={activeId} role="secretaire" />
        <LatestStudents />
      </Box>

      <Box sx={{ px: { xs: 1.5, sm: 3 }, py: 3 }}>
        <QuickActions />
      </Box>
    </Box>
  );
}

export default SecretaireDashboard;
