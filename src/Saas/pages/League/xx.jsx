// function ClubStore() {
//   const [error, setError] = useState({});
//   const [success, setSuccess] = useState("");
//   const { switchPortal, updateAuth } = UseAuth();
//   const [disciplines, setDisciplines] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [selectDiscipline, setSelectDiscipline] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     discipline_id: "",
//     logo: "",
//     country_id: "",
//     city: "",
//     address: "",
//   });
//   const [submitting, setSubmitting] = useState(false);
//   const hasError = (field) => !!error?.[field];
//   const getError = (field) => error?.[field]?.join(", ");
//   //fetch disciplines from api/disciplines
//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       //promise all
//       const [disciplinesResponse, countriesResponse] = await Promise.all([
//         Instance.get("/api/disciplines"),
//         Instance.get("/api/countries"),
//       ]);
//       setDisciplines(disciplinesResponse.data || []);
//       setCountries(countriesResponse.data || []);
//       console.log(disciplinesResponse, countriesResponse);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     if (type === "file") {
//       setFormData({ ...formData, [name]: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };
//   useEffect(() => {
//     if (selectDiscipline) {
//       setFormData((prev) => ({ ...prev, discipline_id: selectDiscipline.id }));
//     }
//   }, [selectDiscipline]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError({});
//     setSubmitting(true);
//     const formDataInitial = new FormData();
//     formDataInitial.append("name", formData.name);
//     formDataInitial.append("logo", formData.logo);
//     formDataInitial.append("city", formData.city);
//     formDataInitial.append("address", formData.address);
//     formDataInitial.append("country_id", formData.country_id);
//     formDataInitial.append("discipline_id", formData.discipline_id);
//     try {
//       const response = await Instance.post(
//         "/api/clubs/clubs",
//         formDataInitial,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         },
//       );
//       if (response?.data?.success) {
//         const { user, clubs, new_club } = response.data;

//         // 1. Extraire les noms des rôles pour le State (Format: ["admin_club"])
//         // On cherche les rôles dans le premier club car c'est celui qu'on vient de créer
//         const extractedRoles = user.clubs[0].roles.map((r) => r.name);

//         // 2. Mettre à jour l'authentification globale
//         // On passe les rôles extraits pour écraser l'ancien tableau vide
//         updateAuth({
//           user: user,
//           clubs: clubs,
//           role: extractedRoles,
//         });

//         // 3. Forcer le rôle actif sur le nouveau club
//         switchPortal(new_club.id, new_club.type, new_club.role);
//         //reset form
//         setSelectDiscipline(null);
//         setFormData({
//           name: "",
//           discipline_id: "",
//           logo: "",
//           country_id: "",
//           city: "",
//           address: "",
//         });
//         setSuccess(
//           "votre club a été créé avec succès.rendez vous dans le dashboard pour y accéder",
//         );

//         setError({});
//       } else {
//         setError({ general: response.data.message });
//         setSuccess("");
//       }
//     } catch (error) {
//       ErrorGlobal({ error, setError });
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   if (loading) return <ConfigSkeleton />;
//   return (
//     <Container maxWidth="md">
//       <Box
//         component={motion.div}
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -50 }}
//         transition={{ duration: 0.5 }}
//         sx={{
//           mb: 8,
//           mt: 2,
//           boxShadow: 10,
//           borderRadius: 2,

//           p: 5,
//           backgroundColor: "background.default",
//         }}
//       >
//         <Typography
//           variant="h4"
//           textAlign="center"
//           sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 }, mb: 3 }}
//         >
//           Création de club
//         </Typography>

//         {success && <Message text={success} type="success" />}
//         {error.general && <Message text={error.general} type="error" />}

//         <form onSubmit={handleSubmit}>
//           {/* ── SECTION 1 ── */}
//           <Typography sx={{ fontWeight: "bold", mb: 1 }}>
//             🏫 Informations du club
//           </Typography>
//           <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
//             {/* Nom du club — demi-largeur */}
//             <TextField
//               error={hasError("name")}
//               helperText={getError("name")}
//               name="name"
//               label="Nom du club"
//               fullWidth
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />

