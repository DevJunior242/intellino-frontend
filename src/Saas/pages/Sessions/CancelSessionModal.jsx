import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Stack,
} from "@mui/material";
import { WarningAmber, ErrorOutline } from "@mui/icons-material";
import { Instance } from "../../../Api/Axios";
import { UseAuth } from "../../../Api/AuthContext";
import ErrorGlobal from "../../../component/ErrorGlobal";
import Message from "../Message";

const CancelSessionModal = ({
  open,
  onClose,
  sessionId,
  fetchSessionData,
  setCancelLoading,
  cancelLoading,
}) => {
  // console.log(sessionId);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  //activeClubId
  const { activeClubId } = UseAuth();
  const [formData, setFormData] = useState({
    cancel_reason: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.cancel_reason.trim().length < 5) {
      setError({
        cancel_reason: ["La raison doit contenir au moins 5 caractères"],
      });
      return;
    }

    setError({});
    setCancelLoading(true);
    try {
      const dataSend = {
        ...formData,
        club_id: activeClubId,
      };
      const response = await Instance.post(
        `/api/session/${sessionId}/cancel`,
        dataSend,
      );
      console.log(response);

      if (response.data.success) {
        setFormData({
          cancel_reason: "",
        });
        setSuccess(response.data.message);
        setTimeout(() => {
          setSuccess("");
        }, 3000);
        setError({});
        await fetchSessionData();
      } else {
        setError(response.data.message);
        setSuccess("");
      }
    } catch (error) {
      ErrorGlobal({ error, setError });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "error.main",
        }}
      >
        <WarningAmber color="error" />
        Annulation du cours
      </DialogTitle>

      <Box sx={{ display: "flex", gap: 2, m: 3 }}>
        {success && <Message text={success} type="success" />}
        {error?.general && <Message text={error.general} type="error" />}
      </Box>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ backgroundColor: "background.default" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir annuler cette session ? Cette action est
            irréversible et les élèves seront informés.
          </Typography>

          <Alert severity="warning" sx={{ mb: 3 }}>
            La raison doit comporter au moins 5 caractères.
          </Alert>
          <TextField
            autoFocus
            label="Raison de l'annulation"
            placeholder="Ex: Instructeur malade, Salle indisponible..."
            fullWidth
            multiline
            rows={3}
            name="cancel_reason"
            value={formData.cancel_reason}
            onChange={handleChange}
            error={hasError("cancel_reason")}
            helperText={getError("cancel_reason")}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2, bgcolor: "#fefefe" }}>
          <Button onClick={onClose} color="inherit">
            Ignorer
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={cancelLoading || formData.cancel_reason.trim().length < 5}
            startIcon={<ErrorOutline />}
          >
            {cancelLoading ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default CancelSessionModal;
