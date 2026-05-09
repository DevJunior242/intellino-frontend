// // import { useState, useEffect, useCallback, useRef } from "react";
// // import {
// //   Box,
// //   Paper,
// //   Typography,
// //   Stack,
// //   Chip,
// //   CircularProgress,
// //   Drawer,
// //   IconButton,
// //   useMediaQuery,
// //   useTheme,
// //   Skeleton,
// //   Fade,
// //   Badge,
// // } from "@mui/material";
// // import {
// //   Star,
// //   FiberManualRecord,
// //   Menu as MenuIcon,
// //   Close as CloseIcon,
// //   Schedule,
// //   OpenInNew,
// // } from "@mui/icons-material";
// // import { Instance } from "../../../../Api/Axios";
// // import SeanceAdminPanelKata from "./SeanceAdminPanelKata";
// // import { Link } from "react-router-dom";
// // import SeanceAdminPanelKumite from "./SeanceAdminPanelKumite";

// // // ─── Skeleton sidebar ─────────────────────────────────────────────────────────
// // const SidebarSkeleton = () => (
// //   <Stack spacing={1.5} sx={{ p: 1 }}>
// //     {[1, 2, 3].map((i) => (
// //       <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: "#141720" }}>
// //         <Skeleton
// //           variant="text"
// //           width="70%"
// //           sx={{ bgcolor: "#1e2433", mb: 1 }}
// //         />
// //         <Skeleton
// //           variant="text"
// //           width="50%"
// //           sx={{ bgcolor: "#1e2433", mb: 1 }}
// //         />
// //         <Skeleton
// //           variant="rectangular"
// //           height={20}
// //           sx={{ bgcolor: "#1e2433", borderRadius: 1 }}
// //         />
// //       </Box>
// //     ))}
// //   </Stack>
// // );

// // // ─── Helpers ──────────────────────────────────────────────────────────────────
// // const formatHeure = (dt) =>
// //   dt
// //     ? new Date(dt).toLocaleTimeString("fr-FR", {
// //         hour: "2-digit",
// //         minute: "2-digit",
// //       })
// //     : "—";

// // const formatDateCourte = (dt) =>
// //   dt
// //     ? new Date(dt).toLocaleDateString("fr-FR", {
// //         weekday: "short",
// //         day: "numeric",
// //         month: "short",
// //       })
// //     : "—";

// // // ─── ConfigCard ───────────────────────────────────────────────────────────────
// // const ConfigCard = ({ config, estSelecte, data, onClick }) => {
// //   const isKumite = config.discipline?.toLowerCase() === "kumite";
// //   const lienPublic = `${window.location.origin}/public/tatami/${config.id}`;
// //   const enCours = data?.enCours;

// //   return (
// //     <Paper
// //       onClick={onClick}
// //       elevation={0}
// //       sx={{
// //         p: 2,
// //         borderRadius: 3,
// //         cursor: "pointer",
// //         bgcolor: estSelecte ? "rgba(108, 99, 255, 0.12)" : "#141720",
// //         border: "1.5px solid",
// //         borderColor: estSelecte ? "#6c63ff" : "#1e2433",
// //         transition: "all 0.2s",
// //         "&:hover": {
// //           borderColor: estSelecte ? "#6c63ff" : "#2e3550",
// //           bgcolor: estSelecte ? "rgba(108, 99, 255, 0.15)" : "#181c28",
// //         },
// //         position: "relative",
// //         overflow: "hidden",
// //       }}
// //     >
// //       {estSelecte && (
// //         <Box
// //           sx={{
// //             position: "absolute",
// //             left: 0,
// //             top: 0,
// //             bottom: 0,
// //             width: 3,
// //             bgcolor: "#6c63ff",
// //             borderRadius: "3px 0 0 3px",
// //           }}
// //         />
// //       )}

// //       <Stack
// //         direction="row"
// //         justifyContent="space-between"
// //         alignItems="flex-start"
// //         mb={0.5}
// //       >
// //         <Typography
// //           variant="subtitle2"
// //           sx={{
// //             fontWeight: 700,
// //             color: estSelecte ? "#6c63ff" : "#dde1f0",
// //             fontSize: "0.8rem",
// //             lineHeight: 1.3,
// //             flex: 1,
// //             pr: 1,
// //           }}
// //         >
// //           {config.plateau_nom}
// //           <Typography
// //             component="span"
// //             variant="caption"
// //             sx={{ color: "#636b88", fontWeight: 400, ml: 0.5 }}
// //           >
// //             ({config.niveau})
// //           </Typography>
// //         </Typography>
// //         <FiberManualRecord
// //           sx={{
// //             fontSize: 10,
// //             color: config.est_valide ? "#22c55e" : "#636b88",
// //             mt: 0.3,
// //             flexShrink: 0,
// //           }}
// //         />
// //       </Stack>

// //       <Stack direction="row" alignItems="center" gap={0.5} mb={0.5}>
// //         <Schedule sx={{ fontSize: 11, color: "#636b88" }} />
// //         <Typography variant="caption" sx={{ color: "#8b90a0" }}>
// //           {formatHeure(config?.heure_debut_prevu)} →{" "}
// //           {formatHeure(config?.heure_fin_prevue)}
// //         </Typography>
// //       </Stack>
// //       <Typography
// //         variant="caption"
// //         sx={{ color: "#636b88", display: "block", mb: 1, fontSize: "0.65rem" }}
// //       >
// //         {formatDateCourte(config?.heure_debut_prevu)}
// //       </Typography>

// //       <Stack
// //         direction="row"
// //         spacing={0.5}
// //         alignItems="center"
// //         flexWrap="wrap"
// //         gap={0.5}
// //       >
// //         <Chip
// //           label={config.discipline}
// //           size="small"
// //           sx={{
// //             height: 18,
// //             fontSize: "0.62rem",
// //             bgcolor: isKumite ? "#ef444420" : "#00e5c020",
// //             color: isKumite ? "#ef4444" : "#00e5c0",
// //             fontWeight: 700,
// //           }}
// //         />
// //         <Typography
// //           variant="caption"
// //           sx={{ color: "#636b88", fontSize: "0.62rem" }}
// //         >
// //           {isKumite ? config.format : `${config.juges_option || "N/A"} juges`}
// //         </Typography>
// //         {enCours && (
// //           <Chip
// //             label="● EN VIE"
// //             size="small"
// //             sx={{
// //               height: 16,
// //               fontSize: "0.58rem",
// //               bgcolor: "#22c55e20",
// //               color: "#22c55e",
// //               fontWeight: 700,
// //             }}
// //           />
// //         )}
// //       </Stack>

