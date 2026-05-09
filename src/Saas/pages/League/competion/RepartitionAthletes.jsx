// import { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Stack,
//   Chip,
//   Button,
//   CircularProgress,
//   Alert,
//   Divider,
//   Grid,
// } from "@mui/material";
// import { PersonAdd, SwapHoriz } from "@mui/icons-material";
// import { Instance } from "../../../../Api/Axios";

// export default function RepartitionAthletes({ competition, configs }) {
//   const [nonAssignes, setNonAssignes] = useState([]);
//   const [parTatami, setParTatami] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitId, setSubmitId] = useState(null);
//   const [erreur, setErreur] = useState(null);

//   console.log("configs pour repartition", configs);
//   console.log("competition", competition);
//   const fetchData = useCallback(async () => {
//     try {
//       const [nonAssRes, ...tatamisRes] = await Promise.all([
//         Instance.get(`/api/ordre-passages/${competition}/non-assign`),
//         ...configs.map((config) =>
//           Instance.get(`/api/ordre-passages/${config.id}`),
//         ),
//       ]);
//       console.log("nonAssRes", nonAssRes);
//       setNonAssignes(nonAssRes.data || []);
//       const result = {};
//       configs.forEach((config, i) => {
//         result[config.id] = result[config.id] = tatamisRes[i].data ?? [];
//       });
//       setParTatami(result);
//       console.log("parTatami", parTatami);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }, [competition, configs, parTatami]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // 1. Mise à jour des URLs d'API
//   const handleAssigner = async (inscriptionId, configId) => {
//     setSubmitId(inscriptionId);
//     try {
//       const dataSend = {
//         inscription_id: inscriptionId,
//         config_notation_id: configId,
//       };
//       console.log("data send", dataSend);
//       await Instance.post(`/api/ordre-passages/assigner`, dataSend);
//       await fetchData();
//     } catch (err) {
//       setErreur(err.response?.data?.message || "Erreur d'assignation");
//     } finally {
//       setSubmitId(null);
//     }
//   };

//   const handleRetirer = async (inscriptionId) => {
//     setSubmitId(inscriptionId);
//     try {
//       const res = await Instance.delete(
//         `/api/ordre-passages/inscription/${inscriptionId}`,
//       );
//       console.log("res", res);
//       await fetchData();
//     } catch (err) {
//       setErreur("Erreur lors du retrait", err);
//     } finally {
//       setSubmitId(null);
//     }
//   };

//   if (loading)
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );

//   return (
//     <Box sx={{ p: 2 }}>
//       <Typography variant="h6" fontWeight="bold" mb={3}>
//         Répartition des athlètes par tatami
//       </Typography>

//       {erreur && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           {erreur}
//         </Alert>
//       )}

//       <Grid container spacing={2}>
//         {/* Colonne gauche — non assignés */}
//         <Grid item xs={12} md={4}>
//           <Paper
//             sx={{
//               borderRadius: 3,
//               overflow: "hidden",
//               border: "1px solid",
//               borderColor: "warning.light",
//             }}
//           >
//             <Box
//               sx={{
//                 p: 1.5,
//                 bgcolor: "warning.main",
//               }}
//             >
//               <Stack
//                 direction="row"
//                 justifyContent="space-between"
//                 alignItems="center"
//               >
//                 <Typography fontWeight="bold" color="white">
//                   Non assignés
//                 </Typography>
//                 <Chip
//                   label={nonAssignes?.length}
//                   size="small"
//                   sx={{
//                     bgcolor: "rgba(255,255,255,0.3)",
//                     color: "white",
//                   }}
//                 />
//               </Stack>
//             </Box>

//             <Stack spacing={1} sx={{ p: 1.5 }}>
//               {nonAssignes.length === 0 ? (
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                   textAlign="center"
//                   py={2}
//                 >
//                   Tous assignés ✓
//                 </Typography>
//               ) : (
//                 nonAssignes.map((inscription) => (
//                   <Paper
//                     key={inscription.id}
//                     sx={{
//                       p: 1.5,
//                       borderRadius: 2,
//                       bgcolor: "zinc.700",
//                       border: "1px solid",
//                       borderColor: "divider",
//                     }}
//                   >
//                     <Typography variant="body2" fontWeight="bold">
//                       {inscription.athlete?.fullname}
//                     </Typography>
//                     <Typography variant="caption" color="text.secondary">
//                       {inscription.club?.name ?? "Inconnu"}
//                       {inscription.kata && ` · ${inscription.kata.nom}`}
//                     </Typography>

