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

const StudentForm = ({ onSuccess } = {}) => {
  const { activeId, activeType } = UseAuth();
  const estClub = activeType === "Club";
  const [submitting, setSubmitting] = useState(false);
  const [isOwnResponsible, setIsOwnResponsible] = useState(false);
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
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

    // 1. Infos globales — une Ligue/Fédération qui inscrit un athlète
    // manuellement ne force pas de club (athlète indépendant) ; seul un
    // Club s'auto-affecte comme club de l'élève.
    if (estClub) {
      formData.append("club_id", activeId);
    }
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
      if (res.data.success) {
        setSuccess(res.data.message || "Inscription réussie !");
        onSuccess?.(res.data);

        setTimeout(() => {
          setSuccess("");
        }, 3000);
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
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontSize: { xs: 10, md: 20 } }}
        >
          Inscription Élève(s)
        </Typography>

        {!estClub && (
          <Message
            text="Inscription en tant qu'athlète indépendant (sans club rattaché) — vous inscrivez directement depuis votre compte Ligue/Fédération."
            type="info"
          />
        )}

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
          componentsProps={{
            typography: {
              sx: { fontSize: { xs: 10, md: 14 } },
            },
          }}
        />

        {/* SECTION PARENT (Affichée uniquement si non responsable) */}
        {!isOwnResponsible && (
          <Box
            sx={{
              mb: 4,
              p: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                bgcolor: "info.main",
                p: 2,
                fontSize: { xs: 10, md: 20 },
              }}
            >
              Informations du Parent / Tuteur
            </Typography>
            <Grid
              container
              spacing={2}
              sx={{
                mt: 1,
                borderRadius: 2,
              }}
            >
              <Grid item xs={12} md={6}>
                <TextField
                  error={hasError("parent_fullname")}
                  helperText={getError("parent_fullname")}
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
                  error={hasError("parent_email")}
                  helperText={getError("parent_email")}
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
                    MenuProps={{
                      PaperProps: {
                        sx: { bgcolor: "background.default" },
                      },
                    }}
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
                componentsProps={{
                  typography: {
                    sx: { fontSize: { xs: 10, md: 14 } },
                  },
                }}
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
          sx={{ mb: 3, fontSize: { xs: 10, md: 14, textTransform: "none" } }}
        >
          Ajouter un enfant à la fratrie
        </Button>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={submitting}
          sx={{ fontSize: { xs: 10, md: 14 }, textTransform: "none" }}
        >
          {submitting
            ? "Enregistrement..."
            : "Finaliser l'inscription/re-inscription"}
        </Button>
      </form>
    </Paper>
  );
};

export default StudentForm;