// //       <Link
// //         to={lienPublic}
// //         target="_blank"
// //         onClick={(e) => e.stopPropagation()}
// //         style={{ textDecoration: "none" }}
// //       >
// //         <Chip
// //           label="Vue publique"
// //           icon={<OpenInNew sx={{ fontSize: "0.7rem !important" }} />}
// //           size="small"
// //           variant="outlined"
// //           sx={{
// //             mt: 1,
// //             fontSize: "0.62rem",
// //             height: 20,
// //             borderColor: "#1e2433",
// //             color: "#636b88",
// //             "&:hover": { borderColor: "#6c63ff", color: "#6c63ff" },
// //           }}
// //         />
// //       </Link>
// //     </Paper>
// //   );
// // };

// // // ─── SidebarContent ───────────────────────────────────────────────────────────
// // const SidebarContent = ({
// //   configs,
// //   tatamiData,
// //   configSelectee,
// //   choisirConfig,
// //   loadingInitial,
// //   onClose,
// //   isMobile,
// // }) => (
// //   <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
// //     <Box
// //       sx={{
// //         p: 2,
// //         bgcolor: "#ffb547",
// //         color: "#000",
// //         display: "flex",
// //         alignItems: "center",
// //         justifyContent: "space-between",
// //         flexShrink: 0,
// //       }}
// //     >
// //       <Stack direction="row" alignItems="center" gap={1}>
// //         <Star fontSize="small" />
// //         <Typography fontWeight="bold" fontSize="0.85rem">
// //           JUGE PRINCIPAL
// //         </Typography>
// //       </Stack>
// //       {isMobile && (
// //         <IconButton size="small" onClick={onClose} sx={{ color: "#000" }}>
// //           <CloseIcon fontSize="small" />
// //         </IconButton>
// //       )}
// //     </Box>

// //     <Box
// //       sx={{
// //         px: 2,
// //         py: 1,
// //         bgcolor: "#0e1118",
// //         borderBottom: "1px solid #1e2433",
// //         flexShrink: 0,
// //       }}
// //     >
// //       <Stack direction="row" gap={1}>
// //         <Chip
// //           label={`${configs.length} plateau${configs.length > 1 ? "x" : ""}`}
// //           size="small"
// //           sx={{
// //             height: 20,
// //             fontSize: "0.65rem",
// //             bgcolor: "#1e2433",
// //             color: "#8b90a0",
// //           }}
// //         />
// //         <Chip
// //           label={`${configs.filter((c) => c.est_valide).length} actifs`}
// //           size="small"
// //           sx={{
// //             height: 20,
// //             fontSize: "0.65rem",
// //             bgcolor: "#22c55e20",
// //             color: "#22c55e",
// //           }}
// //         />
// //       </Stack>
// //     </Box>

// //     <Box
// //       sx={{
// //         flex: 1,
// //         overflowY: "auto",
// //         p: 1.5,
// //         "&::-webkit-scrollbar": { width: 4 },
// //         "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
// //       }}
// //     >
// //       {loadingInitial ? (
// //         <SidebarSkeleton />
// //       ) : (
// //         <Stack spacing={1.5}>
// //           {configs.map((config) => (
// //             <ConfigCard
// //               key={config.id}
// //               config={config}
// //               estSelecte={configSelectee?.id === config.id}
// //               data={tatamiData[config.id]}
// //               onClick={() => {
// //                 choisirConfig(config);
// //                 if (isMobile && onClose) onClose();
// //               }}
// //             />
// //           ))}
// //         </Stack>
// //       )}
// //     </Box>
// //   </Box>
// // );

// // // ─── Main ─────────────────────────────────────────────────────────────────────
// // export default function JugePrincipalDashboard({
// //   configs,
// //   handleValider,
// //   success,
// //   errors,
// //   submitId,
// // }) {
// //   const [tatamiData, setTatamiData] = useState({});
// //   const [loadingInitial, setLoadingInitial] = useState(true);
// //   const [loadingActif, setLoadingActif] = useState(false);
// //   const [polling, setPolling] = useState(false);

// //   const [configSelectee, setConfigSelectee] = useState(null);
// //   const configSelecteeRef = useRef(null);
// //   // ✅ Ref pour savoir si c'est le tout premier chargement ou un switch manuel
// //   const isFirstLoad = useRef(true);
// //   const [drawerOpen, setDrawerOpen] = useState(false);

// //   const muiTheme = useTheme();
// //   const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

// //   const choisirConfig = (config) => {
// //     configSelecteeRef.current = config;
// //     setConfigSelectee(config);
// //   };

// //   // ✅ Fetch tous + sélection initiale dans le même flux — tout dans l'ordre
// //   const fetchTousLesTatamis = useCallback(async () => {
// //     setLoadingInitial(true);
// //     const results = {};
// //     await Promise.all(
// //       configs.map(async (config) => {
// //         try {
// //           const [enCoursRes, arbitresRes] = await Promise.all([
// //             Instance.get(`/api/seances/competition/${config.id}/en-cours`),
// //             Instance.get(`/api/seances/configs/${config.id}/arbitres-rotation`),
// //           ]);
// //           console.log("enCoursRes", enCoursRes);
// //           console.log("arbitresRes", arbitresRes);
// //           results[config.id] = {
// //             enCours: enCoursRes.data.enCours,
// //             arbitres: arbitresRes.data.arbitres,
// //             superviseur: arbitresRes.data.superviseur,
// //           };
// //         } catch {
// //           results[config.id] = {
// //             enCours: null,
// //             arbitres: [],
// //             superviseur: null,
// //           };
// //         }
// //       }),
// //     );
// //     setTatamiData(results);
// //     setLoadingInitial(false);

// //     // ✅ Sélection APRÈS que toutes les données sont prêtes — pas de fetch supplémentaire
// //     if (!configSelecteeRef.current && configs.length > 0) {
// //       const premier =
// //         configs.find((c) => c.configuration_validee) || configs[0];
// //       isFirstLoad.current = true; // marquer que c'est la sélection initiale
// //       choisirConfig(premier);
// //     }
// //   }, [configs]);

// //   // Fetch silencieux d'un seul tatami
// //   const fetchTatamiActif = useCallback(async (configId, silent = false) => {
// //     if (!silent) setLoadingActif(true);
// //     else setPolling(true);
// //     try {
// //       const [enCoursRes, arbitresRes] = await Promise.all([
// //         Instance.get(`/api/seances/competition/${configId}/en-cours`),
// //         Instance.get(`/api/seances/configs/${configId}/arbitres-rotation`),
// //       ]);
// //       console.log("enCoursRes", enCoursRes);
// //       console.log("arbitresRes", arbitresRes);
// //       setTatamiData((prev) => ({
// //         ...prev,
// //         [configId]: {
// //           enCours: enCoursRes.data.enCours,
// //           arbitres: arbitresRes.data.arbitres,
// //           superviseur: arbitresRes.data.superviseur,
// //         },
// //       }));
// //     } catch (e) {
// //       console.log(e);
// //     } finally {
// //       if (!silent) setLoadingActif(false);
// //       else setPolling(false);
// //     }
// //   }, []);

