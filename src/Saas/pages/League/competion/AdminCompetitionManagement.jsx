import { useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import MySwiperComp from "./MySwiperComp";
import { Alert, Box } from "@mui/material";
import AdminPeseeTable from "./AdminPeseeTable";
import { UseAuth } from "../../../../Api/AuthContext";
import ErrorBlock from "../../ErrorBlock";

export default function AdminCompetitionManagement() {
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { activeId } = UseAuth();

  const fetchInscriptions = async (compId) => {
    if (!compId) return;
    setLoading(true);
    setError("");
    try {
      const res = await Instance.get(
        `/api/admin/inscriptions?competition_id=${compId}&organisateur_id=${activeId}`,
      );
      console.log("athletes", res);
      setInscriptions(res.data || []);
    } catch (err) {
      console.error("Erreur de chargement", err);
      setError("Erreur lors du chargement des athlètes");
    } finally {
      setLoading(false);
    }
  };
  // 1. On surveille le changement de compétition sélectionnée
  useEffect(() => {
    if (selectedCompId) {
      fetchInscriptions(selectedCompId);
    }
  }, [selectedCompId]);
  if (error) return <ErrorBlock message={error} onRetry={fetchInscriptions} />;
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