//                     {/* Boutons assigner */}
//                     <Stack direction="row" flexWrap="wrap" gap={0.5} mt={1}>
//                       {configs.map((config) => (
//                         <Chip
//                           key={config.id}
//                           label={
//                             config.plateau_nom ||
//                             `Tatami ${config.id.substring(0, 4)}`
//                           }
//                           size="small"
//                           color="primary"
//                           variant="outlined"
//                           icon={
//                             submitId === inscription.id ? (
//                               <CircularProgress size={10} />
//                             ) : (
//                               <PersonAdd sx={{ fontSize: 12 }} />
//                             )
//                           }
//                           disabled={submitId !== null}
//                           onClick={() =>
//                             handleAssigner(inscription.id, config.id)
//                           }
//                           sx={{ cursor: "pointer" }}
//                         />
//                       ))}
//                     </Stack>
//                   </Paper>
//                 ))
//               )}
//             </Stack>
//           </Paper>
//         </Grid>

//         {/* Colonnes tatamis */}
//         {configs.map((config) => (
//           <Grid item xs={12} md={4} key={config.id}>
//             <Paper
//               sx={{
//                 borderRadius: 3,
//                 overflow: "hidden",
//                 border: "1px solid",
//                 borderColor: "success.light",
//               }}
//             >
//               <Box
//                 sx={{
//                   p: 1.5,
//                   bgcolor: "success.main",
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   justifyContent="space-between"
//                   alignItems="center"
//                 >
//                   <Typography fontWeight="bold" color="white" noWrap>
//                     {config.plateau_nom}
//                   </Typography>
//                   <Chip
//                     label={parTatami[config.id]?.length || 0}
//                     size="small"
//                     sx={{
//                       bgcolor: "rgba(255,255,255,0.3)",
//                       color: "white",
//                     }}
//                   />
//                 </Stack>
//               </Box>

//               <Stack spacing={1} sx={{ p: 1.5 }}>
//                 {(parTatami[config.id] || []).length === 0 ? (
//                   <Typography
//                     variant="body2"
//                     color="text.secondary"
//                     textAlign="center"
//                     py={2}
//                   >
//                     Aucun athlète
//                   </Typography>
//                 ) : (
//                   (parTatami[config.id] || []).map((ordre, index) => (
//                     <Paper
//                       key={ordre.id}
//                       sx={{
//                         p: 1.5,
//                         borderRadius: 2,
//                         bgcolor: "zinc.700",
//                         border: "1px solid",
//                         borderColor: "divider",
//                       }}
//                     >
//                       <Stack
//                         direction="row"
//                         justifyContent="space-between"
//                         alignItems="flex-start"
//                       >
//                         <Box>
//                           <Stack direction="row" alignItems="center" gap={1}>
//                             <Chip
//                               label={index + 1}
//                               size="small"
//                               color="primary"
//                             />
//                             <Typography variant="body2" fontWeight="bold">
//                               {ordre?.inscription?.athlete?.fullname ??
//                                 "Inconnu"}
//                             </Typography>
//                           </Stack>

//                           <Typography
//                             variant="caption"
//                             color="text.secondary"
//                             ml={4}
//                           >
//                             {ordre?.inscription?.club?.name}
//                             {ordre?.inscription?.kata &&
//                               ` · ${ordre?.inscription?.kata.nom}`}
//                           </Typography>
//                           <Typography variant="caption" ml={4}>
//                             {ordre.inscription?.competition?.category?.nom ??
//                               "Sans catégorie"}
//                             ({" "}
//                             {ordre.inscription?.competition?.category?.sexe ??
//                               "Inconnu"}
//                             )
//                           </Typography>
//                         </Box>

//                         {/* Retirer du tatami */}
//                         <Chip
//                           label="✕"
//                           size="small"
//                           color="error"
//                           variant="outlined"
//                           disabled={submitId === ordre?.inscription?.id}
//                           onClick={() => handleRetirer(ordre?.inscription.id)}
//                           sx={{ cursor: "pointer", minWidth: 0 }}
//                         />
//                       </Stack>
//                     </Paper>
//                   ))
//                 )}
//               </Stack>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Button,
} from "@mui/material";
import { PersonAdd, SwapHoriz } from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Instance } from "../../../../Api/Axios";

