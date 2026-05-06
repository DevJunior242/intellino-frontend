import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";
import { Instance } from "../../Api/Axios";
import Message from "./Message";
function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
  });
  const [success, setSuccess] = useState("");

  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setIsLoading(true);

    try {
      const res = await Instance.post("/api/forgot-password", formData);
      console.log(res);
      if (res.data.message) {
        setSuccess(res.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 5000);
        setError({});
      } else {
        setError(res.data.message);
        setSuccess("");
      }
    } catch (err) {
      console.log("err", err);
      ErrorGlobal({ error: err, setError });
      setTimeout(() => {
        setError({});
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
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
          Saisir votre email de récuperation
        </Typography>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.email}
            id="email"
            label="Email de récuperation"
            name="email"
            value={formData.email}
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
            required
          />
          {error.email && (
            <FormHelperText error>{error.email.join(", ")}</FormHelperText>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "envoyer"}
          </Button>
        </form>
        <Button
          fullWidth
          sx={{ mt: 2, textTransform: "none" }}
          component={Link}
          to="/login"
          type="button"
        >
          se connecter
        </Button>
      </Box>
    </Container>
  );
}

export default ForgotPassword;
