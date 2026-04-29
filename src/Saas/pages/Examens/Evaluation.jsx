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
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";
import ConfigSkeleton from "../ConfigSkeleton";

function Evaluation({ student, open, handleClose, examenId }) {
  const [error, setError] = useState({});

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [enchainements, setEnchainement] = useState([]);
  const [commentaire, setCommentaire] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [scores, setScores] = useState({});
  //lactiveclubId
  const { activeId } = UseAuth();

  //obtenir les tournois
  const getEnch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Instance(
        `/api/enchainements/${examenId}?organisateur_id=${activeId}`,
      );
      console.log(response);
      setEnchainement(response.data.enchainements || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [activeId, examenId]);

  useEffect(() => {
    getEnch();
  }, [getEnch]);

  const handleChangeScore = (enchainementId, value) => {
    setScores((prev) => ({
      ...prev,
      [enchainementId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const playload = {
        examen_id: examenId,
        student_id: student.id,
        notes: Object.entries(scores).map(([enchainement_id, score]) => ({
          enchainement_id,
          score,
        })),
        commentaire: commentaire ?? "",
      };
      const response = await Instance.post(
        `/api/evaluation/examen/${examenId}/candidat/${student.id}?organisateur_id=${activeId}`,
        playload,
      );
      console.log(response);
      if (response.data.success) {
        setSuccess(response.data.message);
        //reset form
        setCommentaire("");
        setScores({});

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        alert("Erreur lors de l’enregistrement de la note.");
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

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <DialogTitle>Note de l'étudiant</DialogTitle>
          <DialogContent
            sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ mb: 2, fontSize: { xs: 8, md: 14 } }}
            >
              Notation de <b>{student.fullname}</b>
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {enchainements.map((item) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontSize: { xs: 8, md: 14 } }}
                >
                  {item.name}/{item.diviseur}
                </Typography>
                <TextField
                  error={!!getError("score")}
                  type="number"
                  size="small"
                  fullWidth
                  inputProps={{ min: 0, max: 20 }}
                  value={scores[item.id] ?? ""}
                  onChange={(e) => handleChangeScore(item.id, e.target.value)}
                  placeholder={`Score / ${item.diviseur}`}
                  required
                  sx={{ fontSize: { xs: 8, md: 14 } }}
                />
                {hasError("score") && (
                  <FormHelperText error>{getError("score")}</FormHelperText>
                )}
              </Box>
            ))}

            <TextField
              error={!!getError("commentaire")}
              label="Commentaire général"
              multiline
              rows={3}
              fullWidth
              sx={{ mt: 2 }}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
            {hasError("commentaire") && (
              <FormHelperText error>{getError("commentaire")}</FormHelperText>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
            >
              {submitting ? "Enregistrement..." : "Noter"}
            </Button>
          </DialogActions>
        </form>
      </Box>
    </Dialog>
  );
}

export default Evaluation;
