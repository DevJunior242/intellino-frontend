import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import Club from "../../component/Dashboard/Club";
import DashboardStats from "../../component/Dashboard/DashboardStats";
import { Box, Typography } from "@mui/material";
const Dashboard = () => {
  return (
    <>
      <Box sx={{ py: 2, px: 2 }}>
        <DashboardStats />
      </Box>
    </>
  );
};

export default Dashboard;
