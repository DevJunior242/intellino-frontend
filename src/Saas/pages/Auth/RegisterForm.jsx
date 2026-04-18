// ─── RegisterForm.jsx ─────────────────────────────────────────────────────────
import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { GoldField } from "./LoginForm";
import { GOLD, GOLD_H, BORDER, DIM, TEXT, RED } from "./AuthPage";

const ROLES = ["ATHLÈTE", "COACH", "CLUB"];

export default function RegisterForm({ onSwitch }) {
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState("ATHLÈTE");

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
        Nouveau combattant
      </Typography>

      {/* First / Last name */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          mb: 1.5,
        }}
      >
        <GoldField label="Nom Complet" placeholder="Kaboré Kévin" />
        <GoldField label="numéro de téléphone" placeholder="75303579" />
      </Box>

      {/* Email */}
      <GoldField
        label="Adresse email"
        type="email"
        placeholder="email@exemple.com"
        sx={{ mb: 1.5 }}
      />

      {/* Password */}
      <GoldField
        label="Mot de passe"
        type={showPw ? "text" : "password"}
        placeholder="Min. 8 caractères"
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
        sx={{ mb: 1.5 }}
      />
      <GoldField
        label="Mot de passe de confirmation"
        type={showPw ? "text" : "password"}
        placeholder="Min. 8 caractères"
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
        sx={{ mb: 1.5 }}
      />

      {/* Role selector */}
      {/* <Typography
        sx={{
          fontFamily: "'Impact','Arial Narrow',sans-serif",
          fontSize: 11,
          letterSpacing: 1.5,
          color: DIM,
          textTransform: "uppercase",
          mb: 0.75,
        }}
      >
        Profil
      </Typography>
      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={(_, val) => val && setRole(val)}
        fullWidth
        sx={{ mb: 1.75 }}
      >
        {ROLES.map((r) => (
          <ToggleButton
            key={r}
            value={r}
            disableRipple
            sx={{
              flex: 1,
              fontFamily: "'Impact','Arial Narrow',sans-serif",
              letterSpacing: 1,
              fontSize: 11,
              border: `1px solid ${BORDER} !important`,
              borderRadius: "3px !important",
              color: DIM,
              bgcolor: "#0D1E36",
              py: 0.75,
              "&.Mui-selected": {
                borderColor: `${GOLD} !important`,
                color: GOLD,
                bgcolor: "#0D1E36",
              },
              "&:hover": { borderColor: `${DIM} !important`, color: TEXT },
            }}
          >
            {r}
          </ToggleButton>
        ))}
      </ToggleButtonGroup> */}

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
          mb: 1.5,
        }}
      >
        CRÉER MON COMPTE
      </Button>

      {/* Terms */}
      <Typography
        sx={{
          fontSize: 11,
          color: "#3A5A7A",
          textAlign: "center",
          lineHeight: 1.6,
          mb: 0.75,
        }}
      >
        En créant un compte vous acceptez les{" "}
        <Link
          href="#"
          underline="none"
          sx={{ color: GOLD, "&:hover": { color: GOLD_H } }}
        >
          CGU
        </Link>{" "}
        et la{" "}
        <Link
          href="#"
          underline="none"
          sx={{ color: GOLD, "&:hover": { color: GOLD_H } }}
        >
          politique de confidentialité
        </Link>{" "}
        d'INTELLINO.
      </Typography>

      {/* Switch to login */}
      <Typography sx={{ fontSize: 11, color: "#3A5A7A", textAlign: "center" }}>
        Déjà inscrit ?{" "}
        <Link
          component="button"
          onClick={onSwitch}
          underline="none"
          sx={{ color: GOLD, fontSize: 11, "&:hover": { color: GOLD_H } }}
        >
          Se connecter
        </Link>
      </Typography>
    </Box>
  );
}