//             {/* Discipline — demi-largeur (à côté du nom) */}
//             <FormControl fullWidth error={hasError("discipline_id")} required>
//               <InputLabel>Discipline</InputLabel>
//               <Select
//                 label="Discipline"
//                 value={formData.discipline_id}
//                 onChange={(e) =>
//                   setFormData({ ...formData, discipline_id: e.target.value })
//                 }
//                 MenuProps={{
//                   PaperProps: {
//                     sx: { backgroundColor: "background.default" },
//                   },
//                 }}
//               >
//                 {disciplines.length > 0 ? (
//                   disciplines.map((disp) => (
//                     <MenuItem key={disp.id} value={disp.id}>
//                       {disp.name}
//                     </MenuItem>
//                   ))
//                 ) : (
//                   <MenuItem disabled>Aucune discipline</MenuItem>
//                 )}
//               </Select>
//               {hasError("discipline_id") && (
//                 <FormHelperText>{getError("discipline_id")}</FormHelperText>
//               )}
//             </FormControl>
//           </Box>

//           {/* ── SECTION 2 ── */}
//           <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
//             🌍 Localisation
//           </Typography>
//           <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
//             {/* Pays — demi-largeur */}
//             <FormControl fullWidth error={hasError("country_id")} required>
//               <InputLabel>Pays</InputLabel>
//               <Select
//                 value={formData.country_id}
//                 onChange={(e) =>
//                   setFormData({ ...formData, country_id: e.target.value })
//                 }
//                 label="Pays"
//                 MenuProps={{
//                   PaperProps: {
//                     sx: { backgroundColor: "background.default" },
//                   },
//                 }}
//               >
//                 {countries.length > 0 ? (
//                   countries.map((country) => (
//                     <MenuItem key={country.id} value={country.id}>
//                       {country.name}
//                     </MenuItem>
//                   ))
//                 ) : (
//                   <MenuItem disabled>Aucun pays</MenuItem>
//                 )}
//               </Select>
//               {hasError("country_id") && (
//                 <FormHelperText>{getError("country_id")}</FormHelperText>
//               )}
//             </FormControl>

//             {/* Région — demi-largeur (à côté du pays) */}
//             <TextField
//               error={hasError("city")}
//               helperText={getError("city")}
//               name="city"
//               label="La ville"
//               fullWidth
//               value={formData.city}
//               onChange={handleChange}
//               required
//             />
//           </Box>
//           {/* Adresse — pleine largeur */}
//           <TextField
//             error={hasError("address")}
//             helperText={getError("address")}
//             name="address"
//             label="Adresse"
//             fullWidth
//             margin="normal"
//             value={formData.address}
//             onChange={handleChange}
//           />

//           {/* ── SECTION 3 ── */}
//           <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
//             🖼️ Branding
//           </Typography>

//           <TextField
//             error={hasError("logo")}
//             helperText={getError("logo")}
//             name="logo"
//             type="file"
//             fullWidth
//             onChange={handleChange}
//           />

//           {/* ── SUBMIT ── */}
//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             sx={{ p: 2, textTransform: "none", mt: 2 }}
//             disabled={submitting}
//           >
//             {submitting ? "Chargement..." : "Créer le club"}
//           </Button>
//         </form>
//       </Box>
//     </Container>
//   );
// }

// export default ClubStore;

// function Storeleague() {
//   const [error, setError] = useState({});
//   const [success, setSuccess] = useState(false);
//   const { switchPortal, updateAuth } = UseAuth();
//   const [submitting, setSubmitting] = useState(false);
//   const [countries, setCountries] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorCountry, setErrorCountry] = useState("");

//   const fetchData = useCallback(async () => {
//     setLoading(true);

//     setErrorCountry("");
//     try {
//       const res = await Instance.get("/api/countries");
//       setCountries(res.data || []);
//     } catch (error) {
//       console.log(error);
//       setErrorCountry(
//         "Une erreur est survenue lors de la récupération des pays",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const [formData, setFormData] = useState({
//     name: "",
//     country_id: "",
//     region: "",
//     address: "",
//     logo: "",
//   });

//   const hasError = (field) => !!error?.[field];
//   const getError = (field) => error?.[field]?.join(", ");

//   const handleChange = (e) => {
//     const { name, value, type, files } = e.target;
//     if (type === "file") {
//       setFormData({ ...formData, [name]: files[0] });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError({});
//     setSubmitting(true);
//     const formDataInitial = new FormData();
//     formDataInitial.append("name", formData.name);
//     formDataInitial.append("region", formData.region);
//     formDataInitial.append("address", formData.address);
//     formDataInitial.append("country_id", formData.country_id);
//     formDataInitial.append("logo", formData.logo);

//     try {
//       const response = await Instance.post(
//         "/api/leagues/leagues",
//         formDataInitial,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         },
//       );
//       console.log(response);
//       if (response?.data?.success) {
//         const { user, leagues, new_league } = response.data;

