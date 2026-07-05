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
} from "@mui/material";
import { Update, EventNote, AccessTime } from "@mui/icons-material";
import ErrorGlobal from "../../../component/ErrorGlobal";
import { UseAuth } from "../../../Api/AuthContext";
import { Instance } from "../../../Api/Axios";
import Message from "../Message";

const ReportExamenModal = ({
  open,
  onClose,
  examen,
  examenId,
  fetchExamenData,
  reportLoading,
  setReportLoading,
}) => {
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  const [newData, setNewData] = useState({
    start_date: examen?.start_date || "",
    end_date: examen?.end_date || "",
    start_time: examen?.start_time?.substring(0, 5) || "",
    end_time: examen?.end_time?.substring(0, 5) || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reportLoading) return;
    setError({});
    setReportLoading(true);
    try {
      const dataSend = {
        ...newData,
      };
      const response = await Instance.post(
        `/api/examens/${examenId}/reschedule`,
        dataSend,
      );

      if (response.data.success) {
        // onClose();
        setSuccess(response.data.message);
        setTimeout(async () => {
          setSuccess("");
          onClose();
          await fetchExamenData();
        }, 1500);
        setError({});
        await fetchExamenData();
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
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "background.default",
          }}
        >
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
              Modifier la planification pour le cours : <b>{examen?.title}</b>
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  error={!!hasError("start_date")}
                  helperText={getError("start_date")}
                  label="date de début"
                  name="start_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newData.start_date}
                  onChange={(e) =>
                    setNewData({ ...newData, start_date: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  error={!!hasError("end_date")}
                  helperText={getError("end_date")}
                  label="Nouvelle Date"
                  name="end_date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={newData.end_date}
                  onChange={(e) =>
                    setNewData({ ...newData, end_date: e.target.value })
                  }
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              <TextField
                error={hasError("start_time")}
                helperText={getError("start_time")}
                fullWidth
                type="time"
                name="start_time"
                label="heure de début"
                InputLabelProps={{ shrink: true }}
                value={
                  newData.start_time ? newData.start_time.substring(0, 5) : ""
                }
                onChange={(e) =>
                  setNewData({ ...newData, start_time: e.target.value })
                }
                margin="dense"
              />
              <TextField
                error={hasError("end_time")}
                helperText={getError("end_time")}
                fullWidth
                type="time"
                name="end_time"
                label="Fin"
                InputLabelProps={{ shrink: true }}
                value={newData.end_time ? newData.end_time.substring(0, 5) : ""}
                onChange={(e) =>
                  setNewData({ ...newData, end_time: e.target.value })
                }
                margin="dense"
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose} color="inherit">
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={reportLoading || !newData.end_date}
              startIcon={<EventNote />}
            >
              {reportLoading ? "Mise à jour..." : "Confirmer le report"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};
export default ReportExamenModal;
