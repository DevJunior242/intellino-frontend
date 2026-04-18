// ─── LoginForm.jsx ────────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { GOLD, GOLD_H, FIELD, BORDER, DIM, TEXT, RED } from "./AuthPage";

// ── Reusable styled text field ────────────────────────────────────────────────
function GoldField({ label, ...props }) {
  return (
    <TextField
      fullWidth
      label={label}
      size="small"
      variant="outlined"
      {...props}
      sx={{
        "& label": {
          fontFamily: "'Impact','Arial Narrow',sans-serif",
          letterSpacing: 1.5,
          fontSize: 11,
          color: DIM,
          textTransform: "uppercase",
        },
        "& label.Mui-focused": { color: GOLD },
        "& .MuiOutlinedInput-root": {
          bgcolor: FIELD,
          color: TEXT,
          "& fieldset": { borderColor: BORDER },
          "&:hover fieldset": { borderColor: DIM },
          "&.Mui-focused fieldset": { borderColor: GOLD },
        },
        "& input::placeholder": { color: "#2A4A6A", opacity: 1 },
        ...props.sx,
      }}
    />
  );
}

export { GoldField };

// ─────────────────────────────────────────────────────────────────────────────
export default function LoginForm({ onSwitch }) {
  const [showPw, setShowPw] = useState(false);

  return (
    <Box sx={{ p: "1.75rem" }}>
      {/* Section title */}
      <Typography
        sx={{
          fontFamily: "'Impact','Arial Narrow',sans-serif",
          fontSize: 11,
          letterSpacing: 2,
          color: RED,
          textTransform: "uppercase",
          mb: 1.5,
          pb: 0.5,
          borderBottom: "1px solid #1A0A10",
        }}
      >
        Accès sécurisé
      </Typography>

      {/* Email ou numéro de téléphone */}
      <GoldField
        label="Adresse email ou numéro de téléphone"
        type="email"
        placeholder="email@exemple.com"
        sx={{ mb: 1.5 }}
      />

      {/* Password */}
      <GoldField
        label="Mot de passe"
        type={showPw ? "text" : "password"}
        placeholder="••••••••"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPw((p) => !p)}
                edge="end"
                size="small"
                sx={{ color: DIM }}
              >
                {showPw ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.25 }}
      />

      {/* Remember / Forgot */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              sx={{ color: BORDER, "&.Mui-checked": { color: GOLD }, p: 0.5 }}
            />
          }
          label={
            <Typography sx={{ fontSize: 12, color: DIM }}>
              Se souvenir de moi
            </Typography>
          }
        />
        <Link
          href="#"
          underline="none"
          sx={{
            fontSize: 12,
            color: GOLD,
            letterSpacing: 0.5,
            "&:hover": { color: GOLD_H },
          }}
        >
          Mot de passe oublié ?
        </Link>
      </Box>

      {/* Submit */}
      <Button
        fullWidth
        variant="contained"
        sx={{
          bgcolor: GOLD,
          color: "#050B14",
          fontFamily: "'Impact','Arial Narrow',sans-serif",
          fontSize: 15,
          letterSpacing: 3,
          borderRadius: 1,
          py: 1.1,
          "&:hover": { bgcolor: GOLD_H },
          boxShadow: "none",
        }}
      >
        SE CONNECTER
      </Button>

      {/* Divider */}
      <Divider
        sx={{
          my: 2,
          "&::before, &::after": { borderColor: BORDER },
          "& .MuiDivider-wrapper": {
            fontFamily: "'Impact','Arial Narrow',sans-serif",
            fontSize: 10,
            letterSpacing: 2,
            color: "#3A5A7A",
          },
        }}
      >
        OU CONTINUER AVEC
      </Divider>

      {/* Social */}
      {/* <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          mb: 1.5,
        }}
      >
        {["🌐  Google", "⚡  SSO Fédération"].map((label) => (
          <Button
            key={label}
            variant="outlined"
            sx={{
              borderColor: BORDER,
              color: DIM,
              fontSize: 12,
              letterSpacing: 1,
              borderRadius: 1,
              "&:hover": {
                borderColor: DIM,
                color: TEXT,
                bgcolor: "transparent",
              },
            }}
          >
            {label}
          </Button>
        ))}
      </Box> */}

      {/* Switch to register */}
      <Typography sx={{ fontSize: 11, color: "#3A5A7A", textAlign: "center" }}>
        Pas encore de compte ?{" "}
        <Link
          component="button"
          onClick={onSwitch}
          underline="none"
          sx={{ color: GOLD, fontSize: 11, "&:hover": { color: GOLD_H } }}
        >
          Créer un compte
        </Link>
      </Typography>
    </Box>
  );
}
