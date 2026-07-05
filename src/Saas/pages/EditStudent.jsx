import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Paper,
} from "@mui/material";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";

export default function EditStudent({
  open,
  handleClose,
  student,
  setStudents,
}) {
  const [error, setError] = useState({});
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const { activeId } = UseAuth();
  const [formData, setFormData] = useState({
    fullname: student?.fullname || "",
    birthdate: student?.birthdate
      ? new Date(student.birthdate).toISOString().split("T")[0]
      : "",
    sex: student?.sex || "",
    status: student?.status || "",
    photo: null,
    club_id: activeId,
  });
  const [preview, setPreview] = useState(student?.photo || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, photo: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError({});
    try {
      const payload = new FormData();
      payload.append("fullname", formData.fullname);
      payload.append("birthdate", formData.birthdate);
      payload.append("sex", formData.sex);
      // payload.append("status", formData.status);
      payload.append("club_id", activeId);
      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const response = await Instance.post(
        `/api/student/${student.id}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      const updatedStudent = response?.data?.student || [];

      // Transformer photo en URL complète pour affichage
      const formattedStudent = {
        ...student,
        ...updatedStudent,
        birthdate: new Date(updatedStudent.birthdate),
        photo: updatedStudent.photo ? updatedStudent.photo : student.photo,
      };

      setStudents((prev) =>
        prev.map((s) => (s.id === formattedStudent.id ? formattedStudent : s)),
      );
      if (response.data.success) {
        alert("Élève mis à jour avec succès");
        handleClose();
      }
      handleClose();
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setLoading(false);
    }
  };

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
      <DialogTitle>Modifier l'étudiant</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          error={hasError("fullname")}
          helperText={getError("fullname")}
          label="Nom complet"
          name="fullname"
          value={formData.fullname}
          onChange={handleChange}
          required
        />
        <TextField
          error={hasError("birthdate")}
          helperText={getError("birthdate")}
          label="Date de naissance"
          type="date"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl error={hasError("sex")} helperText={getError("sex")}>
          <InputLabel>Sexe</InputLabel>
          <Select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            MenuProps={{
              PaperProps: {
                sx: { backgroundColor: "background.default" },
              },
            }}
          >
            <MenuItem value="M">Homme</MenuItem>
            <MenuItem value="F">Femme</MenuItem>
          </Select>
        </FormControl>

        {/* <FormControl error={hasError("status")} helperText={getError("status")}>
          <InputLabel>Status</InputLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <MenuItem value="actif">Actif</MenuItem>
            <MenuItem value="inactif">Inactif</MenuItem>
          </Select>
        </FormControl> */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={preview} sx={{ width: 56, height: 56 }} />
          <TextField
            type="file"
            error={hasError("photo")}
            helperText={getError("photo")}
            label="Photo"
            name="photo"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
