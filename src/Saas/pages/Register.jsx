import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormHelperText,
} from "@mui/material";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";
import Message from "./Message";
function Register() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register } = UseAuth();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({});
    try {
      await register(formData);
      setSuccess(true);
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
        sx={{
          mt: 8,
          boxShadow: 10,
          borderRadius: 2,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          component={"h1"}
          textAlign={"center"}
          sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
        >
          créer un compte utilisateur
        </Typography>
        {success && <Message text={success} type="success" />}
        {error.general && <Message text={error.general} type="error" />}{" "}
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.fullname}
            id="fullname"
            name="fullname"
            label="nom complet"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.fullname}
            onChange={handleChange}
          />
          {error.fullname && (
            <FormHelperText error>{error.fullname.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.email}
            id="email"
            name="email"
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {error.email && (
            <FormHelperText error>{error.email.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.phone}
            id="phone"
            name="phone"
            label="Phone"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {error.phone && (
            <FormHelperText error>{error.phone.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.password}
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {error.password && (
            <FormHelperText error>{error.password.join(", ")}</FormHelperText>
          )}
          <TextField
            error={!!error.password_confirmation}
            id="password_confirmation"
            name="password_confirmation"
            label="Password confirmation"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password_confirmation}
            onChange={handleChange}
            required
          />
          {error.password_confirmation && (
            <FormHelperText error>
              {error.password_confirmation[0]}
            </FormHelperText>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
            disabled={submitting}
          >
            {submitting ? "Loading..." : "s'inscrire"}
          </Button>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              fullWidth
              sx={{ mt: 2, textTransform: "none" }}
              component={"h1"}
            >
              déja inscrit ?
            </Typography>
            <Link
              fullWidth
              sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
              to="/login"
            >
              Se connecter
            </Link>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default Register;
