import React, { useRef, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Container,
  FormHelperText,
} from "@mui/material";
import {
  PhotoCamera,
  Email,
  Phone,
  Business,
  Edit,
  Save,
  Cancel,
} from "@mui/icons-material";
import { deepPurple } from "@mui/material/colors";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";

const Profile = () => {
  const { auth, updateAuth, activeRole } = UseAuth();
  const isSuperAdmin = auth.roleSuperAdmin?.includes("super_admin");

  const fileInputRef = useRef(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");

  const [isEditing, setIsEditing] = useState(false);

  // État local pour les champs du formulaire
  const originalEmail = auth?.user?.email || "";
  const [formData, setFormData] = useState({
    fullname: auth?.user?.fullname || "",
    phone: auth?.user?.phone || "",
    email: originalEmail,
    current_password: "",
  });
  const emailChanged = formData.email !== originalEmail;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await Instance.put("/api/setting/profile", formData);
      if (res.data.success) {
        setSuccess(res.data.message);
        setTimeout(() => setSuccess(""), 4000);
      }
      setFormData((prev) => ({ ...prev, current_password: "" }));
      setIsEditing(false);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    }
  };
  //upload photo
  const handlePhotoChange = async (e) => {
    setError("");
    setSuccess("");
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await Instance.post("/api/setting/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success) {
        const { user } = res.data;

        updateAuth({
          user: user,
        });
        setSuccess("Photo mise à jour !");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    }
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        justifyContent: "center",
        pt: 5,
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          position: "relative",
          width: "100%",
          p: 4,
          backgroundColor: "background.default",
        }}
      >
        {/* Bouton de bascule Édition / Annulation */}
        <Box sx={{ position: "absolute", top: 20, right: 20 }}>
          {!isEditing ? (
            <Button startIcon={<Edit />} onClick={() => setIsEditing(true)}>
              Modifier
            </Button>
          ) : (
            <Button
              color="error"
              startIcon={<Cancel />}
              onClick={() => setIsEditing(false)}
            >
              Annuler
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 5,
          }}
        >
          {/* SECTION GAUCHE : PHOTO */}
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={auth?.user?.photo_url}
                sx={{
                  width: 140,
                  height: 140,
                  mb: 2,
                  bgcolor: deepPurple[500],
                  fontSize: 50,
                  cursor: "pointer",
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {formData.fullname.charAt(0)}
              </Avatar>
              <IconButton
                onClick={() => fileInputRef.current.click()}
                sx={{
                  position: "absolute",
                  bottom: 15,
                  right: 5,
                  bgcolor: "white",
                  boxShadow: 2,
                }}
              >
                <PhotoCamera fontSize="small" color="primary" />
              </IconButton>
              <input
                name="photo"
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                hidden
                accept="image/*"
              />
              {error.photo && (
                <FormHelperText error>{error.photo.join(", ")}</FormHelperText>
              )}
            </Box>

            {isSuperAdmin ? (
              <Chip
                label={auth?.roleSuperAdmin || "Super Admin"}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            ) : (
              <Chip
                label={activeRole || "Rôle Inconnu"}
                color="primary"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Box>

          {/* SECTION DROITE : FORMULAIRE */}
          <Stack spacing={3} sx={{ flexGrow: 1 }}>
            {success && <Message text={success} type="success" />}
            {error.general && <Message text={error.general} type="error" />}
            <Typography variant="h5" fontWeight="800">
              Paramètres du profil
            </Typography>
            <form onSubmit={handleUpdateProfile}>
              <TextField
                error={hasError("fullname")}
                helperText={getError("fullname")}
                label="Nom Complet"
                name="fullname"
                fullWidth
                variant={isEditing ? "outlined" : "standard"}
                value={formData.fullname}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
                margin="normal"
              />

              <TextField
                error={hasError("email")}
                helperText={getError("email")}
                label="Email"
                name="email"
                fullWidth
                variant={isEditing ? "outlined" : "standard"}
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
                margin="normal"
              />

              {isEditing && emailChanged && (
                <TextField
                  error={hasError("current_password")}
                  helperText={
                    getError("current_password") ||
                    "Requis pour confirmer le changement d'adresse email"
                  }
                  label="Mot de passe actuel"
                  name="current_password"
                  type="password"
                  fullWidth
                  variant="outlined"
                  value={formData.current_password}
                  onChange={handleChange}
                  margin="normal"
                  required
                />
              )}

              <TextField
                error={hasError("phone")}
                helperText={getError("phone")}
                label="Téléphone"
                name="phone"
                fullWidth
                variant={isEditing ? "outlined" : "standard"}
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                InputProps={{ readOnly: !isEditing }}
                margin="normal"
              />

              {isEditing && (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Save />}
                  sx={{
                    mt: 2,
                    textTransform: "none",
                    fontSize: { xs: 14, md: 24 },
                  }}
                >
                  Enregistrer les modifications
                </Button>
              )}
            </form>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
