import React, { act, useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  Stack,
  Select,
  FormControl,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { motion } from "motion/react";
import { UseAuth } from "../../../../Api/AuthContext";
import { Instance } from "../../../../Api/Axios";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "../../ConfigSkeleton";

function InscriptionForm({ competitionId, discipline, onSuccess }) {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectStudent, setSelectStudent] = useState(null);
  const { activeId, activeType } = UseAuth();
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    athlete_id: "",
    competition_id: "",
    kata: "",
    poids_declare: "",
    poids_officiel: "",
  });

  useEffect(() => {
    if (selectStudent) {
      setFormData((prev) => ({ ...prev, athlete_id: selectStudent.id }));
    }
  }, [selectStudent]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const getInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Instance.get(`/api/students?club_id=${activeId}`);
      console.log(res);
      setStudents(res.data.students || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    getInitialData();
  }, [activeId, getInitialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    if (!competitionId) return;
    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
        organisateur_id: activeId,
        organisateur_type: activeType,
        competition_id: competitionId,
      };
      const response = await Instance.post(
        "/api/inscriptions/inscriptions",
        dataSend,
      );
      onSuccess();
      console.log(response);
      if (response.data.success) {
        setSuccess(response.data.message);
        setSelectStudent(null);

        setFormData({
          statut_pesee: 0,
          poids_declare: "",
          poids_officiel: "",
        });
        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ConfigSkeleton />;
  }
  return (
    <Container maxWidth="md">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{ mt: 8, p: 4 }}
      >
        <Typography
          variant="h4"
          component="h1"
          textAlign="center"
          sx={{ fontWeight: "bold", fontSize: { xs: "1.4rem", md: "2rem" } }} // ✅ unités rem
        >
          Inscription à l'épreuve de {discipline}
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Autocomplete
            slotProps={{
              paper: {
                sx: { backgroundColor: "background.default" },
              },
            }}
            disablePortal
            options={Array.isArray(students) ? students : []}
            getOptionLabel={(student) =>
              `${student.fullname || ""} - ${student.birthdate || ""}`
            }
            value={selectStudent}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(e, newValue) => setSelectStudent(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                error={!!error.student_id}
                fullWidth
                margin="normal"
                label="Choisir un athlète à compétir"
                required
              />
            )}
          />
          {hasError("student_id") && (
            <FormHelperText error>{getError("student_id")}</FormHelperText>
          )}

          {/* Kumite — champ poids */}
          {discipline === "Kumite" && (
            <TextField
              error={!!error.poids_declare}
              helperText={getError("poids_declare")}
              label="Veuillez saisir le poids de votre athlète (kg)"
              name="poids_declare"
              value={formData.poids_declare}
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
          )}

          {/* Kata — sélection du kata */}
          {discipline === "Kata" && (
            <TextField
              error={!!error.kata}
              helperText={getError("kata")}
              label="Veuillez saisir le kata exécuté"
              name="kata"
              value={formData.kata}
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            {submitting ? "Enregistrement en cours..." : "S'inscrire"}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default InscriptionForm;
