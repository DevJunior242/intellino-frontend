import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { Update, EventNote, AccessTime } from "@mui/icons-material";
import ErrorGlobal from "../../../component/ErrorGlobal";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import Message from "../Message";

const ReportSessionModal = ({
  open,
  onClose,
  session,
  sessionId,
  fetchSessionData,
  reportLoading,
  setReportLoading,
}) => {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [newData, setNewData] = useState({
    session_date: session?.session_date || "",
    start_time: session?.start_time?.substring(0, 5) || "",
    end_time: session?.end_time?.substring(0, 5) || "",
  });
  const { activeId } = UseAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError({});
    setReportLoading(true);
    try {
      const dataSend = {
        ...newData,
        club_id: activeId,
      };
      console.log(dataSend);
      const response = await Instance.post(
        `/api/session/${sessionId}/reschedule`,
        dataSend,
      );

      if (response.data.success) {
        onClose();
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
      setReportLoading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "background.default" }}>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="xs"
        sx={{
          "& .MuiDialog-paper": {
            p: 3,
            borderRadius: 3,
            backgroundColor: "background.default",
          },
        }}
      >
        <DialogTitle>
          <Update color="primary" />
          Reporter la séance
        </DialogTitle>
        <Box sx={{ display: "flex", gap: 2, m: 3 }}>
          {success && <Message text={success} type="success" />}
          {error?.general && <Message text={error.general} type="error" />}
        </Box>
        <form onSubmit={handleSubmit}>
          <DialogContent
            dividers
            sx={{ backgroundColor: "background.default" }}
          >
            <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
              Modifier la planification pour le cours : <b>{session?.title}</b>
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  error={!!hasError("session_date")}
                  helperText={getError("session_date")}
                  label="Nouvelle Date"
                  name="session_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newData.session_date}
                  onChange={(e) =>
                    setNewData({ ...newData, session_date: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={!!hasError("start_time")}
                  helperText={getError("start_time")}
                  name="start_time"
                  label="Heure Début"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={
                    newData.start_time ? newData.start_time.substring(0, 5) : ""
                  }
                  onChange={(e) =>
                    setNewData({ ...newData, start_time: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={!!hasError("end_time")}
                  helperText={getError("end_time")}
                  name="end_time"
                  label="Heure Fin"
                  type="time"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={
                    newData.end_time ? newData.end_time.substring(0, 5) : ""
                  }
                  onChange={(e) =>
                    setNewData({ ...newData, end_time: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="inherit" disabled={reportLoading}>
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={reportLoading || !newData.session_date}
              startIcon={
                reportLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <EventNote />
                )
              }
            >
              {reportLoading ? "Mise à jour..." : "Confirmer le report"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
export default ReportSessionModal;
