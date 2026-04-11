import { Delete } from "@mui/icons-material";
import { Box, Button, Paper, Typography } from "@mui/material";
import React from "react";
import { useState } from "react";
import ConfirmDeleteAccount from "./ConfirmDeleteAccount";

function DeleAccount() {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        backgroundColor: "background.default",
      }}
    >
      <Typography variant="h6" color="error">
        Zone de danger
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        La suppression de votre compte effacera toutes vos données de manière
        irréversible.
      </Typography>
      <Button
        variant="contained"
        color="error"
        size="large"
        startIcon={<Delete />}
        onClick={handleClickOpen}
        sx={{ mt: 2, textTransform: "none", fontSize: 14,width:"100%" }}
      >
        Supprimer mon compte
      </Button>
      <ConfirmDeleteAccount open={open} onClose={handleClose} />
    </Paper>
  );
}

export default DeleAccount;
