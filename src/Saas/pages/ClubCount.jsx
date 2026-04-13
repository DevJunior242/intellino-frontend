import React, { useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

function ClubCount() {
  const [clubCount, setClubCount] = useState(0);

  const fetchClubCount = async () => {
    try {
      const response = await Instance("/api/clubs/count");
      setClubCount(response.data || 0);
    } catch (error) {
      console.error("Error fetching club count:", error);
    }
  };

  useEffect(() => {
    fetchClubCount();
  }, []);
  return (
    <motion.div
      style={{ zIndex: 1 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontSize: { xs: "2.2rem", md: "3rem" },
            fontWeight: 900,
            background: "linear-gradient(135deg, #ff6900, #ff4081)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {clubCount}+
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.5)",
            fontSize: "0.9rem",
            mt: 0.5,
            fontWeight: 500,
          }}
        >
          Clubs inscrits
        </Typography>
      </Box>
    </motion.div>
  );
}

export default ClubCount;
