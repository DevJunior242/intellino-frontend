import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import AddIcon from "@mui/icons-material/Add";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";

// const StudentForm = () => {
//   const [createAccount, setCreateAccount] = useState(false);
//   const [isOwnResponsible, setIsOwnResponsible] = useState(false);
//   const [birthdate, setbirthdate] = useState(null);
//   const [error, setError] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   const [studentParent, setStudentParent] = useState([]);
//   const [success, setSuccess] = useState("");
//   const [selectParent, setSelectParent] = useState(null);

//   const getErrorText = (fieldKey) => {
//     const errorArray = error[fieldKey];
//     return Array.isArray(errorArray) ? errorArray.join(", ") : errorArray;
//   };
//   const hasError = (field) => !!error?.[field];
//   const { activeRole, activeClubId } = UseAuth();
//   console.log("activeRole", activeRole);
//   console.log("activeClubId", activeClubId);
//   const [formData, setFormData] = useState({
//     fullname: "",
//     birthdate: "",
//     sex: "",
//     user_id: null,
//     email: "",
//     phone: "",
//     photo: "",
//     club_id: activeClubId,
//   });

//   const [preview, setPreview] = useState(null);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, photo: file }));
//       setPreview(URL.createObjectURL(file));
//     }
//   };

//   const isMinor =
//     birthdate && differenceInYears(new Date(), birthdate.toDate()) < 18;
//   const handleDateChange = (newValue) => {
//     setbirthdate(newValue);
//     const formattedDate = newValue ? newValue.format("YYYY-MM-DD") : "";

//     setFormData((prev) => ({
//       ...prev,
//       birthdate: formattedDate,
//     }));

//     if (newValue && differenceInYears(new Date(), newValue.toDate()) < 18) {
//       setIsOwnResponsible(false);
//     }
//   };
//   const getParents = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await Instance(
//         `/api/parents-users?club_id=${activeClubId}`,
//       );
//       console.log(response);
//       setStudentParent(response.data.parentUsers || []);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   }, [activeClubId]);

//   useEffect(() => {
//     getParents();
//   }, [getParents]);

//   //parent selectionné
//   useEffect(() => {
//     if (selectParent) {
//       setFormData((prev) => ({
//         ...prev,
//         user_id: selectParent.id,
//       }));
//     }
//   }, [selectParent]);

//   //handlesubmit

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError({});

//     setSubmitting(true);
//     try {
//       const payload = new FormData();
//       payload.append("is_own_responsible", isOwnResponsible ? 1 : 0);
//       payload.append("create_account", createAccount ? 1 : 0);
//       payload.append("fullname", formData.fullname);
//       payload.append("birthdate", formData.birthdate);
//       payload.append("sex", formData.sex);
//       payload.append("club_id", activeClubId);

//       if (createAccount) {
//         payload.append("email", formData.email);
//         payload.append("phone", formData.phone);
//       }
//       if (!isOwnResponsible) {
//         payload.append("user_id", formData.user_id || "");
//       }
//       if (formData.photo) {
//         payload.append("photo", formData.photo);
//       }

//       const url = "/api/parent-eleven/store";

//       const response = await Instance.post(url, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       console.log(response);

//       if (response.data.success) {
//         setSelectParent(null);
//         setFormData({
//           fullname: "",
//           birthdate: "",
//           sex: "",
//           email: "",
//           phone: "",
//           photo: "",
//         });
//         setSuccess(response.data.message);
//         setError({});
//         setTimeout(() => {
//           setSuccess("");
//         }, 3000);
//       }
//     } catch (error) {
//       console.error(error);
//       ErrorGlobal({ error, setError });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return <ConfigSkeleton />;
//   }
//   return (
//     <Paper
//       sx={{
//         p: 4,
//         maxWidth: 600,
//         mx: "auto",
//         backgroundColor: "background.default",
//       }}
//     >
//       <Typography variant="h5" gutterBottom>
//         Formulaire d'enregistrement de l'élève
//       </Typography>
//       {success && <Message text={success} type="success" />}
//       {error.general && <Message text={error.general} type="error" />}

