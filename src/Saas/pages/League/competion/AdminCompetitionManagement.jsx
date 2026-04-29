import { useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import MySwiperComp from "./MySwiperComp";
import { Alert, Box } from "@mui/material";
import AdminPeseeTable from "./AdminPeseeTable";

export default function AdminCompetitionManagement() {
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. On surveille le changement de compétition sélectionnée
  useEffect(() => {
    if (selectedCompId) {
      fetchInscriptions(selectedCompId);
    }
  }, [selectedCompId]);

  const fetchInscriptions = async (compId) => {
    setLoading(true);
    try {
      const res = await Instance.get(
        `/api/admin/inscriptions?competition_id=${compId}`,
      );
      console.log("athletes", res);
      setInscriptions(res.data || []);
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* SECTION 1 : Swiper pour choisir LA compétition */}
      <MySwiperComp
        onSelect={(id) => setSelectedCompId(id)}
        selectedId={selectedCompId}
      />

      {/* SECTION 2 : Le tableau de pesée (uniquement si une comp est choisie) */}
      {selectedCompId ? (
        <AdminPeseeTable rows={inscriptions} loading={loading} />
      ) : (
        <Alert severity="info">
          Veuillez sélectionner une compétition pour voir les athlètes.
        </Alert>
      )}
    </Box>
  );
}