//         // 1. Extraire les noms des rôles pour le State (Format: ["admin_club"])
//         // On cherche les rôles dans le premier club car c'est celui qu'on vient de créer
//         const extractedRoles = user.leagues[0].roles.map((r) => r.name);

//         // 2. Mettre à jour l'authentification globale
//         // On passe les rôles extraits pour écraser l'ancien tableau vide
//         updateAuth({
//           user: user,
//           leagues: leagues,
//           role: extractedRoles,
//         });

//         // 3. Forcer le rôle actif sur le nouveau club
//         switchPortal(new_league.id, new_league.type, new_league.role); //reset form
//         setFormData({
//           name: "",
//           phone: "",

//           logo: "",
//         });
//         setSuccess(response.data.message);

//         setError({});
//       } else {
//         setError({ general: response.data.message });
//         setSuccess(false);
//       }
//     } catch (error) {
//       ErrorGlobal({ error, setError });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <ConfigSkeleton />;
//   if (errorCountry) return <ErrorBlock text={errorCountry} type="error" />;

//   return (
//     <Container maxWidth="md">
//       <Box
//         component={motion.div}
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -50 }}
//         transition={{ duration: 0.5 }}
//         sx={{
//           mb: 8,
//           mt: 2,
//           boxShadow: 10,
//           borderRadius: 2,

//           p: 5,
//           backgroundColor: "background.default",
//         }}
//       >
//         <Typography
//           variant="h4"
//           textAlign="center"
//           sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 }, mb: 3 }}
//         >
//           Espace Ligue
//         </Typography>

//         {success && <Message text={success} type="success" />}
//         {error.general && <Message text={error.general} type="error" />}

//         <form onSubmit={handleSubmit}>
//           {/* ── SECTION 1 ── */}
//           <Typography sx={{ fontWeight: "bold", mb: 1 }}>
//             🏫 Informations Ligue
//           </Typography>
//           <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
//             {/* Nom du club — demi-largeur */}
//             <TextField
//               error={hasError("name")}
//               helperText={getError("name")}
//               name="name"
//               label="Nom de la Ligue"
//               fullWidth
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//           </Box>

//           {/* ── SECTION 2 ── */}
//           <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
//             🌍 Localisation
//           </Typography>
//           <Box sx={{ display: { xs: "block", md: "flex" }, gap: 2 }}>
//             {/* Pays — demi-largeur */}
//             <FormControl fullWidth error={hasError("country_id")} required>
//               <InputLabel>Pays</InputLabel>
//               <Select
//                 value={formData.country_id}
//                 onChange={(e) =>
//                   setFormData({ ...formData, country_id: e.target.value })
//                 }
//                 label="Pays"
//                 MenuProps={{
//                   PaperProps: {
//                     sx: { backgroundColor: "background.default" },
//                   },
//                 }}
//               >
//                 {countries.length > 0 ? (
//                   countries.map((country) => (
//                     <MenuItem key={country.id} value={country.id}>
//                       {country.name}
//                     </MenuItem>
//                   ))
//                 ) : (
//                   <MenuItem disabled>Aucun pays</MenuItem>
//                 )}
//               </Select>
//               {hasError("country_id") && (
//                 <FormHelperText>{getError("country_id")}</FormHelperText>
//               )}
//             </FormControl>

//             {/* Région — demi-largeur (à côté du pays) */}
//             <TextField
//               error={hasError("region")}
//               helperText={getError("region")}
//               name="region"
//               label="Région(ex: centre)"
//               fullWidth
//               value={formData.region}
//               onChange={handleChange}
//               required
//             />
//           </Box>
//           {/* Adresse — pleine largeur */}
//           <TextField
//             error={hasError("address")}
//             helperText={getError("address")}
//             name="address"
//             label="Adresse(optionel)"
//             fullWidth
//             margin="normal"
//             value={formData.address}
//             onChange={handleChange}
//           />

//           {/* ── SECTION 3 ── */}
//           <Typography sx={{ fontWeight: "bold", mt: 2, mb: 1 }}>
//             🖼️ Branding
//           </Typography>

//           <TextField
//             error={hasError("logo")}
//             helperText={getError("logo")}
//             name="logo"
//             type="file"
//             fullWidth
//             onChange={handleChange}
//           />

//           {/* ── SUBMIT ── */}
//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             sx={{ p: 2, textTransform: "none", mt: 2 }}
//             disabled={submitting}
//           >
//             {submitting ? "Chargement..." : "Créer la ligue"}
//           </Button>
//         </form>
//       </Box>
//     </Container>
//   );
// }

// export default Storeleague;
