// import {
//   Box,
//   Button,
//   Container,
//   FormHelperText,
//   TextField,
//   Typography,
// } from "@mui/material";
// import React, { useState } from "react";
// import { motion } from "motion/react";
// import { Link } from "react-router-dom";
// import ErrorGlobal from "../../component/ErrorGlobal";
// import { UseAuth } from "../../Api/AuthContext";
// import { Turnstile } from "@marsidev/react-turnstile";

// function Login() {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const { login } = UseAuth();
//   const [error, setError] = useState({});
//   const [isLoading, setSubmitting] = useState(false);
//   // const [captchaToken, setCaptchaToken] = useState(null);
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError({});
//     setSubmitting(true);

//     // if (!captchaToken) {
//     //   alert("Veuillez valider la vérification de sécurité.");
//     //   return;
//     // }

//     try {
//       const dataSend = {
//         ...formData,
//         // captcha_token: captchaToken,
//       };
//       await login(dataSend);
//     } catch (err) {
//       ErrorGlobal({ error: err, setError });
//       setTimeout(() => {
//         setError({});
//       }, 3000);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Container maxWidth="xs">
//       <Box
//         component={motion.div}
//         initial={{ opacity: 0, y: 50 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -50 }}
//         transition={{ duration: 0.5 }}
//         sx={{
//           mt: 8,
//           boxShadow: 10,
//           borderRadius: 2,
//           p: 4,
//         }}
//       >
//         <Typography
//           variant="h4"
//           component={"h1"}
//           textAlign={"center"}
//           sx={{ fontWeight: "bold", fontSize: { xs: 8, md: 14 } }}
//         >
//           Connexion
//         </Typography>
//         {error.general && (
//           <Typography textAlign={"center"} color={"red"}>
//             {error.general}
//           </Typography>
//         )}

//         <form onSubmit={handleSubmit}>
//           <TextField
//             error={!!error.email}
//             id="email"
//             label="Email"
//             name="email"
//             value={formData.email}
//             variant="outlined"
//             fullWidth
//             margin="normal"
//             onChange={handleChange}
//             required
//           />
//           {error.email && (
//             <FormHelperText error>{error.email.join(", ")}</FormHelperText>
//           )}
//           <TextField
//             error={!!error.password}
//             id="password"
//             name="password"
//             label="Password"
//             variant="outlined"
//             fullWidth
//             margin="normal"
//             value={formData.password}
//             onChange={handleChange}
//             required
//           />
//           {error.password && (
//             <FormHelperText error>{error.password.join(", ")}</FormHelperText>
//           )}
//           <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
//             {/* <Turnstile
//               siteKey="0x4AAAAAACVU_Qe1pMvah8c9"
//               onSuccess={(token) => setCaptchaToken(token)}
//               onExpire={() => setCaptchaToken(null)}
//             /> */}
//           </Box>
//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             sx={{ mt: 2 }}
//             disabled={isLoading}
//           >
//             {isLoading ? "Loading..." : "se connecter"}
//           </Button>
//         </form>
//         <Box sx={{ display: "flex", gap: 2 }}>
//           <Button
//             fullWidth
//             sx={{ mt: 2, textTransform: "none" }}
//             component={Link}
//             to="/register"
//             type="button"
//           >
//             S'inscrire
//           </Button>
//           <Button
//             fullWidth
//             sx={{ mt: 2, textTransform: "none", fontSize: { xs: 8, md: 14 } }}
//             component={Link}
//             to="/forgot-password"
//             type="button"
//           >
//             mot de passe oublié
//           </Button>
//         </Box>
//       </Box>
//     </Container>
//   );
// }

// export default Login;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Divider,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { UseAuth } from "../../Api/AuthContext";
import ErrorGlobal from "../../component/ErrorGlobal";
import Message from "./Message";

// ── Variants ─────────────────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.35, ease: "easeIn" } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.25 + i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

// ── Decorative ribbon ─────────────────────────────────────────────────────────
const Ribbon = () => (
  <Box
    component={motion.div}
    initial={{ opacity: 0, scaleX: 0 }}
    animate={{ opacity: 1, scaleX: 1 }}
    transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    sx={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: "160px",
      background:
        "linear-gradient(105deg, #c8102e 0%, #8b0000 30%, #b8860b 60%, #1a1a3e 100%)",
      clipPath: "polygon(0 60%, 100% 30%, 100% 100%, 0% 100%)",
      zIndex: 0,
      transformOrigin: "left",
    }}
  />
);

// ── Shared input style ────────────────────────────────────────────────────────
const inputSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: "8px",
    color: "#e0e0e0",
    fontSize: "0.88rem",

    "& fieldset": {
      borderColor: "rgba(255,255,255,0.1)",
    },

    "&:hover fieldset": {
      borderColor: "rgba(184,134,11,0.5)",
    },

    "&.Mui-focused": {
      backgroundColor: "rgba(255,255,255,0.04)",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#b8860b",
      borderWidth: "1.5px",
    },
  },

  "& input": {
    color: "#e0e0e0",
  },

  "& input::placeholder": {
    color: "#666",
    opacity: 1,
  },

  "& input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 100px rgba(255,255,255,0.04) inset",
    WebkitTextFillColor: "#e0e0e0",
    transition: "background-color 5000s ease-in-out 0s",
  },
};

