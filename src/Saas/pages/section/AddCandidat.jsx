import React, { useState } from "react";
import { Stack, TextField, Button, MenuItem } from "@mui/material";

export default function AddCandidat({ postes, onAdd }) {
  const [candidat, setCandidat] = useState({
    nom: "",
    prenom: "",
    poste_id: "",
  });

  const submit = () => {
    if (!candidat.nom || !candidat.poste_id) return;
    onAdd(candidat);
    setCandidat({ nom: "", prenom: "", poste_id: "" });
  };

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ mb: 4, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}
    >
      <TextField
        label="Nom"
        size="small"
        value={candidat.nom}
        onChange={(e) => setCandidat({ ...candidat, nom: e.target.value })}
      />
      <TextField
        label="Prénom"
        size="small"
        value={candidat.prenom}
        onChange={(e) => setCandidat({ ...candidat, prenom: e.target.value })}
      />
      <TextField
        select
        label="Poste convoité"
        size="small"
        sx={{ minWidth: 200 }}
        value={candidat.poste_id}
        onChange={(e) => setCandidat({ ...candidat, poste_id: e.target.value })}
      >
        {postes?.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.title}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="contained" onClick={submit}>
        Ajouter Candidat
      </Button>
    </Stack>
  );
}
