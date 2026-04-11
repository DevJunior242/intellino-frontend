import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import { Instance } from "../../../Api/Axios";

const MotionBox = motion(Box);

export default function ClubExamModal({ open, handleClose, examId, clubId }) {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const getStudents = useCallback(async () => {
    if (!open || !clubId) return;

    setLoading(true);
    try {
      const response = await Instance(`/api/students?club_id=${clubId}`);
      console.log(response);
      setStudents(response.data.students || []);
      // initialiser selected
      const init = {};
      response.data.students.forEach((s) => {
        init[s.id] = false;
      });
      setSelected(init);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [clubId, open]);
  useEffect(() => {
    getStudents();
  }, [getStudents]);

  const toggleStudent = (studentId) => {
    setSelected((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const submitStudents = async () => {
    setSubmitting(true);
    try {
      const studentIds = Object.keys(selected).filter((id) => selected[id]);
      await Promise.all(
        studentIds.map((id) =>
          axios.post("/api/exam-students", { student_id: id, exam_id: examId }),
        ),
      );
      alert("Students ajoutés à l'examen !");
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <MotionBox
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          width: 400,
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Typography variant="h6" mb={2}>
          Sélectionner vos students
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          students.map((student) => (
            <FormControlLabel
              key={student.id}
              control={
                <Checkbox
                  checked={!!selected[student.id]}
                  onChange={() => toggleStudent(student.id)}
                />
              }
              label={student.fullname}
            />
          ))
        )}

        <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={submitStudents}
            disabled={submitting || loading}
          >
            {submitting ? "Envoi..." : "Ajouter à l'examen"}
          </Button>
        </Box>
      </MotionBox>
    </Modal>
  );
}
