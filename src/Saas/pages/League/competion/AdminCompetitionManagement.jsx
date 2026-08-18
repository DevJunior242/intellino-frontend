import { useEffect, useState } from "react";
import { Instance } from "../../../../Api/Axios";
import MySwiperComp from "./MySwiperComp";
import { Alert, Box } from "@mui/material";
import AdminPeseeTable from "./AdminPeseeTable";
import { UseAuth } from "../../../../Api/AuthContext";
import ErrorBlock from "../../ErrorBlock";
import ErrorGlobal from "../../../../component/ErrorGlobal";

export default function AdminCompetitionManagement() {
  const [selectedCompId, setSelectedCompId] = useState(null);
  const [inscriptions, setInscriptions] = useState([]);
  const [errorInscriptions, setErrorInscriptions] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchInscriptions = async (compId) => {
    if (!compId) return;
    setLoading(true);
    setErrorInscriptions("");
    try {
      const res = await Instance.get("/api/admin/inscriptions", {
        params: {
          competition_id: compId,
        },
      });
      setInscriptions(res.data || []);
    } catch (err) {
      setErrorInscriptions("Erreur lors du chargement des athlètes");
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

  //valider inscription
  const handleStatusAction = async (id, action, poids_officiel) => {
    setError({});
    try {
      const res = await Instance.post(`/api/inscriptions/${id}/${action}`, {
        poids_officiel: poids_officiel || null,
      });
      fetchInscriptions(selectedCompId);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    }
  };

  if (errorInscriptions)
    return (
      <ErrorBlock
        message={error}
        onRetry={() => fetchInscriptions(selectedCompId)}
      />
    );
  return (
    <Box>
      {/* SECTION 1 : Swiper pour choisir LA compétition */}
      <MySwiperComp
        onSelect={(id) => setSelectedCompId(id)}
        selectedId={selectedCompId}
      />

      {/* SECTION 2 : Le tableau de pesée (uniquement si une comp est choisie) */}
      {selectedCompId ? (
        <AdminPeseeTable
          rows={inscriptions}
          handleStatusAction={handleStatusAction}
          loading={loading}
        />
      ) : (
        <Alert severity="info">
          Veuillez sélectionner une compétition pour voir les athlètes.
        </Alert>
      )}
    </Box>
  );
}
