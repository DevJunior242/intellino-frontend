import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Stack,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../../../Api/Axios";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";
import ConfigSkeleton from "../../ConfigSkeleton";
import ErrorBlock from "../../ErrorBlock";

const MIN_MEMBRES = 3;
const MAX_MEMBRES = 4;

// Inscription d'une équipe de Kata (Art. 3.5 WKF) : 3 à 4 athlètes, le 4e
// pouvant être déclaré réserve. Réutilise le même endpoint d'éligibilité que
// InscriptionForm (studentsDisponibles) — un élève déjà inscrit (seul ou en
// équipe) sur cette épreuve n'y apparaît plus.
function KataTeamInscriptionForm({ competitionId, onSuccess }) {
  const [error, setError] = useState({});
  const [errorData, setErrorData] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [nom, setNom] = useState("");
  const [selected, setSelected] = useState([]); // [{student_id, est_reserve}]

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const isSelected = (studentId) =>
    selected.some((m) => m.student_id === studentId);

  const toggleStudent = (student) => {
    setSelected((prev) => {
      if (prev.some((m) => m.student_id === student.id)) {
        return prev.filter((m) => m.student_id !== student.id);
      }
      if (prev.length >= MAX_MEMBRES) return prev;
      return [...prev, { student_id: student.id, est_reserve: false }];
    });
  };

  const toggleReserve = (studentId) => {
    setSelected((prev) =>
      prev.map((m) =>
        m.student_id === studentId
          ? { ...m, est_reserve: !m.est_reserve }
          : m,
      ),
    );
  };

  const filteredStudents = (Array.isArray(students) ? students : []).filter(
    (s) => (s.fullname || "").toLowerCase().includes(search.toLowerCase()),
  );

  const getInitialData = useCallback(async () => {
    if (!competitionId) return;
    setLoading(true);
    setErrorData("");
    try {
      const res = await Instance.get(
        `/api/inscriptions/epreuve/${competitionId}/disponibles`,
      );
      setStudents(res.data.students || []);
    } catch (err) {
      setErrorData("Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    getInitialData();
  }, [getInitialData]);

  const canSubmit =
    nom.trim().length > 0 &&
    selected.length >= MIN_MEMBRES &&
    selected.length <= MAX_MEMBRES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    if (!competitionId || !canSubmit) return;

    setSubmitting(true);
    try {
      const response = await Instance.post("/api/kata-teams", {
        competition_id: competitionId,
        nom: nom.trim(),
        membres: selected,
      });
      onSuccess?.();
      if (response.data.success) {
        setSuccess(response.data.message);
        setSelected([]);
        setNom("");
        setSearch("");
        setError({});
        getInitialData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError({ general: response.data.message });
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <ConfigSkeleton />;
  }
  if (errorData) {
    return <ErrorBlock message={errorData} onRetry={getInitialData} />;
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
          sx={{ fontWeight: "bold", fontSize: { xs: "1.4rem", md: "2rem" } }}
        >
          Inscription d'une équipe de Kata
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          3 à 4 athlètes (Art. 3.5 WKF) — le 4e peut être déclaré réserve
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Nom de l'équipe"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            error={hasError("nom")}
            helperText={getError("nom")}
          />

          <TextField
            fullWidth
            margin="normal"
            label="Rechercher un athlète"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {hasError("membres") && (
            <FormHelperText error>{getError("membres")}</FormHelperText>
          )}
          {hasError("competition_id") && (
            <FormHelperText error>
              {getError("competition_id")}
            </FormHelperText>
          )}

          <Box
            sx={{
              maxHeight: 340,
              overflowY: "auto",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              mt: 1,
            }}
          >
            <List dense disablePadding>
              {filteredStudents.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Aucun athlète disponible pour cette épreuve" />
                </ListItem>
              ) : (
                filteredStudents.map((student) => {
                  const checked = isSelected(student.id);
                  const membre = selected.find(
                    (m) => m.student_id === student.id,
                  );
                  return (
                    <ListItem
                      key={student.id}
                      sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 1,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        "&:last-of-type": { borderBottom: "none" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Checkbox
                          edge="start"
                          checked={checked}
                          disabled={!checked && selected.length >= MAX_MEMBRES}
                          onChange={() => toggleStudent(student)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={student.fullname}
                        secondary={student.birthdate}
                        sx={{ flex: 1 }}
                      />
                      {checked && (
                        <Chip
                          label={
                            membre?.est_reserve ? "Réserve" : "Titulaire"
                          }
                          size="small"
                          color={membre?.est_reserve ? "default" : "primary"}
                          onClick={() => toggleReserve(student.id)}
                          sx={{ cursor: "pointer" }}
                        />
                      )}
                    </ListItem>
                  );
                })
              )}
            </List>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 1 }}>
            <Chip
              label={`${selected.length}/${MAX_MEMBRES} athlète${selected.length > 1 ? "s" : ""} sélectionné${selected.length > 1 ? "s" : ""}`}
              color={
                selected.length >= MIN_MEMBRES ? "primary" : "default"
              }
              size="small"
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!canSubmit || submitting}
            sx={{
              mt: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            {submitting
              ? "Enregistrement en cours..."
              : selected.length < MIN_MEMBRES
                ? `Sélectionnez au moins ${MIN_MEMBRES} athlètes`
                : `Inscrire l'équipe (${selected.length} athlètes)`}
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default KataTeamInscriptionForm;
