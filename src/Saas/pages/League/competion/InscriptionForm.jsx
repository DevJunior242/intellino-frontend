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

function InscriptionForm({ competitionId, discipline, onSuccess }) {
  console.log(competitionId);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [katas, setKatas] = useState([]);
  const [selectStudent, setSelectStudent] = useState(null);
  const { activeClubId } = UseAuth();
  console.log("activeClubId", activeClubId);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [formData, setFormData] = useState({
    athlete_id: "",
    competition_id: "",

    statut_pesee: 0,
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
  //promise all
  const getInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [resKata, resStudent] = await Promise.all([
        Instance.get(`/api/katas/katas`),
        Instance.get(`/api/students?club_id=${activeClubId}`),
      ]);
      console.log(resKata, resStudent);
      setKatas(resKata.data);
      setStudents(resStudent.data.students);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeClubId]);

  useEffect(() => {
    if (!activeClubId) return;
    getInitialData();
  }, [activeClubId, getInitialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    if (!competitionId) return;
    try {
      const dataSend = {
        ...formData,
        club_id: activeClubId,
        competition_id: competitionId,
      };
      console.log(dataSend);
      const response = await Instance.post(
        "/api/inscriptions/inscriptions",
        dataSend,
      );
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
    }
  };

  if (loading) {
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

          p: 4,
        }}
      >
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
        >
          Inscription à l'épreuve de {discipline}
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <Autocomplete
            disablePortal
            options={Array.isArray(students) ? students : []}
            getOptionLabel={(student) =>
              `${student.fullname || ""}-${student.birthdate || ""}`
            }
            value={selectStudent}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            onChange={(e, newValue) => setSelectStudent(newValue)}
            renderInput={(params) => (
              <TextField
                error={!!error.student_id}
                {...params}
                fullWidth
                margin="normal"
                label="il vous faut choisir un eleve"
                required
              />
            )}
          />
          {hasError("student_id") && (
            <FormHelperText error>{getError("student_id")}</FormHelperText>
          )}
          {/* kumite */}
          {/* affiche le poid pour kumite */}
          {discipline === "Kumite" && (
            <TextField
              error={!!error.poids_declare}
              helperText={getError("poids_declare")}
              label="Poids déclaré (en kg)"
              name="poids_declare"
              value={formData.poids_declare}
              variant="outlined"
              fullWidth
              margin="normal"
              onChange={handleChange}
            />
          )}
          {/* discipline === "Kata"  */}
          {discipline === "Kata" && (
            <FormControl fullWidth>
              <InputLabel>Kata exécuté</InputLabel>
              <Select
                value={formData.kata_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kata_id: e.target.value,
                  })
                }
              >
                {katas.map((kata) => (
                  <MenuItem key={kata.id} value={kata.id}>
                    <Stack>
                      <Typography variant="body2">{kata.nom}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {kata.nom}-({kata.niveau})
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
          >
            ajouter
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default InscriptionForm;
