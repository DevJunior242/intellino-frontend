import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Paper,
  IconButton,
  List,
  Autocomplete,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./Message";
import { UseAuth } from "../../Api/AuthContext";
import { useNavigate } from "react-router-dom";

const initialCourseState = {
  name: "",
  current_grade_id: null,
};

const initialSessionState = {
  title: "",
  session_date: "",
  start_time: "",
  end_time: "",
  description: "",
};

function Course() {
  const { activeClubId } = UseAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [courseData, setCourseData] = useState(initialCourseState);
  const [sessionsData, setSessionsData] = useState([initialSessionState]);
  const [sessionsList, setSessionsList] = useState([]);
  const [grade, setGrade] = useState([]);
  const [selectCurrentGrade, setSelectCurrentGrade] = useState(null);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const navigate = useNavigate();

  const getSessionError = (error, index) => {
    const sessionErrors = {};
    if (!error) return sessionErrors;

    Object.keys(error).forEach((key) => {
      // Analyse de la clé "sessions.0.title"
      const parts = key.split(".");
      if (parts[0] === "sessions" && Number(parts[1]) === index) {
        const field = parts[2]; // ex: "title", "description"
        sessionErrors[field] = error[key];
      }
    });
    return sessionErrors;
  };

  const getGrade = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await Instance(`/api/grade?club_id=${activeClubId}`);
      console.log(response);
      setGrade(response.data.grades || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeClubId]);
  useEffect(() => {
    getGrade();
  }, [getGrade]);

  useEffect(() => {
    console.log(selectCurrentGrade);
    if (selectCurrentGrade) {
      setCourseData((prev) => ({
        ...prev,
        current_grade_id: selectCurrentGrade.id,
      }));
    }
  }, [selectCurrentGrade]);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseData({ ...courseData, [name]: value });
    if (error[`course.${name}`]) {
      setError((prev) => {
        const { [`course.${name}`]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  const validateStep1 = () => {
    const currentErrors = {};
    const nameRegex = /^[\p{L}\s\d-]+$/u;
    if (!courseData.name.trim()) {
      currentErrors["course.name"] = ["Le nom du cours est obligatoire."];
    } else if (!nameRegex.test(courseData.name)) {
      currentErrors["course.name"] = [
        "Le nom du cours contient des caractères invalides.",
      ];
    }

    if (!courseData.current_grade_id) {
      currentErrors["current_grade_id"] = ["Le niveau est requis."];
    }

    setError(currentErrors);
    console.log(Object.keys(currentErrors));
    return Object.keys(currentErrors).length === 0;
  };

  const goToSessions = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      return;
    }
    setError({});
    setSuccess("");
    setStep(2);
  };

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    setSessionsData({ ...sessionsData, [name]: value });
    if (error[`sessions.${name}`]) {
      setError((prev) => {
        const { [`sessions.${name}`]: _, ...rest } = prev;
        return rest;
      });
    }
  };
  const handleSessionListChange = (e, index) => {
    const { name, value } = e.target;
    const updatedList = [...sessionsList];
    updatedList[index] = { ...updatedList[index], [name]: value };
    setSessionsList(updatedList);

    // Optionnel : supprimer l'erreur existante pour ce champ
    if (error.sessions && error.sessions[index]?.[name]) {
      const updatedError = { ...error };
      delete updatedError.sessions[index][name];
      setError(updatedError);
    }
  };

  const addSessionToList = () => {
    if (
      !sessionsData.title ||
      !sessionsData.session_date ||
      !sessionsData.start_time ||
      !sessionsData.end_time
    ) {
      alert("Veuillez remplir tous les champs de la session.");
      return;
    }
    setSessionsList([...sessionsList, { ...sessionsData }]);
    setSessionsData({
      session_date: "",
      start_time: "",
      end_time: "",
      title: "",
      description: "",
    });
  };

  const removeSession = (index) => {
    setSessionsList(sessionsList.filter((_, i) => i !== index));
  };

  // --- Envoi Final ---
  const handleSubmitFinal = async (e) => {
    e.preventDefault();
    if (sessionsList.length === 0) {
      setError({ general: "Ajoutez au moins une session avant de valider." });
      return;
    }

    setError({});
    setSuccess("");

    const finalPayload = {
      course: {
        name: courseData.name,
        current_grade_id: courseData.current_grade_id || selectCurrentGrade?.id,
      },
      club_id: activeClubId,
      sessions: sessionsList,
    };
    console.log(finalPayload);

    try {
      const response = await Instance.post(
        "/api/course/full-store",
        finalPayload,
      );
      if (response.data.success) {
        setSuccess(
          "Le cours et ses sessions ont été enregistrés avec succès !",
        );
        // Reset complet
        setSelectCurrentGrade(null);
        setCourseData({ name: "" });
        setSessionsList([]);
        navigate("/dashboard/session/list");
        setTimeout(() => setSuccess(""), 5000);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
      if (
        err.response &&
        err.response.status === 422 &&
        err.response.data.errors
      ) {
        const key = Object.keys(err.response.data.errors);
        // Vérifie si une clé d'erreur commence par 'course.'
        if (key.some((key) => key.startsWith("course."))) {
          setStep(1);
          // Sinon, si c'est une erreur 'session.' ou autre
        } else if (key.some((key) => key.startsWith("sessions."))) {
          setStep(2);
        }
      }
    }
  };

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <PulseLoader color="#36d7b7" />
      </Box>
    );

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={3}
        sx={{ p: 4, mt: 4, borderRadius: 3, bgcolor: "background.default" }}
      >
        <AnimatePresence mode="wait">
          {/* ÉTAPE 1 : FORMULAIRE COURS */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
            >
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Nouveau Cours
              </Typography>
              {success && <Message text={success} type="success" />}

              <TextField
                error={hasError("course.name")}
                helperText={getError("course.name")}
                fullWidth
                label="Nom du cours"
                name="name"
                value={courseData.name}
                onChange={handleCourseChange}
                margin="normal"
                required
              />
              <label htmlFor="votre niveau de cours actuel">
                <Typography
                  variant="h6"
                  component={"h1"}
                  sx={{ fontWeight: "bold" }}
                >
                  Niveau actuel
                </Typography>
              </label>
              <Autocomplete
                disablePortal
                options={Array.isArray(grade) ? grade : []}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                getOptionLabel={(grade) => `${grade.name || ""}`}
                value={selectCurrentGrade}
                onChange={(e, newValue) => setSelectCurrentGrade(newValue)}
                renderInput={(params) => (
                  <TextField
                    error={hasError("current_grade_id")}
                    helperText={getError("current_grade_id")}
                    {...params}
                    fullWidth
                    margin="normal"
                    label="choisissez le niveau de grade actuel"
                    required
                  />
                )}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={goToSessions}
                sx={{ mt: 3, py: 1.5 }}
              >
                Suivant : Ajouter des sessions
              </Button>
            </motion.div>
          )}

          {/* ÉTAPE 2 : FORMULAIRE SESSIONS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <Typography
                variant="h5"
                gutterBottom
                align="center"
                sx={{ fontWeight: "bold" }}
              >
                Sessions pour : {courseData.name}
              </Typography>

              <Box
                sx={{
                  bgcolor: "background.default",
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <TextField
                  error={hasError("sessions.title")}
                  helperText={getError("sessions.title")}
                  id="title"
                  name="title"
                  label="Titre de la session"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={sessionsData.title}
                  onChange={handleSessionChange}
                  required
                />
                <TextField
                  error={hasError("sessions.session_date")}
                  helperText={getError("sessions.session_date")}
                  fullWidth
                  type="date"
                  name="session_date"
                  label="Date"
                  InputLabelProps={{ shrink: true }}
                  value={sessionsData.session_date}
                  onChange={handleSessionChange}
                  margin="dense"
                />
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    backgroundColor: "background.default",
                  }}
                >
                  <TextField
                    error={hasError("sessions.start_time")}
                    helperText={getError("sessions.start_time")}
                    fullWidth
                    type="time"
                    name="start_time"
                    label="Début"
                    InputLabelProps={{ shrink: true }}
                    value={sessionsData.start_time}
                    onChange={handleSessionChange}
                    margin="dense"
                  />
                  <TextField
                    error={hasError("sessions.end_time")}
                    helperText={getError("sessions.end_time")}
                    fullWidth
                    type="time"
                    name="end_time"
                    label="Fin"
                    InputLabelProps={{ shrink: true }}
                    value={sessionsData.end_time}
                    onChange={handleSessionChange}
                    margin="dense"
                  />
                </Box>
                <TextField
                  error={hasError("sessions.description")}
                  helperText={getError("sessions.description")}
                  id="description"
                  name="description"
                  label="Description"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  minRows={3}
                  value={sessionsData.description}
                  onChange={handleSessionChange}
                />

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addSessionToList}
                  sx={{ mt: 1 }}
                >
                  Ajouter cette session
                </Button>
              </Box>

              {/* Liste des sessions ajoutées */}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Sessions planifiées ({sessionsList.length})
              </Typography>
              <List>
                {sessionsList.map((s, index) => {
                  const sessionErrors = getSessionError(error, index) || {};
                  return (
                    <Box
                      key={index}
                      sx={{
                        bgcolor: "background.default",
                        p: 2,
                        borderRadius: 2,
                        mb: 3,
                      }}
                    >
                      <TextField
                        error={!!sessionErrors["title"]}
                        helperText={sessionErrors["title"]?.join(", ")}
                        id="title"
                        name="title"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={s.title}
                        onChange={(e) => handleSessionListChange(e, index)}
                        required
                      />
                      <TextField
                        error={!!sessionErrors["session_date"]}
                        helperText={sessionErrors["session_date"]?.join(", ")}
                        fullWidth
                        type="date"
                        name="session_date"
                        label="Date"
                        InputLabelProps={{ shrink: true }}
                        value={s.session_date}
                        onChange={(e) => handleSessionListChange(e, index)}
                        margin="dense"
                      />
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                          error={!!sessionErrors["start_time"]}
                          helperText={sessionErrors["start_time"]?.join(", ")}
                          fullWidth
                          type="time"
                          name="start_time"
                          label="Début"
                          InputLabelProps={{ shrink: true }}
                          value={s.start_time}
                          onChange={(e) => handleSessionListChange(e, index)}
                          margin="dense"
                        />
                        <TextField
                          error={!!sessionErrors["end_time"]}
                          helperText={sessionErrors["end_time"]?.join(", ")}
                          fullWidth
                          type="time"
                          name="end_time"
                          label="Fin"
                          InputLabelProps={{ shrink: true }}
                          value={s.end_time}
                          onChange={(e) => handleSessionListChange(e, index)}
                          margin="dense"
                        />
                      </Box>
                      <TextField
                        error={!!sessionErrors["description"]}
                        helperText={sessionErrors["description"]?.join(", ")}
                        id="description"
                        name="description"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        multiline
                        rows={3}
                        minRows={3}
                        value={s.description}
                        onChange={(e) => handleSessionListChange(e, index)}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          mt: 1,
                        }}
                      >
                        <IconButton
                          edge="end"
                          onClick={() => removeSession(index)}
                        >
                          <DeleteIcon color="error" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </List>

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button fullWidth variant="text" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={handleSubmitFinal}
                >
                  Enregistrer tout
                </Button>
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Paper>
    </Container>
  );
}

export default Course;
