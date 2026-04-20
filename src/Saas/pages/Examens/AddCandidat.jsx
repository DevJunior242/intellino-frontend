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
} from "@mui/material";
import { motion } from "motion/react";
import { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";

import Message from "../Message";
import { UseAuth } from "../../../Api/AuthContext";
import StudentAutocomplete from "../StudentAutocomplete";

function AddCandidat({ open, handleClose, examenId, fetchExamen }) {
  console.log("examenId : ", examenId);
  const [error, setError] = useState({});

  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  //lactiveclubId
  const { activeClubId } = UseAuth();

  const [selectedStudent, setSelectedStudent] = useState(null);

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
          club_id: activeClubId,
        },
      );
      console.log(res);
      if (res.data.success) {
        setSelectedStudent(null);
        fetchExamen();
      }
    } catch (err) {
      console.error(err);
      ErrorGlobal({ error: err, setError });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
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
            <StudentAutocomplete
              activeClubId={activeClubId}
              value={selectedStudent}
              onChange={(val) => setSelectedStudent(val)}
              hasError={hasError}
              getError={getError}
              label="Choisir un élève"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Annuler</Button>
            <Button
              onClick={handleSubmit}
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

export default AddCandidat;
