import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  FormHelperText,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";
import { Instance } from "../../Api/Axios";
function ResetPassword() {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [searchParams] = useSearchParams();
  const isFirstTime = searchParams.get("first") === "true";
  const { token } = useParams();
  useEffect(() => {
    setEmail(searchParams.get("email"));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");

    try {
      const res = await Instance.post("api/reset-password", {
        token: token,
        email: email,
        password: password,
        password_confirmation: password_confirmation,
      });
      console.log(res);
      if (res.data.success) {
        setSuccess(res.data.message);
        setError({});
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
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
          {isFirstTime
            ? "Bienvenue, définissez votre mot de passe"
            : "Changer le mot de passe"}
        </Typography>
        {success && (
          <Message
            text={
              <span>
                {success}
                <Link
                  to="/login"
                  style={{ color: "red", textDecoration: "underline" }}
                >
                  Connectez-vous
                </Link>
              </span>
            }
            type="success"
          />
        )}
        {error.general && <Message text={error.general} type="error" />}
        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.password}
            id="password"
            name="password"
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            value={password_confirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
          {error.password_confirmation && (
            <FormHelperText error>
              {error.password_confirmation[0]}
            </FormHelperText>
          )}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            changer le mot de passe
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default ResetPassword;
