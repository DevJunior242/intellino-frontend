import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { UseAuth } from "../../Api/AuthContext";
import ErrorGlobal from "../../component/ErrorGlobal";
import { Phone } from "@mui/icons-material";
import Message from "./Message";
const GOLD = "#c8a84b";
const GOLD_H = "#e0c060";
// ── Variants ──────────────────────────────────────────────────────────────────
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
  hidden: { opacity: 0, x: 20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: 0.2 + i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

// ── Decorative ribbon (gold/blue tilt) ────────────────────────────────────────
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
        "linear-gradient(105deg, #1a1a3e 0%, #b8860b 40%, #c8102e 80%, #8b0000 100%)",
      clipPath: "polygon(0 40%, 100% 60%, 100% 100%, 0% 100%)",
      zIndex: 0,
      transformOrigin: "right",
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

  // 🔥 placeholder
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
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

  const hasError = (f) => !!error?.[f];
  const getError = (f) => error?.[f]?.join(", ");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error[e.target.name])
      setError((p) => ({ ...p, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError({});
    try {
      await register(formData);
      setSuccess(true);
    } catch (err) {
      ErrorGlobal({ error: err, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        key="register-page"
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
          px: 2, // padding latéral global pour éviter coller aux bords
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

        <Box
          component={motion.div}
          animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          sx={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(184,134,11,0.3) 0%, transparent 70%)",
            bottom: "-150px",
            left: "-100px",
            zIndex: 0,
            filter: "blur(50px)",
          }}
        />

        {/* ── Card ─────────────────────────────────────────────────────── */}
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
            sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 2,
              fontSize: "1.05rem",
              textAlign: "center",
            }}
          >
            {submitting ? "Création de votre compte…" : "Créer un compte"}
          </Typography>

          {success && <Message text={success} type="success" />}
          {error.general && <Message text={error.general} type="error" />}

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} sx={{ width: "100%" }}>
            {/* ① Fullname — pleine largeur */}
            <Box
              component={motion.div}
              custom={0}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              sx={{ mb: 2 }}
            >
              <TextField
                error={hasError("fullname")}
                helperText={getError("fullname")}
                fullWidth
                placeholder="Nom complet"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: "#888", fontSize: 18 }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
                required
              />
            </Box>

            {/* ② Email + ③ Phone — côte à côte */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                component={motion.div}
                custom={1}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                sx={{ flex: 1, minWidth: 0 }}
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
                        <EmailOutlinedIcon
                          sx={{ color: "#888", fontSize: 18 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                  required
                />
              </Box>

              <Box
                component={motion.div}
                custom={2}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <TextField
                  error={hasError("phone")}
                  helperText={getError("phone")}
                  fullWidth
                  placeholder="Numéro de téléphone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "#888", fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                  required
                />
              </Box>
            </Box>

            {/* ④ Password + ⑤ Confirmation — côte à côte */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Box
                component={motion.div}
                custom={3}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <TextField
                  error={hasError("password")}
                  helperText={getError("password")}
                  fullWidth
                  placeholder="Mot de passe"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ color: "#888", fontSize: 18 }}
                        />
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

              <Box
                component={motion.div}
                custom={4}
                variants={fieldVariants}
                initial="hidden"
                animate="visible"
                sx={{ flex: 1, minWidth: 0 }}
              >
                <TextField
                  error={hasError("password_confirmation")}
                  helperText={getError("password_confirmation")}
                  fullWidth
                  placeholder="Confirmer le mot de passe"
                  name="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{ color: "#888", fontSize: 18 }}
                        />
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
            </Box>

            {/* ⑥ Submit — pleine largeur */}
            <Box
              component={motion.div}
              custom={5}
              variants={fieldVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              sx={{ mb: 2 }}
            >
              <Button
                fullWidth
                type="submit"
                disabled={submitting}
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
                  "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
                }}
              >
                {submitting ? "inscription…" : "S'inscrire"}
              </Button>
            </Box>

            {/* ⑦ CGU */}
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              sx={{ mb: 1 }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  color: "#777",
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                En créant un compte vous acceptez les{" "}
                <Typography
                  component={Link}
                  to="/cgu"
                  variant="caption"
                  sx={{
                    color: GOLD,
                    textDecoration: "none",
                    "&:hover": { color: GOLD_H },
                  }}
                >
                  CGU
                </Typography>{" "}
                et la{" "}
                <Typography
                  component={Link}
                  to="/confidentialite"
                  variant="caption"
                  sx={{
                    color: GOLD,
                    textDecoration: "none",
                    "&:hover": { color: GOLD_H },
                  }}
                >
                  politique de confidentialité
                </Typography>{" "}
                d'INTELLINO.
              </Typography>
            </Box>

            {/* ⑧ Lien login */}
            <Box
              component={motion.div}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75 }}
              sx={{ textAlign: "center" }}
            >
              <Typography variant="caption" sx={{ color: "#777" }}>
                Déjà un compte ?{" "}
                <Typography
                  component={Link}
                  to="/login"
                  variant="caption"
                  sx={{
                    color: GOLD,
                    fontWeight: 700,
                    textDecoration: "none",
                    "&:hover": { color: GOLD_H },
                  }}
                >
                  Se connecter ←
                </Typography>
              </Typography>
            </Box>
          </form>
        </Box>
      </Box>
    </AnimatePresence>
  );
}
