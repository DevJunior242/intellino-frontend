import React, { useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { motion } from "motion/react";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";
import StudentAutocomplete from "../StudentAutocomplete";
import StudentForm from "../Students/StudentForm";

function AddCandidat({ open, handleClose, examenId, fetchExamen }) {
  const [error, setError] = useState({});

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  //lactiveclubId
  const { activeId, activeType } = UseAuth();

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nouvelAthleteOpen, setNouvelAthleteOpen] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    examen_id: examenId,
  });

  useEffect(() => {
    if (selectedStudent) {
      setFormData((prev) => ({
        ...prev,
        student_id: selectedStudent.id,
      }));
    }
  }, [selectedStudent]);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (!selectedStudent) return alert("Sélectionnez un étudiant");
    setError({});
    setSuccess("");
    try {
      const res = await Instance.post(
        `/api/candidats/add/${examenId}/${selectedStudent.id}`,
        {
          ...formData,
          student_id: selectedStudent.id,
          organisateur_id: activeId,
          organisateur_type: activeType,
        },
      );
       if (res.data.success) {
        setSuccess(res?.data?.message || "candidat ajouté");
        setSelectedStudent(null);
        setTimeout(() => {
          fetchExamen();
          handleClose();
        }, 1000);
      }
      fetchExamen();
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Dialog
      open={open}
      // onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          p: 3,
          borderRadius: 3,
          backgroundColor: "background.default",
        },
      }}
    >
      <Box>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            Nouvelle candidature-{examenId.substr(0, 8)}
          </DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, fontSize: { xs: 8, md: 14 } }}
            >
              ajout des candidats
            </Typography>

            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" gap={1} alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <StudentAutocomplete
                  activeId={activeId}
                  value={selectedStudent}
                  onChange={(val) => setSelectedStudent(val)}
                  hasError={hasError}
                  getError={getError}
                  label="Choisir un élève"
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<PersonAddAlt1Icon />}
                onClick={() => setNouvelAthleteOpen(true)}
                sx={{ mt: 2, whiteSpace: "nowrap", textTransform: "none" }}
              >
                Nouvel athlète
              </Button>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>

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
          }}
        />
      </DialogContent>
    </Dialog>
    </>
  );
}

export default AddCandidat;
