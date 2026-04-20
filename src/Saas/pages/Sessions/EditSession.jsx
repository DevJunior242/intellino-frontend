import React, { useState } from "react";
import { Instance } from "../../../Api/Axios";
import ErrorGlobal from "../../../component/ErrorGlobal";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import Message from "../Message";

function EditSession({ session, open, handleClose, getSession, activeClubId }) {
  const [submitting, setSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState({
    title: session?.title || "",
    session_date: session?.session_date || "",
    start_time: session?.start_time || "",
    end_time: session?.end_time || "",
    description: session?.description || "",
    course_id: session?.course_id || "",
  });
  const [error, setError] = useState({});
  const [success, setSuccess] = useState("");
  const hasError = (field) => !!error?.[field];
  const getError = (field) => error?.[field]?.join(", ");
  //handle change
  const handleChange = (e) => {
    setSessionData({ ...sessionData, [e.target.name]: e.target.value });
  };

  //handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({});
    setSuccess("");
    setSubmitting(true);
    try {
      const datasend = {
        ...sessionData,
        club_id: activeClubId,
      };
      const response = await Instance.put(
        `/api/sessions/edit/${session.id}`,
        datasend,
      );
      if (response.data.success) {
        setSuccess("Session mise à jour avec succès");
      }
      getSession();
    } catch (error) {
      console.error(error);
      ErrorGlobal({ error, setError });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          p: 3,
          borderRadius: 3,
          backgroundColor: "background.default",
        },
      }}
    >
      <DialogTitle>Modifier la session</DialogTitle>
      {success && <Message text={success} type="success" />}
      {error?.global && <ErrorGlobal error={error.global} />}
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
        <TextField
          error={hasError("title")}
          helperText={getError("title")}
          label="Titre de la session"
          name="title"
          value={sessionData.title}
          onChange={handleChange}
          required
        />

        <TextField
          error={hasError("session_date")}
          helperText={getError("session_date")}
          label="Date"
          type="date"
          name="session_date"
          value={sessionData.session_date}
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          error={hasError("start_time")}
          helperText={getError("start_time")}
          label="Début"
          type="time"
          name="start_time"
          value={
            sessionData.start_time ? sessionData.start_time.substring(0, 5) : ""
          }
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          error={hasError("end_time")}
          helperText={getError("end_time")}
          label="Fin"
          type="time"
          name="end_time"
          value={
            sessionData.end_time ? sessionData.end_time.substring(0, 5) : ""
          }
          onChange={handleChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          error={hasError("description")}
          helperText={getError("description")}
          label="Description"
          name="description"
          value={sessionData.description}
          onChange={handleChange}
          multiline
          rows={3}
          minRows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Annuler</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "mise à jour..." : "modifier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditSession;
