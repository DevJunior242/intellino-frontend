import React, { act, useCallback, useEffect, useState } from "react";
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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { motion } from "motion/react";
import { Instance } from "../../../../Api/Axios";
import ErrorGlobal from "../../../../component/ErrorGlobal";
import Message from "../../Message";
import PulseLoader from "react-spinners/PulseLoader";
import ConfigSkeleton from "../../ConfigSkeleton";
import ErrorBlock from "../../ErrorBlock";
import StudentForm from "../../Students/StudentForm";

function InscriptionForm({ competitionId, subdiscipline, onSuccess }) {
  const [error, setError] = useState({});
  const [errorData, setErrorData] = useState("");

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [students, setStudents] = useState([]);
  const [category, setCategory] = useState(null);
  const [katas, setKatas] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({});
  const [expanded, setExpanded] = useState(false);
  const [nouvelAthleteOpen, setNouvelAthleteOpen] = useState(false);
  const VISIBLE_COUNT = 8;
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const toggleStudent = (student) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[student.id]) {
        delete next[student.id];
      } else {
        next[student.id] = { poids_declare: "", kata_id: null };
      }
      return next;
    });
  };

  const updateChampAthlete = (studentId, field, value) => {
    setSelected((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const selectedCount = Object.keys(selected).length;

  const poidsLabel =
    category?.poids_min && category?.poids_max
      ? `${Number(category.poids_min)}-${Number(category.poids_max)}kg`
      : category?.poids_max
        ? `-${Number(category.poids_max)}kg`
        : category?.poids_min
          ? `+${Number(category.poids_min)}kg`
          : null;

  const isPoidsHorsBornes = (poids) => {
    const val = Number(poids);
    if (!val || !category) return false;
    if (category.poids_min && val < category.poids_min) return true;
    if (category.poids_max && val > category.poids_max) return true;
    return false;
  };

  const hasPoidsHorsBornes = Object.values(selected).some((champs) =>
    isPoidsHorsBornes(champs.poids_declare),
  );

  const filteredStudents = (Array.isArray(students) ? students : []).filter(
    (s) => (s.fullname || "").toLowerCase().includes(search.toLowerCase()),
  );

  const visibleStudents = expanded
    ? filteredStudents
    : filteredStudents.slice(0, VISIBLE_COUNT);
  const remaining = filteredStudents.length - visibleStudents.length;

  // Élèves du club éligibles à CETTE épreuve : bonne catégorie (âge/sexe)
  // et pas déjà inscrits, filtrés côté backend.
  const getInitialData = useCallback(async () => {
    if (!competitionId) return;
    setLoading(true);
    setErrorData("");
    try {
      const res = await Instance.get(
        `/api/inscriptions/epreuve/${competitionId}/disponibles`,
      );
      setStudents(res.data.students || []);
      setCategory(res.data.category || null);
    } catch (error) {
      setErrorData("erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [competitionId]);

  useEffect(() => {
    getInitialData();
  }, [getInitialData]);

  // Catalogue officiel WKF des katas actifs (Art. 5.1) — utilisé pour le
  // menu déroulant plutôt qu'un champ texte libre.
  useEffect(() => {
    if (subdiscipline !== "Kata") return;
    Instance.get("/api/katas/katas")
      .then((res) => setKatas(res.data || []))
      .catch(() => setKatas([]));
  }, [subdiscipline]);

  useEffect(() => {
    setExpanded(false);
  }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    if (!competitionId || selectedCount === 0) return;
    if (hasPoidsHorsBornes) {
      setError({
        general: `Un ou plusieurs poids déclarés sont hors de la catégorie (${poidsLabel}). Corrigez-les avant d'inscrire.`,
      });
      return;
    }
    setSubmitting(true);
    try {
      const inscriptions = Object.entries(selected).map(
        ([athlete_id, champs]) => ({
          athlete_id,
          poids_declare: champs.poids_declare || null,
          kata_id: champs.kata_id || null,
        }),
      );

      const response = await Instance.post("/api/inscriptions/inscriptions", {
        competition_id: competitionId,
        inscriptions,
      });
      onSuccess();
      if (response.data.success) {
        setSuccess(response.data.message);
        setSelected({});
        setSearch("");
        setError({});
        getInitialData();
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
          Inscription à l'épreuve de {subdiscipline}
          {poidsLabel && ` (${poidsLabel})`}
        </Typography>

        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Stack direction="row" gap={1} alignItems="flex-start">
            <TextField
              fullWidth
              margin="normal"
              label="Rechercher un athlète"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button
              variant="outlined"
              startIcon={<PersonAddAlt1Icon />}
              onClick={() => setNouvelAthleteOpen(true)}
              sx={{ mt: 2, whiteSpace: "nowrap", textTransform: "none" }}
            >
              Nouvel athlète
            </Button>
          </Stack>
          {hasError("student_id") && (
            <FormHelperText error>{getError("student_id")}</FormHelperText>
          )}
          {hasError("inscriptions") && (
            <FormHelperText error>{getError("inscriptions")}</FormHelperText>
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
                visibleStudents.map((student) => {
                  const isChecked = !!selected[student.id];
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
                          checked={isChecked}
                          onChange={() => toggleStudent(student)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={student.fullname}
                        secondary={student.birthdate}
                        sx={{ flex: 1 }}
                      />
                      {isChecked && subdiscipline === "Kumite" && (
                        <TextField
                          size="small"
                          label="Poids (kg)"
                          type="number"
                          value={selected[student.id]?.poids_declare || ""}
                          onChange={(e) =>
                            updateChampAthlete(
                              student.id,
                              "poids_declare",
                              e.target.value,
                            )
                          }
                          error={isPoidsHorsBornes(
                            selected[student.id]?.poids_declare,
                          )}
                          helperText={
                            isPoidsHorsBornes(
                              selected[student.id]?.poids_declare,
                            )
                              ? `Hors catégorie (${poidsLabel})`
                              : ""
                          }
                          sx={{ width: { xs: "100%", sm: 140 } }}
                          required
                        />
                      )}
                      {isChecked && subdiscipline === "Kata" && (
                        <Autocomplete
                          size="small"
                          options={katas}
                          getOptionLabel={(option) => option.nom || ""}
                          isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                          }
                          value={
                            katas.find(
                              (k) => k.id === selected[student.id]?.kata_id,
                            ) || null
                          }
                          onChange={(_, newValue) =>
                            updateChampAthlete(
                              student.id,
                              "kata_id",
                              newValue?.id || null,
                            )
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Kata" />
                          )}
                          sx={{ width: { xs: "100%", sm: 220 } }}
                        />
                      )}
                    </ListItem>
                  );
                })
              )}
            </List>
          </Box>

          {remaining > 0 && (
            <Button
              fullWidth
              size="small"
              onClick={() => setExpanded(true)}
              sx={{ mt: 0.5, textTransform: "none" }}
            >
              Afficher {remaining} athlète{remaining > 1 ? "s" : ""} de plus
            </Button>
          )}
          {expanded && filteredStudents.length > VISIBLE_COUNT && (
            <Button
              fullWidth
              size="small"
              onClick={() => setExpanded(false)}
              sx={{ mt: 0.5, textTransform: "none" }}
            >
              Réduire la liste
            </Button>
          )}

          <Stack direction="row" spacing={1} sx={{ mt: 1.5, mb: 1 }}>
            <Chip
              label={`${selectedCount} athlète${selectedCount > 1 ? "s" : ""} sélectionné${selectedCount > 1 ? "s" : ""}`}
              color={selectedCount > 0 ? "primary" : "default"}
              size="small"
            />
          </Stack>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={selectedCount === 0 || submitting || hasPoidsHorsBornes}
            sx={{
              mt: 2,
              textTransform: "none",
              fontSize: { xs: "0.9rem", md: "1rem" },
            }}
          >
            {submitting
              ? "Enregistrement en cours..."
              : hasPoidsHorsBornes
                ? `Poids hors catégorie (${poidsLabel})`
                : selectedCount > 0
                  ? `Inscrire ${selectedCount} athlète${selectedCount > 1 ? "s" : ""}`
                  : "Sélectionnez au moins un athlète"}
          </Button>
        </form>
      </Box>

      {/* Créer un nouvel athlète sans quitter l'écran d'inscription */}
      <Dialog
        open={nouvelAthleteOpen}
        onClose={() => setNouvelAthleteOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Nouvel athlète</DialogTitle>
        <DialogContent>
          <StudentForm
            onSuccess={() => {
              setNouvelAthleteOpen(false);
              getInitialData();
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default InscriptionForm;