//       <Box sx={{ backgroundColor: "background.default" }}>
//         <form onSubmit={handleSubmit}>
//           <Typography variant="h6">Identité de l'élève</Typography>

//           <TextField
//             error={hasError("fullname")}
//             helperText={getErrorText("fullname")}
//             name="fullname"
//             label="Nom complet"
//             fullWidth
//             value={formData.fullname}
//             onChange={handleChange}
//             margin="normal"
//           />
//           <LocalizationProvider dateAdapter={AdapterDayjs}>
//             <DatePicker
//               slotProps={{
//                 textField: {
//                   fullWidth: true,
//                   error: hasError("birthdate"),
//                   helperText: getErrorText("birthdate"),
//                 },
//               }}
//               name="birthdate"
//               label="Date de naissance"
//               value={formData.birthdate ? new dayjs(formData.birthdate) : null}
//               onChange={handleDateChange}
//               // slotProps={{ textField: { fullWidth: true } }}
//               maxDate={dayjs()}
//             />
//           </LocalizationProvider>

//           <FormControl fullWidth margin="normal" required>
//             <InputLabel id="sex-label">Sexe</InputLabel>
//             <Select
//               sx={{
//                 backgroundColor: "background.default",
//                 borderRadius: 2,
//                 "& .MuiSelect-select": {
//                   padding: "12px",
//                 },
//               }}
//               error={hasError("sex")}
//               labelId="sex-label"
//               name="sex"
//               label="Sexe"
//               value={formData.sex}
//               onChange={handleChange}
//               helperText={!!getErrorText("sex")}
//             >
//               <MenuItem value="" disabled>
//                 Sélectionner
//               </MenuItem>
//               <MenuItem value="M">Masculin</MenuItem>
//               <MenuItem value="F">Féminin</MenuItem>
//             </Select>
//           </FormControl>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//             <Avatar src={preview} sx={{ width: 56, height: 56 }} />
//             <TextField
//               type="file"
//               error={hasError("photo")}
//               helperText={getErrorText("photo")}
//               label="Photo"
//               name="photo"
//               accept="image/jpeg,image/png,image/jpg"
//               onChange={handleFileChange}
//               InputLabelProps={{ shrink: true }}
//               margin="normal"
//             />
//           </Box>

//           <Divider sx={{ my: 2 }} />

//           <FormControlLabel
//             control={
//               <Switch
//                 checked={createAccount}
//                 onChange={(e) => setCreateAccount(e.target.checked)}
//               />
//             }
//             label="L'élève a besoin d'un accès personnel (Email)"
//           />

//           {createAccount && (
//             <Box sx={{ gap: 2 }}>
//               <TextField
//                 error={hasError("email")}
//                 helperText={getErrorText("email")}
//                 name="email"
//                 value={formData.email}
//                 label="Email de l'élève"
//                 fullWidth
//                 onChange={handleChange}
//                 margin="normal"
//               />
//               <TextField
//                 error={hasError("phone")}
//                 helperText={getErrorText("phone")}
//                 name="phone"
//                 value={formData.phone}
//                 label="Numéro de téléphone"
//                 fullWidth
//                 onChange={handleChange}
//                 margin="normal"
//               />
//             </Box>
//           )}

//           <FormControlLabel
//             control={
//               <Switch
//                 checked={isOwnResponsible}
//                 disabled={isMinor}
//                 onChange={(e) => setIsOwnResponsible(e.target.checked)}
//               />
//             }
//             label="L'élève est son propre responsable légal"
//           />

//           {!isOwnResponsible && (
//             <Autocomplete
//               disablePortal
//               options={Array.isArray(studentParent) ? studentParent : []}
//               getOptionLabel={(studentParent) =>
//                 `${studentParent.fullname || ""} - ${studentParent.phone || ""}`
//               }
//               value={selectParent}
//               onChange={(e, newValue) => {
//                 setSelectParent(newValue);
//                 console.log("Nouveau parent sélectionné :", newValue);
//               }}
//               renderInput={(params) => (
//                 <TextField
//                   error={!!getErrorText("user_id")}
//                   {...params}
//                   fullWidth
//                   margin="normal"
//                   label="il vous faut choisir un parent"
//                   required={!isOwnResponsible}
//                   helperText={getErrorText("user_id")}
//                 />
//               )}
//             />
//           )}

