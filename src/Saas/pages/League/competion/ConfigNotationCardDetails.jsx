import React, { useCallback, useEffect, useState } from "react";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import ConfigNotationCard from "./ConfigNotationCard";
import SeanceAdminPanel from "./SeanceAdminPanel";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import SaisieNotePage from "./SaisieNotePage";
import JugePrincipalDashboard from "./JugePrincipalDashboard";
import DesignerSuperviseur from "./DesignerSuperviseur";
import RepartitionAthletes from "./RepartitionAthletes";

export default function ConfigNotationCardDetails() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState({});
  const [configs, setConfigs] = useState([]);
  const [submitId, setSubmitId] = useState(null);
  const { auth, activeId, activeType } = UseAuth();

  const adminJuge =
    auth?.role?.includes("admin_league") ||
    auth?.role?.includes("juge_principal");
  // const estAdmin = auth?.role?.includes("admin_league");
  // const estJugePrincipal = auth?.role?.includes("juge_principal");
  const estArbitre = auth?.role?.includes("arbitre_league");

  // UN seul système de vue
  const [vue, setVue] = useState("config");
  const [configActive, setConfigActive] = useState(null);
  const [enCours, setEnCours] = useState(null);

  // Arbitre69-
  const [poste, setPoste] = useState(null);
  const [pin, setPin] = useState("");
  const [erreurPin, setErreurPin] = useState({});

  const [loadingPin, setLoadingPin] = useState(false);

  // ── Fetch configs ──────────────────────────────────
  const getConfigs = useCallback(async () => {
    setLoading(true);
    if (!activeId) return;
    try {
      const res = await Instance.get(
        `/api/config-notation/config-notation?organisateur_id=${activeId}&organisateur_type=${activeType}`,
      );
      console.log("getConfigs res", res);
      setConfigs(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeId, activeType]);

  useEffect(() => {
    getConfigs();
  }, [getConfigs]);

  // ── Admin — Valider ────────────────────────────────
  const handleValider = async (id) => {
    setSubmitId(id);
    setSuccess((prev) => ({ ...prev, [id]: null }));
    setError((prev) => ({ ...prev, [id]: [] }));
    try {
      await Instance.post(`/api/seances/configs/${id}/valider`);
      const freshConfigs = await getConfigs();

      const config = freshConfigs?.find((c) => c.id === id);
      if (config) setConfigActive(config);

      setVue("repartition");
    } catch (err) {
      const msg = err.response?.data?.problemes ||
        err.response?.data?.message || ["Une erreur est survenue."];
      setError((prev) => ({ ...prev, [id]: msg }));
      setTimeout(() => {
        setError((prev) => ({ ...prev, [id]: [] }));
      }, 5000);
    } finally {
      setSubmitId(null);
    }
  };

  // ── Admin — Lancer séance ──────────────────────────
  const handleLaunchSeance = async (configId) => {
    setSuccess((prev) => ({ ...prev, [configId]: null }));
    setError((prev) => ({ ...prev, [configId]: [] }));
    try {
      const res = await Instance.post(
        `/api/seances/configs/${configId}/lancer`,
      );
      if (res.data.success) {
        const config = configs.find((c) => c.id === configId);

        // localStorage.setItem("config_active_id", configId);
        setConfigActive(config);
        setEnCours(res.data.enCours);
        setVue("seance");
      }
    } catch (err) {
      const msg = err.response?.data?.problemes || ["Une erreur est survenue."];
      setError((prev) => ({ ...prev, [configId]: msg }));
    }
  };
  //  Initialiser la seance
  const initSeance = useCallback(async () => {
    const configId = localStorage.getItem("config_active_id");
    const savedPoste = localStorage.getItem("poste");

    if (!configId) return;

    try {
      const config = configs.find((c) => c.id === configId);
      if (!config) return;

      const { data } = await Instance.get(
        `/api/seances/competition/${config.id}/en-cours`,
      );
      console.log("init seance data", data);

      setConfigActive(config);

      if (data.enCours) {
        // il y a encore un athlète en cours
        setEnCours(data.enCours);
        // localStorage.setItem("enCours", JSON.stringify(data.enCours));
      }

      if (savedPoste) {
        setPoste(savedPoste);
        //setVue("saisie"); // arbitre direct
      } else {
        setVue("seance"); // admin
      }
    } catch (err) {
      console.error(err);
    }
  }, [configs]);

  useEffect(() => {
    getConfigs();
  }, [getConfigs]);

  useEffect(() => {
    if (configs.length > 0) {
      initSeance();
    }
  }, [configs, initSeance]);
  // ── Arbitre — Ouvrir saisie PIN ────────────────────
  const ouvrirPin = (config) => {
    setConfigActive(config);
    setPin("");
    setErreurPin({});
    setVue("pin");
  };

  // ── Arbitre — Soumettre PIN ────────────────────────
  const soumettrePin = async () => {
    setLoadingPin(true);
    setErreurPin({});
    try {
      const res = await Instance.post(
        `/api/seances/configs/${configActive.id}/connecter-tablette`,
        { code_acces: pin },
      );
      console.log("res", res);
      if (res.data.success) {
        localStorage.setItem("poste", res.data.poste);
        //localStorage.setItem("config_active_id", configActive.id);
        setPoste(res.data.poste);
        //superviseur dans configNotationCard, arbitre
        if (res.data.superviseur === 1) {
          setVue("seance");
        } else {
          setVue("saisie");
        }
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setLoadingPin(false);
    }
  };

  // ── Rendu ──────────────────────────────────────────
  // Vue saisie notes arbitre
  if (vue === "saisie") {
    return (
      <SaisieNotePage
        config={configActive}
        competitionId={configActive.competition_id}
        poste={poste}
      />
    );
  }

  // Vue PIN arbitre
  if (vue === "pin") {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Paper sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}>
          <Typography variant="h6" fontWeight="bold" mb={1}>
            {configActive.plateau_nom}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Entrez votre code d'accès
          </Typography>

          {error.general && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.general}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Code PIN"
            name="code_acces"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            inputProps={{
              maxLength: 6,
              inputMode: "numeric",
              style: {
                fontSize: "2rem",
                textAlign: "center",
                letterSpacing: "0.5rem",
              },
            }}
            sx={{ mb: 2 }}
            required
          />
          {error?.code_acces && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.code_acces}
            </Alert>
          )}

          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={pin.length !== 6 || loadingPin}
            onClick={soumettrePin}
            sx={{ py: 2, borderRadius: 3 }}
          >
            {loadingPin ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Se connecter"
            )}
          </Button>

          <Button fullWidth sx={{ mt: 1 }} onClick={() => setVue("config")}>
            Retour
          </Button>
        </Paper>
      </Box>
    );
  }
  if (vue === "repartition" && configActive) {
    return (
      <RepartitionAthletes
        competition={configActive.competition_id}
        configs={configs.filter(
          (c) => c.competition_id === configActive.competition_id,
        )}
      />
    );
  }
  if (adminJuge) {
    return (
      <JugePrincipalDashboard
        configs={configs}
        loading={loading}
        handleValider={handleValider}
        onConnecterJuge={ouvrirPin}
        estArbitre={estArbitre}
        errors={error}
        success={success}
        submitId={submitId}
      />
    );
  }

  // if (vue === "superviseur") {
  //   return (
  //     <DesignerSuperviseur
  //       config={configActive}
  //       onSuperviseurDesigne={() => setVue("config")}
  //       handleLaunchSeance={handleLaunchSeance}
  //     />
  //   );
  // }

  // Vue séance admin
  if (vue === "seance") {
    return (
      <SeanceAdminPanel
        error={error}
        success={success}
        initSeance={initSeance}
        config={configActive}
        loading={loading}
        handleLaunchSeance={handleLaunchSeance}
        onAthleteSuivant={(suivant) => {
          console.log("NEW ATHLETE", suivant);
          setEnCours(suivant);
        }}
      />
    );
  }

  // Vue config (défaut)
  return (
    <Box>
      <ConfigNotationCard
        configs={configs}
        loading={loading}
        handleValider={handleValider}
        handleLaunchSeance={handleLaunchSeance}
        onConnecterJuge={ouvrirPin}
        estArbitre={estArbitre}
        errors={error}
        success={success}
        submitId={submitId}
      />
    </Box>
  );
}
