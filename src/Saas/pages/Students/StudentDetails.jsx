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
import StudentForm from "./StudentForm";
import StudentList from "./StudentList";
import StudentGradCreate from "../StudentGradCreate";

function StudentDetails() {
  const { activeRole } = UseAuth();

  const allowAccess = [
    "admin",
    "instructeur",
    "secretaire",
    "super_admin",
  ].includes(activeRole);

  const [inscriptionOpen, setInscriptionOpen] = useState(false);
  const [gradeStudent, setGradeStudent] = useState(null);
  // Incrémenté après une inscription ou une attribution de grade réussie,
  // pour forcer StudentList à recharger sans lui donner le contrôle des
  // modals qui vivent ici.
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
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", fontSize: { xs: 18, md: 24 } }}
          >
            Élèves
          </Typography>

          {allowAccess && (
            <Button
              variant="contained"
              startIcon={<PersonAddAltIcon />}
              onClick={() => setInscriptionOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Inscrire un élève
            </Button>
          )}
        </Box>

        <StudentList
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
          Inscription élève(s)
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

export default StudentDetails;