//           <Button
//             type="submit"
//             variant="contained"
//             disabled={submitting}
//             sx={{ mt: 3 }}
//           >
//             {submitting ? "enregistrement..." : "Enregistrer Élève et Parent"}
//           </Button>
//         </form>
//       </Box>
//     </Paper>
//   );
// };
// export default StudentForm;

const StudentForm = () => {
  const { activeClubId } = UseAuth();
  const [submitting, setSubmitting] = useState(false);
  const [isOwnResponsible, setIsOwnResponsible] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  // État pour le Parent (affiché seulement si !isOwnResponsible)
  const [parentData, setParentData] = useState({
    fullname: "",
    email: "",
    phone: "",
  });

  // État pour la liste des élèves
  const [students, setStudents] = useState([
    {
      fullname: "",
      birthdate: "",
      sex: "",
      email: "",
      phone: "",
      createAccount: false,
    },
  ]);

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };
  const handleFileChange = (index, file) => {
    if (file) {
      const newStudents = [...students];
      newStudents[index].photo = file;
      setStudents(newStudents);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({});
    setSuccess("");
    const formData = new FormData();

    // 1. Infos globales
    formData.append("club_id", activeClubId);
    formData.append("is_own_responsible", isOwnResponsible ? 1 : 0);

    // 2. Infos du Parent (uniquement si non responsable lui-même)
    if (!isOwnResponsible) {
      formData.append("parent_fullname", parentData.fullname);
      formData.append("parent_email", parentData.email);
      formData.append("parent_phone", parentData.phone);
    }

    // 3. Boucle sur les élèves
    students.forEach((student, index) => {
      formData.append(`students[${index}][fullname]`, student.fullname);
      formData.append(`students[${index}][birthdate]`, student.birthdate);
      formData.append(`students[${index}][sex]`, student.sex);
      formData.append(
        `students[${index}][create_account]`,
        student.createAccount ? 1 : 0,
      );

      // Champs conditionnels de l'élève
      if (student.email)
        formData.append(`students[${index}][email]`, student.email);
      if (student.phone)
        formData.append(`students[${index}][phone]`, student.phone);

      // La Photo (le fichier binaire)
      if (student.photo) {
        formData.append(`students[${index}][photo]`, student.photo);
      }
    });
    console.log("FormData :", formData);

    try {
      const res = await Instance.post(
        "/api/parent-eleven/store-multiple",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      console.log("Réponse de l'API :", res);
      if (res.data.success) {
        setTimeout(() => {
          setSuccess(res.data.message || "Inscription réussie !");
        }, 3000);
        // reset
        setParentData({ fullname: "", email: "", phone: "" });
        setStudents([
          {
            fullname: "",
            birthdate: "",
            sex: "",
            email: "",
            phone: "",
            createAccount: false,
          },
        ]);
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backErrors = err.response.data.errors;
        const newErrors = {};

        Object.keys(backErrors).forEach((key) => {
          if (key.startsWith("students.")) {
            const cleanKey = key
              .replace(/\./g, "_")
              .replace("students_", "student_");
            newErrors[cleanKey] = backErrors[key][0];
          } else {
            newErrors[key] = backErrors[key][0];
          }
        });
        setError(newErrors);
      } else {
        ErrorGlobal({ error: err, setError });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        maxWidth: 800,
        mx: "auto",
        backgroundColor: "background.default",
      }}
    >
      {success && <Message text={success} type="success" />}
      {error.general && <Message text={error.general} type="error" />}
      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          Inscription Élève(s)
        </Typography>

        {/* SWITCH RESPONSABLE */}
        <FormControlLabel
          control={
            <Switch
              checked={isOwnResponsible}
              onChange={(e) => setIsOwnResponsible(e.target.checked)}
            />
          }
          label="L'élève (ou le groupe) est son propre responsable légal"
          sx={{ mb: 2 }}
        />

        {/* SECTION PARENT (Affichée uniquement si non responsable) */}
        {!isOwnResponsible && (
          <Box
            sx={{
              mb: 4,
              p: 2,
              bgcolor: "info.main",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">
              Informations du Parent / Tuteur
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{
                mt: 1,
                backgroundColor: "background.default",
                borderRadius: 2,
              }}
            >
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!error.parent_fullname}
                  helperText={error.parent_fullname}
                  value={parentData.fullname}
                  label="Nom Parent"
                  fullWidth
                  variant="filled"
                  onChange={(e) =>
                    setParentData({ ...parentData, fullname: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!error.parent_email}
                  helperText={error.parent_email}
                  value={parentData.email}
                  label="Email Parent"
                  fullWidth
                  variant="filled"
                  onChange={(e) =>
                    setParentData({ ...parentData, email: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  error={!!error.parent_phone}
                  helperText={error.parent_phone}
                  value={parentData.phone}
                  label="Numéro de téléphone"
                  fullWidth
                  variant="filled"
                  onChange={(e) =>
                    setParentData({ ...parentData, phone: e.target.value })
                  }
                  required
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* BOUCLE ÉLÈVES */}
        {students.map((student, index) => {
          // Helper pour récupérer l'erreur de cet élève précis
          const getStudentError = (field) => error[`student_${index}_${field}`];

          return (
            <Card
              key={index}
              sx={{ p: 2, mb: 2, backgroundColor: "background.default" }}
            >
              <Typography variant="subtitle2">Élève #{index + 1}</Typography>
              <TextField
                label="Nom complet"
                fullWidth
                margin="normal"
                value={student.fullname}
                onChange={(e) =>
                  handleStudentChange(index, "fullname", e.target.value)
                }
                error={!!getStudentError("fullname")}
                helperText={getStudentError("fullname")}
                required
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  value={student.birthdate}
                  label="Date de naissance"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    handleStudentChange(index, "birthdate", e.target.value)
                  }
                  error={!!getStudentError("birthdate")}
                  helperText={getStudentError("birthdate")}
                  required
                />

                <FormControl fullWidth error={!!getStudentError("sex")}>
                  <InputLabel>Sexe</InputLabel>
                  <Select
                    value={student.sex}
                    label="Sexe"
                    onChange={(e) =>
                      handleStudentChange(index, "sex", e.target.value)
                    }
                    required
                  >
                    <MenuItem value="M">M</MenuItem>
                    <MenuItem value="F">F</MenuItem>
                  </Select>
                  {getStudentError("sex") && (
                    <FormHelperText>{getStudentError("sex")}</FormHelperText>
                  )}
                </FormControl>
              </Box>
              {/* SWITCH CRÉER COMPTE POUR CET ÉLÈVE */}
              <FormControlLabel
                control={
                  <Switch
                    checked={student.createAccount}
                    onChange={(e) =>
                      handleStudentChange(
                        index,
                        "createAccount",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Créer un compte d'accès pour cet élève"
                sx={{ mt: 2 }}
              />
              {/* Champs conditionnels email/phone */}
              {(student.createAccount || isOwnResponsible) && (
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <TextField
                    value={student.email}
                    label="Email"
                    fullWidth
                    error={!!getStudentError("email")}
                    helperText={getStudentError("email")}
                    onChange={(e) =>
                      handleStudentChange(index, "email", e.target.value)
                    }
                    required
                  />
                  <TextField
                    value={student.phone}
                    label="Téléphone"
                    fullWidth
                    error={!!getStudentError("phone")}
                    helperText={getStudentError("phone")}
                    onChange={(e) =>
                      handleStudentChange(index, "phone", e.target.value)
                    }
                    required
                  />
                </Box>
              )}
            </Card>
          );
        })}

        <Button
          variant="outlined"
          onClick={() =>
            setStudents([...students, { fullname: "", createAccount: false }])
          }
          startIcon={<AddIcon />}
          sx={{ mb: 3 }}
        >
          Ajouter un enfant à la fratrie
        </Button>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={submitting}
        >
          {submitting ? "Enregistrement..." : "Finaliser l'inscription"}
        </Button>
      </form>
    </Paper>
  );
};

export default StudentForm;
