import React, { useCallback, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  FormHelperText,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";

function EditNote({
  student,
  open,
  handleClose,
  examenId,
  setStudents,
  getNotes,
}) {
  console.log("student reçu :", student);
  console.log("notes :", student?.notes);
  const [error, setError] = useState({});
  const [commentaire, setCommentaire] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const { activeId } = UseAuth();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const studentData = Array.isArray(student) ? student[0] : student;

    if (open && studentData?.notes) {
      const initialData = {};
      studentData.notes.forEach((n) => {
        initialData[n.key] = n.value ?? "";
      });
      setFormData(initialData);
      setCommentaire(studentData.comment || "");
    }
  }, [open, student]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitNotes = async (e) => {
    e.preventDefault();
    setLoading(true);

    const studentData = Array.isArray(student) ? student[0] : student;
    if (!examenId || examenId === "undefined" || !studentData) {
      alert("Impossible d'enregistrer : ID de l'examen introuvable.");
      return;
    }
    const payload = {
      notes: Object.keys(formData).map((key) => {
        // Chercher dans studentData.notes
        const originalNote = studentData.notes?.find((n) => n.key === key);
        console.log("originalNote", originalNote);
        return {
          enchainement_id: originalNote?.enchainement_id,
          score: parseFloat(formData[key]) || 0,
        };
      }),
      commentaire: commentaire,
    };
    console.log("  payload noeud notes", payload.notes);

    try {
      const dataSend = {
        ...payload,
        club_id: activeId,
      };
      const response = await Instance.put(
        `/api/evaluation/examen/${examenId}/candidat/${studentData.id}`,
        dataSend,
      );
      if (response.data.success) {
        getNotes();
        alert(`données mises à jour avec succès`);
        // MISE À JOUR LOCALE DE L'ÉTAT
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentData.id) {
              // On crée les nouvelles notes avec les valeurs saisies
              const updatedNotes = s.notes.map((n) => ({
                ...n,
                value: parseFloat(formData[n.key]) || 0,
              }));

              // Calcul de la nouvelle moyenne
              const newTotal = updatedNotes.reduce(
                (sum, n) => sum + n.value,
                0,
              );

              return {
                ...s,
                notes: updatedNotes,
                moyenne: newTotal,
                comment: commentaire,
              };
            }
            return s;
          }),
        );
        handleClose();
      }
    } catch (error) {
      alert("Erreur lors de l'enregistrement");
      ErrorGlobal({ error, setError });
    } finally {
      setLoading(false);
    }
  };
  const studentData = Array.isArray(student) ? student[0] : student;
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Modifier la note de {studentData.fullname}</DialogTitle>

      <Box>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmitNotes}>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Grid container spacing={2}>
              {studentData?.notes?.map((n) => (
                <Grid item xs={12} key={n.key}>
                  <TextField
                    error={hasError(n.key)}
                    helperText={getError(n.key)}
                    label={n.label}
                    type="number"
                    fullWidth
                    value={formData[n.key] ?? ""}
                    onChange={(e) => handleChange(n.key, e.target.value)}
                  />
                </Grid>
              ))}
            </Grid>

            <TextField
              label="Commentaire général"
              fullWidth
              multiline
              rows={2}
              margin="normal"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={handleClose}
              sx={{ textTransform: "none", color: "red" }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmitNotes}
              variant="contained"
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
}

export default EditNote;
