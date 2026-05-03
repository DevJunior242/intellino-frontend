import React, { useCallback, useEffect, useState } from "react";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import { Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";
import ConfigSkeleton from "../../Saas/pages/ConfigSkeleton";
import ErrorBlock from "../../Saas/pages/ErrorBlock";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

function MiniBar({ label, value, index }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#e8c84a", fontWeight: 600 }}
          >
            {value}%
          </Typography>
        </Box>
        <Box
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.07)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 3,
              background: "linear-gradient(90deg, #e8c84a, #f0a030)",
            }}
          />
        </Box>
      </Box>
    </motion.div>
  );
}
function LicenceProgress() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { activeId } = UseAuth();

  //gatcategories
  const getCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await Instance.get(
        `/api/categories?league_id=${activeId}`,
      );
      console.log(response);
      setData(response.data.categories || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (error) return <ErrorBlock message={error} onRetry={getCategories} />;

  return (
    <motion.div
      variants={fadeUp}
      custom={1}
      initial="hidden"
      animate="visible"
      style={{ flex: 1 }}
    >
      <Paper
        sx={{
          p: 2.5,
          bgcolor: "#22262f",
          borderRadius: 3,
          border: "1px solid rgba(255,255,255,0.05)",
          height: "100%",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
          Licenciés par catégorie
        </Typography>

        {data.map((cat, index) => {
          return (
            <MiniBar
              key={cat.id}
              label={`${cat.nom} (${cat.sexe})`}
              value={cat.taux}
              index={index}
            />
          );
        })}
      </Paper>
    </motion.div>
  );
}

export default LicenceProgress;
