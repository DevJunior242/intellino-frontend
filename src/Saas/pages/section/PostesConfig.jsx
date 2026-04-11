import { useCallback, useEffect, useState } from "react";
import { Instance } from "../../../Api/Axios";
import CreatePosteForm from "./PosteForm";
import { Box, Divider } from "@mui/material";
import PostesTable from "./PostesTable";

export default function PostesConfig() {
  const [postes, setPostes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. La fonction qui va chercher les données fraîches
  const fetchPostes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get("/api/getPostes");
      setPostes(res.data || []);
    } catch (error) {
      console.error("Erreur de chargement", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. La fonction qui va chercher les données fraîches
  useEffect(() => {
    fetchPostes();
  }, [fetchPostes]);
  return (
    <Box>
      {/* 2. On passe fetchPostes à onPosteCreated */}
      <CreatePosteForm existingPostes={postes} onPosteCreated={fetchPostes} />

      <Divider sx={{ my: 4 }} />

      {/* 3. Le tableau se mettra à jour tout seul car 'postes' change */}
      <PostesTable data={postes} loading={loading} />
    </Box>
  );
}
