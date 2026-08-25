import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { UseAuth } from "../../../Api/AuthContext";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import StudentForm from "../Students/StudentForm";
import StudentList from "../Students/StudentList";
import StudentGradCreate from "../StudentGradCreate";

// Gestion des athlètes sans club (inscrits directement par une Ligue ou une
// Fédération, saisie manuelle donc plus sujette à erreur qu'une inscription
// via un club) — les athlètes affiliés à un club ne sont pas listés ici, ils
// se gèrent depuis l'écran Élèves du club lui-même.
function AthletesIndependants() {
  const { activeRole } = UseAuth();
  const allowAccess = activeRole === "admin";

  const [inscriptionOpen, setInscriptionOpen] = useState(false);
  const [gradeStudent, setGradeStudent] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 } }}
            >
              Athlètes sans club
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Athlètes inscrits directement (sans passer par un club) — les
              athlètes affiliés à un club se gèrent depuis leur club.
            </Typography>
          </Box>

          {allowAccess && (
            <Button
              variant="contained"
              startIcon={<PersonAddAltIcon />}
              onClick={() => setInscriptionOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Inscrire un athlète
            </Button>
          )}
        </Box>

        <StudentList
          scope="independants"
          onAssignGrade={setGradeStudent}
          refreshSignal={refreshSignal}
        />
      </Box>

      <Dialog
        open={inscriptionOpen}
        onClose={() => setInscriptionOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Inscrire un athlète sans club
          <IconButton onClick={() => setInscriptionOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <StudentForm
            onSuccess={() => {
              setInscriptionOpen(false);
              setRefreshSignal((s) => s + 1);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!gradeStudent}
        onClose={() => setGradeStudent(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Attribuer un grade{gradeStudent ? ` — ${gradeStudent.fullname}` : ""}
          <IconButton onClick={() => setGradeStudent(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {gradeStudent && (
            <StudentGradCreate
              student={gradeStudent}
              onSuccess={() => {
                setGradeStudent(null);
                setRefreshSignal((s) => s + 1);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default AthletesIndependants;
