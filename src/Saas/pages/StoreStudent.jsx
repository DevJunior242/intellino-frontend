import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { motion } from "framer-motion";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
// États initiaux basés sur la structure du contrôleur Laravel
const initialStudentState = {
  fullname: "",
  birthdate: "",
  sex: "",
  photo: null,
};

const initialParentState = {
  user_id: "",
  profession: "",
  domicile: "",
  relation: "",
};

function StoreStudent() {
  const [step, setStep] = useState(1);  
  const [studentData, setStudentData] = useState(initialStudentState);
  const [parentData, setParentData] = useState(initialParentState);
  const [studentParent, setStudentParent] = useState([]);
  const [selectParent, setSelectParent] = useState(null);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //retourner les parents existants
  const getParents = async () => {
    setIsLoading(true);
    try {
      const response = await Instance("/api/parents-users");
      console.log(response);
      setStudentParent(response.data.parentUsers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getParents();
  }, []);
  //parent selectionné
  useEffect(() => {
    if (selectParent) {
      setParentData((prev) => ({ ...prev, user_id: selectParent.id }));
    }
  }, [selectParent]);
  // Gère les changements pour les données de l'élève
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
    // Nettoyer l'erreur spécifique
    if (error[`student.${name}`]) {
      setError((prev) => {
        const { [`student.${name}`]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Gère le changement pour la photo
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setStudentData({ ...studentData, photo: file });
    if (error["student.photo"]) {
      setError((prev) => {
        const { ["student.photo"]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Gère les changements pour les données du parent
  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setParentData({ ...parentData, [name]: value });
    // Nettoyer l'erreur spécifique
    if (error[`parent.${name}`]) {
      setError((prev) => {
        const { [`parent.${name}`]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  // Validation simple côté client avant de passer à l'étape suivante
  const validateStep1 = () => {
    let isValid = true;
    const currentErrors = {};

    if (!studentData.fullname) {
      currentErrors["student.fullname"] =
        "Le nom complet de l'élève est requis.";
      isValid = false;
    }
    if (!studentData.birthdate) {
      currentErrors["student.birthdate"] = "La date de naissance est requise.";
      isValid = false;
    }
    if (!studentData.sex) {
      currentErrors["student.sex"] = "Le sexe est requis.";
      isValid = false;
    }

    // Si la validation de l'étape 1 échoue
    if (!isValid) {
      // Mettre les erreurs localement
      setError(currentErrors);
    } else {
      setError({});
    }

    return isValid;
  };

  // Passage à l'étape suivante
  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  // Soumission finale (Une seule requête à l'API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError({});
    setSuccess("");

    // 1. Préparation des données FormData
    const formData = new FormData();

    // Ajout des données de l'élève (clés imbriquées 'student[key]')
    for (const key in studentData) {
      if (studentData[key] !== null) {
        formData.append(`student[${key}]`, studentData[key]);
      }
    }

    // Ajout des données du parent (clés imbriquées 'parent[key]')
    for (const key in parentData) {
      if (parentData[key] !== null && parentData[key] !== "") {
        formData.append(`parent[${key}]`, parentData[key]);
      }
    }

     const url = "/api/parent-eleven/store";

    try {
      const response = await Instance.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        // Réinitialisation après succès
        setStudentData(initialStudentState);
        setParentData(initialParentState);
        setStep(1); // Retour à la première étape
        setTimeout(() => setSuccess(""), 5000);
        //vider les données du parent
        setSelectParent(null);
      }
    } catch (err) {
      // Utilisation de votre fonction ErrorGlobal pour traiter l'erreur
      // Le callback est utilisé pour désactiver le chargement après le traitement de l'erreur
      ErrorGlobal({
        error: err,
        setError,
        callback: () => setIsLoading(false),
      });

      // Logique spécifique : Changer d'étape en cas d'erreur de validation (422)
      if (
        err.response &&
        err.response.status === 422 &&
        err.response.data.errors
      ) {
        const errors = err.response.data.errors;

        // Vérifie si une clé d'erreur commence par 'student.'
        if (Object.keys(errors).some((key) => key.startsWith("student."))) {
          setStep(1);
          // Sinon, si c'est une erreur 'parent.' ou autre
        } else if (
          Object.keys(errors).some((key) => key.startsWith("parent."))
        ) {
          setStep(2);
        }
      }
    } finally {
      setIsLoading(false);  
    }
  };
  const hasError = (field) => error?.[field]?.join(", ");
   const getErrorText = (fieldKey) => {
  
    const errorArray = error[fieldKey];
    return Array.isArray(errorArray) ? errorArray.join(", ") : errorArray;
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseLoader />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", mb: 2, fontSize: { xs: 8, md: 14 } }}
        >
          Ajouter un élève et son parent
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        {/* Indication des étapes */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <Typography
            variant="h6"
            color={step === 1 ? "primary" : "textSecondary"}
            sx={{ mr: 2, fontWeight: "bold" }}
          >
            Étape 1: Élève
          </Typography>
          <Typography
            variant="h6"
            color={step === 2 ? "primary" : "textSecondary"}
            sx={{ fontWeight: "bold" }}
          >
            Étape 2: Parent
          </Typography>
        </Box>

        {/* -------------------- ÉTAPE 1: ÉLÈVE -------------------- */}
        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Détails de l'Élève
            </Typography>
            {/* Nom complet (Clé: student.fullname) */}
            <TextField
              error={!!hasError("student.fullname")}
              name="fullname"
              label="Nom complet de l'élève"
              variant="outlined"
              fullWidth
              margin="normal"
              value={studentData.fullname}
              onChange={handleStudentChange}
              required
              helperText={getErrorText("student.fullname")}
            />

            {/* Date de naissance (Clé: student.birthdate) */}
            <TextField
              error={!!getErrorText("student.birthdate")}
              type="date"
              name="birthdate"
              label="Date de naissance"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              fullWidth
              margin="normal"
              value={studentData.birthdate}
              onChange={handleStudentChange}
              required
              helperText={getErrorText("student.birthdate")}
            />

            {/* Sexe (Clé: student.sex) */}
            <FormControl
              fullWidth
              margin="normal"
              required
              error={!!getErrorText("student.sex")}
            >
              <InputLabel id="sex-label">Sexe</InputLabel>
              <Select
                labelId="sex-label"
                name="sex"
                label="Sexe"
                value={studentData.sex}
                onChange={handleStudentChange}
              >
                <MenuItem value="" disabled>Sélectionner</MenuItem>
                <MenuItem value="M">Masculin</MenuItem>
                <MenuItem value="F">Féminin</MenuItem>
              </Select>
              {getErrorText("student.sex") && (
                <FormHelperText>{getErrorText("student.sex")}</FormHelperText>
              )}
            </FormControl>

            {/* Photo (Clé: student.photo) */}
            <Typography sx={{ mt: 2, mb: 1 }} variant="body1">
              Photo de l'élève (Optionnel)
            </Typography>
            <TextField
              error={!!getErrorText("student.photo")}
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/jpg"
              variant="outlined"
              fullWidth
              onChange={handlePhotoChange}
              helperText={getErrorText("student.photo")}
            />

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Étape Suivante (Détails du Parent)
            </Button>
          </motion.form>
        )}

        {/* -------------------- ÉTAPE 2: PARENT -------------------- */}
        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
          >
            <Typography variant="h5"  sx={{ mb: 2 }}>
              Détails du Parent
            </Typography>

            <Autocomplete
              disablePortal
              options={studentParent}
              getOptionLabel={(studentParent) =>
                `${studentParent.fullname || ""} - ${studentParent.phone || ""}`
              }
              value={selectParent}
              onChange={(e, newValue) => setSelectParent(newValue)}
              renderInput={(params) => (
                <TextField
                  error={!!getErrorText("parent.user_id")}
                  {...params}
                  fullWidth
                  margin="normal"
                  label="il vous faut choisir un parent"
                  required
                  helperText={getErrorText("parent.user_id")}
                />
              )}
            />

            <TextField
              error={!!getErrorText("parent.profession")}
              name="profession"
              label="Profession du parent"
              variant="outlined"
              fullWidth
              margin="normal"
              value={parentData.profession}
              onChange={handleParentChange}
              helperText={getErrorText("parent.profession")}
            />

            <TextField
              error={!!getErrorText("parent.domicile")}
              name="domicile"
              label="Domicile du parent"
              variant="outlined"
              fullWidth
              margin="normal"
              value={parentData.domicile}
              onChange={handleParentChange}
              helperText={getErrorText("parent.domicile")}
            />

            {/* Relation (Clé: parent.relation) */}
            <TextField
              error={!!getErrorText("parent.relation")}
              name="relation"
              label="Relation (Père, Mère, Tuteur...)"
              variant="outlined"
              fullWidth
              margin="normal"
              value={parentData.relation}
              onChange={handleParentChange}
              helperText={getErrorText("parent.relation")}
            />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                Précédent (Élève)
              </Button>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? (
                  <PulseLoader size={8} color="#fff" />
                ) : (
                  "Enregistrer Élève et Parent"
                )}
              </Button>
            </Box>
          </motion.form>
        )}
      </Box>
    </Container>
  );
}

export default StoreStudent;
