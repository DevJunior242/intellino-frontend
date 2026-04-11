import React, { useEffect } from "react";
import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import { motion } from "motion/react";
import { Instance } from "../../Api/Axios";
import { useState } from "react";
import ErrorGlobal from "../../component/ErrorGlobal";
import PulseLoader from "react-spinners/PulseLoader";
import Message from "./Message";

function AttendanceCreate({ student, open, handleClose, onSuccess }) {
  const [error, setError] = useState({});

  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState([]);
  const [selectSession, setSelectSession] = useState(null);

  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  //obtenir les tournois
  const getSession = async () => {
    setIsLoading(true);
    try {
      const response = await Instance("/api/session");
      console.log(response);
      setSession(response.data.sessions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getSession();
  }, []);

  const [formData, setFormData] = useState({
    student_id: null,
    session_id: null,
    attendance: "",
  });
  useEffect(() => {
    if (student) {
      setFormData((prev) => ({
        ...prev,
        student_id: student.id,
      }));
    }
  }, [student]);

  useEffect(() => {
    if (selectSession) {
      setFormData((prev) => ({
        ...prev,
        session_id: selectSession?.id ?? null,
      }));
    }
  }, [selectSession]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    try {
      const response = await Instance.post("/api/attendances", formData);
      console.log(response);
      if (response.data.success) {
        alert("Présence enregistrée avec succès !");
        onSuccess();
        setSuccess(response.data.message);

        setError({});
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setFormData({
          student_id: null,
          session_id: null,
          attendance: "",
        });
      } else {
        alert("Erreur lors de l’enregistrement de la présence.");
        setError(response.data.message);
        setSuccess("");
      }
      handleClose();
    } catch (error) {
      ErrorGlobal({ error, setError });
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <PulseLoader />
      </Box>
    );
  }
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Marquer la présence ou l'absence</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <Typography>
          Élève : <b>{student?.fullname}</b>
        </Typography>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}

        <form onSubmit={handleSubmit}>
          <Autocomplete
            disablePortal
            options={Array.isArray(session) ? session : []}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            getOptionLabel={(session) =>
              `${session.session_date || ""}(${
                session?.course?.name || ""
              }) de ${session.start_time} à ${session.end_time}`
            }
            value={selectSession}
            onChange={(e, newValue) => setSelectSession(newValue)}
            renderInput={(params) => (
              <TextField
                error={hasError("session_id")}
                {...params}
                fullWidth
                margin="normal"
                label="il vous faut choisir une session"
                required
              />
            )}
          />
          {error?.session_id && (
            <FormHelperText error>{getError("session_id")}</FormHelperText>
          )}

          <FormControl
            fullWidth
            margin="normal"
            required
            error={hasError("attendance")}
          >
            <InputLabel id="attendance-label">Attendance</InputLabel>
            <Select
              labelId="attendance-label"
              name="attendance"
              label="attendance"
              value={formData.attendance}
              onChange={handleChange}
            >
              <MenuItem value="" disabled>
                Sélectionner
              </MenuItem>
              <MenuItem value="present">Present</MenuItem>
              <MenuItem value="absent">Absent</MenuItem>
            </Select>
            {hasError("attendance") && (
              <FormHelperText error>{getError("attendance")}</FormHelperText>
            )}
          </FormControl>

          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Ajouter
           </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
       
      </DialogActions>
    </Dialog>
  );
}

export default AttendanceCreate;
