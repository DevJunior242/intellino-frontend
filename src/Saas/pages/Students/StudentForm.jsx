import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HealthAndSafetyOutlinedIcon from "@mui/icons-material/HealthAndSafetyOutlined";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";

const EMPTY_HEALTH = {
  groupe_sanguin: "",
  allergies: "",
  conditions_medicales: "",
  medecin_nom: "",
  medecin_telephone: "",
  contact_urgence_nom: "",
  contact_urgence_telephone: "",
  contact_urgence_relation: "",
  certificat_medical_fourni: false,
  certificat_medical_expire_le: "",
  notes: "",
};

const StudentForm = ({ onSuccess } = {}) => {
  const { activeId, activeType } = UseAuth();
  const estClub = activeType === "Club";
  const [submitting, setSubmitting] = useState(false);
  const [isOwnResponsible, setIsOwnResponsible] = useState(false);
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  // error[field] est stocké comme une chaîne (voir le catch de handleSubmit,
  // qui prend déjà backErrors[key][0]) — .join() plantait toute la page dès
  // qu'une erreur de validation arrivait, puisqu'une chaîne n'a pas .join().
  const getError = (field) => {
    const val = error?.[field];
    if (!val) return undefined;
    return Array.isArray(val) ? val.join(", ") : val;
  };
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
      health: { ...EMPTY_HEALTH },
    },
  ]);

  const handleStudentChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };
  const handleHealthChange = (index, field, value) => {
    const newStudents = [...students];
    newStudents[index].health = { ...newStudents[index].health, [field]: value };
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

      // Fiche santé (optionnelle) — n'envoie l'objet health que si l'admin a
      // vraiment renseigné quelque chose, sinon le backend créerait une
      // fiche vide pour chaque élève (le simple flag booléen à false, seul
      // champ toujours présent en state, ne compte pas comme "renseigné").
      const healthEntries = student.health ? Object.entries(student.health) : [];
      const healthHasData = healthEntries.some(([key, value]) =>
        key === "certificat_medical_fourni"
          ? value === true
          : value !== "" && value !== null && value !== undefined,
      );
      if (healthHasData) {
        healthEntries.forEach(([key, value]) => {
          if (key === "certificat_medical_fourni") {
            formData.append(`students[${index}][health][${key}]`, value ? 1 : 0);
          } else if (value !== "" && value !== null && value !== undefined) {
            formData.append(`students[${index}][health][${key}]`, value);
          }
        });
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
            health: { ...EMPTY_HEALTH },
          },
        ]);
      }
    } catch (err) {
      const backErrors = err.response?.data?.errors;

      // Une 422 n'a pas toujours d'objet "errors" détaillé par champ (ex:
      // conflit de numéro de téléphone détecté manuellement côté
      // contrôleur, pas par le FormRequest) — dans ce cas Object.keys()
      // plantait sur undefined et masquait le vrai message d'erreur
      // derrière un message générique.
      if (err.response && err.response.status === 422 && backErrors) {
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
      } else if (err.response?.data?.message) {
        setError({ general: err.response.data.message });
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
                  type="email"
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
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const newStudents = [...students];
                      newStudents[index] = {
                        ...newStudents[index],
                        createAccount: checked,
                        // Le champ email/téléphone disparaît quand on
                        // décoche (sauf si isOwnResponsible le garde
                        // affiché) — on vide sa valeur dans ce cas, sinon un
                        // email mal formé tapé avant de décocher reste dans
                        // l'état et part quand même au serveur (champ
                        // devenu invisible, impossible à corriger).
                        ...(!checked && !isOwnResponsible
                          ? { email: "", phone: "" }
                          : {}),
                      };
                      setStudents(newStudents);
                    }}
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
                    type="email"
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

              {/* Fiche santé (optionnelle, informative — rien n'est bloqué) */}
              <Accordion
                sx={{ mt: 2, backgroundColor: "background.paper" }}
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <HealthAndSafetyOutlinedIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Fiche santé (optionnel)
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label="Groupe sanguin"
                      placeholder="Ex: O+"
                      fullWidth
                      value={student.health?.groupe_sanguin || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "groupe_sanguin", e.target.value)
                      }
                    />
                  </Box>

                  <TextField
                    label="Allergies"
                    placeholder="Ex: arachides, pollen..."
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 2 }}
                    value={student.health?.allergies || ""}
                    onChange={(e) =>
                      handleHealthChange(index, "allergies", e.target.value)
                    }
                  />

                  <TextField
                    label="Conditions médicales particulières"
                    placeholder="Ex: asthme, cardiaque, épilepsie, handicap..."
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mb: 2 }}
                    value={student.health?.conditions_medicales || ""}
                    onChange={(e) =>
                      handleHealthChange(index, "conditions_medicales", e.target.value)
                    }
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Médecin traitant
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label="Nom"
                      fullWidth
                      value={student.health?.medecin_nom || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "medecin_nom", e.target.value)
                      }
                    />
                    <TextField
                      label="Téléphone"
                      fullWidth
                      value={student.health?.medecin_telephone || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "medecin_telephone", e.target.value)
                      }
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Contact d'urgence (si différent du parent inscrit)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <TextField
                      label="Nom"
                      fullWidth
                      value={student.health?.contact_urgence_nom || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "contact_urgence_nom", e.target.value)
                      }
                    />
                    <TextField
                      label="Téléphone"
                      fullWidth
                      value={student.health?.contact_urgence_telephone || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "contact_urgence_telephone", e.target.value)
                      }
                    />
                    <TextField
                      label="Lien"
                      placeholder="Ex: Tante"
                      fullWidth
                      value={student.health?.contact_urgence_relation || ""}
                      onChange={(e) =>
                        handleHealthChange(index, "contact_urgence_relation", e.target.value)
                      }
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!student.health?.certificat_medical_fourni}
                          onChange={(e) =>
                            handleHealthChange(
                              index,
                              "certificat_medical_fourni",
                              e.target.checked,
                            )
                          }
                        />
                      }
                      label="Certificat médical fourni"
                    />
                    <TextField
                      label="Date d'expiration"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={student.health?.certificat_medical_expire_le || ""}
                      onChange={(e) =>
                        handleHealthChange(
                          index,
                          "certificat_medical_expire_le",
                          e.target.value,
                        )
                      }
                    />
                  </Box>

                  <TextField
                    label="Notes libres pour l'instructeur"
                    fullWidth
                    multiline
                    minRows={2}
                    value={student.health?.notes || ""}
                    onChange={(e) =>
                      handleHealthChange(index, "notes", e.target.value)
                    }
                  />
                </AccordionDetails>
              </Accordion>
            </Card>
          );
        })}

        <Button
          variant="outlined"
          onClick={() =>
            setStudents([
              ...students,
              { fullname: "", createAccount: false, health: { ...EMPTY_HEALTH } },
            ])
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
