import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import { Box, Typography } from "@mui/material";
import DashboardStats from "../Dashboard/DashboardStats";
const DashboardLeague = () => {
  return (
    <>
      <Box sx={{ py: 2, px: 2 }}>
        <DashboardStats />
      </Box>
    </>
  );
};

export default DashboardLeague;