// //   // Premier chargement
// //   useEffect(() => {
// //     if (configs.length > 0) fetchTousLesTatamis();
// //   }, [configs]);

// //   // Switch de tatami — mais PAS au premier chargement (données déjà dans results)
// //   useEffect(() => {
// //     if (!configSelectee?.id) return;

// //     if (isFirstLoad.current) {
// //       // ✅ Sélection initiale → données déjà chargées, on skip le fetch
// //       isFirstLoad.current = false;
// //       return;
// //     }

// //     // Switch manuel → fetch avec spinner zone droite
// //     fetchTatamiActif(configSelectee.id, false);
// //   }, [configSelectee?.id]);

// //   // Polling toutes les 3s sur le tatami actif
// //   useEffect(() => {
// //     if (!configSelectee?.id) return;
// //     const interval = setInterval(() => {
// //       fetchTatamiActif(configSelectee.id, true);
// //     }, 3000);
// //     return () => clearInterval(interval);
// //   }, [configSelectee?.id, fetchTatamiActif]);

// //   const handleDesignerSuperviseur = async (configId, arbitreCompetitionId) => {
// //     try {
// //       await Instance.patch(`/api/rotation-arbitres/${configId}/superviseur`, {
// //         config_notation_id: configId,
// //         arbitre_competition_id: arbitreCompetitionId,
// //       });
// //       fetchTatamiActif(configId, true);
// //     } catch (e) {
// //       console.log(e);
// //     }
// //   };

// //   const renderRightPanel = () => {
// //     if (!configSelectee || !tatamiData[configSelectee.id]) return null;
// //     const dataActive = tatamiData[configSelectee.id];
// //     console.log("dataActive", dataActive);
// //     const isKumite = configSelectee.discipline?.toLowerCase() === "kumite";

// //     if (isKumite) {
// //       return (
// //         <SeanceAdminPanelKumite
// //           config={configSelectee}
// //           data={dataActive}
// //           handleValider={handleValider}
// //           handleDesignerSuperviseur={handleDesignerSuperviseur}
// //           success={success}
// //           errors={errors}
// //           submitId={submitId}
// //           onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
// //         />
// //       );
// //     }
// //     return (
// //       <SeanceAdminPanelKata
// //         config={configSelectee}
// //         data={dataActive}
// //         handleValider={handleValider}
// //         handleDesignerSuperviseur={handleDesignerSuperviseur}
// //         success={success}
// //         errors={errors}
// //         submitId={submitId}
// //         onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
// //       />
// //     );
// //   };

// //   return (
// //     <Box
// //       sx={{
// //         display: "flex",
// //         height: "100vh",
// //         bgcolor: "#080a0f",
// //         color: "#dde1f0",
// //         position: "relative",
// //         overflow: "hidden",
// //       }}
// //     >
// //       {/* Barre polling silencieux */}
// //       {polling && (
// //         <Box
// //           sx={{
// //             position: "absolute",
// //             top: 0,
// //             left: 0,
// //             right: 0,
// //             zIndex: 9999,
// //             height: 2,
// //           }}
// //         >
// //           <Box
// //             sx={{
// //               height: "100%",
// //               bgcolor: "#ffb547",
// //               animation: "pollingBar 1s ease-in-out infinite",
// //               "@keyframes pollingBar": {
// //                 "0%,100%": { opacity: 0.4 },
// //                 "50%": { opacity: 1 },
// //               },
// //             }}
// //           />
// //         </Box>
// //       )}

// //       {/* ── SIDEBAR DESKTOP ── */}
// //       {!isMobile && (
// //         <Box
// //           sx={{
// //             width: 270,
// //             flexShrink: 0,
// //             borderRight: "1px solid #1e2433",
// //             height: "100%",
// //             overflow: "hidden",
// //           }}
// //         >
// //           <SidebarContent
// //             configs={configs}
// //             tatamiData={tatamiData}
// //             configSelectee={configSelectee}
// //             choisirConfig={choisirConfig}
// //             loadingInitial={loadingInitial}
// //             isMobile={false}
// //           />
// //         </Box>
// //       )}

// //       {/* ── SIDEBAR MOBILE (Drawer) ── */}
// //       {isMobile && (
// //         <Drawer
// //           anchor="left"
// //           open={drawerOpen}
// //           onClose={() => setDrawerOpen(false)}
// //           PaperProps={{
// //             sx: {
// //               width: 280,
// //               bgcolor: "#080a0f",
// //               borderRight: "1px solid #1e2433",
// //             },
// //           }}
// //         >
// //           <SidebarContent
// //             configs={configs}
// //             tatamiData={tatamiData}
// //             configSelectee={configSelectee}
// //             choisirConfig={choisirConfig}
// //             loadingInitial={loadingInitial}
// //             isMobile={true}
// //             onClose={() => setDrawerOpen(false)}
// //           />
// //         </Drawer>
// //       )}

// //       {/* ── ZONE DROITE ── */}
// //       <Box
// //         sx={{
// //           flex: 1,
// //           overflow: "hidden",
// //           display: "flex",
// //           flexDirection: "column",
// //           minWidth: 0,
// //         }}
// //       >
// //         {/* Topbar mobile */}
// //         {isMobile && (
// //           <Box
// //             sx={{
// //               display: "flex",
// //               alignItems: "center",
// //               gap: 1.5,
// //               px: 2,
// //               py: 1.5,
// //               bgcolor: "#0e1118",
// //               borderBottom: "1px solid #1e2433",
// //               flexShrink: 0,
// //             }}
// //           >
// //             <IconButton
// //               size="small"
// //               onClick={() => setDrawerOpen(true)}
// //               sx={{ color: "#ffb547", bgcolor: "#ffb54715", borderRadius: 2 }}
// //             >
// //               <Badge
// //                 badgeContent={configs.filter((c) => c.est_valide).length}
// //                 color="success"
// //                 max={9}
// //               >
// //                 <MenuIcon fontSize="small" />
// //               </Badge>
// //             </IconButton>
// //             <Box sx={{ flex: 1, minWidth: 0 }}>
// //               {configSelectee ? (
// //                 <>
// //                   <Typography
// //                     variant="body2"
// //                     fontWeight="bold"
// //                     color="white"
// //                     noWrap
// //                   >
// //                     {configSelectee.plateau_nom}
// //                   </Typography>
// //                   <Typography variant="caption" sx={{ color: "#636b88" }}>
// //                     {configSelectee.discipline} ·{" "}
// //                     {formatHeure(configSelectee?.heure_debut_prevu)}
// //                   </Typography>
// //                 </>
// //               ) : (
// //                 <Typography variant="body2" sx={{ color: "#636b88" }}>
// //                   Choisir un plateau
// //                 </Typography>
// //               )}
// //             </Box>
// //             {configSelectee && (
// //               <FiberManualRecord
// //                 sx={{
// //                   fontSize: 10,
// //                   color: configSelectee.est_valide ? "#22c55e" : "#636b88",
// //                 }}
// //               />
// //             )}
// //           </Box>
// //         )}