//           <Box sx={{ my: 2, display: "flex", justifyContent: "center" }}>
//             {/* <Turnstile
//               siteKey="0x4AAAAAACVU_Qe1pMvah8c9"
//               onSuccess={(token) => setCaptchaToken(token)}
//               onExpire={() => setCaptchaToken(null)}
//             /> */}
//           </Box>
// ── Component ─────────────────────────────────────────────────────────────────
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login } = UseAuth();
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [submitting, setSubmitting] = useState(false);
  // const [captchaToken, setCaptchaToken] = useState(null);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSubmitting(true);
    setSuccess("");

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
      ErrorGlobal({ error: err, setError });
      setTimeout(() => {
        setError({});
      }, 3000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        key="login-page"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          bgcolor: "#0d0d0d",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
            opacity: 0.4,
            zIndex: 0,
          },
        }}
      >
        <Ribbon />

        {/* Glowing orb */}
        <Box
          component={motion.div}
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(200,16,46,0.35) 0%, transparent 70%)",
            top: "-100px",
            right: "-80px",
            zIndex: 0,
            filter: "blur(40px)",
          }}
        />

        {/* Card */}
        <Box
          component={motion.div}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          sx={{
            position: "relative",
            zIndex: 1,
            width: { xs: "90%", sm: 400 },
            p: { xs: 3, sm: 4 },
            borderRadius: "20px",
            border: "1px solid rgba(200,168,75,0.15)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(200,168,75,0.1)",
            overflow: "hidden", // clip le halo du logo

            // Fond qui reprend l'univers couleur du logo
            background: `
              radial-gradient(ellipse 90% 55% at 50% -5%, rgba(184,134,11,0.2) 0%, transparent 55%),
              radial-gradient(ellipse 55% 45% at 0%  100%, rgba(200,16,46,0.15)  0%, transparent 55%),
              radial-gradient(ellipse 55% 45% at 100% 85%, rgba(26,36,80,0.5)   0%, transparent 55%),
              linear-gradient(160deg, #0e0e18 0%, #0d0d14 50%, #10080d 100%)
            `,

            // grain
            "&::before": {
              content: '""',
              position: "absolute",
              inset: 0,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.025'/%3E%3C/svg%3E")`,
              zIndex: 0,
              pointerEvents: "none",
            },

            "& > *": { position: "relative", zIndex: 1 },
          }}
        >
          {/* ── Logo DANS la card, débordant légèrement en haut ── */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // Padding top généreux pour laisser respirer le logo
              pt: 4,
              pb: 1,
              // Halo doré derrière le logo pour fondre avec le fond de la card
              background:
                "radial-gradient(ellipse 70% 80% at 50% 30%, rgba(184,134,11,0.12) 0%, transparent 70%)",
            }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Box
                component="img"
                src="/Intellino-Logo.png"
                alt="Intellino"
                onError={(e) => (e.currentTarget.style.display = "none")}
                sx={{
                  height: 110,
                  display: "block",
                  // fond de l'image PNG dark fusionne avec le fond de la card
                  mixBlendMode: "lighten",
                  filter: "drop-shadow(0 4px 24px rgba(184,134,11,0.3))",
                }}
              />
            </Box>
          </Box>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mb: 3 }} />

          <Typography
            variant="h6"
            sx={{ color: "#fff", fontWeight: 700, mb: 2.5, fontSize: "1.1rem" }}
          >
            Connexion du compte
          </Typography>
          {success && <Message text={success} type="success" />}
          {error.general && (
            <Message text={error.general} type="error">
              {error.general}
            </Message>
          )}
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <Box
              component={motion.div}
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              sx={{ mb: 2 }}
            >
              <TextField
                error={hasError("email")}
                helperText={getError("email")}
                fullWidth
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: "#888", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
                required
              />
            </Box>

            {/* Password */}
            <Box
              component={motion.div}
              custom={1}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              sx={{ mb: 1.5 }}
            >
              <TextField
                error={hasError("Password")}
                helperText={getError("Password")}
                fullWidth
                placeholder="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: "#888", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ color: "#888" }}
                      >
                        {showPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
                required
              />
            </Box>

            {/* Remember + Forgot */}
            <Box
              component={motion.div}
              custom={2}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{
                      color: "#555",
                      "&.Mui-checked": { color: "#c8102e" },
                      p: "4px",
                    }}
                  />
                }
                label={
                  <Typography variant="caption" sx={{ color: "#aaa" }}>
                    Remember me
                  </Typography>
                }
              />
              <Typography
                component={Link}
                to="/forgot-password"
                variant="caption"
                sx={{
                  color: "#c8a84b",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": { color: "#e0c060" },
                }}
              >
                Forgot password?
              </Typography>
            </Box>

            {/* Submit */}
            <Box
              component={motion.div}
              custom={3}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                fullWidth
                type="submit"
                sx={{
                  background:
                    "linear-gradient(135deg, #c8102e 0%, #8b0000 100%)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  letterSpacing: "0.1em",
                  py: 1.4,
                  borderRadius: "8px",
                  textTransform: "uppercase",
                  boxShadow: "0 4px 24px rgba(200,16,46,0.45)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #e01535 0%, #a00010 100%)",
                    boxShadow: "0 6px 32px rgba(200,16,46,0.6)",
                  },
                }}
                disabled={submitting}
              >
                {submitting ? "connexion..." : " se connecter"}
              </Button>
            </Box>
          </form>

          {/* Switch */}
          <Box
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            sx={{ textAlign: "center", mt: 2.5 }}
          >
            <Typography variant="caption" sx={{ color: "#777" }}>
              Not registered?{" "}
              <Typography
                component={Link}
                to="/register"
                variant="caption"
                sx={{
                  color: "#c8a84b",
                  fontWeight: 700,
                  textDecoration: "none",
                  "&:hover": { color: "#e0c060" },
                }}
              >
                Create account ←
              </Typography>
            </Typography>
          </Box>
        </Box>
      </Box>
    </AnimatePresence>
  );
}
