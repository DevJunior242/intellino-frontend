import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from "@mui/material";
import { PersonAdd, SwapHoriz } from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";

export default function RepartitionAthletes({ competition, configs }) {
  const [nonAssignes, setNonAssignes] = useState([]);
  const [parTatami, setParTatami] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState(null);
  const [erreur, setErreur] = useState(null);

  console.log("configs pour repartition", configs);
  console.log("competition", competition);
  const fetchData = useCallback(async () => {
    try {
      const [nonAssRes, ...tatamisRes] = await Promise.all([
        Instance.get(`/api/ordre-passages/${competition}/non-assign`),
        ...configs.map((config) =>
          Instance.get(`/api/ordre-passages/${config.id}`),
        ),
      ]);
      console.log("nonAssRes", nonAssRes);
      setNonAssignes(nonAssRes.data || []);
      const result = {};
      configs.forEach((config, i) => {
        result[config.id] = result[config.id] = tatamisRes[i].data ?? [];
      });
      setParTatami(result);
      console.log("parTatami", parTatami);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [competition, configs, parTatami]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 1. Mise à jour des URLs d'API
  const handleAssigner = async (inscriptionId, configId) => {
    setSubmitId(inscriptionId);
    try {
      const dataSend = {
        inscription_id: inscriptionId,
        config_notation_id: configId,
      };
      console.log("data send", dataSend);
      await Instance.post(`/api/ordre-passages/assigner`, dataSend);
      await fetchData();
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur d'assignation");
    } finally {
      setSubmitId(null);
    }
  };

  const handleRetirer = async (inscriptionId) => {
    setSubmitId(inscriptionId);
    try {
      const res = await Instance.delete(
        `/api/ordre-passages/inscription/${inscriptionId}`,
      );
      console.log("res", res);
      await fetchData();
    } catch (err) {
      setErreur("Erreur lors du retrait", err);
    } finally {
      setSubmitId(null);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        Répartition des athlètes par tatami
      </Typography>

      {erreur && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {erreur}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Colonne gauche — non assignés */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "warning.light",
            }}
          >
            <Box
              sx={{
                p: 1.5,
                bgcolor: "warning.main",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontWeight="bold" color="white">
                  Non assignés
                </Typography>
                <Chip
                  label={nonAssignes?.length}
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                />
              </Stack>
            </Box>

            <Stack spacing={1} sx={{ p: 1.5 }}>
              {nonAssignes.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                >
                  Tous assignés ✓
                </Typography>
              ) : (
                nonAssignes.map((inscription) => (
                  <Paper
                    key={inscription.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: "zinc.700",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {inscription.athlete?.fullname}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inscription.club?.name ?? "Inconnu"}
                      {inscription.kata && ` · ${inscription.kata.nom}`}
                    </Typography>

                    {/* Boutons assigner */}
                    <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
                      {configs.map((config) => (
                        <Chip
                          key={config.id}
                          label={
                            config.plateau_nom ||
                            `Tatami ${config.id.substring(0, 4)}`
                          }
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={
                            submitId === inscription.id ? (
                              <CircularProgress size={10} />
                            ) : (
                              <PersonAdd sx={{ fontSize: 12 }} />
                            )
                          }
                          disabled={submitId !== null}
                          onClick={() =>
                            handleAssigner(inscription.id, config.id)
                          }
                          sx={{ cursor: "pointer" }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Colonnes tatamis */}
        {configs.map((config) => (
          <Grid item xs={12} md={4} key={config.id}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "success.light",
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "success.main",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight="bold" color="white" noWrap>
                    {config.plateau_nom}
                  </Typography>
                  <Chip
                    label={parTatami[config.id]?.length || 0}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.3)",
                      color: "white",
                    }}
                  />
                </Stack>
              </Box>

              <Stack spacing={1} sx={{ p: 1.5 }}>
                {(parTatami[config.id] || []).length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    textAlign="center"
                    py={2}
                  >
                    Aucun athlète
                  </Typography>
                ) : (
                  (parTatami[config.id] || []).map((ordre, index) => (
                    <Paper
                      key={ordre.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "zinc.700",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Chip
                              label={index + 1}
                              size="small"
                              color="primary"
                            />
                            <Typography variant="body2" fontWeight="bold">
                              {ordre?.inscription?.athlete?.fullname ??
                                "Inconnu"}
                            </Typography>
                          </Stack>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            ml={4}
                          >
                            {ordre?.inscription?.club?.name}
                            {ordre?.inscription?.kata &&
                              ` · ${ordre?.inscription?.kata.nom}`}
                          </Typography>
                          <Typography variant="caption" ml={4}>
                            {ordre.inscription?.competition?.category?.nom ??
                              "Sans catégorie"}
                            ({" "}
                            {ordre.inscription?.competition?.category?.sexe ??
                              "Inconnu"}
                            )
                          </Typography>
                        </Box>

                        {/* Retirer du tatami */}
                        <Chip
                          label="✕"
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={submitId === ordre?.inscription?.id}
                          onClick={() => handleRetirer(ordre?.inscription.id)}
                          sx={{ cursor: "pointer", minWidth: 0 }}
                        />
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