// //         <Box sx={{ flex: 1, overflow: "auto" }}>
// //           {loadingInitial ? (
// //             // ✅ Premier chargement — spinner centré, sidebar montre skeleton
// //             <Box
// //               sx={{
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 height: "100%",
// //                 gap: 2,
// //               }}
// //             >
// //               <CircularProgress sx={{ color: "#ffb547" }} />
// //               <Typography variant="body2" sx={{ color: "#636b88" }}>
// //                 Chargement des plateaux...
// //               </Typography>
// //             </Box>
// //           ) : loadingActif ? (
// //             // ✅ Switch manuel — spinner zone droite seulement, sidebar intacte
// //             <Box
// //               sx={{
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 height: "100%",
// //                 gap: 2,
// //               }}
// //             >
// //               <CircularProgress sx={{ color: "#6c63ff" }} size={32} />
// //               <Typography variant="body2" sx={{ color: "#636b88" }}>
// //                 Chargement de{" "}
// //                 <strong style={{ color: "#dde1f0" }}>
// //                   {configSelectee?.plateau_nom}
// //                 </strong>
// //                 ...
// //               </Typography>
// //             </Box>
// //           ) : configSelectee ? (
// //             // ✅ Données prêtes — affichage direct sans flash
// //             <Fade in key={configSelectee.id} timeout={300}>
// //               <Box sx={{ height: "100%" }}>{renderRightPanel()}</Box>
// //             </Fade>
// //           ) : (
// //             <Box
// //               sx={{
// //                 height: "100%",
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 gap: 2,
// //                 p: 3,
// //               }}
// //             >
// //               <Box
// //                 sx={{
// //                   width: 64,
// //                   height: 64,
// //                   borderRadius: "50%",
// //                   bgcolor: "#141720",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                 }}
// //               >
// //                 <Star sx={{ color: "#ffb547", fontSize: 32 }} />
// //               </Box>
// //               <Typography
// //                 variant="h6"
// //                 sx={{ color: "#dde1f0", fontWeight: 600, textAlign: "center" }}
// //               >
// //                 Sélectionnez un plateau
// //               </Typography>
// //               <Typography
// //                 variant="body2"
// //                 sx={{ color: "#636b88", textAlign: "center", maxWidth: 280 }}
// //               >
// //                 {isMobile
// //                   ? "Appuyez sur le menu pour voir les plateaux disponibles"
// //                   : "Choisissez un plateau dans la liste à gauche pour gérer la séance"}
// //               </Typography>
// //               {isMobile && (
// //                 <Box
// //                   onClick={() => setDrawerOpen(true)}
// //                   sx={{
// //                     mt: 1,
// //                     px: 3,
// //                     py: 1.5,
// //                     bgcolor: "#ffb547",
// //                     color: "#000",
// //                     borderRadius: 3,
// //                     fontWeight: "bold",
// //                     fontSize: "0.85rem",
// //                     cursor: "pointer",
// //                   }}
// //                 >
// //                   Voir les plateaux
// //                 </Box>
// //               )}
// //             </Box>
// //           )}
// //         </Box>
// //       </Box>
// //     </Box>
// //   );
// // }

// import { useState, useEffect, useCallback } from "react";
// import {
//   Box,
//   Paper,
//   Typography,
//   Stack,
//   Chip,
//   CircularProgress,
//   Alert,
//   Divider,
//   Grid,
//   Button,
// } from "@mui/material";
// import { PersonAdd } from "@mui/icons-material";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// import { Instance } from "../../../../Api/Axios";

// // ─── Reorder ───────────────────────────────────────────────────────────────────
// const reorder = (list, startIndex, endIndex) => {
//   const result = Array.from(list);
//   const [removed] = result.splice(startIndex, 1);
//   result.splice(endIndex, 0, removed);
//   return result;
// };

// // ─── Reorder entre listes ─────────────────────────────────────────────────────
// const move = (source, destination, droppableSource, droppableDestination) => {
//   const sourceClone = Array.from(source);
//   const destClone = Array.from(destination);
//   const [removed] = sourceClone.splice(droppableSource.index, 1);
//   destClone.splice(droppableDestination.index, 0, removed);
//   return { source: sourceClone, destination: destClone };
// };

// export default function RepartitionAthletes({ competition, configs, onBack }) {
//   const [nonAssignes, setNonAssignes] = useState([]);
//   const [parTatami, setParTatami] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitId, setSubmitId] = useState(null);
//   const [erreur, setErreur] = useState(null);

