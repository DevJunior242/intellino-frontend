import {
  Box,
  Button,
  Container,
  FormHelperText,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import ErrorGlobal from "../../component/ErrorGlobal";
import { UseAuth } from "../../Api/AuthContext";
import { Turnstile } from "@marsidev/react-turnstile";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = UseAuth();
  const [error, setError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setIsLoading(true);

    // if (!captchaToken) {
    //   alert("Veuillez valider la vérification de sécurité.");
    //   return;
    // }

    try {
      const dataSend = {
        ...formData,
        // captcha_token: captchaToken,
      };
      await login(dataSend);
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
          Connexion
        </Typography>
        {error.general && (
          <Typography textAlign={"center"} color={"red"}>
            {error.general}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            error={!!error.email}
            id="email"
            label="Email"
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
          <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
            {/* <Turnstile
              siteKey="0x4AAAAAACVU_Qe1pMvah8c9"
              onSuccess={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            /> */}
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "se connecter"}
          </Button>
        </form>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            fullWidth
            sx={{ mt: 2, textTransform: "none" }}
            component={Link}
            to="/register"
            type="button"
          >
            S'inscrire
          </Button>
          <Button
            fullWidth
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
            component={Link}
            to="/forgot-password"
            type="button"
          >
            mot de passe oublié
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;
