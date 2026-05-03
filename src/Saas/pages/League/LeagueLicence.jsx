// import React, { useEffect, useState } from "react";
// import { useCallback } from "react";
// import { UseAuth } from "../../../Api/AuthContext";
// import { Instance } from "../../../Api/Axios";
// import LicenceTable from "./LicenceTable";
// import { Box } from "@mui/material";

// function LeagueLicence() {
//   const [loading, setLoading] = useState(true);
//   const [activelicences, setActivelicences] = useState(0);
//   const [expiredlicences, setExpiredlicences] = useState(0);
//   const [pendinglicences, setPendinglicences] = useState(0);
//   const [totalactivelicences, setTotalactivelicences] = useState(0);
//   const { auth } = UseAuth();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("Tous");

//   const leagueId = auth?.user?.current_league_id;
//   console.log("leagueId", leagueId);

//   const getLicences = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await Instance.get(
//         `/api/licences/licences?league_id=${leagueId}`,
//       );
//       console.log(response);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   }, [leagueId]);
//   useEffect(() => {
//     if (!leagueId) return;
//     getLicences();
//   }, [getLicences, leagueId]);
//   return (
//     <Box>
//       <Box>
//         <LicenceTable />
//       </Box>
//     </Box>
//   );
// }

// export default LeagueLicence;