//   // Initialiser parTatami avec des tableaux vides pour chaque config
//   useEffect(() => {
//     const initialParTatami = {};
//     configs.forEach((config) => {
//       initialParTatami[config.id] = [];
//     });
//     setParTatami(initialParTatami);
//   }, [configs]);

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const [nonAssRes, ...tatamisRes] = await Promise.all([
//         Instance.get(`/api/ordre-passages/${competition}/non-assign`),
//         ...configs.map((config) =>
//           Instance.get(`/api/ordre-passages/${config.id}`),
//         ),
//       ]);

//       setNonAssignes(nonAssRes.data || []);

//       const newParTatami = {};
//       configs.forEach((config, i) => {
//         newParTatami[config.id] = tatamisRes[i]?.data || [];
//       });
//       setParTatami(newParTatami);
//     } catch (err) {
//       console.error(err);
//       setErreur("Erreur lors du chargement des données");
//     } finally {
//       setLoading(false);
//     }
//   }, [competition, configs]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleAssigner = async (inscriptionId, configId) => {
//     setSubmitId(inscriptionId);
//     try {
//       await Instance.post(`/api/ordre-passages/assigner`, {
//         inscription_id: inscriptionId,
//         config_notation_id: configId,
//       });
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
//       await Instance.delete(`/api/ordre-passages/inscription/${inscriptionId}`);
//       await fetchData();
//     } catch (err) {
//       setErreur("Erreur lors du retrait");
//     } finally {
//       setSubmitId(null);
//     }
//   };

//   const onDragEnd = async (result) => {
//     const { source, destination, draggableId } = result;

//     // Si on lâche en dehors d'une zone droppable
//     if (!destination) return;

//     // Si on lâche au même endroit
//     if (
//       source.droppableId === destination.droppableId &&
//       source.index === destination.index
//     )
//       return;

//     // Trouver l'inscription correspondante
//     const inscription =
//       nonAssignes.find((i) => i.id === draggableId) ||
//       Object.values(parTatami)
//         .flat()
//         .find((i) => i.inscription?.id === draggableId);

//     if (!inscription) return;

//     // Cas 1: Déplacement depuis "Non assignés" vers un tatami
//     if (
//       source.droppableId === "nonAssignes" &&
//       destination.droppableId.startsWith("tatami-")
//     ) {
//       const configId = destination.droppableId.replace("tatami-", "");
//       await handleAssigner(inscription.id, configId);
//     }
//     // Cas 2: Déplacement depuis un tatami vers "Non assignés"
//     else if (
//       destination.droppableId === "nonAssignes" &&
//       source.droppableId.startsWith("tatami-")
//     ) {
//       await handleRetirer(inscription.id);
//     }
//     // Cas 3: Réorganisation dans un tatami
//     else if (
//       source.droppableId.startsWith("tatami-") &&
//       destination.droppableId.startsWith("tatami-")
//     ) {
//       const configId = source.droppableId.replace("tatami-", "");
//       if (source.droppableId === destination.droppableId) {
//         // Réorganisation dans le même tatami
//         setParTatami((prev) => ({
//           ...prev,
//           [configId]: reorder(prev[configId], source.index, destination.index),
//         }));
//       } else {
//         // Déplacement entre tatamis
//         const sourceConfigId = source.droppableId.replace("tatami-", "");
//         const destConfigId = destination.droppableId.replace("tatami-", "");
//         setParTatami((prev) => {
//           const newParTatami = { ...prev };
//           const { source: newSource, destination: newDest } = move(
//             newParTatami[sourceConfigId],
//             newParTatami[destConfigId],
//             source,
//             destination,
//           );
//           newParTatami[sourceConfigId] = newSource;
//           newParTatami[destConfigId] = newDest;
//           return newParTatami;
//         });
//         // Mettre à jour l'ordre dans l'API
//         try {
//           await Instance.post(`/api/ordre-passages/reorder`, {
//             config_notation_id: destConfigId,
//             inscription_id: inscription.id,
//             new_index: destination.index,
//           });
//         } catch (err) {
//           setErreur("Erreur lors de la réorganisation");
//           await fetchData(); // Recharger pour annuler les changements locaux
//         }
//       }
//     }
//   };

//   const handleResetAll = async () => {
//     if (
//       window.confirm(
//         "Êtes-vous sûr de vouloir réinitialiser toutes les affectations ?",
//       )
//     ) {
//       try {
//         setLoading(true);
//         await Instance.post(`/api/ordre-passages/${competition}/reset`);
//         await fetchData();
//       } catch (err) {
//         setErreur("Erreur lors de la réinitialisation");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   // Calculer le nombre total d'athlètes
//   const totalAssignes = Object.values(parTatami).reduce(
//     (sum, tatami) => sum + tatami.length,
//     0,
//   );
//   const totalNonAssignes = nonAssignes.length;
//   const totalAthletes = totalAssignes + totalNonAssignes;

//   return (
//     <DragDropContext onDragEnd={onDragEnd}>
//       <Box sx={{ p: 2 }}>
//         {/* En-tête avec bouton Retour et compteur */}
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           mb={3}
//         >
//           <Button
//             variant="contained"
//             color="secondary"
//             onClick={onBack}
//             startIcon={<SwapHoriz />}
//             sx={{ borderRadius: 2 }}
//           >
//             Retour
//           </Button>
//           <Alert severity="info" sx={{ maxWidth: 400 }}>
//             <strong>Total:</strong> {totalAthletes} athlètes ({totalAssignes}{" "}
//             assignés, {totalNonAssignes} non assignés)
//           </Alert>
//         </Stack>

//         {erreur && (
//           <Alert
//             severity="error"
//             sx={{ mb: 2 }}
//             onClose={() => setErreur(null)}
//           >
//             {erreur}
//           </Alert>
//         )}

//         {/* Bouton Réinitialiser */}
//         <Button
//           variant="outlined"
//           color="error"
//           onClick={handleResetAll}
//           disabled={loading || totalAssignes === 0}
//           sx={{ mb: 2, borderRadius: 2 }}
//         >
//           Réinitialiser toutes les affectations
//         </Button>

//         <Grid container spacing={2}>
//           {/* Colonne gauche — Non assignés */}
//           <Grid item xs={12} md={4}>
//             <Droppable droppableId="nonAssignes">
//               {(provided) => (
//                 <Paper
//                   ref={provided.innerRef}
//                   {...provided.droppableProps}
//                   sx={{
//                     borderRadius: 3,
//                     overflow: "hidden",
//                     border: "1px solid",
//                     borderColor: "warning.light",
//                     height: "100%",
//                     display: "flex",
//                     flexDirection: "column",
//                   }}
//                 >
//                   <Box sx={{ p: 1.5, bgcolor: "warning.main" }}>
//                     <Stack
//                       direction="row"
//                       justifyContent="space-between"
//                       alignItems="center"
//                     >
//                       <Typography fontWeight="bold" color="white">
//                         Non assignés
//                       </Typography>
//                       <Chip
//                         label={nonAssignes.length}
//                         size="small"
//                         sx={{
//                           bgcolor: "rgba(255,255,255,0.3)",
//                           color: "white",
//                         }}
//                       />
//                     </Stack>
//                   </Box>

//                   <Stack
//                     spacing={1}
//                     sx={{ p: 1.5, flex: 1, overflowY: "auto" }}
//                   >
//                     {nonAssignes.length === 0 ? (
//                       <Typography
//                         variant="body2"
//                         color="text.secondary"
//                         textAlign="center"
//                         py={2}
//                       >
//                         Tous assignés ✓
//                       </Typography>
//                     ) : (
//                       nonAssignes.map((inscription, index) => (
//                         <Draggable
//                           key={inscription.id}
//                           draggableId={inscription.id}
//                           index={index}
//                         >
//                           {(provided) => (
//                             <Paper
//                               ref={provided.innerRef}
//                               {...provided.draggableProps}
//                               {...provided.dragHandleProps}
//                               sx={{
//                                 p: 1.5,
//                                 borderRadius: 2,
//                                 bgcolor: "zinc.700",
//                                 border: "1px solid",
//                                 borderColor: "divider",
//                                 mb: 1,
//                                 ...(submitId === inscription.id && {
//                                   opacity: 0.6,
//                                 }),
//                               }}
//                             >
//                               <Typography variant="body2" fontWeight="bold">
//                                 {inscription.athlete?.fullname}
//                               </Typography>
//                               <Typography
//                                 variant="caption"
//                                 color="text.secondary"
//                               >
//                                 {inscription.club?.name ?? "Inconnu"}
//                                 {inscription.kata &&
//                                   ` · ${inscription.kata.nom}`}
//                               </Typography>
//                             </Paper>
//                           )}
//                         </Draggable>
//                       ))
//                     )}
//                     {provided.placeholder}
//                   </Stack>
//                 </Paper>
//               )}
//             </Droppable>
//           </Grid>

//           {/* Colonnes Tatamis */}
//           {configs.map((config) => (
//             <Grid item xs={12} md={4} key={config.id}>
//               <Droppable droppableId={`tatami-${config.id}`}>
//                 {(provided) => (
//                   <Paper
//                     ref={provided.innerRef}
//                     {...provided.droppableProps}
//                     sx={{
//                       borderRadius: 3,
//                       overflow: "hidden",
//                       border: "1px solid",
//                       borderColor: "success.light",
//                       height: "100%",
//                       display: "flex",
//                       flexDirection: "column",
//                     }}
//                   >
//                     <Box sx={{ p: 1.5, bgcolor: "success.main" }}>
//                       <Stack
//                         direction="row"
//                         justifyContent="space-between"
//                         alignItems="center"
//                       >
//                         <Typography fontWeight="bold" color="white" noWrap>
//                           {config.plateau_nom}
//                         </Typography>
//                         <Chip
//                           label={parTatami[config.id]?.length || 0}
//                           size="small"
//                           sx={{
//                             bgcolor: "rgba(255,255,255,0.3)",
//                             color: "white",
//                           }}
//                         />
//                       </Stack>
//                     </Box>

//                     <Stack
//                       spacing={1}
//                       sx={{ p: 1.5, flex: 1, overflowY: "auto" }}
//                     >
//                       {(parTatami[config.id] || []).length === 0 ? (
//                         <Typography
//                           variant="body2"
//                           color="text.secondary"
//                           textAlign="center"
//                           py={2}
//                         >
//                           Aucun athlète
//                         </Typography>
//                       ) : (
//                         (parTatami[config.id] || []).map((ordre, index) => (
//                           <Draggable
//                             key={ordre.id}
//                             draggableId={ordre.inscription?.id || ordre.id}
//                             index={index}
//                           >
//                             {(provided) => (
//                               <Paper
//                                 ref={provided.innerRef}
//                                 {...provided.draggableProps}
//                                 {...provided.dragHandleProps}
//                                 sx={{
//                                   p: 1.5,
//                                   borderRadius: 2,
//                                   bgcolor: "zinc.700",
//                                   border: "1px solid",
//                                   borderColor: "divider",
//                                   mb: 1,
//                                   ...(submitId === ordre.inscription?.id && {
//                                     opacity: 0.6,
//                                   }),
//                                 }}
//                               >
//                                 <Stack
//                                   direction="row"
//                                   justifyContent="space-between"
//                                   alignItems="flex-start"
//                                 >
//                                   <Box>
//                                     <Stack
//                                       direction="row"
//                                       alignItems="center"
//                                       gap={1}
//                                     >
//                                       <Chip
//                                         label={index + 1}
//                                         size="small"
//                                         color="primary"
//                                       />
//                                       <Typography
//                                         variant="body2"
//                                         fontWeight="bold"
//                                       >
//                                         {ordre?.inscription?.athlete
//                                           ?.fullname ?? "Inconnu"}
//                                       </Typography>
//                                     </Stack>
//                                     <Typography
//                                       variant="caption"
//                                       color="text.secondary"
//                                       ml={4}
//                                     >
//                                       {ordre?.inscription?.club?.name}
//                                       {ordre?.inscription?.kata &&
//                                         ` · ${ordre?.inscription?.kata.nom}`}
//                                     </Typography>
//                                     <Typography variant="caption" ml={4}>
//                                       {ordre.inscription?.competition?.category
//                                         ?.nom ?? "Sans catégorie"}{" "}
//                                       (
//                                       {ordre.inscription?.competition?.category
//                                         ?.sexe ?? "Inconnu"}
//                                       )
//                                     </Typography>
//                                   </Box>
//                                 </Stack>
//                               </Paper>
//                             )}
//                           </Draggable>
//                         ))
//                       )}
//                       {provided.placeholder}
//                     </Stack>
//                   </Paper>
//                 )}
//               </Droppable>
//             </Grid>
//           ))}
//         </Grid>
//       </Box>
//     </DragDropContext>
//   );
// }
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  CircularProgress,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
  Skeleton,
  Fade,
  Badge,
  Button,
} from "@mui/material";
import {
  Star,
  FiberManualRecord,
  Menu as MenuIcon,
  Close as CloseIcon,
  Schedule,
  OpenInNew,
  SwapHoriz,
} from "@mui/icons-material";
import { Instance } from "../../../../Api/Axios";
import { Link } from "react-router-dom";
import RepartitionAthletes from "./RepartitionAthletes";
import SeanceAdminPanelKata from "./SeanceAdminPanelKata";

// ─── Skeleton sidebar ─────────────────────────────────────────────────────────
const SidebarSkeleton = () => (
  <Stack spacing={1.5} sx={{ p: 1 }}>
    {[1, 2, 3].map((i) => (
      <Box key={i} sx={{ p: 2, borderRadius: 3, bgcolor: "#141720" }}>
        <Skeleton
          variant="text"
          width="70%"
          sx={{ bgcolor: "#1e2433", mb: 1 }}
        />
        <Skeleton
          variant="text"
          width="50%"
          sx={{ bgcolor: "#1e2433", mb: 1 }}
        />
        <Skeleton
          variant="rectangular"
          height={20}
          sx={{ bgcolor: "#1e2433", borderRadius: 1 }}
        />
      </Box>
    ))}
  </Stack>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatHeure = (dt) =>
  dt
    ? new Date(dt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatDateCourte = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "—";

// ─── ConfigCard ───────────────────────────────────────────────────────────────

const ConfigCard = ({
  config,
  estSelecte,
  data,
  onClick,
  onShowRepartition,
}) => {
  const isKumite = config.discipline?.toLowerCase() === "kumite";
  const lienPublic = `${window.location.origin}/public/tatami/${config.id}`;
  const enCours = data?.enCours;

  return (
    <Paper
      onClick={onClick}
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: "pointer",
        bgcolor: estSelecte ? "rgba(108, 99, 255, 0.12)" : "#141720",
        border: "1.5px solid",
        borderColor: estSelecte ? "#6c63ff" : "#1e2433",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: estSelecte ? "#6c63ff" : "#2e3550",
          bgcolor: estSelecte ? "rgba(108, 99, 255, 0.15)" : "#181c28",
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ... (le reste du code de ConfigCard) ... */}

      <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexWrap="wrap"
        gap={0.5}
      >
        <Chip
          label={config.discipline}
          size="small"
          sx={{
            height: 18,
            fontSize: "0.62rem",
            bgcolor: isKumite ? "#ef444420" : "#00e5c020",
            color: isKumite ? "#ef4444" : "#00e5c0",
            fontWeight: 700,
          }}
        />
        <Typography
          variant="caption"
          sx={{ color: "#636b88", fontSize: "0.62rem" }}
        >
          {isKumite ? config.format : `${config.juges_option || "N/A"} juges`}
        </Typography>
        {enCours && (
          <Chip
            label="● EN VIE"
            size="small"
            sx={{
              height: 16,
              fontSize: "0.58rem",
              bgcolor: "#22c55e20",
              color: "#22c55e",
              fontWeight: 700,
            }}
          />
        )}
        {/* Bouton pour voir la répartition */}
        <Chip
          label="Voir répartition"
          size="small"
          icon={<SwapHoriz sx={{ fontSize: "0.7rem !important" }} />}
          onClick={(e) => {
            e.stopPropagation();
            onShowRepartition(config.id);
          }}
          sx={{
            mt: 1,
            fontSize: "0.62rem",
            height: 20,
            borderColor: "#6c63ff",
            color: "#6c63ff",
            "&:hover": { bgcolor: "rgba(108, 99, 255, 0.1)" },
          }}
        />
      </Stack>

      <Link
        to={lienPublic}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        style={{ textDecoration: "none" }}
      >
        <Chip
          label="Vue publique"
          icon={<OpenInNew sx={{ fontSize: "0.7rem !important" }} />}
          size="small"
          variant="outlined"
          sx={{
            mt: 1,
            fontSize: "0.62rem",
            height: 20,
            borderColor: "#1e2433",
            color: "#636b88",
            "&:hover": { borderColor: "#6c63ff", color: "#6c63ff" },
          }}
        />
      </Link>
    </Paper>
  );
};
// ─── SidebarContent ───────────────────────────────────────────────────────────
const SidebarContent = ({
  configs,
  tatamiData,
  configSelectee,
  choisirConfig,
  loadingInitial,
  onClose,
  isMobile,
  onShowRepartition,
}) => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <Box
      sx={{
        p: 2,
        bgcolor: "#ffb547",
        color: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Star fontSize="small" />
        <Typography fontWeight="bold" fontSize="0.85rem">
          JUGE PRINCIPAL
        </Typography>
      </Stack>
      {isMobile && (
        <IconButton size="small" onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      )}
    </Box>

    <Box
      sx={{
        px: 2,
        py: 1,
        bgcolor: "#0e1118",
        borderBottom: "1px solid #1e2433",
        flexShrink: 0,
      }}
    >
      <Stack direction="row" gap={1}>
        <Chip
          label={`${configs.length} plateau${configs.length > 1 ? "x" : ""}`}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            bgcolor: "#1e2433",
            color: "#8b90a0",
          }}
        />
        <Chip
          label={`${configs.filter((c) => c.est_valide).length} actifs`}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            bgcolor: "#22c55e20",
            color: "#22c55e",
          }}
        />
      </Stack>
    </Box>

    <Box
      sx={{
        flex: 1,
        overflowY: "auto",
        p: 1.5,
        "&::-webkit-scrollbar": { width: 4 },
        "&::-webkit-scrollbar-thumb": { bgcolor: "#1e2433", borderRadius: 2 },
      }}
    >
      {loadingInitial ? (
        <SidebarSkeleton />
      ) : (
        <Stack spacing={1.5}>
          {configs.map((config) => (
            <ConfigCard
              key={config.id}
              config={config}
              estSelecte={configSelectee?.id === config.id}
              data={tatamiData[config.id]}
              onClick={() => {
                choisirConfig(config);
                if (isMobile && onClose) onClose();
              }}
              onShowRepartition={onShowRepartition}
            />
          ))}
        </Stack>
      )}
    </Box>
  </Box>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JugePrincipalDashboard({
  configs,
  handleValider,
  success,
  errors,
  submitId,
}) {
  const [tatamiData, setTatamiData] = useState({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingActif, setLoadingActif] = useState(false);
  const [polling, setPolling] = useState(false);
  const [configSelectee, setConfigSelectee] = useState(null);
  const [showRepartition, setShowRepartition] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false); // ✅ Nouveau état

  const configSelecteeRef = useRef(null);
  const isFirstLoad = useRef(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const choisirConfig = (config) => {
    configSelecteeRef.current = config;
    setConfigSelectee(config);
  };

  // ✅ fetchTousLesTatamis corrigé
  const fetchTousLesTatamis = useCallback(async () => {
    setLoadingInitial(true);
    setIsDataReady(false); // ✅ Réinitialiser isDataReady

    const results = {};
    await Promise.all(
      configs.map(async (config) => {
        try {
          const [enCoursRes, arbitresRes] = await Promise.all([
            Instance.get(`/api/seances/competition/${config.id}/en-cours`),
            Instance.get(`/api/seances/configs/${config.id}/arbitres-rotation`),
          ]);

          // ✅ Normaliser la réponse pour enCours
          const enCoursData =
            enCoursRes.data?.enCours || enCoursRes.data || null;

          results[config.id] = {
            enCours: enCoursData,
            arbitres: arbitresRes.data?.arbitres || [],
            superviseur: arbitresRes.data?.superviseur || null,
          };
        } catch (error) {
          console.error("Erreur pour le tatami", config.id, error);
          results[config.id] = {
            enCours: null,
            arbitres: [],
            superviseur: null,
          };
        }
      }),
    );

    setTatamiData(results);
    setIsDataReady(true); // ✅ Marquer les données comme prêtes
    setLoadingInitial(false);

    // ✅ Sélectionner la config uniquement si les données sont prêtes
    if (!configSelecteeRef.current && configs.length > 0) {
      const premier =
        configs.find((c) => {
          return (
            results[c.id]?.enCours !== null && results[c.id]?.enCours !== ""
          );
        }) ||
        configs.find((c) => c.est_valide) ||
        configs[0];

      isFirstLoad.current = true;
      choisirConfig(premier);
    }
  }, [configs]);

  // ✅ fetchTatamiActif corrigé
  const fetchTatamiActif = useCallback(async (configId, silent = false) => {
    if (!silent) setLoadingActif(true);
    else setPolling(true);

    try {
      const [enCoursRes, arbitresRes] = await Promise.all([
        Instance.get(`/api/seances/competition/${configId}/en-cours`),
        Instance.get(`/api/seances/configs/${configId}/arbitres-rotation`),
      ]);

      // ✅ Normaliser la réponse pour enCours
      const enCoursData = enCoursRes.data?.enCours || enCoursRes.data || null;

      setTatamiData((prev) => ({
        ...prev,
        [configId]: {
          enCours: enCoursData,
          arbitres: arbitresRes.data?.arbitres || [],
          superviseur: arbitresRes.data?.superviseur || null,
        },
      }));
    } catch (e) {
      console.log("Erreur:", e);
    } finally {
      if (!silent) setLoadingActif(false);
      else setPolling(false);
    }
  }, []);

  // ✅ Premier chargement
  useEffect(() => {
    if (configs.length > 0) fetchTousLesTatamis();
  }, [configs, fetchTousLesTatamis]);

  // ✅ Switch de tatami
  useEffect(() => {
    if (!configSelectee?.id) return;
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    fetchTatamiActif(configSelectee.id, false);
  }, [configSelectee?.id, fetchTatamiActif]);

  // ✅ Polling toutes les 3 secondes (au lieu de 5 minutes)
  useEffect(() => {
    if (!configSelectee?.id) return;
    const interval = setInterval(() => {
      fetchTatamiActif(configSelectee.id, true);
    }, 3000); // ✅ 3 secondes
    return () => clearInterval(interval);
  }, [configSelectee?.id, fetchTatamiActif]);

  const handleDesignerSuperviseur = async (configId, arbitreCompetitionId) => {
    try {
      await Instance.patch(`/api/rotation-arbitres/${configId}/superviseur`, {
        config_notation_id: configId,
        arbitre_competition_id: arbitreCompetitionId,
      });
      fetchTatamiActif(configId, true);
    } catch (e) {
      console.log(e);
    }
  };

  const handleShowRepartition = (configId) => {
    const config = configs.find((c) => c.id === configId);
    if (config) {
      setConfigSelectee(config);
      setShowRepartition(true);
    }
  };
  const renderRightPanel = () => {
    if (!configSelectee || !tatamiData[configSelectee.id]) return null;
    const dataActive = tatamiData[configSelectee.id];
    const isKumite = configSelectee.discipline?.toLowerCase() === "kumite";

    if (showRepartition) {
      return (
        <RepartitionAthletes
          competition={configSelectee.competition_id}
          configs={[configSelectee]}
          onBack={() => setShowRepartition(false)}
        />
      );
    }

    if (isKumite) {
      return (
        <SeanceAdminPanelKumite
          config={configSelectee}
          data={dataActive}
          handleValider={handleValider}
          handleDesignerSuperviseur={handleDesignerSuperviseur}
          success={success}
          errors={errors}
          submitId={submitId}
          onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
          onShowRepartition={() => setShowRepartition(true)}
        />
      );
    }
    return (
      <SeanceAdminPanelKata
        config={configSelectee}
        data={dataActive}
        handleValider={handleValider}
        handleDesignerSuperviseur={handleDesignerSuperviseur}
        success={success}
        errors={errors}
        submitId={submitId}
        onRefresh={() => fetchTatamiActif(configSelectee.id, true)}
        onShowRepartition={() => setShowRepartition(true)}
      />
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#080a0f",
        color: "#dde1f0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {polling && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 2,
          }}
        >
          <Box
            sx={{
              height: "100%",
              bgcolor: "#ffb547",
              animation: "pollingBar 1s ease-in-out infinite",
              "@keyframes pollingBar": {
                "0%,100%": { opacity: 0.4 },
                "50%": { opacity: 1 },
              },
            }}
          />
        </Box>
      )}

      {!isMobile && (
        <Box
          sx={{
            width: 270,
            flexShrink: 0,
            borderRight: "1px solid #1e2433",
            height: "100%",
            overflow: "hidden",
          }}
        >
          <SidebarContent
            configs={configs}
            tatamiData={tatamiData}
            configSelectee={configSelectee}
            choisirConfig={choisirConfig}
            loadingInitial={loadingInitial}
            isMobile={false}
            onShowRepartition={handleShowRepartition}
          />
        </Box>
      )}

      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 280,
              bgcolor: "#080a0f",
              borderRight: "1px solid #1e2433",
            },
          }}
        >
          <SidebarContent
            configs={configs}
            tatamiData={tatamiData}
            configSelectee={configSelectee}
            choisirConfig={choisirConfig}
            loadingInitial={loadingInitial}
            isMobile={true}
            onClose={() => setDrawerOpen(false)}
            onShowRepartition={handleShowRepartition}
          />
        </Drawer>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {isMobile && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              py: 1.5,
              bgcolor: "#0e1118",
              borderBottom: "1px solid #1e2433",
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ color: "#ffb547", bgcolor: "#ffb54715", borderRadius: 2 }}
            >
              <Badge
                badgeContent={configs.filter((c) => c.est_valide).length}
                color="success"
                max={9}
              >
                <MenuIcon fontSize="small" />
              </Badge>
            </IconButton>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {configSelectee ? (
                <>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="white"
                    noWrap
                  >
                    {configSelectee.plateau_nom}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#636b88" }}>
                    {configSelectee.discipline} ·{" "}
                    {formatHeure(configSelectee?.heure_debut_prevu)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" sx={{ color: "#636b88" }}>
                  Choisir un plateau
                </Typography>
              )}
            </Box>
            {configSelectee && (
              <FiberManualRecord
                sx={{
                  fontSize: 10,
                  color: configSelectee.est_valide ? "#22c55e" : "#636b88",
                }}
              />
            )}
          </Box>
        )}

        <Box sx={{ flex: 1, overflow: "auto" }}>
          {loadingInitial ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: "#ffb547" }} />
              <Typography variant="body2" sx={{ color: "#636b88" }}>
                Chargement des plateaux...
              </Typography>
            </Box>
          ) : loadingActif ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                gap: 2,
              }}
            >
              <CircularProgress sx={{ color: "#6c63ff" }} size={32} />
              <Typography variant="body2" sx={{ color: "#636b88" }}>
                Chargement de{" "}
                <strong style={{ color: "#dde1f0" }}>
                  {configSelectee?.plateau_nom}
                </strong>
                ...
              </Typography>
            </Box>
          ) : configSelectee ? (
            <Fade in key={configSelectee.id} timeout={300}>
              <Box sx={{ height: "100%" }}>{renderRightPanel()}</Box>
            </Fade>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                p: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "#141720",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Star sx={{ color: "#ffb547", fontSize: 32 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "#dde1f0", fontWeight: 600, textAlign: "center" }}
              >
                Sélectionnez un plateau
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#636b88", textAlign: "center", maxWidth: 280 }}
              >
                {isMobile
                  ? "Appuyez sur le menu pour voir les plateaux disponibles"
                  : "Choisissez un plateau dans la liste à gauche pour gérer la séance"}
              </Typography>
              {isMobile && (
                <Box
                  onClick={() => setDrawerOpen(true)}
                  sx={{
                    mt: 1,
                    px: 3,
                    py: 1.5,
                    bgcolor: "#ffb547",
                    color: "#000",
                    borderRadius: 3,
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Voir les plateaux
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