// ─── Reorder ───────────────────────────────────────────────────────────────────
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// ─── Reorder entre listes ─────────────────────────────────────────────────────
const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  return { source: sourceClone, destination: destClone };
};

export default function RepartitionAthletes({ competition, configs, onBack }) {
  // ✅ Initialiser parTatami avec useMemo pour éviter les re-créations
  const initialParTatami = useMemo(() => {
    const initial = {};
    configs.forEach((config) => {
      initial[config.id] = [];
    });
    return initial;
  }, [configs]);

  const [nonAssignes, setNonAssignes] = useState([]);
  const [parTatami, setParTatami] = useState(initialParTatami);
  const [loading, setLoading] = useState(true);
  const [submitId, setSubmitId] = useState(null);
  const [erreur, setErreur] = useState(null);

  // ✅ fetchData sans parTatami dans les dépendances
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [nonAssRes, ...tatamisRes] = await Promise.all([
        Instance.get(`/api/ordre-passages/${competition}/non-assign`),
        ...configs.map((config) =>
          Instance.get(`/api/ordre-passages/${config.id}`),
        ),
      ]);

      setNonAssignes(nonAssRes.data || []);

      const newParTatami = {};
      configs.forEach((config, i) => {
        newParTatami[config.id] = tatamisRes[i]?.data || [];
      });
      setParTatami(newParTatami);
    } catch (err) {
      console.error(err);
      setErreur("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  }, [competition, configs]);

  // ✅ useEffect avec les bonnes dépendances
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssigner = async (inscriptionId, configId) => {
    setSubmitId(inscriptionId);
    try {
      await Instance.post(`/api/ordre-passages/assigner`, {
        inscription_id: inscriptionId,
        config_notation_id: configId,
      });
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
      await Instance.delete(`/api/ordre-passages/inscription/${inscriptionId}`);
      await fetchData();
    } catch (err) {
      setErreur("Erreur lors du retrait");
    } finally {
      setSubmitId(null);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Si on lâche en dehors d'une zone droppable
    if (!destination) return;

    // Si on lâche au même endroit
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // Trouver l'inscription correspondante
    const inscription =
      nonAssignes.find((i) => i.id === draggableId) ||
      Object.values(parTatami)
        .flat()
        .find((i) => i.inscription?.id === draggableId);

    if (!inscription) return;

    // Cas 1: Déplacement depuis "Non assignés" vers un tatami
    if (
      source.droppableId === "nonAssignes" &&
      destination.droppableId.startsWith("tatami-")
    ) {
      const configId = destination.droppableId.replace("tatami-", "");
      await handleAssigner(inscription.id, configId);
    }
    // Cas 2: Déplacement depuis un tatami vers "Non assignés"
    else if (
      destination.droppableId === "nonAssignes" &&
      source.droppableId.startsWith("tatami-")
    ) {
      await handleRetirer(inscription.id);
    }
    // Cas 3: Réorganisation dans un tatami
    else if (
      source.droppableId.startsWith("tatami-") &&
      destination.droppableId.startsWith("tatami-")
    ) {
      const configId = source.droppableId.replace("tatami-", "");
      if (source.droppableId === destination.droppableId) {
        // Réorganisation dans le même tatami
        setParTatami((prev) => ({
          ...prev,
          [configId]: reorder(prev[configId], source.index, destination.index),
        }));
      } else {
        // Déplacement entre tatamis
        const sourceConfigId = source.droppableId.replace("tatami-", "");
        const destConfigId = destination.droppableId.replace("tatami-", "");
        setParTatami((prev) => {
          const newParTatami = { ...prev };
          const { source: newSource, destination: newDest } = move(
            newParTatami[sourceConfigId],
            newParTatami[destConfigId],
            source,
            destination,
          );
          newParTatami[sourceConfigId] = newSource;
          newParTatami[destConfigId] = newDest;
          return newParTatami;
        });
        // Mettre à jour l'ordre dans l'API
        try {
          await Instance.post(`/api/ordre-passages/reorder`, {
            config_notation_id: destConfigId,
            inscription_id: inscription.id,
            new_index: destination.index,
          });
        } catch (err) {
          setErreur("Erreur lors de la réorganisation");
          await fetchData();
        }
      }
    }
  };

  const handleResetAll = async () => {
    if (
      window.confirm(
        "Êtes-vous sûr de vouloir réinitialiser toutes les affectations ?",
      )
    ) {
      try {
        setLoading(true);
        await Instance.post(`/api/ordre-passages/${competition}/reset`);
        await fetchData();
      } catch (err) {
        setErreur("Erreur lors de la réinitialisation");
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculer le nombre total d'athlètes
  const totalAssignes = Object.values(parTatami).reduce(
    (sum, tatami) => sum + tatami.length,
    0,
  );
  const totalNonAssignes = nonAssignes.length;
  const totalAthletes = totalAssignes + totalNonAssignes;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ p: 2 }}>
        {/* En-tête avec bouton Retour et compteur */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={onBack}
            startIcon={<SwapHoriz />}
            sx={{ borderRadius: 2 }}
          >
            Retour
          </Button>
          <Alert severity="info" sx={{ maxWidth: 400 }}>
            <strong>Total:</strong> {totalAthletes} athlètes ({totalAssignes}{" "}
            assignés, {totalNonAssignes} non assignés)
          </Alert>
        </Stack>

        {erreur && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setErreur(null)}
          >
            {erreur}
          </Alert>
        )}

        {/* Bouton Réinitialiser */}
        <Button
          variant="outlined"
          color="error"
          onClick={handleResetAll}
          disabled={loading || totalAssignes === 0}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          Réinitialiser toutes les affectations
        </Button>

        <Grid container spacing={2}>
          {/* Colonne gauche — Non assignés */}
          <Grid item xs={12} md={4}>
            <Droppable droppableId="nonAssignes">
              {(provided) => (
                <Paper
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "warning.light",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ p: 1.5, bgcolor: "warning.main" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography fontWeight="bold" color="white">
                        Non assignés
                      </Typography>
                      <Chip
                        label={nonAssignes.length}
                        size="small"
                        sx={{
                          bgcolor: "rgba(255,255,255,0.3)",
                          color: "white",
                        }}
                      />
                    </Stack>
                  </Box>

                  <Stack
                    spacing={1}
                    sx={{ p: 1.5, flex: 1, overflowY: "auto" }}
                  >
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
                      nonAssignes.map((inscription, index) => (
                        <Draggable
                          key={inscription.id}
                          draggableId={inscription.id}
                          index={index}
                        >
                          {(provided) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "zinc.700",
                                border: "1px solid",
                                borderColor: "divider",
                                mb: 1,
                                ...(submitId === inscription.id && {
                                  opacity: 0.6,
                                }),
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold">
                                {inscription.athlete?.fullname}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {inscription.club?.name ?? "Inconnu"}
                                {inscription.kata &&
                                  ` · ${inscription.kata.nom}`}
                              </Typography>
                            </Paper>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </Stack>
                </Paper>
              )}
            </Droppable>
          </Grid>

          {/* Colonnes Tatamis */}
          {configs.map((config) => (
            <Grid item xs={12} md={4} key={config.id}>
              <Droppable droppableId={`tatami-${config.id}`}>
                {(provided) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "success.light",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ p: 1.5, bgcolor: "success.main" }}>
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

                    <Stack
                      spacing={1}
                      sx={{ p: 1.5, flex: 1, overflowY: "auto" }}
                    >
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
                          <Draggable
                            key={ordre.id}
                            draggableId={ordre.inscription?.id || ordre.id}
                            index={index}
                          >
                            {(provided) => (
                              <Paper
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  bgcolor: "zinc.700",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  mb: 1,
                                  ...(submitId === ordre.inscription?.id && {
                                    opacity: 0.6,
                                  }),
                                }}
                              >
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="flex-start"
                                >
                                  <Box>
                                    <Stack
                                      direction="row"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <Chip
                                        label={index + 1}
                                        size="small"
                                        color="primary"
                                      />
                                      <Typography
                                        variant="body2"
                                        fontWeight="bold"
                                      >
                                        {ordre?.inscription?.athlete
                                          ?.fullname ?? "Inconnu"}
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
                                      {ordre.inscription?.competition?.category
                                        ?.nom ?? "Sans catégorie"}{" "}
                                      (
                                      {ordre.inscription?.competition?.category
                                        ?.sexe ?? "Inconnu"}
                                      )
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Paper>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </Stack>
                  </Paper>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DragDropContext>
  );
}
