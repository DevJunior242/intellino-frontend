import React, { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  TextField,
  Avatar,
  Box,
  Button,
  Divider,
  CircularProgress,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Alert,
} from "@mui/material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { Instance } from "../../../../Api/Axios";
import NominationRow from "../../../../component/NominationRow";

export default function BureauNomination() {
  //   const [loading, setLoading] = useState(false);
  const [allNominations, setAllNominations] = useState({});
  const [selectedMandat, setSelectedMandat] = useState(null);
  const [data, setData] = useState({
    postes: [],
    users: [],
    mandats: [],
    loading: true,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const [resPostes, resUsers, resMandats] = await Promise.all([
        Instance.get("/api/getPostes"),
        Instance.get("/api/candidatures"),
        Instance.get("/api/getMandats"),
      ]);
      console.log("resPostes", resPostes.data);
      console.log("resUsers", resUsers.data);
      console.log("resMandats", resMandats.data);
      setData({
        postes: resPostes.data || [],
        users: resUsers.data || [],
        mandats: resMandats.data || [],
        loading: false,
      });
    } catch (error) {
      console.error("Erreur de chargement", error);
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [juryInfo, setJuryInfo] = useState(null);

  // 1. Récupérer l'organisation du jury au chargement
  useEffect(() => {
    if (selectedMandat) {
      Instance.get(`/api/my-jury-status?mandat_id=${selectedMandat}`)
        .then((res) => setJuryInfo(res.data))
        .catch((err) => console.error("Pas un membre du jury"));
    }
  }, [selectedMandat]);

  const handleUpdate = (posteId, data) => {
    setAllNominations((prev) => ({
      ...prev,
      [posteId]: data,
    }));
  };
  const handleFinalSave = async () => {
    // On ne garde que les postes où un candidat a été choisi
    const nominationsValides = Object.values(allNominations)
      .filter((n) => n.candidat_id)
      .map((n) => ({
        candidat_id: n.candidat_id,
        date_nomination: new Date().toISOString().split("T")[0],
        organisateur_id: 1,
        organisateur_type: "App\\Models\\Federation",
      }));

    const payload = {
      nominations: nominationsValides,
    };

    try {
      await Instance.post("/api/bureau/save", payload);
      // ... success
    } catch (err) {
      /* ... error */
    }
  };

  if (data.loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 2 }}>
      {/* 1. Sélection du Mandat */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel>Sélectionner le Mandat de l'élection</InputLabel>
        <Select
          value={selectedMandat}
          label="Sélectionner le Mandat de l'élection"
          onChange={(e) => setSelectedMandat(e.target.value)}
        >
          {data.mandats.map((m) => (
            <MenuItem key={m.id} value={m.id}>
              Mandat {m.start_at} - {m.end_at} {m.actif ? "(Actuel)" : ""}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 2. Statut du Jury */}
      {juryInfo ? (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            Session de supervision officielle :{" "}
            <strong>{juryInfo.org_type}</strong>
          </Typography>
          <Typography variant="caption" sx={{ display: "block" }}>
            Rôle : {juryInfo.role} | Organisation ID : {juryInfo.org_id}
          </Typography>
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Vous n'êtes pas accrédité comme jury pour ce mandat ou cette entité.
        </Alert>
      )}

      {/* 3. Affichage des lignes de nomination (Uniquement si Jury reconnu) */}
      {juryInfo && (
        <Box>
          {data.postes.length > 0 ? (
            <>
              {data.postes.map((poste) => {
                // FILTRAGE CRUCIAL : On ne montre que les candidats de l'organisation du jury
                const candidatsAffichables = data.users.filter(
                  (c) =>
                    c.mandat_id === selectedMandat &&
                    c.poste_id === poste.id &&
                    c.organisateur_id === juryInfo?.org_id,
                );

                return (
                  <NominationRow
                    key={poste.id}
                    poste={poste}
                    candidats={candidatsAffichables} // <--- Liste sécurisée
                    onNominationChange={handleUpdate}
                  />
                );
              })}

              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleFinalSave}
                sx={{ mt: 4, py: 1.5, fontWeight: "bold" }}
              >
                Enregistrer le Bureau Définitif
              </Button>
            </>
          ) : (
            <Alert severity="info">
              Veuillez d'abord créer des postes dans l'onglet "Configuration".
            </Alert>
          )}
        </Box>
      )}
    </Box>
  );
}
