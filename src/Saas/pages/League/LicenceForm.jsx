import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  MenuItem,
  Paper,
  Grid,
  Divider,
  InputAdornment,
  Stack,
  FormHelperText,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import PulseLoader from "react-spinners/PulseLoader";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";
import ConfigSkeleton from "../ConfigSkeleton";
import ErrorBlock from "../ErrorBlock";
import { UseAuth } from "../../../Api/AuthContext";

function LicenceForm() {
  const [data, setData] = useState([]);
  const [selectStudent, setSelectStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState({});
  const [errorStudent, setErrorStudent] = useState("");
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const searchParams = new URLSearchParams(window.location.search);
  const clubId = searchParams.get("club");
  const { activeId } = UseAuth();

  const getStudents = useCallback(async () => {
    setLoading(true);
    setErrorStudent("");
    try {
      const response = await Instance(`/api/league/students?club_id=${clubId}`);
      setData(response.data || []);
    } catch {
      setErrorStudent(
        "une erreur est survenue lors de la récupération des élèves",
      );
    } finally {
      setLoading(false);
    }
  }, [clubId]);
  useEffect(() => {
    if (!clubId) return;
    getStudents();
  }, [getStudents, clubId]);

  const [formData, setFormData] = useState({
    student_id: "",
    type: "",
    montant: "",
    date_emission: "",
    date_expiration: "",
  });
  //select student
  useEffect(() => {
    if (selectStudent) {
      setFormData((prev) => ({ ...prev, student_id: selectStudent.id }));
    }
  }, [selectStudent]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (clubId) {
      setFormData((prev) => ({ ...prev, club_id: clubId }));
    }
  }, [clubId]);
  const handleSubmit = async (e) => {
    if (!clubId) return;
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const dataSend = {
        ...formData,
        club_id: clubId,
        league_id: activeId,
       };
      const response = await Instance.post("/api/licences/licences", dataSend);
      if (response.data.success) {
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          club_id: "",
          student_id: "",
          saison: "",
          type: "",
          montant: "",
          date_emission: "",
          date_expiration: "",
        });
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

  if (loading) return <ConfigSkeleton />;

  if (errorStudent)
    return (
      <ErrorBlock
        message="Impossible de charger les membres"
        onRetry={getStudents}
      />
    );

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "#22262f",
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: "#e8c84a", fontWeight: 700, mb: 1 }}
          >
            Nouvelle Licence
          </Typography>
          <Typography variant="body2" sx={{ color: "#8b90a0", mb: 4 }}>
            Remplissez les informations pour générer la licence officielle.
          </Typography>
          {success && <Message text={success} type="success" />}
          {error?.general && <Message text={error.general} type="error" />}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* 1. Sélection de l'élève (Filtré par Club) */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Sélectionner l'athlète"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  helperText="Seuls les élèves du club sélectionné sont affichés"
                >
                  {data.map((data) => (
                    <MenuItem key={data.id} value={data?.student?.id}>
                      {data?.student?.fullname} —
                      {data?.current_grade?.name || "Grade à récupérer"}
                    </MenuItem>
                  ))}
                </TextField>
                {hasError("student_id") && (
                  <FormHelperText error>
                    {getError("student_id")}
                  </FormHelperText>
                )}
              </Grid>

              {/* 2. Type et Saison */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Type de licence"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="competiteur">Compétiteur</MenuItem>
                  <MenuItem value="loisir">Loisir</MenuItem>
                  <MenuItem value="dirigeant">Dirigeant</MenuItem>
                  <MenuItem value="arbitre">Arbitre</MenuItem>
                </TextField>
                {hasError("type") && (
                  <FormHelperText error>{getError("type")}</FormHelperText>
                )}
              </Grid>

              {/* <Grid item xs={12} sm={6}>
                <TextField
                  error={hasError("saison")}
                  helperText={getError("saison")}
                  fullWidth
                  label="Saison"
                  name="saison"
                  placeholder="Ex: 2025-2026"
                  value={formData.saison}
                  onChange={handleChange}
                />
                {hasError("saison") && (
                  <FormHelperText error>{getError("saison")}</FormHelperText>
                )}
              </Grid> */}

              <Grid item xs={12}>
                <Divider
                  sx={{ my: 1, borderColor: "rgba(255,255,255,0.05)" }}
                />
              </Grid>

              {/* 3. Dates (Émission et Expiration) */}
              <Grid item xs={12} sm={6}>
                <TextField
                  error={hasError("date_emission")}
                  helperText={getError("date_emission")}
                  fullWidth
                  type="date"
                  label="Date d'émission"
                  name="date_emission"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_emission}
                  onChange={handleChange}
                />
                {hasError("date_emission") && (
                  <FormHelperText error>
                    {getError("date_emission")}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  error={hasError("date_expiration")}
                  helperText={getError("date_expiration")}
                  fullWidth
                  type="date"
                  label="Date d'expiration"
                  name="date_expiration"
                  InputLabelProps={{ shrink: true }}
                  value={formData.date_expiration}
                  onChange={handleChange}
                />
                {hasError("date_expiration") && (
                  <FormHelperText error>
                    {getError("date_expiration")}
                  </FormHelperText>
                )}
              </Grid>

              {/* 4. Montant */}
              <Grid item xs={12}>
                <TextField
                  error={hasError("montant")}
                  helperText={getError("montant")}
                  fullWidth
                  label="Montant de la licence"
                  name="montant"
                  type="number"
                  value={formData.montant}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">FCFA</InputAdornment>
                    ),
                  }}
                />
                {hasError("montant") && (
                  <FormHelperText error>{getError("montant")}</FormHelperText>
                )}
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    sx={{
                      color: "#8b90a0",
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                    sx={{
                      bgcolor: "#e8c84a",
                      color: "#1a1d23",
                      fontWeight: 700,
                      px: 4,
                      "&:hover": { bgcolor: "#d4b63b" },
                    }}
                  >
                    {submitting ? "Génération..." : "Valider la licence"}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default LicenceForm;
