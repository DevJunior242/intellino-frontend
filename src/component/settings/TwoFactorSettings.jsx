import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Security } from "@mui/icons-material";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Instance } from "../../Api/Axios";
import { UseAuth } from "../../Api/AuthContext";
import ErrorGlobal from "../ErrorGlobal";
import Message from "../../Saas/pages/Message";

function TwoFactorSettings() {
  const { auth, refreshUser } = UseAuth();
  const enabled = Boolean(auth?.user?.two_factor_confirmed_at);

  // --- Activation (enable -> scan -> confirm) ---
  const [enabling, setEnabling] = useState(false);
  const [setupError, setSetupError] = useState({});
  const [otpauthUrl, setOtpauthUrl] = useState(null);
  const [secret, setSecret] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [confirmCode, setConfirmCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  // Affichés une seule fois juste après confirmation : l'API ne les
  // renvoie plus jamais ensuite (voir TwoFactorAuthController::confirm).
  const [recoveryCodes, setRecoveryCodes] = useState(null);

  useEffect(() => {
    if (!otpauthUrl) return;

    let cancelled = false;
    QRCode.toDataURL(otpauthUrl)
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [otpauthUrl]);

  const handleStartEnable = async () => {
    setSetupError({});
    setEnabling(true);
    try {
      const res = await Instance.post("/api/2fa/enable");
      setSecret(res.data.secret);
      setOtpauthUrl(res.data.qr_code_url);
    } catch (err) {
      ErrorGlobal({ error: err, setError: setSetupError });
    } finally {
      setEnabling(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setSetupError({});
    setConfirming(true);
    try {
      const res = await Instance.post("/api/2fa/confirm", {
        code: confirmCode,
      });
      setRecoveryCodes(res.data.recovery_codes);
      setOtpauthUrl(null);
      setSecret(null);
      setConfirmCode("");
      await refreshUser();
    } catch (err) {
      ErrorGlobal({ error: err, setError: setSetupError });
    } finally {
      setConfirming(false);
    }
  };

  // --- Régénération des codes de récupération (compte déjà protégé) ---
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState({});
  const [newRecoveryCodes, setNewRecoveryCodes] = useState(null);

  const handleRegenerate = async (e) => {
    e.preventDefault();
    setRegenerateError({});
    setRegenerating(true);
    try {
      const res = await Instance.post("/api/2fa/recovery-codes/regenerate", {
        password: regeneratePassword,
      });
      setNewRecoveryCodes(res.data.recovery_codes);
      setRegeneratePassword("");
      setShowRegenerateForm(false);
    } catch (err) {
      ErrorGlobal({ error: err, setError: setRegenerateError });
    } finally {
      setRegenerating(false);
    }
  };

  // --- Désactivation ---
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);
  const [disableError, setDisableError] = useState({});

  const handleDisable = async (e) => {
    e.preventDefault();
    setDisableError({});
    setDisabling(true);
    try {
      await Instance.post("/api/2fa/disable", { password: disablePassword });
      setDisablePassword("");
      setShowDisableForm(false);
      await refreshUser();
    } catch (err) {
      ErrorGlobal({ error: err, setError: setDisableError });
    } finally {
      setDisabling(false);
    }
  };

  return (
    <Paper sx={{ width: "100%", backgroundColor: "background.default", p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: { xs: 14, md: 24 } }}>
          <Security /> Authentification à deux facteurs
        </Typography>
        <Chip
          label={enabled ? "Activée" : "Désactivée"}
          color={enabled ? "success" : "default"}
          size="small"
        />
      </Stack>

      {recoveryCodes ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            2FA activée. Notez ces codes de récupération : ils ne seront plus
            jamais affichés et permettent de vous connecter si vous perdez
            l'accès à votre application d'authentification.
          </Alert>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "action.hover" }}>
            <Stack spacing={0.5}>
              {recoveryCodes.map((c) => (
                <Typography key={c} variant="body2" fontFamily="monospace">
                  {c}
                </Typography>
              ))}
            </Stack>
          </Paper>
          <Button variant="contained" onClick={() => setRecoveryCodes(null)}>
            J'ai noté mes codes
          </Button>
        </Box>
      ) : enabled ? (
        <Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Un code sera demandé à chaque connexion, en plus de votre mot de
            passe.
          </Typography>

          {newRecoveryCodes ? (
            <Box sx={{ mb: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Nouveaux codes de récupération (les précédents ne
                fonctionnent plus) :
              </Alert>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: "action.hover" }}>
                <Stack spacing={0.5}>
                  {newRecoveryCodes.map((c) => (
                    <Typography key={c} variant="body2" fontFamily="monospace">
                      {c}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setNewRecoveryCodes(null)}
              >
                J'ai noté mes codes
              </Button>
            </Box>
          ) : (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowRegenerateForm((v) => !v)}
              >
                Régénérer les codes de récupération
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => setShowDisableForm((v) => !v)}
              >
                Désactiver
              </Button>
            </Stack>
          )}

          {showRegenerateForm && (
            <Box
              component="form"
              onSubmit={handleRegenerate}
              sx={{ display: "flex", gap: 1, mb: 2 }}
            >
              <TextField
                label="Mot de passe"
                type="password"
                size="small"
                value={regeneratePassword}
                onChange={(e) => setRegeneratePassword(e.target.value)}
                required
                fullWidth
              />
              <Button type="submit" variant="contained" disabled={regenerating}>
                Confirmer
              </Button>
            </Box>
          )}
          {regenerateError.general && (
            <Message text={regenerateError.general} type="error" />
          )}

          {showDisableForm && (
            <Box
              component="form"
              onSubmit={handleDisable}
              sx={{ display: "flex", gap: 1, mb: 2 }}
            >
              <TextField
                label="Mot de passe"
                type="password"
                size="small"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="contained"
                color="error"
                disabled={disabling}
              >
                Désactiver
              </Button>
            </Box>
          )}
          {disableError.general && (
            <Message text={disableError.general} type="error" />
          )}
        </Box>
      ) : otpauthUrl ? (
        <Box component="form" onSubmit={handleConfirm}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Scannez ce QR code avec Google Authenticator, Microsoft
            Authenticator ou une application équivalente, puis entrez le code
            généré pour confirmer.
          </Typography>
          {qrDataUrl && (
            <Box sx={{ textAlign: "center", mb: 2 }}>
              <Box
                component="img"
                src={qrDataUrl}
                alt="QR code d'activation 2FA"
                sx={{ width: 200, height: 200 }}
              />
            </Box>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 2, wordBreak: "break-all" }}
          >
            Impossible de scanner ? Saisissez ce code manuellement : {secret}
          </Typography>
          {setupError.general && (
            <Message text={setupError.general} type="error" />
          )}
          <Stack direction="row" spacing={1}>
            <TextField
              label="Code de vérification"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              error={!!setupError.code}
              helperText={setupError.code?.join(", ")}
              autoFocus
              required
              fullWidth
            />
            <Button type="submit" variant="contained" disabled={confirming}>
              {confirming ? "Vérification..." : "Confirmer"}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Protégez votre compte avec un code à usage unique généré par une
            application comme Google Authenticator, en plus de votre mot de
            passe.
          </Typography>
          {setupError.general && (
            <Message text={setupError.general} type="error" />
          )}
          <Button
            variant="outlined"
            onClick={handleStartEnable}
            disabled={enabling}
            startIcon={enabling ? <CircularProgress size={20} /> : null}
            sx={{ textTransform: "none" }}
          >
            {enabling ? "Préparation..." : "Activer la 2FA"}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export default TwoFactorSettings;
